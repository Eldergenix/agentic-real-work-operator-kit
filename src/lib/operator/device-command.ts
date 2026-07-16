import { z } from "zod";
import { HashSchema, IsoDateTimeSchema, JsonValueSchema } from "./schemas.js";

export const DeviceCommandLeaseSchema = z
  .object({
    commandId: z.string().uuid(),
    actionId: z.string().uuid(),
    attemptId: z.string().uuid(),
    userId: z.string().uuid(),
    deviceId: z.string().min(1),
    actionHash: HashSchema,
    goalSpecHash: HashSchema,
    planHash: HashSchema,
    mandateVersion: z.number().int().positive(),
    intentEpoch: z.number().int().nonnegative(),
    consentEpoch: z.string().min(1),
    killSwitchEpoch: z.string().min(1),
    connectorEpoch: z.string().min(1),
    fencingToken: z.string().regex(/^\d+$/u),
    operation: z.string().min(1),
    payload: JsonValueSchema,
    expectedReadBack: JsonValueSchema,
    nonce: z.string().min(16),
    notBefore: IsoDateTimeSchema,
    expiresAt: IsoDateTimeSchema,
    signature: z.string().min(32),
  })
  .strict()
  .superRefine((lease, context) => {
    if (new Date(lease.notBefore).getTime() > new Date(lease.expiresAt).getTime()) {
      context.addIssue({ code: "custom", path: ["expiresAt"], message: "lease expires before notBefore" });
    }
  });

export const DeviceRuntimeStateSchema = z
  .object({
    userId: z.string().uuid(),
    deviceId: z.string().min(1),
    mandateVersion: z.number().int().positive(),
    intentEpoch: z.number().int().nonnegative(),
    consentEpoch: z.string().min(1),
    killSwitchEpoch: z.string().min(1),
    killSwitchActive: z.boolean(),
    connectorEpoch: z.string().min(1),
    minimumFencingToken: z.string().regex(/^\d+$/u),
    online: z.boolean(),
    now: IsoDateTimeSchema,
  })
  .strict();

export const DeviceCommandAcknowledgementSchema = z
  .object({
    commandId: z.string().uuid(),
    actionId: z.string().uuid(),
    attemptId: z.string().uuid(),
    userId: z.string().uuid(),
    deviceId: z.string().min(1),
    status: z.enum([
      "executed_and_read_back",
      "denied",
      "expired",
      "offline",
      "system_failed",
      "read_back_mismatch",
    ]),
    operation: z.string().min(1),
    systemObjectId: z.string().min(1).optional(),
    readBackHash: HashSchema.optional(),
    observedAt: IsoDateTimeSchema,
    platformAttestationRef: z.string().min(1),
    deviceSignature: z.string().min(32),
    safeCode: z.string().min(1).optional(),
  })
  .strict();

export type DeviceCommandLease = z.infer<typeof DeviceCommandLeaseSchema>;
export type DeviceRuntimeState = z.infer<typeof DeviceRuntimeStateSchema>;
export type DeviceCommandAcknowledgement = z.infer<typeof DeviceCommandAcknowledgementSchema>;

export type DeviceLeaseVerdict =
  | { allowed: true; fencingToken: bigint }
  | {
      allowed: false;
      code:
        | "device_offline"
        | "kill_switch_active"
        | "wrong_user_or_device"
        | "stale_mandate"
        | "stale_intent"
        | "stale_consent"
        | "stale_connector"
        | "stale_kill_epoch"
        | "stale_fence"
        | "not_yet_valid"
        | "expired";
    };

/**
 * Deterministic validation immediately before a committing native operation.
 * Cryptographic signature and App Attest verification are intentionally
 * separate platform-bound steps and must complete before this verdict is used.
 */
export function validateDeviceCommandLease(
  leaseInput: DeviceCommandLease,
  stateInput: DeviceRuntimeState,
): DeviceLeaseVerdict {
  const lease = DeviceCommandLeaseSchema.parse(leaseInput);
  const state = DeviceRuntimeStateSchema.parse(stateInput);
  const now = new Date(state.now).getTime();

  if (!state.online) return { allowed: false, code: "device_offline" };
  if (state.killSwitchActive) return { allowed: false, code: "kill_switch_active" };
  if (lease.userId !== state.userId || lease.deviceId !== state.deviceId) {
    return { allowed: false, code: "wrong_user_or_device" };
  }
  if (lease.mandateVersion !== state.mandateVersion) return { allowed: false, code: "stale_mandate" };
  if (lease.intentEpoch !== state.intentEpoch) return { allowed: false, code: "stale_intent" };
  if (lease.consentEpoch !== state.consentEpoch) return { allowed: false, code: "stale_consent" };
  if (lease.connectorEpoch !== state.connectorEpoch) return { allowed: false, code: "stale_connector" };
  if (lease.killSwitchEpoch !== state.killSwitchEpoch) return { allowed: false, code: "stale_kill_epoch" };

  const fence = BigInt(lease.fencingToken);
  if (fence < BigInt(state.minimumFencingToken)) return { allowed: false, code: "stale_fence" };
  if (now < new Date(lease.notBefore).getTime()) return { allowed: false, code: "not_yet_valid" };
  if (now >= new Date(lease.expiresAt).getTime()) return { allowed: false, code: "expired" };

  return { allowed: true, fencingToken: fence };
}
