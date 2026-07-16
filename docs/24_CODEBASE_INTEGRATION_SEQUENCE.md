# Codebase integration sequence

## Phase 1 — audit before modification

1. Resolve the actual default branch and current deployment refs.
2. Run the repository test, typecheck, migration drift and Worker route suites.
3. Build a committing-path inventory from tool registration to provider call.
4. Identify existing idempotency, approval, grant, ledger and recovery owners.
5. Record schema conflicts and migration ordering.
6. Freeze a baseline Aegis evidence directory.

## Phase 2 — additive contracts

Introduce without deleting legacy paths:

```text
src/lib/operator/goal-spec.ts
src/lib/operator/plan-ir.ts
src/lib/operator/provenance.ts
src/lib/operator/effect-registry.ts
src/lib/operator/capability.ts
src/lib/operator/authorization-gate.ts
src/lib/operator/risk-guardian.ts
src/lib/operator/provider-adapter.ts
src/lib/operator/lifecycle.ts
```

Keep existing approval and grant flows working as compatibility inputs. They must not remain independent authorization owners after a family graduates.

## Phase 3 — additive data model

Apply the supplied migrations to a staging clone after mapping names and existing constraints:

```text
20260715125000_operator_intent_plan.sql
20260715130000_operator_mandates.sql
20260715140000_operator_action_events.sql
20260715150000_operator_outcome_memory_models.sql
```

Validate:

- migration order and drift;
- owner RLS;
- service-writer privileges;
- function `search_path` and grants;
- append-only enforcement;
- concurrent reservations;
- outbox reconciliation;
- erasure paths.

## Phase 4 — run-turn and Workflow integration

`run-turn.ts` should:

- compile or load GoalSpec;
- consume exact `approvedCanonical` dispatch;
- create/validate Plan IR;
- return typed action candidates, not credentials;
- accept structured denial/support results;
- link model influence receipts;
- never mark a mission complete from provider acknowledgement.

`workflow-core.ts` and the Cloudflare Workflow should:

- execute by plan node;
- claim current epochs immediately before each commit;
- park for authentication or authority;
- reconcile before retry;
- recompile on intent interruption;
- compensate in reverse dependency order where valid;
- evaluate terminal mission predicates.

## Phase 5 — private broker

1. Deploy the private operator Worker with no public route.
2. Add Service Bindings from authorized caller Workers.
3. Remove provider credentials from planner/AI Workers.
4. Bind signed capabilities to exact action/attempt/epochs/fence.
5. Resolve credentials only after claim and immediately before provider I/O.
6. Append acknowledgement and verification observations through Postgres RPCs.
7. Re-read current epochs before terminal finalization.

## Phase 6 — one family at a time

For Calendar:

1. register fixture contract;
2. prove reducer/broker against fixture;
3. provision Google test account;
4. register Google adapter;
5. route direct command through broker;
6. route scheduled Mission through same broker;
7. hard-disable old direct Calendar commits in Operator Mode;
8. prove provider, UI and deployment parity;
9. mark the family `test_account_proven` or `internal_canary` only after evidence.

Repeat the same retirement procedure for each family.

## Phase 7 — Human Context and ML

Do not make learned models a dependency of the first provider-proof milestone. Start with deterministic state and procedure logic. Activate learned influence only after the outcome ledger, consent/erasure pipeline and serving-receipt checks are live.
