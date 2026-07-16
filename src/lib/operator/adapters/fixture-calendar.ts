import { canonicalHash } from "../canonical.js";
import type {
  OperatorProviderAdapter,
  ProviderAttemptContext,
  ProviderCompensationResult,
  ProviderExecutionResult,
  ProviderReconciliationResult,
  ProviderVerificationResult,
} from "../provider-adapter.js";
import {
  EffectContractSchema,
  JsonValueSchema,
  type CanonicalOperatorAction,
  type EffectContract,
  type JsonValue,
  type VerificationObservation,
} from "../schemas.js";

export type FixtureMode = "success" | "fail_before_effect" | "timeout_after_effect" | "verify_mismatch";

export class FixtureCalendarAdapter implements OperatorProviderAdapter {
  readonly contract: EffectContract = EffectContractSchema.parse({
    actionFamily: "calendar.event.create",
    version: "fixture-v1",
    domain: "calendar",
    provider: "fixture_calendar",
    committing: true,
    idempotencyClass: "client_generated_object_id",
    minimumVerificationGrade: "V2",
    recoverySemantics: "true_reversal",
    sourceOfTruth: "fixture calendar state",
    sourceOfTruthRank: 100,
    maturityHorizonMs: 0,
    expectedVisibilityDelayMs: 0,
    verifierRef: "fixture-calendar-get-v1",
    reconciliationRef: "fixture-calendar-get-v1",
    compensationRef: "fixture-calendar-delete-v1",
    explicitIrreversibility: false,
    graduationState: "test_proven",
  });

  private readonly events = new Map<string, JsonValue>();
  private readonly idempotency = new Map<string, string>();
  executeCount = 0;

  constructor(public mode: FixtureMode = "success") {}

  async execute(
    action: CanonicalOperatorAction,
    context: ProviderAttemptContext,
  ): Promise<ProviderExecutionResult> {
    this.executeCount += 1;
    if (this.mode === "fail_before_effect") {
      return { status: "failed", failureCode: "fixture_rejected", providerProvedNoEffect: true };
    }
    const existing = this.idempotency.get(context.idempotencyKey);
    const providerObjectId = existing ?? `fixture-${action.logicalEffectId}`;
    if (existing === undefined) {
      this.events.set(providerObjectId, action.arguments);
      this.idempotency.set(context.idempotencyKey, providerObjectId);
    }
    if (this.mode === "timeout_after_effect") {
      return { status: "uncertain", reasonCode: "fixture_timeout_after_commit", providerObjectId };
    }
    return {
      status: "acknowledged",
      providerObjectId,
      providerReceipt: { providerObjectId },
    };
  }

  async verify(
    action: CanonicalOperatorAction,
    providerObjectId: string,
    context: ProviderAttemptContext,
  ): Promise<ProviderVerificationResult> {
    const state = this.events.get(providerObjectId);
    if (state === undefined) {
      return { status: "not_visible_yet", observedAt: new Date().toISOString(), retryAfterMs: 1 };
    }
    const matched = this.mode !== "verify_mismatch" && JSON.stringify(state) === JSON.stringify(action.arguments);
    const observation = await this.observation(action, context.attemptId, providerObjectId, state, matched, false);
    return matched
      ? { status: "verified", observation, providerState: state }
      : { status: "mismatch", observation, providerState: state, mismatchFields: ["arguments"] };
  }

  async reconcile(
    action: CanonicalOperatorAction,
    providerObjectId: string | undefined,
    context: ProviderAttemptContext,
  ): Promise<ProviderReconciliationResult> {
    const objectId = providerObjectId ?? this.idempotency.get(context.idempotencyKey);
    if (objectId === undefined) return { status: "failed", failureCode: "not_found", providerProvedNoEffect: true };
    const state = this.events.get(objectId);
    if (state === undefined) return { status: "failed", failureCode: "not_found", providerProvedNoEffect: true };
    const matched = JSON.stringify(state) === JSON.stringify(action.arguments);
    if (!matched) return { status: "uncertain", reasonCode: "fixture_mismatch" };
    const observation = await this.observation(action, context.attemptId, objectId, state, true, false);
    return { status: "verified", verification: { status: "verified", observation, providerState: state } };
  }

  async compensate(
    action: CanonicalOperatorAction,
    providerObjectId: string,
    _preState: JsonValue | undefined,
    context: ProviderAttemptContext,
  ): Promise<ProviderCompensationResult> {
    this.events.delete(providerObjectId);
    const state = JsonValueSchema.parse({ providerObjectId, absent: true });
    const observation = await this.observation(action, context.attemptId, providerObjectId, state, true, true);
    return { status: "compensated", observation, providerState: state };
  }

  has(providerObjectId: string): boolean {
    return this.events.has(providerObjectId);
  }

  private async observation(
    action: CanonicalOperatorAction,
    attemptId: string,
    providerObjectId: string,
    state: JsonValue,
    matched: boolean,
    compensation: boolean,
  ): Promise<VerificationObservation> {
    return {
      observationId: crypto.randomUUID(),
      actionId: action.actionId,
      attemptId,
      providerObjectId,
      verifierRef: compensation ? "compensation:fixture-calendar-delete-v1" : "fixture-calendar-get-v1",
      grade: "V2",
      observedAt: new Date().toISOString(),
      matched,
      predicateResults: { state: matched },
      redactedEvidenceHash: await canonicalHash(state),
    };
  }
}
