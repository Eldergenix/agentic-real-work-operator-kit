import { describe, expect, it } from "vitest";
import { evaluateMissionOutcome } from "../src/lib/operator/mission-outcome.js";
import { makeFixtureBundle } from "./fixtures.js";

 describe("mission outcome evaluator", () => {
  it("separates a verified provider effect from goal satisfaction", async () => {
    const bundle = await makeFixtureBundle();
    const satisfied = evaluateMissionOutcome(
      bundle.goal,
      [
        {
          observationId: crypto.randomUUID(),
          observedAt: new Date().toISOString(),
          grade: "V2",
          sourceOfTruth: "fixture-calendar",
          state: { summary: "Protected focus block" },
        },
      ],
      new Date(),
    );
    expect(satisfied.status).toBe("goal_satisfied");

    const failed = evaluateMissionOutcome(
      bundle.goal,
      [
        {
          observationId: crypto.randomUUID(),
          observedAt: new Date().toISOString(),
          grade: "V2",
          sourceOfTruth: "fixture-calendar",
          state: { summary: "Wrong event" },
        },
      ],
      new Date(),
    );
    expect(failed.status).toBe("goal_failed");
  });
});
