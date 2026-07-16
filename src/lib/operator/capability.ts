import type { CanonicalOperatorAction, CapabilityCell, ConsequenceVector, Money } from "./schemas.js";

const verificationRank = { V0: 0, V1: 1, V2: 2, V3: 3, V4: 4 } as const;
const reachRank = { private: 0, bounded_group: 1, organization: 2, public: 3 } as const;
const propagationRank = { single_object: 0, multiple_objects: 1, external_people: 2, public: 3 } as const;
const reversibilityRank = { full: 0, time_limited: 1, partial: 2, none: 3 } as const;

export type CapabilityMatch =
  | { matches: true }
  | {
      matches: false;
      code:
        | "identity_mismatch"
        | "family_mismatch"
        | "provider_mismatch"
        | "account_mismatch"
        | "target_mismatch"
        | "purpose_mismatch"
        | "consequence_exceeds_ceiling"
        | "amount_exceeds_ceiling"
        | "verification_too_weak"
        | "idempotency_not_allowed"
        | "capability_not_current";
      detail: string;
    };

function moneyWithin(value: Money | undefined, ceiling: Money | undefined): boolean {
  if (value === undefined) return true;
  if (ceiling === undefined) return false;
  return value.currency === ceiling.currency && value.amountMinor <= ceiling.amountMinor;
}

function consequenceWithin(value: ConsequenceVector, ceiling: ConsequenceVector): boolean {
  if (!moneyWithin(value.financialMaxLoss, ceiling.financialMaxLoss)) return false;
  return (
    value.privacySeverity <= ceiling.privacySeverity &&
    reachRank[value.publicReach] <= reachRank[ceiling.publicReach] &&
    value.legalFinality <= ceiling.legalFinality &&
    value.healthImpact <= ceiling.healthImpact &&
    value.physicalImpact <= ceiling.physicalImpact &&
    value.accountSecurityImpact <= ceiling.accountSecurityImpact &&
    propagationRank[value.propagation] <= propagationRank[ceiling.propagation] &&
    reversibilityRank[value.reversibility] <= reversibilityRank[ceiling.reversibility]
  );
}

export function matchCapabilityCell(
  action: CanonicalOperatorAction,
  cell: CapabilityCell,
  now: Date,
): CapabilityMatch {
  if (action.userId !== cell.userId) {
    return { matches: false, code: "identity_mismatch", detail: "Capability belongs to another user" };
  }
  if (action.domain !== cell.domain || action.actionFamily !== cell.actionFamily) {
    return { matches: false, code: "family_mismatch", detail: "Domain or action family does not match" };
  }
  if (action.provider !== cell.provider) {
    return { matches: false, code: "provider_mismatch", detail: "Provider does not match" };
  }
  if (action.providerAccountId !== cell.providerAccountId) {
    return { matches: false, code: "account_mismatch", detail: "Provider account does not match" };
  }
  if (action.target.type !== cell.targetType || !cell.exactTargetIds.includes(action.target.id)) {
    return { matches: false, code: "target_mismatch", detail: "Exact target is outside the capability cell" };
  }
  if (action.purpose !== cell.purpose) {
    return { matches: false, code: "purpose_mismatch", detail: "Purpose does not match" };
  }
  if (!consequenceWithin(action.consequence, cell.consequenceCeiling)) {
    return {
      matches: false,
      code: "consequence_exceeds_ceiling",
      detail: "Action consequence exceeds the capability ceiling",
    };
  }
  if (!moneyWithin(action.amount, cell.amountCeiling)) {
    return { matches: false, code: "amount_exceeds_ceiling", detail: "Action amount exceeds the ceiling" };
  }
  if (verificationRank[action.requiredVerificationGrade] < verificationRank[cell.minimumVerificationGrade]) {
    return {
      matches: false,
      code: "verification_too_weak",
      detail: "Action does not require the capability's minimum verification grade",
    };
  }
  if (!cell.allowedIdempotencyClasses.includes(action.idempotencyClass)) {
    return {
      matches: false,
      code: "idempotency_not_allowed",
      detail: "Action idempotency strategy is not permitted by this capability",
    };
  }
  const timestamp = now.getTime();
  if (timestamp < new Date(cell.validFrom).getTime() || timestamp >= new Date(cell.expiresAt).getTime()) {
    return { matches: false, code: "capability_not_current", detail: "Capability is not currently valid" };
  }
  return { matches: true };
}
