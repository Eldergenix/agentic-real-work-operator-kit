import { describe, expect, it } from "vitest";
import { FixtureCalendarAdapter } from "../src/lib/operator/adapters/fixture-calendar.js";
import { OperatorBroker } from "../src/lib/operator/broker.js";
import { EffectRegistry } from "../src/lib/operator/effect-registry.js";
import { projectActionReceipt } from "../src/lib/operator/receipt.js";
import { InMemoryOperatorRepository } from "../src/lib/operator/repository.js";
import { makeFixtureBundle } from "./fixtures.js";

describe("truthful action receipt", () => {
  it("uses Undo only for a verified true reversal contract", async () => {
    const adapter = new FixtureCalendarAdapter();
    const registry = new EffectRegistry();
    registry.register(adapter);
    const broker = new OperatorBroker(new InMemoryOperatorRepository(), registry);
    const bundle = await makeFixtureBundle();
    const execution = await broker.execute(bundle.request);
    const receipt = projectActionReceipt(execution.aggregate, adapter.contract);
    expect(receipt.effectStatus).toBe("verified");
    expect(receipt.recoveryLabel).toBe("Undo");
    expect(receipt.certaintyLabel).toMatch(/Independent verification/u);
  });

  it("never converts a verifier mismatch into success", async () => {
    const adapter = new FixtureCalendarAdapter("verify_mismatch");
    const registry = new EffectRegistry();
    registry.register(adapter);
    const broker = new OperatorBroker(new InMemoryOperatorRepository(), registry);
    const bundle = await makeFixtureBundle();
    const execution = await broker.execute(bundle.request);
    const receipt = projectActionReceipt(execution.aggregate, adapter.contract);
    expect(execution.effectOccurred).toBe("unknown");
    expect(execution.missionEvaluationRequired).toBe(false);
    expect(receipt.effectStatus).toBe("uncertain");
    expect(receipt.certaintyLabel).toMatch(/cannot yet determine/u);
  });
});
