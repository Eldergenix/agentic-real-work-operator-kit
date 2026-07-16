import type { ActionAggregate, ActionStatus } from "./lifecycle.js";
import type { MissionOutcome } from "./mission-outcome.js";
import type { EffectContract, VerificationGrade } from "./schemas.js";

export type OperatorTone = "neutral" | "positive" | "caution" | "critical";
export type UserControl =
  | "wait"
  | "refresh_verification"
  | "authenticate"
  | "reconcile"
  | "cancel"
  | "restore"
  | "undo"
  | "request_refund"
  | "confirm_refund"
  | "correct"
  | "mitigate"
  | "acknowledge_permanent_effect"
  | "contact_support";

export type ActionCardProjection = {
  title: string;
  stateLabel: string;
  detail: string;
  tone: OperatorTone;
  terminal: boolean;
  effectStatus: ActionStatus;
  missionStatus?: MissionOutcome["status"];
  providerObjectId?: string;
  verificationGrade?: VerificationGrade;
  controls: UserControl[];
  residualPropagationWarning?: string;
};

export function projectActionCard(
  aggregate: ActionAggregate,
  contract: EffectContract,
  actionLabel: string,
  mission?: MissionOutcome,
): ActionCardProjection {
  const base = statusPresentation(aggregate.status);
  const controls = controlsFor(aggregate.status, contract);
  const residualPropagationWarning = residualWarning(contract);

  return {
    title: actionLabel,
    stateLabel: base.stateLabel,
    detail: base.detail,
    tone: base.tone,
    terminal: aggregate.terminal,
    effectStatus: aggregate.status,
    ...(mission === undefined ? {} : { missionStatus: mission.status }),
    ...(aggregate.providerObjectId === undefined ? {} : { providerObjectId: aggregate.providerObjectId }),
    ...(aggregate.lastVerification?.grade === undefined
      ? {}
      : { verificationGrade: aggregate.lastVerification.grade }),
    controls,
    ...(residualPropagationWarning === undefined ? {} : { residualPropagationWarning }),
  };
}

function statusPresentation(status: ActionStatus): Pick<ActionCardProjection, "stateLabel" | "detail" | "tone"> {
  switch (status) {
    case "planned": return { stateLabel: "Planned", detail: "Operator Kit has not requested an external change.", tone: "neutral" };
    case "authorized": return { stateLabel: "Authorized", detail: "The exact action passed the current authority gate.", tone: "neutral" };
    case "reserved": return { stateLabel: "Reserved", detail: "Budget, quota and idempotency reservations are held.", tone: "neutral" };
    case "executing": return { stateLabel: "Sending request", detail: "The provider outcome is not known yet.", tone: "caution" };
    case "provider_acknowledged": return { stateLabel: "Provider accepted", detail: "Operator Kit is independently verifying the external state.", tone: "caution" };
    case "verified": return { stateLabel: "Verified", detail: "An independent provider or device observation matched the intended effect.", tone: "positive" };
    case "permanent_verified": return { stateLabel: "Permanent effect verified", detail: "The effect is confirmed and the action contract does not claim a full reversal.", tone: "critical" };
    case "denied": return { stateLabel: "Not authorized", detail: "The current mandate or exact action policy did not allow this effect.", tone: "caution" };
    case "risk_abstained": return { stateLabel: "Paused for safety", detail: "Authority exists, but current action-level risk or support evidence is insufficient.", tone: "caution" };
    case "awaiting_authentication": return { stateLabel: "Authentication needed", detail: "Complete the provider handoff; Operator Kit will resume the same workflow without receiving your credential.", tone: "caution" };
    case "failed": return { stateLabel: "No effect", detail: "The provider proved that the requested effect did not occur.", tone: "critical" };
    case "uncertain": return { stateLabel: "Outcome uncertain", detail: "Operator Kit cannot determine whether the external effect occurred and will not retry blindly.", tone: "critical" };
    case "reconciling": return { stateLabel: "Checking provider state", detail: "Operator Kit is reading the system of record before deciding whether another attempt is safe.", tone: "caution" };
    case "compensating": return { stateLabel: "Recovering", detail: "Operator Kit is performing the registered recovery and has not confirmed it yet.", tone: "caution" };
    case "compensated": return { stateLabel: "Recovery verified", detail: "The registered cancellation, restoration or reversal was independently confirmed.", tone: "positive" };
    case "compensation_failed": return { stateLabel: "Recovery failed", detail: "The original effect may remain. Review the provider state and support options.", tone: "critical" };
    case "expired": return { stateLabel: "Expired", detail: "The action expired before a provider attempt began.", tone: "neutral" };
    case "superseded": return { stateLabel: "Replaced", detail: "A newer user intent superseded this unstarted or unresolved action.", tone: "neutral" };
    case "aborted": return { stateLabel: "Stopped", detail: "Execution stopped without claiming a provider effect.", tone: "neutral" };
  }
}

function controlsFor(status: ActionStatus, contract: EffectContract): UserControl[] {
  if (status === "awaiting_authentication") return ["authenticate"];
  if (status === "provider_acknowledged") return ["wait", "refresh_verification"];
  if (status === "uncertain" || status === "reconciling") return ["reconcile", "contact_support"];
  if (status === "compensation_failed") return ["reconcile", "contact_support"];
  if (status === "permanent_verified") return ["acknowledge_permanent_effect"];
  if (status !== "verified") return [];

  switch (contract.recoverySemantics) {
    case "true_reversal": return ["undo"];
    case "time_limited_cancellation": return ["cancel"];
    case "restoration": return ["restore"];
    case "refund_initiated": return ["request_refund"];
    case "refund_settled": return ["confirm_refund"];
    case "correction": return ["correct"];
    case "mitigation":
    case "partial_reversal": return ["mitigate"];
    case "irreversible": return ["acknowledge_permanent_effect"];
  }
}

function residualWarning(contract: EffectContract): string | undefined {
  switch (contract.recoverySemantics) {
    case "mitigation":
    case "partial_reversal":
      return "Some external propagation or consequences may remain after recovery.";
    case "correction":
      return "A correction does not remove the original communication or disclosure.";
    case "refund_initiated":
      return "A refund request is not complete until the provider confirms settlement.";
    case "irreversible":
      return "No full reversal is available for this effect.";
    default:
      return undefined;
  }
}
