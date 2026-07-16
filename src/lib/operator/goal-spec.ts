import { canonicalHash } from "./canonical.js";
import { GoalSpecSchema, type GoalSpec, type JsonValue } from "./schemas.js";

export type GoalSpecDraft = Omit<GoalSpec, "canonicalHash">;

export async function finalizeGoalSpec(draft: GoalSpecDraft): Promise<GoalSpec> {
  const canonicalHashValue = await canonicalHash(draft as unknown as JsonValue);
  return GoalSpecSchema.parse({ ...draft, canonicalHash: canonicalHashValue });
}

export function assertGoalSpecExecutable(goal: GoalSpec, now: Date): void {
  if (goal.unresolvedSlots.length > 0) {
    throw new Error(`GoalSpec has unresolved authority slots: ${goal.unresolvedSlots.join(", ")}`);
  }
  if (new Date(goal.validUntil).getTime() <= now.getTime()) {
    throw new Error("GoalSpec has expired");
  }
}

export function materialIntentChange(previous: GoalSpec, next: GoalSpec): boolean {
  if (next.intentEpoch <= previous.intentEpoch) {
    throw new Error("Intent epoch must increase for a revised GoalSpec");
  }
  return (
    previous.objective !== next.objective ||
    previous.policyHash !== next.policyHash ||
    JSON.stringify(previous.authoritySlots) !== JSON.stringify(next.authoritySlots) ||
    JSON.stringify(previous.terminalPredicates) !== JSON.stringify(next.terminalPredicates) ||
    JSON.stringify(previous.forbiddenSideEffects) !== JSON.stringify(next.forbiddenSideEffects)
  );
}
