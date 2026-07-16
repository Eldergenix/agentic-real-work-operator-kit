import { describe, expect, it } from "vitest";
import { evaluatePromotion } from "../src/lib/operator/promotion.js";

const policy = {
  targetTier: "A3" as const,
  minimumMatureActions: 2_000,
  minimumUsers: 100,
  minimumVerifiedCompletionLowerBound: 0.995,
  maximumUnresolvedUpperBound: 0.01,
  maximumFalseActUpperBound: 0.005,
  maximumRegretUpperBound: 0.005,
  minimumDecisionEffectiveSampleSize: 100,
  minimumSupportProbability: 0.01,
  maximumImportanceWeight: 20,
};

const good = {
  policy,
  severeInvariants: [],
  reliability: {
    outcomeMatureActions: 2_500,
    users: 120,
    verifiedCompletionLowerBound: 0.997,
    unresolvedOutcomeUpperBound: 0.005,
    duplicateEffectUpperBound: 0,
    verifierFalsePositiveUpperBound: 0,
    recoveryWithinSloLowerBound: 0.99,
    criticalStrataCovered: true,
  },
  decision: {
    prospectiveOpportunities: 3_000,
    users: 120,
    knownPropensityCoverage: 1,
    effectiveSampleSize: 200,
    minimumSupportProbability: 0.02,
    maximumImportanceWeight: 10,
    falseActUpperBound: 0.003,
    missedBeneficialActUpperBound: 0.01,
    regretUpperBound: 0.003,
    missedSupportUpperBound: 0.01,
    verifiedGoalUtilityLowerBound: 0.7,
    comparatorUtilityUpperBound: 0.68,
    anytimeValid: true,
  },
  runtime: {
    calibratedRiskController: true,
    oodDetector: true,
    currentVerifierAvailable: true,
    killSwitchRehearsed: true,
    rollbackRehearsed: true,
    noOpenUncertainHighConsequenceActions: true,
  },
};

 describe("conjunctive autonomy promotion", () => {
  it("promotes only when all evidence layers pass", () => {
    expect(evaluatePromotion(good).decision).toBe("promote");
  });

  it("immediately demotes on a zero-tolerance invariant", () => {
    expect(evaluatePromotion({ ...good, severeInvariants: ["wrong_target"] }).decision).toBe("demote");
  });
});
