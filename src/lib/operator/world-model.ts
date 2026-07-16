import type { CanonicalOperatorAction, JsonValue } from "./schemas.js";

export type WorldModelCapabilityLevel = "L0_registered" | "L1_predictor" | "L2_simulator" | "L3_evolver";

export type BeliefState = {
  beliefStateId: string;
  userId: string;
  domain: string;
  validAt: string;
  sourceEventIds: string[];
  latentRef?: string;
  structuredBeliefs: Record<string, {
    value: JsonValue;
    probability?: number;
    epistemicUncertainty: number;
    aleatoricUncertainty: number;
    freshness: number;
  }>;
};

export type PredictionEvidence = {
  artifactId: string;
  artifactHash: string;
  capabilityLevel: WorldModelCapabilityLevel;
  domain: string;
  transitionFamily: string;
  calibrationEpoch: string;
  supportRegion: "in_support" | "weak_support" | "out_of_support";
  epistemicUncertainty: number;
  aleatoricUncertainty: number;
  oodScore: number;
  certifiedHorizonSteps: number;
  certifiedHorizonMs?: number;
  generatedAt: string;
};

export type TransitionPrediction = {
  predictionId: string;
  action: CanonicalOperatorAction;
  nextStateDistribution: JsonValue;
  expectedObservationDistribution: JsonValue;
  goalOutcomeDistribution: JsonValue;
  riskDistribution: JsonValue;
  evidence: PredictionEvidence;
};

export type InterventionConsistencyReport = {
  reportId: string;
  baselinePredictionId: string;
  interventionPredictionId: string;
  changedVariables: string[];
  invariantViolations: string[];
  interventionSensitive: boolean;
  passed: boolean;
};

export interface HumanContextWorldModel {
  readonly artifactId: string;
  readonly capabilityLevel: WorldModelCapabilityLevel;
  updateBelief(input: {
    previous?: BeliefState;
    observations: JsonValue[];
    observationProcess: JsonValue;
  }): Promise<BeliefState>;
  predictTransition(input: {
    belief: BeliefState;
    action: CanonicalOperatorAction;
    horizonSteps: number;
  }): Promise<TransitionPrediction>;
  evaluateIntervention(input: {
    baseline: TransitionPrediction;
    intervention: TransitionPrediction;
  }): Promise<InterventionConsistencyReport>;
}

export type ModelServingReceipt = {
  artifactId: string;
  artifactHash: string;
  modelFamily: string;
  domain: string;
  outputHeads: string[];
  capabilityLevel: WorldModelCapabilityLevel;
  supportedTransitions: string[];
  certifiedHorizons: Record<string, number>;
  datasetManifestHash: string;
  evaluationManifestHash: string;
  privacyReceiptHash: string;
  runtimeReceiptHash: string;
  rollbackReceiptHash: string;
  validFrom: string;
  expiresAt: string;
  authorityContribution: 0;
};

export type ModelInfluenceReceipt = {
  influenceId: string;
  actionId: string;
  planId: string;
  artifactId: string;
  outputHead: string;
  candidateSetHash: string;
  selectedCandidateProbability: number;
  abstentionProbability: number;
  supportRegion: PredictionEvidence["supportRegion"];
  authorityContribution: 0;
  createdAt: string;
};
