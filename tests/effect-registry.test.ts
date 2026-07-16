import { describe, expect, it } from "vitest";
import { EffectRegistry } from "../src/lib/operator/effect-registry.js";
import { FixtureCalendarAdapter } from "../src/lib/operator/adapters/fixture-calendar.js";

 describe("effect registry", () => {
  it("fails closed for unregistered committing actions", () => {
    const registry = new EffectRegistry();
    expect(() => registry.require("commerce.order.create", "v1")).toThrow(/Unregistered/u);
  });

  it("rejects duplicate contracts", () => {
    const registry = new EffectRegistry();
    registry.register(new FixtureCalendarAdapter());
    expect(() => registry.register(new FixtureCalendarAdapter())).toThrow(/Duplicate/u);
  });
});
