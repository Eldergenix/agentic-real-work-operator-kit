import { hashAction, hashTarget } from "../../../../src/lib/operator/action-hash.js";
import { ActionEventSchema, reduceActionEvents, type ActionAggregate, type ActionEvent } from "../../../../src/lib/operator/lifecycle.js";
import type { OperatorRepository, Reservation, ReservationRequest, ReservationState } from "../../../../src/lib/operator/repository.js";
import {
  AuthorizationEvidenceSchema,
  CanonicalOperatorActionSchema,
  type AuthorizationEvidence,
  type CanonicalOperatorAction,
} from "../../../../src/lib/operator/schemas.js";

export class SupabaseOperatorRepository implements OperatorRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly serviceRoleKey: string,
  ) {}

  async createAction(action: CanonicalOperatorAction, initialEvent: ActionEvent): Promise<void> {
    await this.rpc("operator_create_action", {
      p_action: action,
      p_event: initialEvent,
      p_action_hash: await hashAction(action),
      p_target_hash: await hashTarget(action.target),
    });
  }

  async getAction(actionId: string): Promise<CanonicalOperatorAction | undefined> {
    const rows = await this.rest<Array<{ action_payload: unknown }>>(
      `/rest/v1/operator_actions?action_id=eq.${encodeURIComponent(actionId)}&select=action_payload&limit=1`,
    );
    const row = rows[0];
    return row === undefined ? undefined : CanonicalOperatorActionSchema.parse(row.action_payload);
  }

  async getAggregate(actionId: string): Promise<ActionAggregate | undefined> {
    const rows = await this.rest<Array<{ event_payload: unknown }>>(
      `/rest/v1/operator_action_events?action_id=eq.${encodeURIComponent(actionId)}&select=event_payload&order=sequence.asc`,
    );
    if (rows.length === 0) return undefined;
    return reduceActionEvents(rows.map((row) => ActionEventSchema.parse(row.event_payload)));
  }

  async appendEvent(event: ActionEvent, expectedSequence: number): Promise<ActionAggregate> {
    await this.rpc("operator_append_action_event", {
      p_event: event,
      p_expected_sequence: expectedSequence,
    });
    const aggregate = await this.getAggregate(event.actionId);
    if (aggregate === undefined) throw new Error("Action disappeared after event append");
    return aggregate;
  }

  async reserve(request: ReservationRequest): Promise<Reservation> {
    const value = await this.rpc<Record<string, unknown>>("operator_reserve", {
      p_request: {
        ...request,
        fencingToken: request.fencingToken.toString(),
      },
    });
    return decodeReservation(value);
  }

  async transitionReservation(
    reservationId: string,
    fencingToken: bigint,
    nextState: ReservationState,
  ): Promise<void> {
    await this.rpc("operator_transition_reservation", {
      p_reservation_id: reservationId,
      p_fencing_token: fencingToken.toString(),
      p_next_state: nextState,
    });
  }

  async getReservation(reservationId: string): Promise<Reservation | undefined> {
    const rows = await this.rest<Array<Record<string, unknown>>>(
      `/rest/v1/operator_reservations?reservation_id=eq.${encodeURIComponent(reservationId)}&select=*&limit=1`,
    );
    return rows[0] === undefined ? undefined : decodeReservation(rows[0]);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<ActionAggregate | undefined> {
    const rows = await this.rest<Array<{ action_id: string }>>(
      `/rest/v1/operator_reservations?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&select=action_id&limit=1`,
    );
    return rows[0] === undefined ? undefined : this.getAggregate(rows[0].action_id);
  }

  async consumeAuthorization(
    evidence: AuthorizationEvidence,
    consumedAt: string,
    actionId: string,
  ): Promise<void> {
    void consumedAt;
    const parsed = AuthorizationEvidenceSchema.parse(evidence);
    if (parsed.kind === "operator_mandate") return;
    await this.rpc("consume_authorization", {
      p_authorization_id:
        parsed.kind === "direct_command" ? parsed.attestationId : parsed.approvalId,
      p_user_id: parsed.userId,
      p_action_id: actionId,
      p_action_hash: parsed.actionHash,
      p_target_hash: parsed.targetHash,
      p_policy_hash: parsed.policyHash,
    });
  }

  private async rpc<T = unknown>(name: string, body: Record<string, unknown>): Promise<T> {
    return this.rest<T>(`/rest/v1/rpc/${name}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json", prefer: "return=representation" },
    });
  }

  private async rest<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        "accept-profile": "operator",
        "content-profile": "operator",
        ...(init.headers ?? {}),
      },
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 4_096);
      throw new Error(`Supabase operator persistence failed (${response.status}): ${detail}`);
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") return undefined as T;
    const text = await response.text();
    return (text.length === 0 ? undefined : JSON.parse(text)) as T;
  }
}

function decodeReservation(row: Record<string, unknown>): Reservation {
  const amountMinor = row["amount_minor"];
  const currency = row["currency"];
  return {
    reservationId: String(row["reservation_id"]),
    actionId: String(row["action_id"]),
    userId: String(row["user_id"]),
    mandateId: String(row["mandate_id"]),
    idempotencyKey: String(row["idempotency_key"]),
    ...(amountMinor === null || amountMinor === undefined
      ? {}
      : { amount: { amountMinor: Number(amountMinor), currency: String(currency) } }),
    state: String(row["state"]) as ReservationState,
    fencingToken: BigInt(String(row["fencing_token"])),
    createdAt: String(row["created_at"]),
  };
}
