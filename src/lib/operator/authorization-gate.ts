import { hashAction, hashTarget } from "./action-hash.js";
import { matchCapabilityCell } from "./capability.js";
import { assertGoalSpecExecutable } from "./goal-spec.js";
import { assertPlanCurrent } from "./plan-ir.js";
import { evaluateProtectedBindings } from "./provenance.js";
import type {
  AuthorizationEvidence,
  CanonicalOperatorAction,
  CapabilityCell,
  EffectContract,
  GoalSpec,
  Mandate,
  PlanIR,
  ProvenanceGraph,
} from "./schemas.js";

export type CurrentAuthorityState = {
  intentEpoch: number;
  mandateVersion: number;
  consentEpoch: string;
  connectorEpoch: string;
  killSwitchEpoch: string;
  killSwitchActive: boolean;
  now: Date;
};

export type AuthorizationRequest = {
  action: CanonicalOperatorAction;
  goal: GoalSpec;
  plan: PlanIR;
  effect: EffectContract;
  authorization: AuthorizationEvidence;
  provenance: ProvenanceGraph;
  current: CurrentAuthorityState;
  mandate?: Mandate;
  capabilityCell?: CapabilityCell;
};

export type AuthorizationReceipt = {
  decision: "allow";
  authorizationKind: AuthorizationEvidence["kind"];
  authorizationRef: string;
  capabilityCellId?: string;
  actionHash: string;
  targetHash: string;
  policyHash: string;
  intentEpoch: number;
  mandateVersion: number;
  consentEpoch: string;
  connectorEpoch: string;
  killSwitchEpoch: string;
  checkedAt: string;
};

export class AuthorizationDenied extends Error {
  readonly code:
    | "kill_switch"
    | "goal_or_plan_invalid"
    | "contract_mismatch"
    | "authorization_expired"
    | "authorization_consumed"
    | "authorization_hash_mismatch"
    | "mandate_invalid"
    | "capability_invalid"
    | "provenance_denied"
    | "stale_epoch";

  constructor(code: AuthorizationDenied["code"], message: string) {
    super(message);
    this.name = "AuthorizationDenied";
    this.code = code;
  }
}

const verificationRank = { V0: 0, V1: 1, V2: 2, V3: 3, V4: 4 } as const;

function envelopeKey(cell: CapabilityCell): string {
  return `${cell.productTier}:${cell.domain}:${cell.actionFamily}:${cell.provider}:${cell.purpose}`;
}

function assertCommon(request: AuthorizationRequest): void {
  const { action, goal, plan, effect, current } = request;
  if (current.killSwitchActive) throw new AuthorizationDenied("kill_switch", "Global kill switch is active");

  try {
    assertGoalSpecExecutable(goal, current.now);
    assertPlanCurrent(plan, current.intentEpoch, current.now);
  } catch (error) {
    throw new AuthorizationDenied(
      "goal_or_plan_invalid",
      error instanceof Error ? error.message : "Goal or plan is invalid",
    );
  }

  if (
    goal.intentEpoch !== current.intentEpoch ||
    plan.intentEpoch !== current.intentEpoch ||
    action.intentEpoch !== current.intentEpoch
  ) {
    throw new AuthorizationDenied("stale_epoch", "Intent epoch changed");
  }
  if (plan.mandateVersion !== current.mandateVersion) {
    throw new AuthorizationDenied("stale_epoch", "Mandate version changed");
  }
  if (goal.consentEpoch !== current.consentEpoch || plan.consentEpoch !== current.consentEpoch) {
    throw new AuthorizationDenied("stale_epoch", "Consent epoch changed");
  }
  if (
    action.goalId !== goal.goalId ||
    action.goalSpecHash !== goal.canonicalHash ||
    action.planId !== plan.planId ||
    action.planVersion !== plan.planVersion ||
    action.userId !== goal.userId ||
    plan.userId !== goal.userId
  ) {
    throw new AuthorizationDenied("contract_mismatch", "Action, plan, and GoalSpec are not exactly bound");
  }
  const node = plan.nodes.find((candidate) => candidate.nodeId === action.nodeId);
  if (node === undefined || node.action.actionId !== action.actionId) {
    throw new AuthorizationDenied("contract_mismatch", "Action is not a node in the immutable Plan IR");
  }
  if (
    effect.actionFamily !== action.actionFamily ||
    effect.domain !== action.domain ||
    effect.provider !== action.provider ||
    effect.idempotencyClass !== action.idempotencyClass ||
    verificationRank[action.requiredVerificationGrade] < verificationRank[effect.minimumVerificationGrade]
  ) {
    throw new AuthorizationDenied("contract_mismatch", "Action does not satisfy the registered effect contract");
  }
  if (new Date(action.expiresAt).getTime() <= current.now.getTime()) {
    throw new AuthorizationDenied("goal_or_plan_invalid", "Action expired");
  }

  const provenanceDecisions = evaluateProtectedBindings(node.protectedInputBindings, request.provenance);
  const denied = provenanceDecisions.find((decision) => !decision.allowed);
  if (denied !== undefined && !denied.allowed) {
    throw new AuthorizationDenied("provenance_denied", `${denied.code}: ${denied.detail}`);
  }
}

