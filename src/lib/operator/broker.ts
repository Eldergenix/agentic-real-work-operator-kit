import { authorizeAction, type AuthorizationRequest, type CurrentAuthorityState } from "./authorization-gate.js";
import { EffectRegistry } from "./effect-registry.js";
import { reduceActionEvents, type ActionAggregate, type ActionEvent } from "./lifecycle.js";
import type { OperatorProviderAdapter, ProviderAttemptContext } from "./provider-adapter.js";
import type { OperatorRepository } from "./repository.js";
import { evaluateRisk, type RiskBudget, type RiskEstimate } from "./risk-guardian.js";
import type {
  AuthorizationEvidence,
  CanonicalOperatorAction,
  CapabilityCell,
  GoalSpec,
  Mandate,
  Money,
  PlanIR,
  ProvenanceGraph,
} from "./schemas.js";

export type BrokerExecutionRequest = {
  runId: string;
  attemptId?: string;
  action: CanonicalOperatorAction;
  goal: GoalSpec;
  plan: PlanIR;
  authorization: AuthorizationEvidence;
  provenance: ProvenanceGraph;
  current: CurrentAuthorityState & { fencingToken: bigint };
  mandate?: Mandate;
  capabilityCell?: CapabilityCell;
  idempotencyKey: string;
  reservationId: string;
  maxBudget?: Money;
  riskEstimate: RiskEstimate;
  riskBudget: RiskBudget;
  evidenceClass: "fixture" | "sandbox" | "test_account" | "internal_canary" | "production_cohort";
};

export type BrokerExecutionResult = {
  aggregate: ActionAggregate;
  effectOccurred: boolean | "unknown";
  missionEvaluationRequired: boolean;
};

export class OperatorBroker {
  constructor(
    private readonly repository: OperatorRepository,
    private readonly registry: EffectRegistry,
  ) {}

