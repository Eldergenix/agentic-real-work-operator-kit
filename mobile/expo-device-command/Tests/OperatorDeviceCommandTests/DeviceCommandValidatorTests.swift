import Foundation
import Testing
@testable import OperatorDeviceCommand

private func fixture() -> (DeviceCommandLease, DeviceRuntimeState) {
    let userId = UUID()
    let now = Date()
    let lease = DeviceCommandLease(
        commandId: UUID(),
        actionId: UUID(),
        attemptId: UUID(),
        userId: userId,
        deviceId: "device-key-1",
        actionHash: String(repeating: "a", count: 64),
        goalSpecHash: String(repeating: "b", count: 64),
        planHash: String(repeating: "c", count: 64),
        mandateVersion: 3,
        intentEpoch: 7,
        consentEpoch: "consent-4",
        killSwitchEpoch: "kill-9",
        connectorEpoch: "device-connector-2",
        fencingToken: 12,
        operation: "healthkit.workout.save",
        notBefore: now.addingTimeInterval(-1),
        expiresAt: now.addingTimeInterval(30),
        nonce: "nonce-0123456789",
        signature: "signature-01234567890123456789012"
    )
    let state = DeviceRuntimeState(
        userId: userId,
        deviceId: "device-key-1",
        mandateVersion: 3,
        intentEpoch: 7,
        consentEpoch: "consent-4",
        killSwitchEpoch: "kill-9",
        killSwitchActive: false,
        connectorEpoch: "device-connector-2",
        minimumFencingToken: 12,
        online: true,
        now: now
    )
    return (lease, state)
}

@Test("allows an exact current online lease")
func allowsCurrentLease() {
    let (lease, state) = fixture()
    #expect(DeviceCommandValidator.validate(lease: lease, state: state) == .allowed(fencingToken: 12))
}

@Test("fails closed after consent or kill state changes")
func rejectsChangedAuthorityEpochs() {
    let (lease, state) = fixture()
    let staleConsent = DeviceRuntimeState(
        userId: state.userId,
        deviceId: state.deviceId,
        mandateVersion: state.mandateVersion,
        intentEpoch: state.intentEpoch,
        consentEpoch: "consent-5",
        killSwitchEpoch: state.killSwitchEpoch,
        killSwitchActive: false,
        connectorEpoch: state.connectorEpoch,
        minimumFencingToken: state.minimumFencingToken,
        online: true,
        now: state.now
    )
    #expect(DeviceCommandValidator.validate(lease: lease, state: staleConsent) == .denied(.staleConsent))

    let killed = DeviceRuntimeState(
        userId: state.userId,
        deviceId: state.deviceId,
        mandateVersion: state.mandateVersion,
        intentEpoch: state.intentEpoch,
        consentEpoch: state.consentEpoch,
        killSwitchEpoch: state.killSwitchEpoch,
        killSwitchActive: true,
        connectorEpoch: state.connectorEpoch,
        minimumFencingToken: state.minimumFencingToken,
        online: true,
        now: state.now
    )
    #expect(DeviceCommandValidator.validate(lease: lease, state: killed) == .denied(.killSwitchActive))
}

@Test("rejects stale fencing and expiration")
func rejectsStaleFenceAndExpiry() {
    let (lease, state) = fixture()
    let staleFence = DeviceRuntimeState(
        userId: state.userId,
        deviceId: state.deviceId,
        mandateVersion: state.mandateVersion,
        intentEpoch: state.intentEpoch,
        consentEpoch: state.consentEpoch,
        killSwitchEpoch: state.killSwitchEpoch,
        killSwitchActive: false,
        connectorEpoch: state.connectorEpoch,
        minimumFencingToken: 13,
        online: true,
        now: state.now
    )
    #expect(DeviceCommandValidator.validate(lease: lease, state: staleFence) == .denied(.staleFence))

    let expired = DeviceRuntimeState(
        userId: state.userId,
        deviceId: state.deviceId,
        mandateVersion: state.mandateVersion,
        intentEpoch: state.intentEpoch,
        consentEpoch: state.consentEpoch,
        killSwitchEpoch: state.killSwitchEpoch,
        killSwitchActive: false,
        connectorEpoch: state.connectorEpoch,
        minimumFencingToken: state.minimumFencingToken,
        online: true,
        now: lease.expiresAt
    )
    #expect(DeviceCommandValidator.validate(lease: lease, state: expired) == .denied(.expired))
}
