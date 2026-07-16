import { describe, expect, it } from "vitest";
import { assertAcyclicPlan, readyPlanNodes, reverseCompensationOrder } from "../src/lib/operator/saga.js";
import { makeFixtureBundle } from "./fixtures.js";

describe("durable saga helpers", () => {
  it("selects only dependency-ready nodes and compensates in reverse dependency order", async () => {
    const bundle = await makeFixtureBundle();
    const first = bundle.plan.nodes[0]!;
    const second = {
      ...first,
      nodeId: "notify-after-calendar",
      action: {
        ...first.action,
        actionId: crypto.randomUUID(),
        logicalEffectId: crypto.randomUUID(),
        nodeId: "notify-after-calendar",
      },
    };
    const plan = {
      ...bundle.plan,
      nodes: [first, second],
      edges: [{ fromNodeId: first.nodeId, toNodeId: second.nodeId, condition: "on_verified" as const }],
    };
    assertAcyclicPlan(plan);
    expect(readyPlanNodes(plan, {})).toEqual([first]);
    expect(readyPlanNodes(plan, { [first.nodeId]: "verified" })).toEqual([second]);
    expect(
      reverseCompensationOrder(plan, {
        [first.nodeId]: "verified",
        [second.nodeId]: "verified",
      }).map((node) => node.nodeId),
    ).toEqual([second.nodeId, first.nodeId]);
  });

  it("rejects a cyclic plan before execution", async () => {
    const bundle = await makeFixtureBundle();
    const node = bundle.plan.nodes[0]!;
    expect(() =>
      assertAcyclicPlan({
        ...bundle.plan,
        edges: [{ fromNodeId: node.nodeId, toNodeId: node.nodeId, condition: "always" }],
      }),
    ).toThrow(/cycle/u);
  });
});
