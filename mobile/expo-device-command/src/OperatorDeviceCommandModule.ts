import { requireNativeModule } from "expo";
import type {
  DeviceCommandAcknowledgement,
  DeviceCommandEnvelope,
} from "./OperatorDeviceCommand.types";

type NativeOperatorDeviceCommand = {
  execute(envelope: DeviceCommandEnvelope): Promise<DeviceCommandAcknowledgement>;
  getRegisteredDeviceId(): Promise<string>;
};

export default requireNativeModule<NativeOperatorDeviceCommand>("OperatorDeviceCommand");
