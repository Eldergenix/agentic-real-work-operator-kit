export type NativeLeaseVerificationInput = {
  canonicalPayload: string;
  signatureBase64: string;
  serverPublicKeyBase64: string;
  expectedDeviceId: string;
  expiresAtEpochMs: number;
};

export type NativeLeaseVerificationResult = {
  verified: boolean;
  deviceId: string;
  verifiedAtEpochMs: number;
};

export type NativeDeviceAttestation = {
  deviceId: string;
  deviceKeyId: string;
  challengeSignatureBase64: string;
  attestationReference?: string;
};
