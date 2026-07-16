import { describe, expect, it } from "vitest";
import { projectActionCard } from "../src/lib/operator/ui-projection.js";
import { FixtureCalendarAdapter } from "../src/lib/operator/adapters/fixture-calendar.js";
import type { ActionAggregate } from "../src/lib/operator/lifecycle.js";

function aggregate(status: ActionAggregate["status"]): ActionAggregate {
  return {
    actionId: "33333333-3333-4333-8333-333333333333",
    status,
    sequence: 1,
    fencingToken: 1n,
    intentEpoch: 1,
    attemptCount: 0,
    terminal: ["verified", "failed", "compensated", "compensation_failed"].includes(status),
    events: [],
  };
}

describe("operator UI projection", () => {
  it("never presents provider acknowledgement as verified", () => {
    const card = projectActionCard(
      aggregate("provider_acknowledged"),
      new FixtureCalendarAdapter().contract,
      "Create focus block",
    );
    expect(card.stateLabel).toBe("Provider accepted");
    expect(card.controls).toContain("refresh_verification");
  });

  it("shows truthful recovery semantics", () => {
    const contract = { ...new FixtureCalendarAdapter().contract, recoverySemantics: "correction" as const };
    const card = projectActionCard(aggregate("verified"), contract, "Send update");
    expect(card.controls).toEqual(["correct"]);
    expect(card.residualPropagationWarning).toMatch(/does not remove/u);
  });
});
