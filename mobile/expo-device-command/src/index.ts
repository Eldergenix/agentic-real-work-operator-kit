import OperatorDeviceCommandModule from "./OperatorDeviceCommandModule";
import type {
  DeviceCommandAcknowledgement,
  DeviceCommandEnvelope,
} from "./OperatorDeviceCommand.types";

export type { DeviceCommandAcknowledgement, DeviceCommandEnvelope };

export async function executeDeviceCommand(input: {
  envelope: DeviceCommandEnvelope;
  expectedDeviceId: string;
}): Promise<DeviceCommandAcknowledgement> {
  const nativeDeviceId = await OperatorDeviceCommandModule.getRegisteredDeviceId();
  if (nativeDeviceId !== input.expectedDeviceId) {
    throw new Error("device_identity_mismatch");
  }
  if (input.envelope.deviceId !== nativeDeviceId) {
    throw new Error("command_device_mismatch");
  }
  const expiry = Date.parse(input.envelope.expiresAt);
  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    throw new Error("command_expired");
  }
  return OperatorDeviceCommandModule.execute(input.envelope);
}
