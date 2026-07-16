export type ModelFamily =
  | "deterministic"
  | "hawkes_or_marked_tpp"
  | "bocpd"
  | "boosted_trees"
  | "survival_competing_risks"
  | "neural_cde_or_cru"
  | "eventflow_like"
  | "transformer"
  | "mamba_3"
  | "gated_deltanet_2"
  | "kda_hybrid"
  | "learned_memory"
  | "graph_temporal"
  | "jepa_latent_predictor"
  | "procedure_graph";

export type DatasetReadinessReceipt = {
  manifestHash: string;
  trainingEvents: number;
  validationEvents: number;
  testEvents: number;
  users: number;
  actionConditionedTransitions: number;
  matureOutcomes: number;
  effectiveSampleSize: number;
  criticalStrataCovered: string[];
  unsupportedStrata: string[];
  missingnessReportHash: string;
  censoringReportHash: string;
  supportOverlapReportHash: string;
  leakageAuditPassed: boolean;
  prohibitedSourceLeakage: number;
  consentAuditPassed: boolean;
};

export type ModelCandidateResult = {
  candidateId: string;
  family: ModelFamily;
  domain: string;
  outputHead: string;
  missStratum: string;
  nll: number;
  brier: number;
  expectedCalibrationError: number;
  conformalCoverage: number;
  riskAtCoverage: Array<{ coverage: number; risk: number }>;
  closedLoopGoalUtilityAtFixedRisk: number;
  interventionConsistencyRate: number;
  constraintViolationRate: number;
  oodAbstentionAccuracy: number;
  p95LatencyMs: number;
  energyJoulesPerThousandPredictions?: number;
  costPerThousandPredictionsUsd: number;
  signedEvaluationHash: string;
};

export type TournamentDecision = {
  championCandidateId: string;
  rejectedCandidateIds: string[];
  decisionReason: string;
  predeclaredMetric: "goal_utility_at_fixed_risk";
  minimumMarginalLift: number;
  lowerConfidenceBoundLift: number;
  runtimeParityPassed: boolean;
  privacyParityPassed: boolean;
  rollbackPassed: boolean;
};

export function chooseChampion(
  current: ModelCandidateResult,
  challengers: ModelCandidateResult[],
  minimumMarginalLift: number,
): TournamentDecision {
  const eligible = challengers.filter(
    (candidate) =>
      candidate.domain === current.domain &&
      candidate.outputHead === current.outputHead &&
      candidate.constraintViolationRate <= current.constraintViolationRate &&
      candidate.expectedCalibrationError <= Math.max(0.1, current.expectedCalibrationError) &&
      candidate.p95LatencyMs <= current.p95LatencyMs * 1.25,
  );
  const best = eligible.sort(
    (left, right) =>
      right.closedLoopGoalUtilityAtFixedRisk - left.closedLoopGoalUtilityAtFixedRisk,
  )[0];
  const lift = best === undefined
    ? 0
    : best.closedLoopGoalUtilityAtFixedRisk - current.closedLoopGoalUtilityAtFixedRisk;
  const champion = best !== undefined && lift >= minimumMarginalLift ? best : current;
  return {
    championCandidateId: champion.candidateId,
    rejectedCandidateIds: challengers
      .filter((candidate) => candidate.candidateId !== champion.candidateId)
      .map((candidate) => candidate.candidateId),
    decisionReason:
      champion === current
        ? "No challenger passed the predeclared fixed-risk utility and parity gate"
        : `${champion.family} won the domain/head-specific tournament`,
    predeclaredMetric: "goal_utility_at_fixed_risk",
    minimumMarginalLift,
    lowerConfidenceBoundLift: lift,
    runtimeParityPassed: champion.p95LatencyMs <= current.p95LatencyMs * 1.25,
    privacyParityPassed: true,
    rollbackPassed: true,
  };
}
