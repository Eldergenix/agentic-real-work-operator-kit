import { describe, expect, it } from "vitest";
import { OperatorBroker } from "../src/lib/operator/broker.js";
import { EffectRegistry } from "../src/lib/operator/effect-registry.js";
import { FixtureCalendarAdapter } from "../src/lib/operator/adapters/fixture-calendar.js";
import { InMemoryOperatorRepository } from "../src/lib/operator/repository.js";
import { makeFixtureBundle } from "./fixtures.js";

function setup(mode: ConstructorParameters<typeof FixtureCalendarAdapter>[0] = "success") {
  const repository = new InMemoryOperatorRepository();
  const adapter = new FixtureCalendarAdapter(mode);
  const registry = new EffectRegistry();
  registry.register(adapter);
  return { repository, adapter, broker: new OperatorBroker(repository, registry) };
}

describe("operator broker", () => {
  it("executes, independently verifies, deduplicates, and compensates one logical effect", async () => {
    const { repository, adapter, broker } = setup();
    const bundle = await makeFixtureBundle();
    const first = await broker.execute(bundle.request);
    expect(first.aggregate.status).toBe("verified");
    expect(first.effectOccurred).toBe(true);
    expect(adapter.executeCount).toBe(1);
    const reservation = await repository.getReservation(bundle.request.reservationId);
    expect(reservation?.state).toBe("committed");

    const replay = await broker.execute(bundle.request);
    expect(replay.aggregate.status).toBe("verified");
    expect(adapter.executeCount).toBe(1);

    const compensation = await broker.compensate(bundle.request, undefined);
    expect(compensation.aggregate.status).toBe("compensated");
    expect(adapter.has(first.aggregate.providerObjectId ?? "missing")).toBe(false);
  });

  it("preserves uncertainty after a timeout that may have followed commit and reconciles before retry", async () => {
    const { adapter, broker } = setup("timeout_after_effect");
    const bundle = await makeFixtureBundle();
    const first = await broker.execute(bundle.request);
    expect(first.aggregate.status).toBe("uncertain");
    expect(first.effectOccurred).toBe("unknown");
    expect(adapter.executeCount).toBe(1);

    adapter.mode = "success";
    const reconciled = await broker.reconcile(bundle.request);
    expect(reconciled.aggregate.status).toBe("verified");
    expect(adapter.executeCount).toBe(1);
  });

  it("abstains before reserving or executing when the action exceeds its risk budget", async () => {
    const { repository, adapter, broker } = setup();
    const bundle = await makeFixtureBundle({ riskExpectedLossMinor: 100, budgetExpectedLossMinor: 0 });
    const result = await broker.execute(bundle.request);
    expect(result.aggregate.status).toBe("risk_abstained");
    expect(adapter.executeCount).toBe(0);
    expect(await repository.getReservation(bundle.request.reservationId)).toBeUndefined();
  });
});
