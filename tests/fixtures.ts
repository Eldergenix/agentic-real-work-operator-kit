import { hashAction, hashTarget } from "../src/lib/operator/action-hash.js";
import { canonicalHash } from "../src/lib/operator/canonical.js";
import { finalizeGoalSpec } from "../src/lib/operator/goal-spec.js";
import { finalizePlanIR } from "../src/lib/operator/plan-ir.js";
import type { BrokerExecutionRequest } from "../src/lib/operator/broker.js";
import type {
  AuthorizationEvidence,
  CanonicalOperatorAction,
  CapabilityCell,
  GoalSpec,
  JsonValue,
  Mandate,
  PlanIR,
  ProvenanceGraph,
} from "../src/lib/operator/schemas.js";

const future = (ms: number): string => new Date(Date.now() + ms).toISOString();
const past = (ms: number): string => new Date(Date.now() - ms).toISOString();

export type FixtureBundle = {
  request: BrokerExecutionRequest;
  action: CanonicalOperatorAction;
  goal: GoalSpec;
  plan: PlanIR;
  provenance: ProvenanceGraph;
  mandate: Mandate;
  capabilityCell: CapabilityCell;
};

export async function makeFixtureBundle(options: {
  authorizationKind?: "direct_command" | "operator_mandate";
  provider?: "fixture_calendar" | "google_calendar";
  adapterVersion?: "fixture-v1" | "google-calendar-v1";
  targetId?: string;
  riskExpectedLossMinor?: number;
  budgetExpectedLossMinor?: number;
} = {}): Promise<FixtureBundle> {
  const authorizationKind = options.authorizationKind ?? "direct_command";
  const provider = options.provider ?? "fixture_calendar";
  const adapterVersion = options.adapterVersion ?? "fixture-v1";
  const userId = crypto.randomUUID();
  const goalId = crypto.randomUUID();
  const planId = crypto.randomUUID();
  const actionId = crypto.randomUUID();
  const mandateId = crypto.randomUUID();
  const capabilityCellId = crypto.randomUUID();
  const policyHash = "a".repeat(64);
  const consentEpoch = "consent-1";
  const target = {
    type: "calendar",
    id: options.targetId ?? "primary",
    provider,
    accountId: "account-1",
  };
  const targetHash = await hashTarget(target);
  const args: JsonValue = {
    calendarId: "primary",
    summary: "Protected focus block",
    start: { dateTime: future(3_600_000), timeZone: "Europe/Brussels" },
    end: { dateTime: future(7_200_000), timeZone: "Europe/Brussels" },
    attendees: [],
    sendUpdates: "none",
    visibility: "private",
    transparency: "opaque",
  };
  const argumentsHash = await canonicalHash(args);
  const goal = await finalizeGoalSpec({
    goalId,
    version: 1,
    intentEpoch: 1,
    userId,
    conversationId: "conversation-1",
    sourceMessageIds: ["message-1"],
    objective: "Create a private focus block",
    terminalPredicates: [
      {
        predicateId: "event-summary",
        description: "The created event has the requested summary",
        kind: "provider_state",
        expression: { path: "summary", operator: "eq", expected: "Protected focus block" },
        maturityHorizonMs: 0,
        requiredVerificationGrade: "V2",
      },
    ],
    forbiddenSideEffects: [],
    authoritySlots: {
      actionFamily: {
        value: "calendar.event.create",
        source: "explicit_user_text",
        provenanceNodeId: "user-action-family",
      },
      target: {
        value: target as unknown as JsonValue,
        source: "provider_unique_resolution",
        provenanceNodeId: "provider-target",
      },
    },
    unresolvedSlots: [],
    mandateId,
    policyHash,
    consentEpoch,
    validUntil: future(900_000),
  });

  const action: CanonicalOperatorAction = {
    actionId,
    logicalEffectId: crypto.randomUUID(),
    userId,
    goalId,
    goalSpecHash: goal.canonicalHash,
    planId,
    planVersion: 1,
    nodeId: "create-focus-event",
    intentEpoch: 1,
    domain: "calendar",
    actionFamily: "calendar.event.create",
    provider,
    providerAccountId: "account-1",
    target,
    arguments: args,
    argumentsHash,
    purpose: "daily_planning",
    consequence: {
      privacySeverity: 1,
      publicReach: "private",
      legalFinality: 0,
      healthImpact: 0,
      physicalImpact: 0,
      accountSecurityImpact: 0,
      propagation: "single_object",
      reversibility: "full",
    },
    requiredVerificationGrade: "V2",
    idempotencyClass: "client_generated_object_id",
    adapterVersion,
    expiresAt: future(900_000),
  };

  const plan = await finalizePlanIR({
    planId,
    planVersion: 1,
    userId,
    goalId,
    goalSpecHash: goal.canonicalHash,
    intentEpoch: 1,
    mandateVersion: 1,
    policyHash,
    consentEpoch,
    provenanceRootHash: "b".repeat(64),
    expiresAt: future(900_000),
    nodes: [
      {
        nodeId: action.nodeId,
        action,
        protectedInputBindings: [
          {
            fieldPath: "target",
            valueHash: targetHash,
            provenanceNodeId: "provider-target",
            requiredIntegrity: "high",
            requiredPurpose: "daily_planning",
            minimumAuthority: "authoritative_fact",
          },
        ],
        preconditions: [],
        expectedPostconditions: goal.terminalPredicates,
        verificationRef: "fixture-calendar-get-v1",
        compensationRef: "fixture-calendar-delete-v1",
        recoverySemantics: "true_reversal",
        maxAttempts: 2,
      },
    ],
    edges: [],
    terminalPredicates: goal.terminalPredicates,
  });

  const provenance: ProvenanceGraph = {
    rootNodeId: "provider-target",
    nodes: [
      {
        nodeId: "provider-target",
        kind: "provider_observation",
        valueHash: targetHash,
        label: {
          origin: "provider_system_of_record",
          integrity: "high",
          sensitivity: "private",
          purposes: ["daily_planning"],
          observedAt: new Date().toISOString(),
          ingestedAt: new Date().toISOString(),
          originRef: "fixture-calendar-list",
          transformationRefs: [],
          authorityCeiling: "authoritative_fact",
        },
      },
    ],
    edges: [],
  };

  const capabilityCell: CapabilityCell = {
    capabilityCellId,
    userId,
    mandateId,
    mandateVersion: 1,
    productTier: "A2",
    domain: "calendar",
    actionFamily: "calendar.event.create",
    provider,
    providerAccountId: "account-1",
    targetType: "calendar",
    exactTargetIds: [target.id],
    purpose: "daily_planning",
    consequenceCeiling: {
      privacySeverity: 1,
      publicReach: "private",
      legalFinality: 0,
      healthImpact: 0,
      physicalImpact: 0,
      accountSecurityImpact: 0,
      propagation: "single_object",
      reversibility: "full",
    },
    minimumVerificationGrade: "V2",
    allowedIdempotencyClasses: ["client_generated_object_id"],
    validFrom: past(60_000),
    expiresAt: future(86_400_000),
    evidenceEpoch: "evidence-1",
    policyHash,
  };

  const mandate: Mandate = {
    mandateId,
    userId,
    version: 1,
    status: "active",
    automaticPromotion: true,
    maximumEnvelope: [
      `${capabilityCell.productTier}:${capabilityCell.domain}:${capabilityCell.actionFamily}:${capabilityCell.provider}:${capabilityCell.purpose}`,
    ],
    validFrom: past(60_000),
    expiresAt: future(86_400_000),
    policyHash,
    consentEpoch,
  };

  let authorization: AuthorizationEvidence;
  if (authorizationKind === "operator_mandate") {
    authorization = {
      kind: "operator_mandate",
      mandateId,
      capabilityCellId,
    };
  } else {
    authorization = {
      kind: "direct_command",
      attestationId: crypto.randomUUID(),
      userId,
      conversationId: "conversation-1",
      sourceMessageId: "message-1",
      actionHash: await hashAction(action),
      targetHash,
      policyHash,
      nonce: crypto.randomUUID(),
      expiresAt: future(900_000),
    };
  }

  const request: BrokerExecutionRequest = {
    runId: "run-1",
    action,
    goal,
    plan,
    authorization,
    provenance,
    current: {
      intentEpoch: 1,
      mandateVersion: 1,
      consentEpoch,
      connectorEpoch: "connector-1",
      killSwitchEpoch: "kill-1",
      killSwitchActive: false,
      fencingToken: 1n,
      now: new Date(),
    },
    ...(authorizationKind === "operator_mandate" ? { mandate, capabilityCell } : {}),
    idempotencyKey: `idempotency:${action.logicalEffectId}`,
    reservationId: crypto.randomUUID(),
    riskEstimate: {
      wrongTargetUpperBound: 0,
      policyViolationUpperBound: 0,
      irreversibleRegretUpperBound: 0,
      privacyIncidentUpperBound: 0,
      oodScore: 0,
      supportRegion: "in_support",
      calibratedAt: new Date().toISOString(),
      expectedLoss: {
        amountMinor: options.riskExpectedLossMinor ?? 0,
        currency: "EUR",
      },
    },
    riskBudget: {
      wrongTargetUpperBound: 0.01,
      policyViolationUpperBound: 0.01,
      irreversibleRegretUpperBound: 0.01,
      privacyIncidentUpperBound: 0.01,
      maxOodScore: 0.1,
      allowWeakSupport: false,
      expectedLossCeiling: {
        amountMinor: options.budgetExpectedLossMinor ?? 0,
        currency: "EUR",
      },
    },
    evidenceClass: "fixture",
  };

  return { request, action, goal, plan, provenance, mandate, capabilityCell };
}
