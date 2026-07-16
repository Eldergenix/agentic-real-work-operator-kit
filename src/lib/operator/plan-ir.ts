import { canonicalHash } from "./canonical.js";
import { PlanIRSchema, type JsonValue, type PlanIR } from "./schemas.js";

export type PlanIRDraft = Omit<PlanIR, "canonicalHash">;

export async function finalizePlanIR(draft: PlanIRDraft): Promise<PlanIR> {
  const nodeIds = new Set(draft.nodes.map((node) => node.nodeId));
  if (nodeIds.size !== draft.nodes.length) throw new Error("Plan nodes must have unique IDs");

  for (const edge of draft.edges) {
    if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)) {
      throw new Error(`Plan edge references an unknown node: ${edge.fromNodeId} -> ${edge.toNodeId}`);
    }
  }

  for (const node of draft.nodes) {
    if (node.action.planId !== draft.planId || node.action.planVersion !== draft.planVersion) {
      throw new Error(`Action ${node.action.actionId} is not bound to this Plan IR version`);
    }
    if (node.action.goalSpecHash !== draft.goalSpecHash || node.action.intentEpoch !== draft.intentEpoch) {
      throw new Error(`Action ${node.action.actionId} is not bound to the current intent`);
    }
  }

  const canonicalHashValue = await canonicalHash(draft as unknown as JsonValue);
  return PlanIRSchema.parse({ ...draft, canonicalHash: canonicalHashValue });
}

export function assertPlanCurrent(plan: PlanIR, currentIntentEpoch: number, now: Date): void {
  if (plan.intentEpoch !== currentIntentEpoch) throw new Error("Plan belongs to a stale intent epoch");
  if (new Date(plan.expiresAt).getTime() <= now.getTime()) throw new Error("Plan IR has expired");
}
