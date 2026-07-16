import type { CurrentAuthorityState } from "../../../../src/lib/operator/authorization-gate.js";
import {
  CapabilityCellSchema,
  MandateSchema,
  type CapabilityCell,
  type Mandate,
} from "../../../../src/lib/operator/schemas.js";
import type { BrokerCapability } from "../../../../src/lib/operator/broker-capability.js";

export type AuthorityReferences = {
  goalId: string;
  planId: string;
  planVersion: number;
  domain: string;
  actionFamily: string;
};

export type LoadedAuthority = {
  current: CurrentAuthorityState & { fencingToken: bigint };
  mandate?: Mandate;
  capabilityCell?: CapabilityCell;
};

type GoalRow = {
  intent_epoch: number | string;
  canonical_hash: string;
  consent_epoch: string;
};

type PlanRow = {
  canonical_hash: string;
  intent_epoch: number | string;
  mandate_version: number | string;
  consent_epoch: string;
};

type KillSwitchRow = { active: boolean; epoch: number | string };

/**
 * Reloads authority from the server-side system of record immediately before
 * execution. Caller-authored `current`, mandate, and capability objects are
 * never treated as authoritative by the Worker composition root.
 */
export class SupabaseAuthorityLoader {
  constructor(
    private readonly baseUrl: string,
    private readonly serviceRoleKey: string,
  ) {}

  async load(capability: BrokerCapability, refs: AuthorityReferences): Promise<LoadedAuthority> {
    const now = new Date();
    const goal = await this.loadCurrentGoal(capability.subjectUserId, refs.goalId);
    if (goal.canonical_hash !== capability.goalSpecHash) {
      throw new Error("goal_spec_superseded_or_hash_mismatch");
    }

    const plan = await this.loadPlan(refs.planId, refs.planVersion);
    if (plan.canonical_hash !== capability.planHash) throw new Error("plan_hash_mismatch");
    if (Number(plan.intent_epoch) !== Number(goal.intent_epoch)) throw new Error("plan_intent_epoch_stale");
    if (plan.consent_epoch !== goal.consent_epoch) throw new Error("plan_consent_epoch_stale");

    let mandate: Mandate | undefined;
    let capabilityCell: CapabilityCell | undefined;
    let mandateKillEpoch = 0;

    if (capability.mandateId !== undefined) {
      const mandateRows = await this.get<Array<Record<string, unknown>>>(
        `/rest/v1/operator_mandates?mandate_id=eq.${encodeURIComponent(capability.mandateId)}` +
          `&version=eq.${capability.mandateVersion}&select=*&limit=1`,
      );
      const row = mandateRows[0];
      if (row === undefined) throw new Error("current_mandate_version_not_found");
      mandateKillEpoch = Number(row["kill_switch_epoch"] ?? 0);
      mandate = MandateSchema.parse({
        mandateId: row["mandate_id"],
        userId: row["user_id"],
        version: row["version"],
        status: row["status"],
        automaticPromotion: row["automatic_promotion"],
        maximumEnvelope: row["maximum_autonomy_envelope"],
        validFrom: row["valid_from"],
        expiresAt: row["expires_at"],
        policyHash: row["policy_hash"],
        consentEpoch: row["consent_epoch"],
      });
      if (mandate.userId !== capability.subjectUserId) throw new Error("mandate_user_mismatch");
    }

    if (capability.capabilityCellId !== undefined) {
      capabilityCell = await this.loadCapabilityCell(capability.capabilityCellId);
      if (capabilityCell.userId !== capability.subjectUserId) throw new Error("capability_user_mismatch");
      if (capability.mandateId !== capabilityCell.mandateId) throw new Error("capability_mandate_mismatch");
    }

    const killState = await this.loadKillSwitchState({
      userId: capability.subjectUserId,
      ...(capability.mandateId === undefined ? {} : { mandateId: capability.mandateId }),
      domain: refs.domain,
      actionFamily: refs.actionFamily,
    });
    const currentKillEpoch = Math.max(killState.epoch, mandateKillEpoch);

    const currentMandateVersion = mandate?.version ?? Number(plan.mandate_version);
    const currentConsentEpoch = mandate?.consentEpoch ?? goal.consent_epoch;

    return {
      current: {
        intentEpoch: Number(goal.intent_epoch),
        mandateVersion: currentMandateVersion,
        consentEpoch: currentConsentEpoch,
        connectorEpoch: capability.connectorEpoch,
        killSwitchEpoch: String(currentKillEpoch),
        killSwitchActive: killState.active || mandate?.status === "paused" || mandate?.status === "revoked",
        fencingToken: BigInt(capability.fencingToken),
        now,
      },
      ...(mandate === undefined ? {} : { mandate }),
      ...(capabilityCell === undefined ? {} : { capabilityCell }),
    };
  }

