import Foundation

public struct DeviceCommandLease: Codable, Equatable, Sendable {
    public let commandId: UUID
    public let actionId: UUID
    public let attemptId: UUID
    public let userId: UUID
    public let deviceId: String
    public let actionHash: String
    public let goalSpecHash: String
    public let planHash: String
    public let mandateVersion: Int
    public let intentEpoch: Int
    public let consentEpoch: String
    public let killSwitchEpoch: String
    public let connectorEpoch: String
    public let fencingToken: UInt64
    public let operation: String
    public let notBefore: Date
    public let expiresAt: Date
    public let nonce: String
    public let signature: String

    public init(
        commandId: UUID,
        actionId: UUID,
        attemptId: UUID,
        userId: UUID,
        deviceId: String,
        actionHash: String,
        goalSpecHash: String,
        planHash: String,
        mandateVersion: Int,
        intentEpoch: Int,
        consentEpoch: String,
        killSwitchEpoch: String,
        connectorEpoch: String,
        fencingToken: UInt64,
        operation: String,
        notBefore: Date,
        expiresAt: Date,
        nonce: String,
        signature: String
    ) {
        self.commandId = commandId
        self.actionId = actionId
        self.attemptId = attemptId
        self.userId = userId
        self.deviceId = deviceId
        self.actionHash = actionHash
        self.goalSpecHash = goalSpecHash
        self.planHash = planHash
        self.mandateVersion = mandateVersion
        self.intentEpoch = intentEpoch
        self.consentEpoch = consentEpoch
        self.killSwitchEpoch = killSwitchEpoch
        self.connectorEpoch = connectorEpoch
        self.fencingToken = fencingToken
        self.operation = operation
        self.notBefore = notBefore
        self.expiresAt = expiresAt
        self.nonce = nonce
        self.signature = signature
    }
}

public struct DeviceRuntimeState: Equatable, Sendable {
    public let userId: UUID
    public let deviceId: String
    public let mandateVersion: Int
    public let intentEpoch: Int
    public let consentEpoch: String
    public let killSwitchEpoch: String
    public let killSwitchActive: Bool
    public let connectorEpoch: String
    public let minimumFencingToken: UInt64
    public let online: Bool
    public let now: Date

    public init(
        userId: UUID,
        deviceId: String,
        mandateVersion: Int,
        intentEpoch: Int,
        consentEpoch: String,
        killSwitchEpoch: String,
        killSwitchActive: Bool,
        connectorEpoch: String,
        minimumFencingToken: UInt64,
        online: Bool,
        now: Date
    ) {
        self.userId = userId
        self.deviceId = deviceId
        self.mandateVersion = mandateVersion
        self.intentEpoch = intentEpoch
        self.consentEpoch = consentEpoch
        self.killSwitchEpoch = killSwitchEpoch
        self.killSwitchActive = killSwitchActive
        self.connectorEpoch = connectorEpoch
        self.minimumFencingToken = minimumFencingToken
        self.online = online
        self.now = now
    }
}

public enum DeviceLeaseDenialCode: String, Codable, Equatable, Sendable {
    case deviceOffline = "device_offline"
    case killSwitchActive = "kill_switch_active"
    case wrongUserOrDevice = "wrong_user_or_device"
    case staleMandate = "stale_mandate"
    case staleIntent = "stale_intent"
    case staleConsent = "stale_consent"
    case staleConnector = "stale_connector"
    case staleKillEpoch = "stale_kill_epoch"
    case staleFence = "stale_fence"
    case notYetValid = "not_yet_valid"
    case expired = "expired"
    case malformedLease = "malformed_lease"
}

public enum DeviceLeaseVerdict: Equatable, Sendable {
    case allowed(fencingToken: UInt64)
    case denied(DeviceLeaseDenialCode)
}

public enum DeviceCommandValidator {
    /// Performs the deterministic checks required immediately before a native
    /// committing operation. The caller must first verify the server signature,
    /// platform attestation, authenticated device registration, and registry
    /// membership for `operation`.
    public static func validate(
        lease: DeviceCommandLease,
        state: DeviceRuntimeState
    ) -> DeviceLeaseVerdict {
        guard isStructurallyValid(lease) else { return .denied(.malformedLease) }
        guard state.online else { return .denied(.deviceOffline) }
        guard !state.killSwitchActive else { return .denied(.killSwitchActive) }
        guard lease.userId == state.userId, lease.deviceId == state.deviceId else {
            return .denied(.wrongUserOrDevice)
        }
        guard lease.mandateVersion == state.mandateVersion else { return .denied(.staleMandate) }
        guard lease.intentEpoch == state.intentEpoch else { return .denied(.staleIntent) }
        guard lease.consentEpoch == state.consentEpoch else { return .denied(.staleConsent) }
        guard lease.connectorEpoch == state.connectorEpoch else { return .denied(.staleConnector) }
        guard lease.killSwitchEpoch == state.killSwitchEpoch else { return .denied(.staleKillEpoch) }
        guard lease.fencingToken >= state.minimumFencingToken else { return .denied(.staleFence) }
        guard state.now >= lease.notBefore else { return .denied(.notYetValid) }
        guard state.now < lease.expiresAt else { return .denied(.expired) }
        return .allowed(fencingToken: lease.fencingToken)
    }

    private static func isStructurallyValid(_ lease: DeviceCommandLease) -> Bool {
        lease.mandateVersion > 0 &&
        lease.intentEpoch >= 0 &&
        lease.notBefore <= lease.expiresAt &&
        lease.deviceId.isEmpty == false &&
        lease.operation.isEmpty == false &&
        lease.consentEpoch.isEmpty == false &&
        lease.killSwitchEpoch.isEmpty == false &&
        lease.connectorEpoch.isEmpty == false &&
        lease.nonce.count >= 16 &&
        lease.signature.count >= 32 &&
        isLowerHexDigest(lease.actionHash) &&
        isLowerHexDigest(lease.goalSpecHash) &&
        isLowerHexDigest(lease.planHash)
    }

    private static func isLowerHexDigest(_ value: String) -> Bool {
        value.count == 64 && value.unicodeScalars.allSatisfy { scalar in
            ("0"..."9").contains(Character(String(scalar))) ||
            ("a"..."f").contains(Character(String(scalar)))
        }
    }
}
