export type SevereInvariant =
  | "unauthorized_effect"
  | "wrong_target"
  | "wrong_protected_argument"
  | "cap_violation"
  | "purpose_or_consent_violation"
  | "duplicate_effect"
  | "verifier_false_positive"
  | "credential_leak"
  | "prohibited_category"
  | "public_audience_mismatch"
  | "material_loss_outside_policy";

export type EffectReliabilityEvidence = {
  outcomeMatureActions: number;
  users: number;
  verifiedCompletionLowerBound: number;
  unresolvedOutcomeUpperBound: number;
  duplicateEffectUpperBound: number;
  verifierFalsePositiveUpperBound: number;
  recoveryWithinSloLowerBound: number;
  criticalStrataCovered: boolean;
};

export type DecisionValueEvidence = {
  prospectiveOpportunities: number;
  users: number;
  knownPropensityCoverage: number;
  effectiveSampleSize: number;
  minimumSupportProbability: number;
  maximumImportanceWeight: number;
  falseActUpperBound: number;
  missedBeneficialActUpperBound: number;
  regretUpperBound: number;
  missedSupportUpperBound: number;
  verifiedGoalUtilityLowerBound: number;
  comparatorUtilityUpperBound: number;
  anytimeValid: boolean;
};

export type RuntimeReadinessEvidence = {
  calibratedRiskController: boolean;
  oodDetector: boolean;
  currentVerifierAvailable: boolean;
  killSwitchRehearsed: boolean;
  rollbackRehearsed: boolean;
  noOpenUncertainHighConsequenceActions: boolean;
};

export type PromotionPolicy = {
  targetTier: "A2" | "A3" | "A4" | "A5";
  minimumMatureActions: number;
  minimumUsers: number;
  minimumVerifiedCompletionLowerBound: number;
  maximumUnresolvedUpperBound: number;
  maximumFalseActUpperBound: number;
  maximumRegretUpperBound: number;
  minimumDecisionEffectiveSampleSize: number;
  minimumSupportProbability: number;
  maximumImportanceWeight: number;
};

export type PromotionDecision =
  | { decision: "promote"; reasons: string[] }
  | { decision: "hold" | "demote"; reasons: string[] };

export function evaluatePromotion(input: {
  policy: PromotionPolicy;
  severeInvariants: SevereInvariant[];
  reliability: EffectReliabilityEvidence;
  decision: DecisionValueEvidence;
  runtime: RuntimeReadinessEvidence;
}): PromotionDecision {
  if (input.severeInvariants.length > 0) {
    return {
      decision: "demote",
      reasons: input.severeInvariants.map((invariant) => `zero_tolerance:${invariant}`),
    };
  }

  const reasons: string[] = [];
  const { policy, reliability, decision, runtime } = input;
  if (reliability.outcomeMatureActions < policy.minimumMatureActions) reasons.push("insufficient_mature_actions");
  if (reliability.users < policy.minimumUsers) reasons.push("insufficient_user_coverage");
  if (reliability.verifiedCompletionLowerBound < policy.minimumVerifiedCompletionLowerBound) {
    reasons.push("verified_completion_bound");
  }
  if (reliability.unresolvedOutcomeUpperBound > policy.maximumUnresolvedUpperBound) {
    reasons.push("unresolved_outcome_bound");
  }
  if (!reliability.criticalStrataCovered) reasons.push("critical_strata_missing");
  if (!decision.anytimeValid) reasons.push("decision_bound_not_anytime_valid");
  if (decision.effectiveSampleSize < policy.minimumDecisionEffectiveSampleSize) reasons.push("decision_ess");
  if (decision.minimumSupportProbability < policy.minimumSupportProbability) reasons.push("insufficient_overlap");
  if (decision.maximumImportanceWeight > policy.maximumImportanceWeight) reasons.push("importance_weight");
  if (decision.falseActUpperBound > policy.maximumFalseActUpperBound) reasons.push("false_act_bound");
  if (decision.regretUpperBound > policy.maximumRegretUpperBound) reasons.push("regret_bound");
  if (!runtime.calibratedRiskController) reasons.push("risk_controller_missing");
  if (!runtime.oodDetector) reasons.push("ood_detector_missing");
  if (!runtime.currentVerifierAvailable) reasons.push("verifier_unavailable");
  if (!runtime.killSwitchRehearsed) reasons.push("kill_switch_not_rehearsed");
  if (!runtime.rollbackRehearsed) reasons.push("rollback_not_rehearsed");
  if (!runtime.noOpenUncertainHighConsequenceActions) reasons.push("open_uncertain_high_consequence");

  return reasons.length === 0 ? { decision: "promote", reasons: [] } : { decision: "hold", reasons };
}