  async loadCapabilityCell(capabilityCellId: string): Promise<CapabilityCell> {
    const rows = await this.get<Array<Record<string, unknown>>>(
      `/rest/v1/capability_cells?capability_cell_id=eq.${encodeURIComponent(capabilityCellId)}&select=*&limit=1`,
    );
    const row = rows[0];
    if (row === undefined) throw new Error("capability_cell_not_found");
    if (row["demoted_at"] !== null && row["demoted_at"] !== undefined) {
      throw new Error("capability_cell_demoted");
    }
    return CapabilityCellSchema.parse({
      capabilityCellId: row["capability_cell_id"],
      userId: row["user_id"],
      mandateId: row["mandate_id"],
      mandateVersion: row["mandate_version"],
      productTier: row["product_tier"],
      domain: row["domain"],
      actionFamily: row["action_family"],
      provider: row["provider"],
      providerAccountId: row["provider_account_id"],
      targetType: row["target_type"],
      exactTargetIds: row["exact_target_ids"],
      purpose: row["purpose"],
      consequenceCeiling: row["consequence_ceiling"],
      ...(row["amount_ceiling_minor"] === null || row["amount_ceiling_minor"] === undefined
        ? {}
        : {
            amountCeiling: {
              amountMinor: Number(row["amount_ceiling_minor"]),
              currency: String(row["amount_currency"]),
            },
          }),
      minimumVerificationGrade: row["minimum_verification_grade"],
      allowedIdempotencyClasses: row["allowed_idempotency_classes"],
      validFrom: row["valid_from"],
      expiresAt: row["expires_at"],
      evidenceEpoch: row["evidence_epoch"],
      policyHash: row["policy_hash"],
    });
  }

  private async loadCurrentGoal(userId: string, goalId: string): Promise<GoalRow> {
    const rows = await this.get<GoalRow[]>(
      `/rest/v1/goal_specs?user_id=eq.${encodeURIComponent(userId)}` +
        `&goal_id=eq.${encodeURIComponent(goalId)}` +
        `&select=intent_epoch,canonical_hash,consent_epoch&order=intent_epoch.desc&limit=1`,
    );
    const row = rows[0];
    if (row === undefined) throw new Error("goal_spec_not_found");
    return row;
  }

  private async loadPlan(planId: string, planVersion: number): Promise<PlanRow> {
    const rows = await this.get<PlanRow[]>(
      `/rest/v1/plan_irs?plan_id=eq.${encodeURIComponent(planId)}` +
        `&plan_version=eq.${planVersion}` +
        `&select=canonical_hash,intent_epoch,mandate_version,consent_epoch&limit=1`,
    );
    const row = rows[0];
    if (row === undefined) throw new Error("plan_ir_not_found");
    return row;
  }

  private async loadKillSwitchState(input: {
    userId: string;
    mandateId?: string;
    domain: string;
    actionFamily: string;
  }): Promise<{ active: boolean; epoch: number }> {
    const scopes: Array<[string, string]> = [
      ["global", "global"],
      ["user", input.userId],
      ["domain", input.domain],
      ["action_family", input.actionFamily],
    ];
    if (input.mandateId !== undefined) scopes.push(["mandate", input.mandateId]);

    const rows = await Promise.all(
      scopes.map(([scopeType, scopeId]) =>
        this.get<KillSwitchRow[]>(
          `/rest/v1/operator_kill_switches?scope_type=eq.${encodeURIComponent(scopeType)}` +
            `&scope_id=eq.${encodeURIComponent(scopeId)}&select=active,epoch&limit=1`,
        ),
      ),
    );
    const present = rows.flat();
    return {
      active: present.some((row) => row.active),
      epoch: present.reduce((maximum, row) => Math.max(maximum, Number(row.epoch)), 0),
    };
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        "accept-profile": "operator",
      },
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 4_096);
      throw new Error(`authority_reload_failed:${response.status}:${detail}`);
    }
    return (await response.json()) as T;
  }
}
