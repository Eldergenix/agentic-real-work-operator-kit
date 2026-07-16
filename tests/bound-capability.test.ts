import { describe, expect, it } from "vitest";
import { mintBoundBrokerCapability, verifyBrokerCapability } from "../src/lib/operator/broker-capability.js";
import type { JsonValue } from "../src/lib/operator/schemas.js";
import { makeFixtureBundle } from "./fixtures.js";

describe("capability-to-request binding", () => {
  it("binds the exact wire request and canonical action", async () => {
    const fixture = await makeFixtureBundle();
    const now = new Date();
    const attemptId = crypto.randomUUID();
    const wireRequest = {
      ...fixture.request,
      attemptId,
      current: {
        ...fixture.request.current,
        now: fixture.request.current.now.toISOString(),
        fencingToken: fixture.request.current.fencingToken.toString(),
      },
      evidenceClass: "test_account",
    } as unknown as JsonValue;
    const secret = "s".repeat(64);
    const minted = await mintBoundBrokerCapability(
      {
        claims: {
          issuer: "mozi-ai",
          audience: "mozi-operator",
          subjectUserId: fixture.action.userId,
          runId: fixture.request.runId,
          actionId: fixture.action.actionId,
          attemptId,
          goalSpecHash: fixture.goal.canonicalHash,
          planHash: fixture.plan.canonicalHash,
          provenanceRootHash: fixture.plan.provenanceRootHash,
          mandateVersion: fixture.request.current.mandateVersion,
          policyHash: fixture.plan.policyHash,
          consentEpoch: fixture.request.current.consentEpoch,
          connectorEpoch: fixture.request.current.connectorEpoch,
          killSwitchEpoch: fixture.request.current.killSwitchEpoch,
          intentEpoch: fixture.request.current.intentEpoch,
          reservationId: fixture.request.reservationId,
          fencingToken: fixture.request.current.fencingToken.toString(),
          adapterVersion: fixture.action.adapterVersion,
          idempotencyKey: fixture.request.idempotencyKey,
          notBefore: now.toISOString(),
          expiresAt: new Date(now.getTime() + 30_000).toISOString(),
          nonce: crypto.randomUUID(),
        },
        action: fixture.action,
        wireRequest,
      },
      secret,
    );
    const verified = await verifyBrokerCapability(minted.token, secret, now);
    expect(verified.requestHash).toBe(minted.payload.requestHash);
    expect(verified.actionHash).toBe(minted.payload.actionHash);
  });
});
