import { reduceActionEvents, type ActionAggregate, type ActionEvent } from "./lifecycle.js";
import type { AuthorizationEvidence, CanonicalOperatorAction, Money } from "./schemas.js";

export type ReservationState = "reserved" | "committed" | "refunded" | "reconciling";

export type Reservation = {
  reservationId: string;
  actionId: string;
  userId: string;
  mandateId: string;
  idempotencyKey: string;
  amount?: Money;
  state: ReservationState;
  fencingToken: bigint;
  createdAt: string;
};

export type ReservationRequest = Omit<Reservation, "state"> & { maxBudget?: Money };

export interface OperatorRepository {
  createAction(action: CanonicalOperatorAction, initialEvent: ActionEvent): Promise<void>;
  getAction(actionId: string): Promise<CanonicalOperatorAction | undefined>;
  getAggregate(actionId: string): Promise<ActionAggregate | undefined>;
  appendEvent(event: ActionEvent, expectedSequence: number): Promise<ActionAggregate>;
  reserve(request: ReservationRequest): Promise<Reservation>;
  transitionReservation(
    reservationId: string,
    fencingToken: bigint,
    nextState: ReservationState,
  ): Promise<void>;
  getReservation(reservationId: string): Promise<Reservation | undefined>;
  findByIdempotencyKey(idempotencyKey: string): Promise<ActionAggregate | undefined>;
  consumeAuthorization(
    evidence: AuthorizationEvidence,
    consumedAt: string,
    actionId: string,
  ): Promise<void>;
}

class KeyMutex {
  private readonly tails = new Map<string, Promise<void>>();

  async run<T>(key: string, operation: () => Promise<T> | T): Promise<T> {
    const previous = this.tails.get(key) ?? Promise.resolve();
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const next = previous.then(() => gate);
    this.tails.set(key, next);
    await previous;
    try {
      return await operation();
    } finally {
      release?.();
      if (this.tails.get(key) === next) this.tails.delete(key);
    }
  }
}

export class InMemoryOperatorRepository implements OperatorRepository {
  private readonly actions = new Map<string, CanonicalOperatorAction>();
  private readonly events = new Map<string, ActionEvent[]>();
  private readonly reservations = new Map<string, Reservation>();
  private readonly idempotencyToAction = new Map<string, string>();
  private readonly consumedAuthorizations = new Set<string>();
  private readonly mutex = new KeyMutex();

  async createAction(action: CanonicalOperatorAction, initialEvent: ActionEvent): Promise<void> {
    await this.mutex.run(`action:${action.actionId}`, () => {
      if (this.actions.has(action.actionId)) throw new Error(`Action ${action.actionId} already exists`);
      const aggregate = reduceActionEvents([initialEvent]);
      if (aggregate.actionId !== action.actionId) throw new Error("Initial event does not match action");
      this.actions.set(action.actionId, structuredClone(action));
      this.events.set(action.actionId, [structuredClone(initialEvent)]);
    });
  }

  async getAction(actionId: string): Promise<CanonicalOperatorAction | undefined> {
    const action = this.actions.get(actionId);
    return action === undefined ? undefined : structuredClone(action);
  }

  async getAggregate(actionId: string): Promise<ActionAggregate | undefined> {
    const events = this.events.get(actionId);
    return events === undefined ? undefined : reduceActionEvents(structuredClone(events));
  }

  async appendEvent(event: ActionEvent, expectedSequence: number): Promise<ActionAggregate> {
    return this.mutex.run(`action:${event.actionId}`, () => {
      const events = this.events.get(event.actionId);
      if (events === undefined) throw new Error(`Unknown action ${event.actionId}`);
      const current = reduceActionEvents(events);
      if (current.sequence !== expectedSequence) {
        throw new Error(`Concurrent update: expected sequence ${expectedSequence}, found ${current.sequence}`);
      }
      const nextEvents = [...events, structuredClone(event)];
      const next = reduceActionEvents(nextEvents);
      this.events.set(event.actionId, nextEvents);
      return next;
    });
  }

  async reserve(request: ReservationRequest): Promise<Reservation> {
    return this.mutex.run(`budget:${request.userId}:${request.mandateId}`, () => {
      const existingAction = this.idempotencyToAction.get(request.idempotencyKey);
      if (existingAction !== undefined && existingAction !== request.actionId) {
        throw new Error("Idempotency key is already bound to another logical action");
      }
      const existing = this.reservations.get(request.reservationId);
      if (existing !== undefined) {
        if (existing.actionId !== request.actionId || existing.idempotencyKey !== request.idempotencyKey) {
          throw new Error("Reservation identity collision");
        }
        return structuredClone(existing);
      }

      if (request.amount !== undefined && request.maxBudget !== undefined) {
        if (request.amount.currency !== request.maxBudget.currency) throw new Error("Budget currency mismatch");
        const inUse = [...this.reservations.values()]
          .filter(
            (item) =>
              item.userId === request.userId &&
              item.mandateId === request.mandateId &&
              item.amount?.currency === request.amount?.currency &&
              item.state !== "refunded",
          )
          .reduce((total, item) => total + (item.amount?.amountMinor ?? 0), 0);
        if (inUse + request.amount.amountMinor > request.maxBudget.amountMinor) {
          throw new Error("Atomic mandate budget exceeded");
        }
      }

      const reservation: Reservation = {
        reservationId: request.reservationId,
        actionId: request.actionId,
        userId: request.userId,
        mandateId: request.mandateId,
        idempotencyKey: request.idempotencyKey,
        ...(request.amount === undefined ? {} : { amount: request.amount }),
        state: "reserved",
        fencingToken: request.fencingToken,
        createdAt: request.createdAt,
      };
      this.reservations.set(request.reservationId, reservation);
      this.idempotencyToAction.set(request.idempotencyKey, request.actionId);
      return structuredClone(reservation);
    });
  }

  async transitionReservation(
    reservationId: string,
    fencingToken: bigint,
    nextState: ReservationState,
  ): Promise<void> {
    await this.mutex.run(`reservation:${reservationId}`, () => {
      const reservation = this.reservations.get(reservationId);
      if (reservation === undefined) throw new Error(`Unknown reservation ${reservationId}`);
      if (fencingToken < reservation.fencingToken) throw new Error("Stale reservation fencing token");
      if (reservation.state === "committed" && nextState === "refunded") {
        throw new Error("Committed reservation requires an explicit compensation/refund action");
      }
      reservation.fencingToken = fencingToken;
      reservation.state = nextState;
    });
  }

  async getReservation(reservationId: string): Promise<Reservation | undefined> {
    const reservation = this.reservations.get(reservationId);
    return reservation === undefined ? undefined : structuredClone(reservation);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<ActionAggregate | undefined> {
    const actionId = this.idempotencyToAction.get(idempotencyKey);
    return actionId === undefined ? undefined : this.getAggregate(actionId);
  }

  async consumeAuthorization(
    evidence: AuthorizationEvidence,
    _consumedAt: string,
    _actionId: string,
  ): Promise<void> {
    if (evidence.kind === "operator_mandate") return;
    const id = evidence.kind === "direct_command" ? evidence.attestationId : evidence.approvalId;
    await this.mutex.run(`authorization:${id}`, () => {
      if (this.consumedAuthorizations.has(id)) throw new Error("Authorization replay detected");
      this.consumedAuthorizations.add(id);
    });
  }
}
