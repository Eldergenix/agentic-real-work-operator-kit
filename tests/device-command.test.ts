import { describe, expect, it } from "vitest";
import {
  DeviceCommandLeaseSchema,
  DeviceRuntimeStateSchema,
  validateDeviceCommandLease,
} from "../src/lib/operator/device-command.js";

const future = (ms: number): string => new Date(Date.now() + ms).toISOString();
const past = (ms: number): string => new Date(Date.now() - ms).toISOString();

function fixture() {
  const userId = crypto.randomUUID();
  const deviceId = "device-key-1";
  const lease = DeviceCommandLeaseSchema.parse({
    commandId: crypto.randomUUID(),
    actionId: crypto.randomUUID(),
    attemptId: crypto.randomUUID(),
    userId,
    deviceId,
    actionHash: "a".repeat(64),
    goalSpecHash: "b".repeat(64),
    planHash: "c".repeat(64),
    mandateVersion: 3,
    intentEpoch: 7,
    consentEpoch: "consent-4",
    killSwitchEpoch: "kill-9",
    connectorEpoch: "device-connector-2",
    fencingToken: "12",
    operation: "healthkit.workout.save",
    payload: { workoutType: "walking", durationSeconds: 1800 },
    expectedReadBack: { workoutType: "walking" },
    nonce: "nonce-0123456789",
    notBefore: past(1_000),
    expiresAt: future(30_000),
    signature: "signature-01234567890123456789012",
  });
  const state = DeviceRuntimeStateSchema.parse({
    userId,
    deviceId,
    mandateVersion: 3,
    intentEpoch: 7,
    consentEpoch: "consent-4",
    killSwitchEpoch: "kill-9",
    killSwitchActive: false,
    connectorEpoch: "device-connector-2",
    minimumFencingToken: "12",
    online: true,
    now: new Date().toISOString(),
  });
  return { lease, state };
}

describe("device command lease", () => {
  it("allows an exact current online lease", () => {
    const { lease, state } = fixture();
    expect(validateDeviceCommandLease(lease, state)).toEqual({ allowed: true, fencingToken: 12n });
  });

  it("fails closed when consent or kill state changes", () => {
    const { lease, state } = fixture();
    expect(validateDeviceCommandLease(lease, { ...state, consentEpoch: "consent-5" })).toEqual({
      allowed: false,
      code: "stale_consent",
    });
    expect(validateDeviceCommandLease(lease, { ...state, killSwitchActive: true })).toEqual({
      allowed: false,
      code: "kill_switch_active",
    });
  });

  it("rejects offline and stale fencing execution", () => {
    const { lease, state } = fixture();
    expect(validateDeviceCommandLease(lease, { ...state, online: false })).toEqual({
      allowed: false,
      code: "device_offline",
    });
    expect(validateDeviceCommandLease(lease, { ...state, minimumFencingToken: "13" })).toEqual({
      allowed: false,
      code: "stale_fence",
    });
  });
});
