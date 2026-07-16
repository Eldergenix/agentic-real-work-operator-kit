# Implementation-agent handoff prompt

Use this prompt in the Operator Kit repository with a coding agent that can inspect, edit, build, test, deploy to non-production environments, and capture evidence.

---

You are implementing Agentic Real-Work Operator Kit Frontier V4 in an existing production repository. Treat this package as the reference contract, not as permission to overwrite existing architecture blindly.

## Mission

Replace the production read-only Mission seam with one canonical real-action pipeline while preserving existing chat, goal, approval, standing-grant, AgentCard, browser, connector and mobile behavior until each action family is migrated and proven.

A feature is not complete when it drafts, proposes, simulates, requests approval, returns provider HTTP success, passes unit tests, or runs only in shadow mode. It is complete only after it changes a real connected test/provider/device state, reads that state back independently, records an honest event-sourced receipt, survives replay, and exercises truthful recovery where supported.

## Mandatory repository-review phase

Before editing:

1. Read the repository's root agent instructions and every scoped instruction file.
2. Verify every supplied path, migration, SHA, Worker ref, feature flag and TestFlight assertion. Record discrepancies; never silently assume them.
3. Inventory all committing paths from chat, Missions, voice, crons, scheduled messages, Composio, browser/Puppet, native modules, AgentCard, Uber and client-resolved tools.
4. Map the existing data owners for users, connectors, OAuth credentials, approvals, grants, budgets, audit, consent, erasure, memory and model artifacts.
5. Search for all direct provider writes. For the first graduated family, route or hard-disable every bypass before claiming broker ownership.
6. Build an integration map showing which files from this package are copied, adapted, superseded or rejected and why.

## Non-negotiable invariants

- Models never mint positive authority.
- Natural language is compiled into a frozen GoalSpec before execution.
- Every committing mission is an immutable typed Plan IR.
- Protected fields pass a causal provenance check.
- Every provider attempt binds to current intent, mandate, consent, connector and kill-switch epochs.
- The private operator Worker is the only credential-bearing execution runtime.
- Provider acknowledgement is not verification.
- A verified effect is not automatically a satisfied mission.
- A stale worker/fence cannot execute or finalize state.
- A non-idempotent uncertain effect is never retried unattended.
- Persistent-memory transforms cannot increase origin authority.
- A4/A5 autonomy exists only inside the category/consequence envelope explicitly enrolled by the user.
- No synthetic, fixture, shadow or proposal event counts toward live promotion evidence.

## Implementation order

### Phase 0 — prove current truth

Create an Aegis work directory and store:

- source/ref inventory;
- deployment ref inventory;
- migration status and drift;
- action-family ownership table;
- credential-flow diagram;
- all current direct-write paths;
- current tests and failures.

### Phase 1 — integrate the kernel

Adapt, do not blindly duplicate:

- `src/lib/operator/schemas.ts`
- GoalSpec and Plan IR finalization;
- provenance reference monitor;
- capability lattice;
- risk guardian;
- event lifecycle;
- repository and reservation interfaces;
- memory authority;
- mission-outcome evaluator.

Write red tests first for malformed authority, altered payload, wrong target, stale epoch, duplicate replay, concurrent reservation, timeout-after-commit, verifier mismatch, revocation race and compensation failure.

### Phase 2 — database authority

Review the additive migrations against the actual schema. Never rewrite applied migrations. Apply to a staging clone first. Add or adapt:

- frozen GoalSpec and Plan IR;
- mandates and capability cells;
- single-use direct commands/approvals;
- action events, attempts, reservations and verification observations;
- outbox projections;
- mission outcomes;
- bitemporal context and memory authority;
- promotion and model-influence receipts.

Prove RLS, service-role-only mutation, immutable rows, optimistic concurrency, budget races, revocation and erasure.

### Phase 3 — private Worker

Create/deploy the private operator Worker before its callers. It must:

- expose only Service Binding RPC;
- verify exact short-lived request-bound capabilities;
- claim a single-use nonce and increasing fence;
- reload current authority from the server;
- resolve credentials only after authorization;
- register only complete effect adapters;
- write lifecycle state before projecting UI/analytics;
- reconcile unknown outcomes before retry.

Do not hold a Durable Object lock or database transaction across provider network I/O.

### Phase 4 — Calendar proof

Provision a non-production Google Workspace account and scoped OAuth connection. Implement private-event create first. Attendee invitation is a separate higher-propagation capability.

Exit requires chat and scheduled Mission paths to create real events through one broker, read them back by Google event ID, survive duplicate delivery, show receipts and verify deletion.

### Phase 5 — UX and subsequent domains

Wire Settings, Workers, Agenda and chat to the authoritative state. Then graduate email, connected-app writes, browser, device/health, smart home, ride, commerce and high-consequence subwaves separately.

### Phase 6 — learned decision systems

Do not begin with Dreamer. First establish data readiness, deterministic baselines, procedural preplay, temporal model tournament, rank-only planning, safe bandits and short-horizon MPC. Promote a model only for certified domains, heads and horizons.

## Validation loop

After every package:

1. Run focused tests.
2. Run full typecheck/lint/CI.
3. Validate RLS and migration drift.
4. Exercise provider fault scenarios.
5. Compare authoritative provider state.
6. Check UI projection against action events.
7. Check deployed refs and installed client compatibility.
8. Ask: “What would a senior security/reliability reviewer reject?” Fix it before proceeding.

## Completion reporting

Use precise status labels:

- `kernel_implemented`
- `kernel_provider_proven`
- `action_family_registered`
- `action_family_test_account_proven`
- `action_family_internal_canary`
- `action_family_cohort_graduated`
- `model_l1_promoted`
- `model_l2_promoted`
- `model_l3_promoted`
- `product_program_graduated`

Never report a broader status than the captured evidence proves.
