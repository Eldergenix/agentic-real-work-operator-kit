import type { ActionAggregate } from "./lifecycle.js";
import type { MissionOutcome } from "./mission-outcome.js";
import type { EffectContract, VerificationGrade } from "./schemas.js";

export type ActionReceiptProjection = {
  actionId: string;
  effectStatus: ActionAggregate["status"];
  missionStatus?: MissionOutcome["status"];
  providerObjectId?: string;
  strongestVerificationGrade?: VerificationGrade;
  recoveryLabel:
    | "Undo"
    | "Cancel"
    | "Restore"
    | "Request refund"
    | "Confirm refund"
    | "Correct"
    | "Mitigate"
    | "No reversal available";
  certaintyLabel: string;
};

export function projectActionReceipt(
  aggregate: ActionAggregate,
  contract: EffectContract,
  mission?: MissionOutcome,
): ActionReceiptProjection {
  const recoveryLabel: ActionReceiptProjection["recoveryLabel"] = (() => {
    switch (contract.recoverySemantics) {
      case "true_reversal": return "Undo";
      case "time_limited_cancellation": return "Cancel";
      case "restoration": return "Restore";
      case "refund_initiated": return "Request refund";
      case "refund_settled": return "Confirm refund";
      case "correction": return "Correct";
      case "mitigation":
      case "partial_reversal": return "Mitigate";
      case "irreversible": return "No reversal available";
    }
  })();

  const certaintyLabel = (() => {
    switch (aggregate.status) {
      case "verified": return "Independent verification confirmed the provider effect.";
      case "permanent_verified": return "Independent verification confirmed a permanent effect.";
      case "provider_acknowledged": return "The provider accepted the request; verification is pending.";
      case "uncertain":
      case "reconciling": return "Operator Kit cannot yet determine the external outcome and will not assume success.";
      case "compensated": return "The registered recovery was independently verified.";
      case "compensation_failed": return "The recovery attempt failed; the original effect may remain.";
      case "failed": return "The provider proved that no effect occurred.";
      default: return `Action state: ${aggregate.status}.`;
    }
  })();

  return {
    actionId: aggregate.actionId,
    effectStatus: aggregate.status,
    ...(mission === undefined ? {} : { missionStatus: mission.status }),
    ...(aggregate.providerObjectId === undefined ? {} : { providerObjectId: aggregate.providerObjectId }),
    ...(aggregate.lastVerification?.grade === undefined
      ? {}
      : { strongestVerificationGrade: aggregate.lastVerification.grade }),
    recoveryLabel,
    certaintyLabel,
  };
}