  async execute(request: BrokerExecutionRequest): Promise<BrokerExecutionResult> {
    const existing = await this.repository.getAggregate(request.action.actionId);
    if (existing !== undefined) {
      return {
        aggregate: existing,
        effectOccurred:
          existing.status === "verified" || existing.status === "permanent_verified"
            ? true
            : existing.status === "uncertain" || existing.status === "reconciling"
              ? "unknown"
              : false,
        missionEvaluationRequired:
          existing.status === "verified" || existing.status === "permanent_verified",
      };
    }

    const adapter = this.registry.require(request.action.actionFamily, request.action.adapterVersion);
    const eventBase = this.eventBase(request);
    const planned: ActionEvent = {
      ...eventBase(1),
      type: "action_planned",
      planHash: request.plan.canonicalHash,
    };
    await this.repository.createAction(request.action, planned);
    let aggregate = reduceActionEvents([planned]);

    let authorizationReceipt;
    try {
      const authorizationRequest: AuthorizationRequest = {
        action: request.action,
        goal: request.goal,
        plan: request.plan,
        effect: adapter.contract,
        authorization: request.authorization,
        provenance: request.provenance,
        current: request.current,
        ...(request.mandate === undefined ? {} : { mandate: request.mandate }),
        ...(request.capabilityCell === undefined ? {} : { capabilityCell: request.capabilityCell }),
      };
      authorizationReceipt = await authorizeAction(authorizationRequest);
    } catch (error) {
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "action_denied",
          reasonCode: error instanceof Error ? error.message : "authorization_denied",
        },
        aggregate.sequence,
      );
      return { aggregate, effectOccurred: false, missionEvaluationRequired: false };
    }

    aggregate = await this.repository.appendEvent(
      {
        ...eventBase(aggregate.sequence + 1),
        type: "action_authorized",
        authorizationKind: authorizationReceipt.authorizationKind,
        authorizationRef: authorizationReceipt.authorizationRef,
        ...(authorizationReceipt.capabilityCellId === undefined
          ? {}
          : { capabilityCellId: authorizationReceipt.capabilityCellId }),
      },
      aggregate.sequence,
    );

    const riskDecision = evaluateRisk(request.riskEstimate, request.riskBudget);
    if (riskDecision.decision === "abstain") {
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "risk_abstained",
          riskReceiptRef: crypto.randomUUID(),
          recommendedSupport: riskDecision.recommendedSupport,
        },
        aggregate.sequence,
      );
      return { aggregate, effectOccurred: false, missionEvaluationRequired: false };
    }

    try {
      await this.repository.reserve({
        reservationId: request.reservationId,
        actionId: request.action.actionId,
        userId: request.action.userId,
        mandateId: request.mandate?.mandateId ?? request.goal.mandateId ?? request.action.goalId,
        idempotencyKey: request.idempotencyKey,
        ...(request.action.amount === undefined ? {} : { amount: request.action.amount }),
        ...(request.maxBudget === undefined ? {} : { maxBudget: request.maxBudget }),
        fencingToken: request.current.fencingToken,
        createdAt: request.current.now.toISOString(),
      });
      await this.repository.consumeAuthorization(
        request.authorization,
        request.current.now.toISOString(),
        request.action.actionId,
      );
    } catch (error) {
      const reservation = await this.repository.getReservation(request.reservationId);
      if (reservation !== undefined && reservation.state === "reserved") {
        await this.repository.transitionReservation(
          request.reservationId,
          request.current.fencingToken,
          "refunded",
        );
      }
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "action_denied",
          reasonCode: error instanceof Error ? error.message : "reservation_or_authorization_failed",
        },
        aggregate.sequence,
      );
      return { aggregate, effectOccurred: false, missionEvaluationRequired: false };
    }

    aggregate = await this.repository.appendEvent(
      {
        ...eventBase(aggregate.sequence + 1),
        type: "reservation_acquired",
        reservationId: request.reservationId,
        idempotencyKey: request.idempotencyKey,
      },
      aggregate.sequence,
    );

    const attemptId = request.attemptId ?? crypto.randomUUID();
    aggregate = await this.repository.appendEvent(
      {
        ...eventBase(aggregate.sequence + 1),
        type: "attempt_started",
        attemptId,
        attemptNumber: aggregate.attemptCount + 1,
      },
      aggregate.sequence,
    );

    const context = this.attemptContext(request, attemptId);
    let execution;
    try {
      execution = await adapter.execute(request.action, context);
    } catch (error) {
      execution = {
        status: "uncertain" as const,
        reasonCode: error instanceof Error ? `adapter_exception:${error.name}` : "adapter_exception",
      };
    }

    if (execution.status === "authentication_required") {
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "authentication_required",
          handoffRef: execution.handoffRef,
        },
        aggregate.sequence,
      );
      return { aggregate, effectOccurred: false, missionEvaluationRequired: false };
    }

    if (execution.status === "failed") {
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "action_failed",
          failureCode: execution.failureCode,
          providerProvedNoEffect: execution.providerProvedNoEffect,
        },
        aggregate.sequence,
      );
      await this.repository.transitionReservation(
        request.reservationId,
        request.current.fencingToken,
        "refunded",
      );
      return { aggregate, effectOccurred: false, missionEvaluationRequired: false };
    }

    if (execution.status === "uncertain") {
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "action_uncertain",
          reasonCode: execution.reasonCode,
        },
        aggregate.sequence,
      );
      await this.repository.transitionReservation(
        request.reservationId,
        request.current.fencingToken,
        "reconciling",
      );
      return { aggregate, effectOccurred: "unknown", missionEvaluationRequired: false };
    }

    aggregate = await this.repository.appendEvent(
      {
        ...eventBase(aggregate.sequence + 1),
        type: "provider_acknowledged",
        attemptId,
        providerObjectId: execution.providerObjectId,
        ...(execution.providerReceiptRef === undefined
          ? {}
          : { providerReceiptRef: execution.providerReceiptRef }),
      },
      aggregate.sequence,
    );

    let verification;
    try {
      verification = await adapter.verify(request.action, execution.providerObjectId, context);
    } catch (error) {
      verification = {
        status: "uncertain" as const,
        observedAt: new Date().toISOString(),
        reasonCode: error instanceof Error ? `verifier_exception:${error.name}` : "verifier_exception",
      };
    }

    if (verification.status === "verified" || verification.status === "mismatch") {
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "verification_observed",
          observation: verification.observation,
        },
        aggregate.sequence,
      );
    }

    if (verification.status === "verified") {
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "action_verified",
          permanent: adapter.contract.explicitIrreversibility,
          evidenceClass: request.evidenceClass,
        },
        aggregate.sequence,
      );
      await this.repository.transitionReservation(
        request.reservationId,
        request.current.fencingToken,
        "committed",
      );
      return { aggregate, effectOccurred: true, missionEvaluationRequired: true };
    }

    if (verification.status === "mismatch") {
      // The mismatched independent observation already reduces the aggregate
      // to `uncertain`. A second uncertainty event would be a redundant and
      // illegal state transition.
      await this.repository.transitionReservation(
        request.reservationId,
        request.current.fencingToken,
        "reconciling",
      );
      return { aggregate, effectOccurred: "unknown", missionEvaluationRequired: false };
    }

    aggregate = await this.repository.appendEvent(
      {
        ...eventBase(aggregate.sequence + 1),
        type: "action_uncertain",
        reasonCode:
          verification.status === "not_visible_yet" ? "provider_state_not_visible" : verification.reasonCode,
      },
      aggregate.sequence,
    );
    await this.repository.transitionReservation(
      request.reservationId,
      request.current.fencingToken,
      "reconciling",
    );
    return { aggregate, effectOccurred: "unknown", missionEvaluationRequired: false };
  }

  async reconcile(request: BrokerExecutionRequest): Promise<BrokerExecutionResult> {
    let aggregate = await this.repository.getAggregate(request.action.actionId);
    if (aggregate === undefined) throw new Error("Cannot reconcile unknown action");
    if (aggregate.status !== "uncertain" && aggregate.status !== "reconciling") return {
      aggregate,
      effectOccurred:
        aggregate.status === "verified" || aggregate.status === "permanent_verified" ? true : false,
      missionEvaluationRequired:
        aggregate.status === "verified" || aggregate.status === "permanent_verified",
    };

    const adapter = this.registry.require(request.action.actionFamily, request.action.adapterVersion);
    const attemptId = request.attemptId ?? crypto.randomUUID();
    const eventBase = this.eventBase(request);
    aggregate = await this.repository.appendEvent(
      {
        ...eventBase(aggregate.sequence + 1),
        type: "reconciliation_started",
        attemptId,
      },
      aggregate.sequence,
    );
    const result = await adapter.reconcile(
      request.action,
      aggregate.providerObjectId,
      this.attemptContext(request, attemptId),
    );

    if (result.status === "verified") {
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "verification_observed",
          observation: result.verification.observation,
        },
        aggregate.sequence,
      );
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "action_verified",
          permanent: adapter.contract.explicitIrreversibility,
          evidenceClass: request.evidenceClass,
        },
        aggregate.sequence,
      );
      await this.repository.transitionReservation(
        request.reservationId,
        request.current.fencingToken,
        "committed",
      );
      return { aggregate, effectOccurred: true, missionEvaluationRequired: true };
    }

    if (result.status === "failed") {
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "action_failed",
          failureCode: result.failureCode,
          providerProvedNoEffect: true,
        },
        aggregate.sequence,
      );
      await this.repository.transitionReservation(
        request.reservationId,
        request.current.fencingToken,
        "refunded",
      );
      return { aggregate, effectOccurred: false, missionEvaluationRequired: false };
    }

    aggregate = await this.repository.appendEvent(
      {
        ...eventBase(aggregate.sequence + 1),
        type: "action_uncertain",
        reasonCode: result.reasonCode,
      },
      aggregate.sequence,
    );
    return { aggregate, effectOccurred: "unknown", missionEvaluationRequired: false };
  }

  async compensate(
    request: BrokerExecutionRequest,
    preState: import("./schemas.js").JsonValue | undefined,
  ): Promise<BrokerExecutionResult> {
    let aggregate = await this.repository.getAggregate(request.action.actionId);
    if (aggregate === undefined) throw new Error("Cannot compensate unknown action");
    if (aggregate.providerObjectId === undefined) throw new Error("No provider object to compensate");

    const adapter = this.registry.require(request.action.actionFamily, request.action.adapterVersion);
    if (adapter.compensate === undefined || adapter.contract.compensationRef === undefined) {
      throw new Error("Effect has no truthful compensator");
    }

    const attemptId = request.attemptId ?? crypto.randomUUID();
    const eventBase = this.eventBase(request);
    aggregate = await this.repository.appendEvent(
      {
        ...eventBase(aggregate.sequence + 1),
        type: "compensation_started",
        compensationAttemptId: attemptId,
      },
      aggregate.sequence,
    );
    const providerObjectId = aggregate.providerObjectId;
    if (providerObjectId === undefined) throw new Error("No provider object to compensate");
    const result = await adapter.compensate(
      request.action,
      providerObjectId,
      preState,
      this.attemptContext(request, attemptId),
    );

    if (result.status === "compensated") {
      if (!result.observation.matched) throw new Error("Compensator did not independently verify reversal");
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "verification_observed",
          observation: result.observation,
        },
        aggregate.sequence,
      );
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "action_compensated",
          observation: result.observation,
        },
        aggregate.sequence,
      );
      return { aggregate, effectOccurred: false, missionEvaluationRequired: true };
    }

    if (result.status === "failed") {
      aggregate = await this.repository.appendEvent(
        {
          ...eventBase(aggregate.sequence + 1),
          type: "compensation_failed",
          failureCode: result.failureCode,
        },
        aggregate.sequence,
      );
      return { aggregate, effectOccurred: true, missionEvaluationRequired: true };
    }

    aggregate = await this.repository.appendEvent(
      {
        ...eventBase(aggregate.sequence + 1),
        type: "action_uncertain",
        reasonCode: result.reasonCode,
      },
      aggregate.sequence,
    );
    return { aggregate, effectOccurred: "unknown", missionEvaluationRequired: true };
  }

  private eventBase(request: BrokerExecutionRequest): (sequence: number) => Omit<ActionEvent, "type"> {
    return (sequence) => ({
      eventId: crypto.randomUUID(),
      actionId: request.action.actionId,
      sequence,
      occurredAt: new Date().toISOString(),
      actor: "mozi-operator",
      intentEpoch: request.current.intentEpoch,
      mandateVersion: request.current.mandateVersion,
      policyHash: request.plan.policyHash,
      consentEpoch: request.current.consentEpoch,
      connectorEpoch: request.current.connectorEpoch,
      killSwitchEpoch: request.current.killSwitchEpoch,
      fencingToken: request.current.fencingToken.toString(),
    });
  }

  private attemptContext(request: BrokerExecutionRequest, attemptId: string): ProviderAttemptContext {
    return {
      attemptId,
      idempotencyKey: request.idempotencyKey,
      fencingToken: request.current.fencingToken,
      intentEpoch: request.current.intentEpoch,
      mandateVersion: request.current.mandateVersion,
      consentEpoch: request.current.consentEpoch,
      connectorEpoch: request.current.connectorEpoch,
      killSwitchEpoch: request.current.killSwitchEpoch,
    };
  }
}
