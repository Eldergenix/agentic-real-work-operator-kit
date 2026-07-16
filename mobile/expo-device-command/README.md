# Operator Kit Expo device-command lane

This directory contains two complementary implementation assets:

1. a dependency-free SwiftPM validator (`Sources/` and `Tests/`) that mirrors the deterministic current-epoch and fencing checks and runs on Linux/macOS;
2. an Expo local-module scaffold (`ios/`, `android/`, `src/`, `expo-module.config.json`) for integration into Operator Kit's actual Expo project.

Run the deterministic native validator with:

```sh
swift test --package-path mobile/expo-device-command
```

In the target Expo project, scaffold a current local module with `create-expo-module`, then merge the platform sources so the generated podspec, Gradle, autolinking, privacy manifests, and Expo SDK APIs match the app's installed SDK.

## Trust boundary

The lane provides a durable installation identity, device-held signing key, short-lived server lease validation, current intent/consent/connector/kill-switch checks, and signed acknowledgement shape. It deliberately does **not** expose a generic arbitrary native-command executor. Every HealthKit, EventKit, reminder, smart-home, or other command family must have a typed native handler, platform permission checks, preconditions, independent system read-back, and truthful recovery semantics. Unknown commands fail closed.

## Production call order

1. authenticate the Operator Kit user and registered installation;
2. verify App Attest/DeviceCheck or Play Integrity server-side;
3. atomically claim the typed command online;
4. reload current mandate, consent, connector, cap, and kill-switch state;
5. mint a lease lasting seconds and signed by a pinned server key;
6. validate signature, expiry, device identity, action hash, epochs, and fence immediately before mutation;
7. execute one registry-known native operation;
8. independently read system state back;
9. sign and upload the acknowledgement/read-back hash;
10. let the server append the verification observation and evaluate mission predicates.

Offline committing execution is prohibited. Read-only local assistance may continue. Production integration still requires Keychain/Secure Enclave or Android Keystore rotation, exact server-public-key encoding, platform privacy descriptions, background constraints, per-command schemas, physical-device testing, and TestFlight/backend compatibility proof.
