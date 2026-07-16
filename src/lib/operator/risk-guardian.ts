import type { Money } from "./schemas.js";

export type RiskEstimate = {
  expectedLoss?: Money;
  tailLoss95?: Money;
  wrongTargetUpperBound: number;
  policyViolationUpperBound: number;
  irreversibleRegretUpperBound: number;
  privacyIncidentUpperBound: number;
  oodScore: number;
  supportRegion: "in_support" | "weak_support" | "out_of_support";
  artifactId?: string;
  calibratedAt: string;
};

export type RiskBudget = {
  expectedLossCeiling?: Money;
  tailLoss95Ceiling?: Money;
  wrongTargetUpperBound: number;
  policyViolationUpperBound: number;
  irreversibleRegretUpperBound: number;
  privacyIncidentUpperBound: number;
  maxOodScore: number;
  allowWeakSupport: boolean;
};

export type SupportRecommendation =
  | "refresh_provider_state"
  | "stronger_verifier"
  | "clarify_non_authority_information"
  | "request_authentication"
  | "request_new_authority"
  | "abort_or_compensate";

export type RiskDecision =
  | { decision: "execute"; reasons: [] }
  | {
      decision: "abstain";
      reasons: string[];
      recommendedSupport: SupportRecommendation;
    };

function moneyExceeds(value: Money | undefined, ceiling: Money | undefined): boolean {
  if (value === undefined) return false;
  if (ceiling === undefined) return true;
  return value.currency !== ceiling.currency || value.amountMinor > ceiling.amountMinor;
}

export function evaluateRisk(estimate: RiskEstimate, budget: RiskBudget): RiskDecision {
  const reasons: string[] = [];
  if (moneyExceeds(estimate.expectedLoss, budget.expectedLossCeiling)) reasons.push("expected_loss");
  if (moneyExceeds(estimate.tailLoss95, budget.tailLoss95Ceiling)) reasons.push("tail_loss");
  if (estimate.wrongTargetUpperBound > budget.wrongTargetUpperBound) reasons.push("wrong_target");
  if (estimate.policyViolationUpperBound > budget.policyViolationUpperBound) reasons.push("policy_violation");
  if (estimate.irreversibleRegretUpperBound > budget.irreversibleRegretUpperBound) {
    reasons.push("irreversible_regret");
  }
  if (estimate.privacyIncidentUpperBound > budget.privacyIncidentUpperBound) reasons.push("privacy");
  if (estimate.oodScore > budget.maxOodScore) reasons.push("ood");
  if (estimate.supportRegion === "out_of_support") reasons.push("out_of_support");
  if (estimate.supportRegion === "weak_support" && !budget.allowWeakSupport) reasons.push("weak_support");

  if (reasons.length === 0) return { decision: "execute", reasons: [] };

  let recommendedSupport: SupportRecommendation;
  if (reasons.includes("ood") || reasons.includes("out_of_support") || reasons.includes("weak_support")) {
    recommendedSupport = "refresh_provider_state";
  } else if (reasons.includes("wrong_target")) {
    recommendedSupport = "clarify_non_authority_information";
  } else if (reasons.includes("policy_violation")) {
    recommendedSupport = "request_new_authority";
  } else if (reasons.includes("privacy") || reasons.includes("tail_loss")) {
    recommendedSupport = "abort_or_compensate";
  } else {
    recommendedSupport = "stronger_verifier";
  }

  return { decision: "abstain", reasons, recommendedSupport };
}
