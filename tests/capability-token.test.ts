import { describe, expect, it } from "vitest";
import { mintBrokerCapability, verifyBrokerCapability } from "../src/lib/operator/broker-capability.js";

 describe("single-use broker capability envelope", () => {
  it("authenticates and expires an exact attempt capability", async () => {
    const now = new Date();
    const payload = {
      issuer: "mozi-ai",
      audience: "mozi-operator" as const,
      subjectUserId: crypto.randomUUID(),
      runId: "run-1",
      actionId: crypto.randomUUID(),
      attemptId: crypto.randomUUID(),
      goalSpecHash: "a".repeat(64),
      planHash: "b".repeat(64),
      provenanceRootHash: "c".repeat(64),
      actionHash: "d".repeat(64),
      requestHash: "f".repeat(64),
      mandateVersion: 1,
      policyHash: "e".repeat(64),
      consentEpoch: "consent-1",
      connectorEpoch: "connector-1",
      killSwitchEpoch: "kill-1",
      intentEpoch: 1,
      reservationId: crypto.randomUUID(),
      fencingToken: "1",
      adapterVersion: "fixture-v1",
      idempotencyKey: "idempotency-1",
      notBefore: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30_000).toISOString(),
      nonce: crypto.randomUUID(),
    };
    const secret = "s".repeat(64);
    const minted = await mintBrokerCapability(payload, secret);
    expect((await verifyBrokerCapability(minted.token, secret, now)).actionId).toBe(payload.actionId);
    await expect(
      verifyBrokerCapability(minted.token, secret, new Date(now.getTime() + 60_000)),
    ).rejects.toThrow(/expired/u);
  });
});
