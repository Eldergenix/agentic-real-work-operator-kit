import { describe, expect, it } from "vitest";
import { admitMemory, evaluateMemoryInfluence } from "../src/lib/operator/memory-ledger.js";

 describe("origin-bound memory authority", () => {
  it("does not allow model-derived memory to become an authoritative action input", () => {
    expect(() =>
      admitMemory({
        memoryId: crypto.randomUUID(),
        memoryClass: "derived_hypothesis",
        contentHash: "a".repeat(64),
        origins: [
          {
            originId: "external-email",
            principalId: "sender@example.com",
            trustDomain: "external_email",
            authority: "none",
          },
        ],
        transformationRefs: ["model-summary"],
        purposes: ["daily_planning"],
        consentEpoch: "consent-1",
        writerIdentity: "memory-writer",
        policyHash: "b".repeat(64),
        requestedAuthority: "authoritative_fact",
        now: new Date(),
      }),
    ).toThrow(/elevation receipt/u);
  });

  it("permits planning-only memory for ranking but blocks it from protected fields", () => {
    const receipt = admitMemory({
      memoryId: crypto.randomUUID(),
      memoryClass: "derived_hypothesis",
      contentHash: "a".repeat(64),
      origins: [
        {
          originId: "user-preference",
          principalId: "user-1",
          trustDomain: "authenticated_user",
          authority: "planning_only",
        },
      ],
      transformationRefs: ["compaction-1"],
      purposes: ["daily_planning"],
      consentEpoch: "consent-1",
      writerIdentity: "memory-writer",
      policyHash: "b".repeat(64),
      requestedAuthority: "planning_only",
      now: new Date(),
    });
    expect(evaluateMemoryInfluence(receipt, crypto.randomUUID(), "candidate.rank", false).allowed).toBe(true);
    expect(evaluateMemoryInfluence(receipt, crypto.randomUUID(), "recipient", true).allowed).toBe(false);
  });
});
