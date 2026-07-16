import { describe, expect, it } from "vitest";
import { evaluateProtectedBinding } from "../src/lib/operator/provenance.js";
import type { ProtectedInputBinding, ProvenanceGraph } from "../src/lib/operator/schemas.js";

const binding: ProtectedInputBinding = {
  fieldPath: "recipient",
  valueHash: "a".repeat(64),
  provenanceNodeId: "recipient",
  requiredIntegrity: "high",
  requiredPurpose: "send_message",
  minimumAuthority: "authoritative_fact",
};

function graph(origin: "authenticated_user" | "external_untrusted"): ProvenanceGraph {
  return {
    rootNodeId: "recipient",
    nodes: [
      {
        nodeId: "recipient",
        kind: origin === "authenticated_user" ? "user_message" : "tool_result",
        valueHash: "a".repeat(64),
        label: {
          origin,
          integrity: origin === "authenticated_user" ? "high" : "untrusted",
          sensitivity: "private",
          purposes: ["send_message"],
          observedAt: new Date().toISOString(),
          ingestedAt: new Date().toISOString(),
          originRef: "source-1",
          transformationRefs: [],
          authorityCeiling: origin === "authenticated_user" ? "authoritative_fact" : "none",
        },
      },
    ],
    edges: [],
  };
}

describe("causal provenance reference monitor", () => {
  it("allows an authenticated high-integrity protected field", () => {
    expect(evaluateProtectedBinding(binding, graph("authenticated_user")).allowed).toBe(true);
  });

  it("blocks external content from selecting a protected field", () => {
    const decision = evaluateProtectedBinding(binding, graph("external_untrusted"));
    expect(decision.allowed).toBe(false);
  });
});
