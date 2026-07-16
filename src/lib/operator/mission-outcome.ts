import type { GoalPredicate, GoalSpec, JsonValue, VerificationGrade } from "./schemas.js";

export type MissionOutcomeStatus =
  | "open"
  | "evaluating"
  | "goal_satisfied"
  | "partially_satisfied"
  | "goal_failed"
  | "goal_uncertain"
  | "superseded";

export type OutcomeObservation = {
  observationId: string;
  observedAt: string;
  grade: VerificationGrade;
  sourceOfTruth: string;
  state: JsonValue;
};

export type PredicateResult = {
  predicateId: string;
  result: "satisfied" | "violated" | "unknown" | "not_mature";
  observationIds: string[];
  reason: string;
};

export type MissionOutcome = {
  goalId: string;
  intentEpoch: number;
  status: MissionOutcomeStatus;
  evaluatedAt: string;
  predicateResults: PredicateResult[];
  forbiddenSideEffectResults: PredicateResult[];
};

const gradeRank = { V0: 0, V1: 1, V2: 2, V3: 3, V4: 4 } as const;

export interface GoalPredicateEvaluator {
  evaluate(predicate: GoalPredicate, observations: OutcomeObservation[]): PredicateResult;
}

export class JsonPathPredicateEvaluator implements GoalPredicateEvaluator {
  evaluate(predicate: GoalPredicate, observations: OutcomeObservation[]): PredicateResult {
    const eligible = observations.filter(
      (observation) => gradeRank[observation.grade] >= gradeRank[predicate.requiredVerificationGrade],
    );
    const expression = predicate.expression;
    if (
      expression === null ||
      Array.isArray(expression) ||
      typeof expression !== "object" ||
      typeof expression["path"] !== "string" ||
      typeof expression["operator"] !== "string"
    ) {
      return {
        predicateId: predicate.predicateId,
        result: "unknown",
        observationIds: eligible.map((item) => item.observationId),
        reason: "Predicate expression is not supported by the deterministic evaluator",
      };
    }

    for (const observation of [...eligible].reverse()) {
      const actual = getPath(observation.state, expression["path"]);
      const expected = expression["expected"];
      const matched = compare(actual, expression["operator"], expected);
      if (matched !== undefined) {
        return {
          predicateId: predicate.predicateId,
          result: matched ? "satisfied" : "violated",
          observationIds: [observation.observationId],
          reason: matched ? "Authoritative observation matched" : "Authoritative observation violated predicate",
        };
      }
    }

    return {
      predicateId: predicate.predicateId,
      result: "unknown",
      observationIds: eligible.map((item) => item.observationId),
      reason: "No eligible authoritative observation could evaluate the predicate",
    };
  }
}

function getPath(value: JsonValue, path: string): JsonValue | undefined {
  const segments = path.split(".").filter(Boolean);
  let current: JsonValue | undefined = value;
  for (const segment of segments) {
    if (current === null || Array.isArray(current) || typeof current !== "object") return undefined;
    current = current[segment];
  }
  return current;
}

function compare(actual: JsonValue | undefined, operator: string, expected: JsonValue | undefined): boolean | undefined {
  switch (operator) {
    case "exists":
      return actual !== undefined;
    case "absent":
      return actual === undefined;
    case "eq":
      return JSON.stringify(actual) === JSON.stringify(expected);
    case "neq":
      return JSON.stringify(actual) !== JSON.stringify(expected);
    case "contains":
      if (typeof actual === "string" && typeof expected === "string") return actual.includes(expected);
      if (Array.isArray(actual)) return actual.some((item) => JSON.stringify(item) === JSON.stringify(expected));
      return undefined;
    case "lte":
      return typeof actual === "number" && typeof expected === "number" ? actual <= expected : undefined;
    case "gte":
      return typeof actual === "number" && typeof expected === "number" ? actual >= expected : undefined;
    default:
      return undefined;
  }
}

export function evaluateMissionOutcome(
  goal: GoalSpec,
  observations: OutcomeObservation[],
  now: Date,
  evaluator: GoalPredicateEvaluator = new JsonPathPredicateEvaluator(),
): MissionOutcome {
  const terminal = goal.terminalPredicates.map((predicate) => {
    const latestRelevant = observations.reduce(
      (latest, observation) => Math.max(latest, new Date(observation.observedAt).getTime()),
      0,
    );
    if (latestRelevant > 0 && now.getTime() < latestRelevant + predicate.maturityHorizonMs) {
      return {
        predicateId: predicate.predicateId,
        result: "not_mature" as const,
        observationIds: [],
        reason: "Outcome maturity horizon has not closed",
      };
    }
    return evaluator.evaluate(predicate, observations);
  });
  const forbidden = goal.forbiddenSideEffects.map((predicate) => evaluator.evaluate(predicate, observations));

  let status: MissionOutcomeStatus;
  if (forbidden.some((result) => result.result === "satisfied")) {
    status = "goal_failed";
  } else if (terminal.every((result) => result.result === "satisfied")) {
    status = "goal_satisfied";
  } else if (terminal.some((result) => result.result === "not_mature" || result.result === "unknown")) {
    status = terminal.some((result) => result.result === "satisfied")
      ? "partially_satisfied"
      : "goal_uncertain";
  } else if (terminal.some((result) => result.result === "satisfied")) {
    status = "partially_satisfied";
  } else {
    status = "goal_failed";
  }

  return {
    goalId: goal.goalId,
    intentEpoch: goal.intentEpoch,
    status,
    evaluatedAt: now.toISOString(),
    predicateResults: terminal,
    forbiddenSideEffectResults: forbidden,
  };
}
