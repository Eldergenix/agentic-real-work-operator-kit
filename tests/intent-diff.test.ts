import { describe, expect, it } from "vitest";
import { diffGoalSpecs } from "../src/lib/operator/intent-diff.js";
import { makeFixtureBundle } from "./fixtures.js";

describe("intent epochs", () => {
  it("requires an epoch increment for a material protected-slot change", async () => {
    const fixture = await makeFixtureBundle();
    const changed = structuredClone(fixture.goal);
    changed.intentEpoch += 1;
    changed.authoritySlots["target"] = {
      value: "another-calendar",
      source: "explicit_user_text",
      provenanceNodeId: "p-target",
    };
    const diff = diffGoalSpecs(fixture.goal, changed);
    expect(diff.material).toBe(true);
    expect(diff.changedAuthoritySlots).toEqual(["target"]);
  });

  it("rejects a material change without a new epoch", async () => {
    const fixture = await makeFixtureBundle();
    const changed = structuredClone(fixture.goal);
    changed.objective = "A different goal";
    expect(() => diffGoalSpecs(fixture.goal, changed)).toThrow(/increment intentEpoch/);
  });
});
