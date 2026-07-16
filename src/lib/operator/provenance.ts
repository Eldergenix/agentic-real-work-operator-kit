import type {
  MemoryAuthoritySchema,
  ProtectedInputBinding,
  ProvenanceGraph,
  ProvenanceNode,
} from "./schemas.js";
import type { z } from "zod";

type MemoryAuthority = z.infer<typeof MemoryAuthoritySchema>;

const integrityRank = {
  untrusted: 0,
  low: 1,
  medium: 2,
  high: 3,
} as const;

const authorityRank: Record<MemoryAuthority, number> = {
  none: 0,
  display_only: 1,
  preference_ranking: 2,
  planning_only: 3,
  authoritative_fact: 4,
};

export type ProvenanceDecision =
  | { allowed: true; backwardSlice: string[] }
  | {
      allowed: false;
      code:
        | "missing_provenance_node"
        | "value_hash_mismatch"
        | "integrity_too_low"
        | "purpose_not_allowed"
        | "authority_too_low"
        | "disallowed_untrusted_influence"
        | "cycle_detected";
      detail: string;
      backwardSlice: string[];
    };

function indexGraph(graph: ProvenanceGraph): {
  nodes: Map<string, ProvenanceNode>;
  parents: Map<string, string[]>;
} {
  const nodes = new Map(graph.nodes.map((node) => [node.nodeId, node]));
  const parents = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const existing = parents.get(edge.toNodeId) ?? [];
    existing.push(edge.fromNodeId);
    parents.set(edge.toNodeId, existing);
  }
  return { nodes, parents };
}

export function backwardSlice(graph: ProvenanceGraph, startNodeId: string): string[] {
  const { nodes, parents } = indexGraph(graph);
  if (!nodes.has(startNodeId)) return [];

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const ordered: string[] = [];

  const visit = (nodeId: string): void => {
    if (visiting.has(nodeId)) throw new Error(`Provenance cycle detected at ${nodeId}`);
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    for (const parentId of parents.get(nodeId) ?? []) visit(parentId);
    visiting.delete(nodeId);
    visited.add(nodeId);
    ordered.push(nodeId);
  };

  visit(startNodeId);
  return ordered;
}

export function evaluateProtectedBinding(
  binding: ProtectedInputBinding,
  graph: ProvenanceGraph,
): ProvenanceDecision {
  const { nodes } = indexGraph(graph);
  const targetNode = nodes.get(binding.provenanceNodeId);
  if (targetNode === undefined) {
    return {
      allowed: false,
      code: "missing_provenance_node",
      detail: `No provenance node ${binding.provenanceNodeId}`,
      backwardSlice: [],
    };
  }
  if (targetNode.valueHash !== binding.valueHash) {
    return {
      allowed: false,
      code: "value_hash_mismatch",
      detail: `Protected field ${binding.fieldPath} does not match its recorded provenance value`,
      backwardSlice: [binding.provenanceNodeId],
    };
  }

  let slice: string[];
  try {
    slice = backwardSlice(graph, binding.provenanceNodeId);
  } catch (error) {
    return {
      allowed: false,
      code: "cycle_detected",
      detail: error instanceof Error ? error.message : "Provenance cycle detected",
      backwardSlice: [],
    };
  }

  for (const nodeId of slice) {
    const node = nodes.get(nodeId);
    if (node === undefined) continue;
    if (integrityRank[node.label.integrity] < integrityRank[binding.requiredIntegrity]) {
      return {
        allowed: false,
        code: "integrity_too_low",
        detail: `${nodeId} has ${node.label.integrity} integrity; ${binding.requiredIntegrity} is required`,
        backwardSlice: slice,
      };
    }
    if (!node.label.purposes.includes(binding.requiredPurpose)) {
      return {
        allowed: false,
        code: "purpose_not_allowed",
        detail: `${nodeId} is not permitted for purpose ${binding.requiredPurpose}`,
        backwardSlice: slice,
      };
    }
    if (authorityRank[node.label.authorityCeiling] < authorityRank[binding.minimumAuthority]) {
      return {
        allowed: false,
        code: "authority_too_low",
        detail: `${nodeId} authority is ${node.label.authorityCeiling}; ${binding.minimumAuthority} is required`,
        backwardSlice: slice,
      };
    }
    if (
      node.label.origin === "external_untrusted" ||
      (node.label.origin === "model_derived" && binding.minimumAuthority === "authoritative_fact")
    ) {
      return {
        allowed: false,
        code: "disallowed_untrusted_influence",
        detail: `${nodeId} cannot influence protected field ${binding.fieldPath}`,
        backwardSlice: slice,
      };
    }
  }

  return { allowed: true, backwardSlice: slice };
}

export function evaluateProtectedBindings(
  bindings: ProtectedInputBinding[],
  graph: ProvenanceGraph,
): ProvenanceDecision[] {
  return bindings.map((binding) => evaluateProtectedBinding(binding, graph));
}
