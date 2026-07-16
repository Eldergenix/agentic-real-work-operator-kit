import { describe, expect, it } from "vitest";
import { FaultInjectingAdapter } from "../src/lib/operator/provider-fault-simulator.js";
import { FixtureCalendarAdapter } from "../src/lib/operator/adapters/fixture-calendar.js";
import { makeFixtureBundle } from "./fixtures.js";

const context = {
  attemptId: "attempt-sim-1",
  idempotencyKey: "idem-sim-1",
  fencingToken: 1n,
  intentEpoch: 1,
  mandateVersion: 1,
  consentEpoch: "consent-1",
  connectorEpoch: "connector-1",
  killSwitchEpoch: "kill-1",
};

describe("FaultInjectingAdapter", () => {
  it("models timeout after effect without changing the delegated provider identity", async () => {
    const delegate = new FixtureCalendarAdapter();
    const adapter = new FaultInjectingAdapter(delegate, {
      execute: ["timeout_after_effect", "none"],
    });
    const action = (await makeFixtureBundle()).action;

    const first = await adapter.execute(action, context);
    expect(first.status).toBe("uncertain");
    const second = await adapter.execute(action, context);
    expect(second.status).toBe("acknowledged");
    expect(delegate.executeCount).toBe(2);
    if (first.status === "uncertain" && second.status === "acknowledged") {
      expect(first.providerObjectId).toBe(second.providerObjectId);
    }
  });

  it("never fabricates verification when the verifier is unavailable", async () => {
    const delegate = new FixtureCalendarAdapter();
    const adapter = new FaultInjectingAdapter(delegate, {
      verify: ["verification_uncertain"],
    });
    const action = (await makeFixtureBundle()).action;
    const execution = await adapter.execute(action, context);
    if (execution.status !== "acknowledged") throw new Error("fixture did not acknowledge");

    const verification = await adapter.verify(action, execution.providerObjectId, context);
    expect(verification.status).toBe("uncertain");
  });

  it("represents compensation failure honestly", async () => {
    const delegate = new FixtureCalendarAdapter();
    const adapter = new FaultInjectingAdapter(delegate, {
      compensate: ["compensation_failure"],
    });
    const action = (await makeFixtureBundle()).action;
    const execution = await adapter.execute(action, context);
    if (execution.status !== "acknowledged") throw new Error("fixture did not acknowledge");

    const result = await adapter.compensate(action, execution.providerObjectId, undefined, context);
    expect(result.status).toBe("failed");
  });
});
