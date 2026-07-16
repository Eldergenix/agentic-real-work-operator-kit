import { canonicalHash } from "./canonical.js";
import type { CanonicalOperatorAction, JsonValue, TargetRef } from "./schemas.js";

export async function hashAction(action: CanonicalOperatorAction): Promise<string> {
  return canonicalHash(action as unknown as JsonValue);
}

export async function hashTarget(target: TargetRef): Promise<string> {
  return canonicalHash(target as unknown as JsonValue);
}
