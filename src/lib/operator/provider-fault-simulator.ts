import type {
  OperatorProviderAdapter,
  ProviderAttemptContext,
  ProviderCompensationResult,
  ProviderExecutionResult,
  ProviderReconciliationResult,
  ProviderVerificationResult,
} from "./provider-adapter.js";
import type { CanonicalOperatorAction, EffectContract, JsonValue } from "./schemas.js";

export type ProviderFault =
  | "none"
  | "timeout_before_effect"
  | "timeout_after_effect"
  | "explicit_failure_before_effect"
  | "authentication_required"
  | "verification_not_visible"
  | "verification_mismatch"
  | "verification_uncertain"
  | "reconciliation_uncertain"
  | "compensation_failure"
  | "compensation_uncertain";

export type ProviderFaultPlan = {
  execute?: ProviderFault[];
  verify?: ProviderFault[];
  reconcile?: ProviderFault[];
  compensate?: ProviderFault[];
};

/**
 * Deterministic provider-fault wrapper used to qualify adapters and broker
 * recovery behavior. Faults are consumed in FIFO order independently for each
 * operation. The wrapper never fabricates a verified observation.
 */
export class FaultInjectingAdapter implements OperatorProviderAdapter {
  readonly contract: EffectContract;
  private readonly queues: Required<ProviderFaultPlan>;

  constructor(
    private readonly delegate: OperatorProviderAdapter,
    plan: ProviderFaultPlan,
  ) {
    this.contract = delegate.contract;
    this.queues = {
      execute: [...(plan.execute ?? [])],
      verify: [...(plan.verify ?? [])],
      reconcile: [...(plan.reconcile ?? [])],
      compensate: [...(plan.compensate ?? [])],
    };
  }

  async execute(
    action: CanonicalOperatorAction,
    context: ProviderAttemptContext,
  ): Promise<ProviderExecutionResult> {
    const fault = this.next("execute");
    if (fault === "timeout_before_effect") {
      return { status: "uncertain", reasonCode: "sim_timeout_before_effect" };
    }
    if (fault === "explicit_failure_before_effect") {
      return {
        status: "failed",
        failureCode: "sim_provider_rejected",
        providerProvedNoEffect: true,
      };
    }
    if (fault === "authentication_required") {
      return { status: "authentication_required", handoffRef: "sim:reauth" };
    }

    const result = await this.delegate.execute(action, context);
    if (fault === "timeout_after_effect" && result.status === "acknowledged") {
      return {
        status: "uncertain",
        reasonCode: "sim_timeout_after_effect",
        providerObjectId: result.providerObjectId,
        providerReceipt: result.providerReceipt,
      };
    }
    return result;
  }

  async verify(
    action: CanonicalOperatorAction,
    providerObjectId: string,
    context: ProviderAttemptContext,
  ): Promise<ProviderVerificationResult> {
    const fault = this.next("verify");
    if (fault === "verification_not_visible") {
      return {
        status: "not_visible_yet",
        observedAt: new Date().toISOString(),
        retryAfterMs: 1_000,
      };
    }
    if (fault === "verification_uncertain") {
      return {
        status: "uncertain",
        observedAt: new Date().toISOString(),
        reasonCode: "sim_verifier_unavailable",
      };
    }

    const result = await this.delegate.verify(action, providerObjectId, context);
    if (fault === "verification_mismatch" && result.status === "verified") {
      return {
        status: "mismatch",
        observation: { ...result.observation, matched: false },
        providerState: result.providerState,
        mismatchFields: ["simulated_field_drift"],
      };
    }
    return result;
  }

  async reconcile(
    action: CanonicalOperatorAction,
    providerObjectId: string | undefined,
    context: ProviderAttemptContext,
  ): Promise<ProviderReconciliationResult> {
    const fault = this.next("reconcile");
    if (fault === "reconciliation_uncertain") {
      return {
        status: "uncertain",
        reasonCode: "sim_reconciliation_unavailable",
        retryAfterMs: 1_000,
      };
    }
    return this.delegate.reconcile(action, providerObjectId, context);
  }

  async compensate(
    action: CanonicalOperatorAction,
    providerObjectId: string,
    preState: JsonValue | undefined,
    context: ProviderAttemptContext,
  ): Promise<ProviderCompensationResult> {
    const fault = this.next("compensate");
    if (fault === "compensation_failure") {
      return { status: "failed", failureCode: "sim_compensation_rejected" };
    }
    if (fault === "compensation_uncertain") {
      return { status: "uncertain", reasonCode: "sim_compensation_timeout" };
    }
    if (this.delegate.compensate === undefined) {
      return { status: "failed", failureCode: "adapter_has_no_compensator" };
    }
    return this.delegate.compensate(action, providerObjectId, preState, context);
  }

  remaining(): Required<Record<keyof ProviderFaultPlan, number>> {
    return {
      execute: this.queues.execute.length,
      verify: this.queues.verify.length,
      reconcile: this.queues.reconcile.length,
      compensate: this.queues.compensate.length,
    };
  }

  private next(operation: keyof ProviderFaultPlan): ProviderFault {
    return this.queues[operation].shift() ?? "none";
  }
}
