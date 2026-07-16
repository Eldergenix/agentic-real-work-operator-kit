import { requireNativeModule } from "expo";
import type {
  NativeDeviceAttestation,
  NativeLeaseVerificationInput,
  NativeLeaseVerificationResult,
} from "./OperatorDeviceCommand.types";

type OperatorDeviceCommandNativeModule = {
  getDeviceId(): Promise<string>;
  verifyExecutionLease(input: NativeLeaseVerificationInput): Promise<NativeLeaseVerificationResult>;
  signAcknowledgement(canonicalAcknowledgement: string): Promise<NativeDeviceAttestation>;
};

export default requireNativeModule<OperatorDeviceCommandNativeModule>("OperatorDeviceCommand");
