import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const typescript = await readFile(join(root, "src/lib/operator/device-command.ts"), "utf8");
const swift = await readFile(
  join(root, "mobile/expo-device-command/Sources/OperatorDeviceCommand/DeviceCommandValidator.swift"),
  "utf8",
);

const denialCodes = [
  "device_offline",
  "kill_switch_active",
  "wrong_user_or_device",
  "stale_mandate",
  "stale_intent",
  "stale_consent",
  "stale_connector",
  "stale_kill_epoch",
  "stale_fence",
  "not_yet_valid",
  "expired",
];

for (const code of denialCodes) {
  if (!typescript.includes(`\"${code}\"`)) throw new Error(`TypeScript device contract is missing ${code}`);
  if (!swift.includes(`\"${code}\"`)) throw new Error(`Swift device contract is missing ${code}`);
}

for (const protectedField of [
  "commandId",
  "actionId",
  "attemptId",
  "userId",
  "deviceId",
  "actionHash",
  "goalSpecHash",
  "planHash",
  "mandateVersion",
  "intentEpoch",
  "consentEpoch",
  "killSwitchEpoch",
  "connectorEpoch",
  "fencingToken",
  "operation",
  "notBefore",
  "expiresAt",
  "nonce",
  "signature",
]) {
  if (!typescript.includes(protectedField)) throw new Error(`TypeScript lease is missing ${protectedField}`);
  if (!swift.includes(protectedField)) throw new Error(`Swift lease is missing ${protectedField}`);
}

for (const requiredOrderFragment of [
  "state.online",
  "state.killSwitchActive",
  "lease.userId",
  "lease.mandateVersion",
  "lease.intentEpoch",
  "lease.consentEpoch",
  "lease.connectorEpoch",
  "lease.killSwitchEpoch",
  "minimumFencingToken",
  "notBefore",
  "expiresAt",
]) {
  if (!typescript.includes(requiredOrderFragment)) {
    throw new Error(`TypeScript device validation is missing ${requiredOrderFragment}`);
  }
}

console.log(
  JSON.stringify({
    event: "operator_cross_runtime_contract_validated",
    denialCodes: denialCodes.length,
    protectedFields: 19,
  }),
);
