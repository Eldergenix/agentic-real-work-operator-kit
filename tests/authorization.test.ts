import { describe, expect, it } from "vitest";
import { authorizeAction } from "../src/lib/operator/authorization-gate.js";
import { FixtureCalendarAdapter } from "../src/lib/operator/adapters/fixture-calendar.js";
import { makeFixtureBundle } from "./fixtures.js";

 describe("deterministic authorization gate", () => {
  it("allows a current exact operator capability", async () => {
    const bundle = await makeFixtureBundle({ authorizationKind: "operator_mandate" });
    const receipt = await authorizeAction({
      action: bundle.action,
      goal: bundle.goal,
      plan: bundle.plan,
      effect: new FixtureCalendarAdapter().contract,
      authorization: bundle.request.authorization,
      provenance: bundle.provenance,
      current: bundle.request.current,
      mandate: bundle.mandate,
      capabilityCell: bundle.capabilityCell,
    });
    expect(receipt.decision).toBe("allow");
    expect(receipt.capabilityCellId).toBe(bundle.capabilityCell.capabilityCellId);
  });

  it("denies target drift even when the domain and action family match", async () => {
    const bundle = await makeFixtureBundle({ authorizationKind: "operator_mandate" });
    const cell = { ...bundle.capabilityCell, exactTargetIds: ["another-calendar"] };
    await expect(
      authorizeAction({
        action: bundle.action,
        goal: bundle.goal,
        plan: bundle.plan,
        effect: new FixtureCalendarAdapter().contract,
        authorization: bundle.request.authorization,
        provenance: bundle.provenance,
        current: bundle.request.current,
        mandate: bundle.mandate,
        capabilityCell: cell,
      }),
    ).rejects.toThrow(/target/u);
  });

  it("denies a direct-command attestation whose exact action hash changed", async () => {
    const bundle = await makeFixtureBundle();
    if (bundle.request.authorization.kind !== "direct_command") throw new Error("Fixture mismatch");
    const authorization = { ...bundle.request.authorization, actionHash: "f".repeat(64) };
    await expect(
      authorizeAction({
        action: bundle.action,
        goal: bundle.goal,
        plan: bundle.plan,
        effect: new FixtureCalendarAdapter().contract,
        authorization,
        provenance: bundle.provenance,
        current: bundle.request.current,
      }),
    ).rejects.toThrow(/exact action/u);
  });

  it("denies a direct command from another conversation or source message", async () => {
    const bundle = await makeFixtureBundle();
    if (bundle.request.authorization.kind !== "direct_command") throw new Error("Fixture mismatch");

    await expect(
      authorizeAction({
        action: bundle.action,
        goal: bundle.goal,
        plan: bundle.plan,
        effect: new FixtureCalendarAdapter().contract,
        authorization: { ...bundle.request.authorization, conversationId: "conversation-other" },
        provenance: bundle.provenance,
        current: bundle.request.current,
      }),
    ).rejects.toThrow(/source conversation and message/u);

    await expect(
      authorizeAction({
        action: bundle.action,
        goal: bundle.goal,
        plan: bundle.plan,
        effect: new FixtureCalendarAdapter().contract,
        authorization: { ...bundle.request.authorization, sourceMessageId: "message-other" },
        provenance: bundle.provenance,
        current: bundle.request.current,
      }),
    ).rejects.toThrow(/source conversation and message/u);
  });

});
