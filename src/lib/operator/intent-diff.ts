import { canonicalJson } from "./canonical.js";
import type { GoalSpec } from "./schemas.js";

export type IntentDiff = {
  previousEpoch: number;
  nextEpoch: number;
  objectiveChanged: boolean;
  changedAuthoritySlots: string[];
  terminalPredicatesChanged: boolean;
  forbiddenSideEffectsChanged: boolean;
  purposeOrPolicyChanged: boolean;
  material: boolean;
};

export function diffGoalSpecs(previous: GoalSpec, next: GoalSpec): IntentDiff {
  if (previous.goalId !== next.goalId || previous.userId !== next.userId) {
    throw new Error("GoalSpec diff requires the same goal and user");
  }
  if (next.intentEpoch < previous.intentEpoch) throw new Error("Intent epoch cannot move backwards");

  const slotKeys = new Set([
    ...Object.keys(previous.authoritySlots),
    ...Object.keys(next.authoritySlots),
  ]);
  const changedAuthoritySlots = [...slotKeys]
    .filter(
      (key) =>
        canonicalJson(previous.authoritySlots[key] ?? null) !==
        canonicalJson(next.authoritySlots[key] ?? null),
    )
    .sort();
  const objectiveChanged = previous.objective !== next.objective;
  const terminalPredicatesChanged =
    canonicalJson(previous.terminalPredicates) !== canonicalJson(next.terminalPredicates);
  const forbiddenSideEffectsChanged =
    canonicalJson(previous.forbiddenSideEffects) !== canonicalJson(next.forbiddenSideEffects);
  const purposeOrPolicyChanged =
    previous.policyHash !== next.policyHash || previous.consentEpoch !== next.consentEpoch;
  const material =
    objectiveChanged ||
    changedAuthoritySlots.length > 0 ||
    terminalPredicatesChanged ||
    forbiddenSideEffectsChanged ||
    purposeOrPolicyChanged;

  if (material && next.intentEpoch <= previous.intentEpoch) {
    throw new Error("A material intent change must increment intentEpoch");
  }

  return {
    previousEpoch: previous.intentEpoch,
    nextEpoch: next.intentEpoch,
    objectiveChanged,
    changedAuthoritySlots,
    terminalPredicatesChanged,
    forbiddenSideEffectsChanged,
    purposeOrPolicyChanged,
    material,
  };
}
