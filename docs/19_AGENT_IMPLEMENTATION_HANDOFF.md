# AI Engineering Agent Implementation Handoff

## 1. Mission

Integrate the Agentic Real-Work Operator Kit into the existing repository without reinventing current owners, weakening governance, rewriting applied migrations, exposing credentials, or claiming completion before real provider proof.

## 2. Mandatory behavior

- Work on the existing checked-out branch unless repository policy requires otherwise.
- Read existing architecture/governance/domain documents before editing.
- Inventory and reuse existing tool, approval, grant, goal, Workflow, AHCE, provider, and UI owners.
- Make additive changes and narrow migrations.
- Write red tests before authority, money, replay, revocation, target, lifecycle, and migration changes.
- Keep model/planner code credential-free.
- Do not enable committing functionality until the broker path and provider proof are complete.
- Never report a shadow result, fixture, screenshot, unit test, provider acknowledgement, or source flag as a shipped operator capability.

## 3. First repository audit

Produce `docs/aegis/work/.../00-current-state.md` containing:

```text
repository/branch/commit/dirty state
referenced document existence and supersession conflicts
all committing actions and call sites
all current approval/grant/authorization owners
all credential owners and Worker secret sets
current action ledger/lifecycle behavior
approvedCanonical resume behavior
current database migration state and project ref
current Worker routes/bindings/deploy refs
current TestFlight build/source ref
available provider test accounts
current test/evaluation commands
```

Mark every supplied current-state claim verified, contradicted, or unknown.

## 4. Package 0A — Intent and Plan Integrity

### Create

```text
src/lib/operator/goal-spec.ts
src/lib/operator/intent-compiler.server.ts
src/lib/operator/intent-epoch.ts
src/lib/operator/plan-ir.ts
src/lib/operator/provenance.ts
src/lib/operator/information-flow.ts
src/lib/operator/reference-monitor.ts
src/lib/operator/denial-result.ts
```

### Integrate

- authenticated chat/voice source-message attestation;
- exact approval/direct command linkage;
- Plan IR persistence;
- protected-field policy;
- intent interruption in Workflow;
- canonicalization parity tests.

### Do not proceed until

- ambiguous protected target asks one question;
- untrusted/model-derived target fails;
- stale intent capability fails;
- changed action invalidates approval;
- unaffected replan node can be deterministically retained.

## 5. Package 0B — Action Registry

Extend every committing tool contract with:

```text
adapter ID/version
domain/action family
protected fields
target extraction
consequence vector
idempotency class
provider identity strategy
verification grade/strategy
propagation/maturity horizon
reconciliation
recovery semantics
point of no return
mission predicate template
redaction
```

CI fails for unknown committing tools.

## 6. Package 1 — Event-Sourced Lifecycle

- add logical action, event, attempt, verification, compensation, dependency, mission outcome, and outbox tables;
- implement one transition reducer used by server and tests;
- preserve `uncertain` after timeout;
- make existing ledgers projections/references;
- add stale fence/epoch tests;
- keep applied migrations untouched.

## 7. Package 2 — Mandates and Capability Cells

- compile UI policy to canonical server policy;
- add direct-command single-use attestation;
- migrate legacy standing grants/journeys into cells;
- retire legacy runtime allow/deny per family only after parity;
- add maximum-autonomy envelope and A4/A5 category inclusion;
- add promotion/demotion evidence epochs.

## 8. Package 3 — Private Broker

- create `mozi-operator` private WorkerEntrypoint;
- add service binding from AI/router/Workflow as actually required;
- keep provider secrets out of other bundles;
- verify signed capability/current epochs server-side;
- claim fenced attempt and reservation atomically;
- perform external I/O outside DO/database locks;
- append facts, not prose success;
- reconcile before retry.

## 9. Package 4 — Context, Outcome, and Memory Ledger

- add decision opportunity and model influence receipts;
- implement memory origin authority/admission/quarantine;
- make event times bitemporal;
- complete consent/erasure graph;
- write authoritative action event first, then outbox projections;
- do not allow projection failure to fail open action state.

## 10. Package 5 — Calendar proof

- provision dedicated Google test account/calendar and scoped OAuth;
- implement private event create/update/cancel first;
- deterministic client event ID and private extended metadata;
- direct provider GET verification;
- exact pre-state snapshot and compensation;
- GoalSpec terminal predicate;
- run from authenticated chat and scheduled Mission;
- test duplicate Workflow delivery and timeout-after-commit;
- show authoritative receipt in real Operator Kit surface;
- record provider, Worker, DB, client, and recovery proof.

Only after this exit may the operator kernel be called `kernel_provider_proven`.

## 11. Subsequent work

Proceed in this order:

```text
exact communications/connected-app writes
browser with independent verification
device/HealthKit and benign smart-home
rides
A5 commerce subwave
other A5 subwaves
context runtime/procedure graph
temporal model tournament
finite ranker
safe contextual bandit
constrained MPC
Dreamer-style challenger
```

## 12. Pull request structure

Prefer narrow reviewable PRs/commits:

1. contracts/tests only;
2. additive migrations/database functions/tests;
3. broker Worker/bindings/secret policies;
4. Workflow/run-turn integration;
5. calendar adapter and test-account proof;
6. UX receipt/recovery;
7. deployment/canary evidence.

Do not mix unrelated redesigns or advanced models into the kernel proof.

## 13. Required evidence per PR

```text
changed invariants and threat model
focused tests and full CI
migration/RLS/drift result
bundle/secret/route checks
provider simulator result
real provider proof when applicable
screenshots/physical device proof when applicable
deploy refs and client compatibility
rollback instructions
open limitations
```

## 14. Stop conditions

Stop and record an explicit blocker rather than bypassing when:

- current repository contradicts the supplied authority architecture;
- a parallel commit path cannot be retired safely;
- database drift or unrelated migrations exist;
- provider test account/read permission is unavailable;
- verifier cannot be independent enough;
- safe idempotency/reconciliation cannot be established;
- a requested capability exceeds structural ceilings;
- credentials would need to enter planner/model/client state;
- production ref/client compatibility cannot be proven.

## 15. Final implementation report

For each capability cell, report:

```text
registered
test-account proven
internal canary
cohort graduated
not implemented
blocked
```

Include exact evidence links and do not use one global “complete” label.
