# Status and assumptions

**Generated:** 2026-07-16  
**Artifact status:** implementation-grade specification and testable deterministic kernel  
**Not represented as:** a merged patch, deployed Worker, applied production migration, trained model, provider-certified integration, or completed production canary

## Implemented and locally validated

- TypeScript/Zod contracts for intent, plans, effects, mandates, capability cells, provenance, risk, lifecycle, verification, mission outcome, memory authority, world-model influence, and promotion evidence.
- Deterministic server gate with exact direct-command source-message/conversation binding, recorded approval, standing mandate, target, purpose, cap, version, epoch, provenance, idempotency and verification checks.
- Event-sourced lifecycle reducer that rejects unsupported state transitions and refuses verification without an independent observation.
- Separate provider-effect and mission-goal state.
- Origin-bound memory-authority propagation and explicit elevation receipt contracts.
- Google Calendar create/reference adapter with deterministic provider identity, independent GET read-back, exact argument matching, ETag capture and verified delete compensation behavior.
- Private Cloudflare Worker RPC and Service Binding design with short-lived exact capabilities, current server-state reload, nonce claim and fencing through a per-action Durable Object.
- Additive Postgres/Supabase migrations and server-only RPC patterns.
- OpenAPI, ML manifests, TLA+ starters, CI, 40 TypeScript tests across 21 files, a runnable provider-system smoke test, 3 compiled Swift device-lease tests, runbooks, planning manifests, and source indexes.

## Repository-specific work that remains

- Audit the actual Operator Kit checkout, branch, commit, dirty state, missing governance documents, migrations, generated types, connector owners, legacy gates, tool call sites, deployed Worker refs, Supabase ref, and installed TestFlight ref.
- Map the scaffold into Operator Kit’s current modules without introducing a second authority or lifecycle owner.
- Compile every existing committing chat, Mission, cron, browser, Composio, native, AgentCard, Uber, email, and device path into the exhaustive effect registry or hard-disable it in Operator Mode.
- Provision current Cloudflare bindings, secrets, Hyperdrive/internal DB access, current generated Worker types, credential-owner binding, observability and deployment ordering.
- Apply migrations to a staging clone and run real Postgres/RLS/concurrency/rollback tests.
- Provision provider test accounts and execute real read-back/uncertainty/recovery canaries.
- Integrate the included Expo iOS/Android module scaffold and compiled Swift lease validator into the actual app, then prove App Attest/Play Integrity, server signatures, native execution/read-back, UI, and TestFlight/backend compatibility.
- Produce a governed corpus, train candidates, and execute the predeclared model tournament and live influence canaries.

## Explicit hardening gates before production

1. **Atomic certification:** combine budget/quota reservation and one-shot direct-command/approval consumption in one database transaction under the action/fence lock. The reference broker refunds after a consumption failure and is fenced, but production should remove the inter-RPC gap.
2. **Capability-key rotation:** the scaffold uses short-lived HMAC capabilities for a compact testable reference. Production must support key IDs, rotation, overlap/revocation, secret separation and preferably asymmetric signing where operationally appropriate.
3. **Database access boundary:** a Supabase service-role HTTP client is included as a reference. The production Worker must use the reviewed least-privilege path—such as an internal authority-store service or Hyperdrive role—and must not expose broad credentials to callers or logs.
4. **Cross-runtime canonicalization:** generate and verify shared canonical-hash test vectors for TypeScript, SQL, Swift/native and any browser/container runtime before those runtimes mint or validate protected hashes.
5. **Real database proof:** unit tests use in-memory repositories. Run transaction isolation, row-lock, concurrent reservation, RLS, outbox and migration rollback suites against the same PostgreSQL major version used in staging/production.
6. **Provider behavior:** Google Calendar tests use mocked fetch. Verify OAuth scopes, event-ID restrictions, ETags, notification behavior, recurrence, eventual visibility, quota errors, webhook ordering, deletion and reconciliation in a dedicated Workspace test account.
7. **No broad model authority:** the world-model, risk and promotion modules are contracts and evaluation gates; no trained model or learned action policy is included or promoted.
8. **Formal-model completion:** TLA+ files are starter specifications. Add complete configs, fairness/liveness assumptions, bounded checks and review counterexamples before treating them as proof.

## Inherited assertions requiring verification

The supplied plan names repository paths, SHAs, Supabase project refs, Worker deployments, current billing mode and TestFlight builds. The private repository and control planes were not available to this artifact. Package 0 must classify each assertion as verified, contradicted or unknown and attach durable evidence.
