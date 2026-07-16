import type { PlanIR, PlanNode } from "./schemas.js";

export type SagaNodeState =
  | "not_started"
  | "verified"
  | "failed"
  | "uncertain"
  | "compensated"
  | "superseded";

export function assertAcyclicPlan(plan: PlanIR): void {
  const nodes = new Set(plan.nodes.map((node) => node.nodeId));
  const adjacency = new Map<string, string[]>();
  for (const node of nodes) adjacency.set(node, []);
  for (const edge of plan.edges) {
    if (!nodes.has(edge.fromNodeId) || !nodes.has(edge.toNodeId)) {
      throw new Error("Plan edge references an unknown node");
    }
    adjacency.get(edge.fromNodeId)?.push(edge.toNodeId);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (nodeId: string): void => {
    if (visiting.has(nodeId)) throw new Error("Plan graph contains a cycle");
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) visit(next);
    visiting.delete(nodeId);
    visited.add(nodeId);
  };
  for (const nodeId of nodes) visit(nodeId);
}

export function readyPlanNodes(
  plan: PlanIR,
  state: Record<string, SagaNodeState>,
): PlanNode[] {
  assertAcyclicPlan(plan);
  return plan.nodes.filter((node) => {
    if ((state[node.nodeId] ?? "not_started") !== "not_started") return false;
    const incoming = plan.edges.filter((edge) => edge.toNodeId === node.nodeId);
    return incoming.every((edge) => {
      const predecessor = state[edge.fromNodeId] ?? "not_started";
      switch (edge.condition) {
        case "on_verified":
          return predecessor === "verified";
        case "on_failed":
          return predecessor === "failed";
        case "on_uncertain":
          return predecessor === "uncertain";
        case "always":
          return ["verified", "failed", "uncertain", "compensated", "superseded"].includes(predecessor);
      }
    });
  });
}

export function reverseCompensationOrder(
  plan: PlanIR,
  state: Record<string, SagaNodeState>,
): PlanNode[] {
  assertAcyclicPlan(plan);
  const completed = new Set(
    plan.nodes.filter((node) => state[node.nodeId] === "verified").map((node) => node.nodeId),
  );
  const ordered: PlanNode[] = [];
  const seen = new Set<string>();
  const visit = (nodeId: string): void => {
    if (seen.has(nodeId)) return;
    seen.add(nodeId);
    for (const edge of plan.edges.filter((item) => item.fromNodeId === nodeId)) visit(edge.toNodeId);
    const node = plan.nodes.find((item) => item.nodeId === nodeId);
    if (
      node !== undefined &&
      completed.has(nodeId) &&
      node.compensationRef !== undefined &&
      node.recoverySemantics !== "irreversible"
    ) {
      ordered.push(node);
    }
  };
  for (const node of plan.nodes) visit(node.nodeId);
  return ordered;
}
