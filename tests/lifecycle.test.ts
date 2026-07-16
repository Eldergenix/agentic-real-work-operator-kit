import { describe, expect, it } from "vitest";
import { reduceActionEvents, type ActionEvent } from "../src/lib/operator/lifecycle.js";

const actionId = crypto.randomUUID();
const attemptId = crypto.randomUUID();
const base = (sequence: number) => ({
  eventId: crypto.randomUUID(),
  actionId,
  sequence,
  occurredAt: new Date().toISOString(),
  actor: "test",
  intentEpoch: 1,
  mandateVersion: 1,
  policyHash: "a".repeat(64),
  consentEpoch: "consent-1",
  connectorEpoch: "connector-1",
  killSwitchEpoch: "kill-1",
  fencingToken: "1",
});

function observed(sequence: number, matched = true): ActionEvent {
  return {
    ...base(sequence),
    type: "verification_observed",
    observation: {
      observationId: crypto.randomUUID(),
      actionId,
      attemptId,
      providerObjectId: "event-1",
      verifierRef: "fixture-get",
      grade: "V2",
      observedAt: new Date().toISOString(),
      matched,
      predicateResults: { all: matched },
      redactedEvidenceHash: "b".repeat(64),
    },
  };
}

function prefix(): ActionEvent[] {
  return [
    { ...base(1), type: "action_planned", planHash: "c".repeat(64) },
    {
      ...base(2),
      type: "action_authorized",
      authorizationKind: "direct_command",
      authorizationRef: "approval-1",
    },
    {
      ...base(3),
      type: "reservation_acquired",
      reservationId: crypto.randomUUID(),
      idempotencyKey: "idempotency-1",
    },
    { ...base(4), type: "attempt_started", attemptId, attemptNumber: 1 },
    { ...base(5), type: "provider_acknowledged", attemptId, providerObjectId: "event-1" },
  ];
}

describe("event-sourced lifecycle", () => {
  it("requires independent read-back before verified", () => {
    expect(() =>
      reduceActionEvents([
        ...prefix(),
        { ...base(6), type: "action_verified", permanent: false, evidenceClass: "fixture" },
      ]),
    ).toThrow(/independent verification/u);

    const aggregate = reduceActionEvents([
      ...prefix(),
      observed(6),
      { ...base(7), type: "action_verified", permanent: false, evidenceClass: "fixture" },
    ]);
    expect(aggregate.status).toBe("verified");
    expect(aggregate.providerObjectId).toBe("event-1");
  });

  it("rejects stale fencing tokens", () => {
    const events = prefix();
    events.push({ ...observed(6), fencingToken: "0" });
    expect(() => reduceActionEvents(events)).toThrow(/fencing/u);
  });
});
