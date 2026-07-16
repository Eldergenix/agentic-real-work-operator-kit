# Mobile and device-command integration

The canonical cross-runtime contract is `src/lib/operator/device-command.ts`. The Expo/iOS target must generate native/TypeScript equivalents from the reviewed schema rather than inventing a second authority model.

## Required device execution sequence

```text
server registers canonical action
→ server authorizes and reserves
→ server creates short-lived command lease
→ device receives notification/polls queue
→ device verifies app/device attestation and server signature
→ device atomically claims command online
→ server rechecks current mandate, intent, consent, connector, cap and kill epochs
→ device validates exact lease locally
→ native framework executes one operation
→ native framework independently reads state back
→ device signs acknowledgement and read-back hash
→ server appends verification observation and evaluates mission predicates
```

Offline committing execution fails closed. Read-only local assistance may continue. Push delivery is not execution proof.

## iOS implementation requirements

- Store a device-held signing key in the Secure Enclave/Keychain where supported.
- Bind the device registration to the authenticated user and app installation.
- Verify App Attest or the reviewed platform-integrity mechanism server-side.
- Do not place provider, Supabase service-role, Cloudflare or connector credentials in the app.
- Reject leases for the wrong user/device, stale epochs, stale fence, future `notBefore`, expired time, invalid signature or offline state.
- Execute only registry-known native operations.
- Read back through HealthKit/EventKit/Home provider state rather than trusting a local success callback alone.
- Return only purpose-permitted/redacted outcome fields to the server.
- Recheck authorization after app restart, reinstall, authentication handoff and notification redelivery.

## UI state contract

The mobile UI must show distinct states:

- waiting for device;
- awaiting authentication;
- executing;
- provider/device acknowledged;
- independently verified;
- mission satisfied/partial/failed/uncertain;
- expired/offline/denied;
- compensating/compensated/mitigated/permanent.

Never present a push acknowledgement, native API return value, reminder, or simulator write as a verified physical-device effect.