export async function authorizeAction(request: AuthorizationRequest): Promise<AuthorizationReceipt> {
  assertCommon(request);
  const { action, authorization, current } = request;
  const actionHash = await hashAction(action);
  const targetHash = await hashTarget(action.target);

  let authorizationRef: string;
  let capabilityCellId: string | undefined;

  if (authorization.kind === "direct_command" || authorization.kind === "recorded_approval") {
    authorizationRef =
      authorization.kind === "direct_command" ? authorization.attestationId : authorization.approvalId;
    if (authorization.userId !== action.userId) {
      throw new AuthorizationDenied("authorization_hash_mismatch", "Authorization belongs to another user");
    }
    if (authorization.kind === "direct_command") {
      if (
        request.goal.conversationId === undefined ||
        authorization.conversationId !== request.goal.conversationId ||
        !request.goal.sourceMessageIds.includes(authorization.sourceMessageId)
      ) {
        throw new AuthorizationDenied(
          "authorization_hash_mismatch",
          "Direct-command attestation is not bound to the GoalSpec source conversation and message",
        );
      }
    }
    if (authorization.consumedAt !== undefined) {
      throw new AuthorizationDenied("authorization_consumed", "Authorization has already been consumed");
    }
    if (new Date(authorization.expiresAt).getTime() <= current.now.getTime()) {
      throw new AuthorizationDenied("authorization_expired", "Authorization expired");
    }
    if (
      authorization.actionHash !== actionHash ||
      authorization.targetHash !== targetHash ||
      authorization.policyHash !== request.plan.policyHash
    ) {
      throw new AuthorizationDenied("authorization_hash_mismatch", "Authorization does not match exact action");
    }
  } else {
    authorizationRef = authorization.mandateId;
    const mandate = request.mandate;
    const cell = request.capabilityCell;
    if (mandate === undefined || cell === undefined) {
      throw new AuthorizationDenied("mandate_invalid", "Mandate authorization requires a capability cell");
    }
    if (
      mandate.mandateId !== authorization.mandateId ||
      mandate.mandateId !== cell.mandateId ||
      cell.capabilityCellId !== authorization.capabilityCellId ||
      mandate.userId !== action.userId ||
      cell.userId !== action.userId
    ) {
      throw new AuthorizationDenied("mandate_invalid", "Mandate or capability identity mismatch");
    }
    if (
      mandate.status !== "active" ||
      mandate.version !== current.mandateVersion ||
      cell.mandateVersion !== current.mandateVersion ||
      mandate.policyHash !== request.plan.policyHash ||
      cell.policyHash !== request.plan.policyHash ||
      mandate.consentEpoch !== current.consentEpoch ||
      new Date(mandate.validFrom).getTime() > current.now.getTime() ||
      new Date(mandate.expiresAt).getTime() <= current.now.getTime()
    ) {
      throw new AuthorizationDenied("mandate_invalid", "Mandate is not current");
    }
    if (!mandate.maximumEnvelope.includes(envelopeKey(cell))) {
      throw new AuthorizationDenied("mandate_invalid", "Capability is outside the enrolled autonomy envelope");
    }
    const match = matchCapabilityCell(action, cell, current.now);
    if (!match.matches) {
      throw new AuthorizationDenied("capability_invalid", `${match.code}: ${match.detail}`);
    }
    capabilityCellId = cell.capabilityCellId;
  }

  return {
    decision: "allow",
    authorizationKind: authorization.kind,
    authorizationRef,
    ...(capabilityCellId === undefined ? {} : { capabilityCellId }),
    actionHash,
    targetHash,
    policyHash: request.plan.policyHash,
    intentEpoch: current.intentEpoch,
    mandateVersion: current.mandateVersion,
    consentEpoch: current.consentEpoch,
    connectorEpoch: current.connectorEpoch,
    killSwitchEpoch: current.killSwitchEpoch,
    checkedAt: current.now.toISOString(),
  };
}
