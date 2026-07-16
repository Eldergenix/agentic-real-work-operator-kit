import ExpoModulesCore
import CryptoKit
import Security

public final class OperatorDeviceCommandModule: Module {
  public func definition() -> ModuleDefinition {
    Name("OperatorDeviceCommand")

    AsyncFunction("getDeviceId") { () -> String in
      try DeviceIdentity.shared.deviceId()
    }

    AsyncFunction("verifyExecutionLease") { (input: LeaseInput) -> LeaseResult in
      let now = Date().timeIntervalSince1970 * 1000
      guard input.expiresAtEpochMs > now else { throw DeviceCommandError.leaseExpired }
      guard input.expectedDeviceId == try DeviceIdentity.shared.deviceId() else {
        throw DeviceCommandError.wrongDevice
      }
      guard
        let payload = input.canonicalPayload.data(using: .utf8),
        let signature = Data(base64Encoded: input.signatureBase64),
        let publicKeyData = Data(base64Encoded: input.serverPublicKeyBase64)
      else { throw DeviceCommandError.invalidEncoding }

      let publicKey = try P256.Signing.PublicKey(x963Representation: publicKeyData)
      guard publicKey.isValidSignature(signature, for: payload) else {
        throw DeviceCommandError.invalidSignature
      }
      return LeaseResult(
        verified: true,
        deviceId: try DeviceIdentity.shared.deviceId(),
        verifiedAtEpochMs: Int64(now)
      )
    }

    AsyncFunction("signAcknowledgement") { (canonicalAcknowledgement: String) -> AttestationResult in
      guard let payload = canonicalAcknowledgement.data(using: .utf8) else {
        throw DeviceCommandError.invalidEncoding
      }
      let key = try DeviceIdentity.shared.signingKey()
      let signature = try key.signature(for: payload)
      return AttestationResult(
        deviceId: try DeviceIdentity.shared.deviceId(),
        deviceKeyId: try DeviceIdentity.shared.deviceKeyId(),
        challengeSignatureBase64: signature.base64EncodedString(),
        attestationReference: nil
      )
    }
  }
}

struct LeaseInput: Record {
  @Field var canonicalPayload: String = ""
  @Field var signatureBase64: String = ""
  @Field var serverPublicKeyBase64: String = ""
  @Field var expectedDeviceId: String = ""
  @Field var expiresAtEpochMs: Double = 0
}

struct LeaseResult: Record {
  @Field var verified: Bool
  @Field var deviceId: String
  @Field var verifiedAtEpochMs: Int64
}

struct AttestationResult: Record {
  @Field var deviceId: String
  @Field var deviceKeyId: String
  @Field var challengeSignatureBase64: String
  @Field var attestationReference: String?
}

enum DeviceCommandError: Error {
  case leaseExpired
  case wrongDevice
  case invalidEncoding
  case invalidSignature
  case keychainFailure
}

private final class DeviceIdentity {
  static let shared = DeviceIdentity()
  private let service = "com.eldergenix.operator-device-command"

  func deviceId() throws -> String {
    if let existing = try load(account: "device-id") { return existing }
    let value = UUID().uuidString.lowercased()
    try save(value, account: "device-id")
    return value
  }

  func deviceKeyId() throws -> String {
    let key = try signingKey()
    let digest = SHA256.hash(data: key.publicKey.rawRepresentation)
    return digest.map { String(format: "%02x", $0) }.joined()
  }

  func signingKey() throws -> P256.Signing.PrivateKey {
    if let encoded = try load(account: "signing-key"), let data = Data(base64Encoded: encoded) {
      return try P256.Signing.PrivateKey(rawRepresentation: data)
    }
    let key = P256.Signing.PrivateKey()
    try save(key.rawRepresentation.base64EncodedString(), account: "signing-key")
    return key
  }

  private func load(account: String) throws -> String? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne
    ]
    var result: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    if status == errSecItemNotFound { return nil }
    guard status == errSecSuccess, let data = result as? Data,
          let value = String(data: data, encoding: .utf8) else {
      throw DeviceCommandError.keychainFailure
    }
    return value
  }

  private func save(_ value: String, account: String) throws {
    let data = Data(value.utf8)
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account
    ]
    SecItemDelete(query as CFDictionary)
    let add = query.merging([kSecValueData as String: data]) { _, new in new }
    guard SecItemAdd(add as CFDictionary, nil) == errSecSuccess else {
      throw DeviceCommandError.keychainFailure
    }
  }
}
