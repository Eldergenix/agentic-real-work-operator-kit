# Master Technical Implementation Plan

## 1. Objective

Build Operator Kit as a Human Context Operator that can execute durable, authorized work across connected systems while preserving user intent, deterministic authority, credential isolation, truthful uncertainty, independent verification, recovery, privacy, and evidence-based earned autonomy.

The implementation is successful only when a real provider or device state change is visible in the provider/device and in the authoritative Operator Kit UI, linked to its GoalSpec, Plan IR, mandate, policy, action, provider identity, verification observations, mission result, and any recovery.

## 2. Architectural decision

The implementation uses one canonical path:

```text
Authenticated intent / schedule / event
→ Intent Compiler
→ frozen GoalSpec + intent epoch
→ authoritative state + calibrated belief
→ typed candidate generation
→ immutable Plan IR
→ causal provenance reference monitor
→ capability-cell authorization
→ action-conditional risk/abstention
→ signed single-use execution capability
→ credential-isolated operator broker
→ provider/device attempt
→ independent verification
→ effect reducer
→ mission outcome evaluator
→ receipt/outbox/projections
→ governed episodic and procedural learning
```

No model, prompt, tool registry, browser page, external email, retrieved memory, or provider response can create positive authority.

## 3. Non-negotiable completion gate

A capability is complete only when all conditions hold:

1. A current authenticated authorization source exists: exact direct command, exact recorded approval, or mandate capability cell.
2. Protected fields have sufficient provenance integrity and are frozen in the canonical action.
3. The action is inside current mandate, purpose consent, target, provider, account, time, budget, consequence, and verifier constraints.
4. The runtime risk guardian permits the exact action in the current state and support region.
5. A fenced attempt changes real provider/device state or honestly records no/unknown effect.
6. The provider supplies a stable object/effect identity when its API supports one.
7. Independent observations evaluate the expected postconditions at the registered verification grade.
8. The action reaches an honest state: `verified`, `permanent_verified`, `compensated`, `uncertain`, `failed`, `compensation_failed`, `superseded`, or `aborted`.
9. The mission outcome is evaluated separately against terminal user-goal predicates.
10. The authoritative append-only event history and redacted receipt are durable.
11. Retries obey the adapter's idempotency class and cannot blindly repeat an uncertain non-idempotent effect.
12. Revocation, expiry, stale intent, stale connector, cap exhaustion, target drift, or kill-switch epoch stops all new attempts.
13. Recovery copy is truthful; no UI calls mitigation or correction a full undo.
14. Provider, backend, client, and UI proof are all recorded for a production wave.

## 4. Scope boundaries

### Structural stops

- passwords, passkeys, one-time codes, CAPTCHA answers, identity-verification answers, or credential guessing;
- prohibited commerce or illegal action categories;
- diagnosis, prescription, treatment changes, clinical triage, or licensed judgment;
- action outside current mandate or purpose consent;
- changed canonical action after authorization;
- unregistered actions lacking an executor, verifier, reconciliation strategy, and receipt mapping;
- unattended retry when the adapter cannot safely prevent or detect duplicate effects.

### High-consequence enrollment boundary

A2 private, low-propagation, verified-reversible work may be enabled after self-test. A3 categories may be included through clearly disclosed enrollment. A4 and A5 categories require one-time explicit inclusion in the maximum-autonomy envelope by category and consequence band. Promotion within that envelope can be automatic; promotion can never expand it.

## 5. Implementation packages

| Package | Purpose | Exit proof |
|---|---|---|
| **0A Intent and Plan Integrity** | GoalSpec, protected slots, intent epochs, Plan IR, provenance graph | altered/stale intent or low-integrity target cannot execute |
| **0B Action Registry** | complete typed effect, verifier, idempotency, consequence, recovery contracts | CI rejects unregistered committing tools |
| **1 Event-Sourced Lifecycle** | actions, attempts, events, verification, mission outcome | timeout-after-commit remains uncertain and replay-safe |
| **2 Mandate and Capability Lattice** | mandates, direct commands, capability cells, promotion/demotion | exact scope executes; adjacent scope fails |
| **3 Private Operator Broker** | service binding, capability token, fencing, credentials, reservations | planner never sees credentials; one accepted effect |
| **4 Outcome and Memory Ledger** | outcome bundles, model influence, source lineage, memory authority | complete trace with erasure and no authority laundering |
| **5 Calendar Vertical** | real Google Calendar create/update/cancel/verify/compensate | chat and Mission mutate and verify test account |
| **6 Communications and Connected Apps** | exact recipients and typed Composio writes | provider-backed message/object verification |
| **7 Browser Operator** | target-bound persistent browser workflows | real test-account state verified outside automation trace |
| **8 Device, Health, Smart Home** | signed device lane and local sensitive processing | physical read-back and reverse action |
| **9 Ride Operator** | quote/request/status/cancel/fee state machine | sandbox plus capped live canary |
| **10 A5 Subwaves** | commerce, travel, recurring, public, destructive, clerical-form | independent subwave evidence and permanent-effect truth |
| **11 Governed Context Runtime** | bitemporal observations, belief, minimal projection | context changes a real authorized action and is erasable |
| **12 Procedural and Temporal Models** | data readiness, procedure graph, model tournament | fixed-risk improvement over deterministic baseline |
| **13 Learned Control** | finite ranker, safe bandit, MPC, late Dreamer challenger | live verified-goal improvement without policy violations |
| **14 Unified Operator UX** | enrollment, passport, missions, outcomes, recovery, controls | real cross-device authoritative state |
| **15 Production Graduation** | migrations, deploy parity, canaries, rollback, incident response | exact capability cells graduate with complete evidence |

Machine-readable detail is in [`implementation/WORK_BREAKDOWN.yaml`](../planning/WORK_BREAKDOWN.yaml).

## 6. Critical path

```text
GoalSpec/Plan IR
→ reference monitor
→ event-sourced lifecycle
→ mandate/capability database
→ private broker
→ Google Calendar adapter
→ provider proof
```

Do not parallelize high-consequence domains ahead of this critical path. Other teams may develop adapter contracts, provider simulators, UX shells, research datasets, and evaluation harnesses, but no committing family graduates until the calendar kernel proves the common path.

## 7. Repository integration map

The supplied repository paths remain the primary integration seams:

- `src/lib/agent-goal/run-context.server.ts`: supply governed state, candidate tools, and broker client rather than direct credentials.
- `src/lib/agent-goal/run-turn.ts`: consume exact approved/direct/mandate action dispatch, write GoalSpec/Plan IR linkage, and return structured continuation/denial.
- `src/lib/agent-goal/workflow-core.ts`: durable plan execution, intent interruption, saga progress, reconciliation, and mission outcomes.
- `infra/cloudflare-app/user-goal-workflow.ts`: step-isolated, retry-aware Workflow orchestration.
- `src/lib/trust/grants.server.ts`: compile legacy grants into mandate capability cells; retire it as a second runtime authority per family.
- `src/lib/tools/execution-ledger.ts`: become projection/compatibility reader over authoritative operator events.
- `src/lib/human-context/v3/`: authoritative observation adapters and minimal-purpose projections.
- `src/lib/ahce/ledger/`: append-only outcome, model influence, memory, and erasure projections.
- `src/lib/ahce/world-model/v3/`: model tournament and signed artifact owners, never execution authority.

New canonical owners are specified in [`implementation/REPOSITORY_FILE_MAP.md`](../planning/REPOSITORY_FILE_MAP.md).

## 8. Data ownership

- **Postgres:** authoritative GoalSpecs, plans, mandates, capability cells, logical actions, attempts, events, verifications, budgets, outcomes, incidents, and outbox.
- **Durable Objects:** narrowly partitioned claims/fencing/coordination; never the only durable authority and never hold external I/O inside a concurrency lock.
- **Workflows:** waits, resumptions, retries, long-running sequencing, authentication pauses, reconciliation schedules.
- **Provider systems:** external source of truth for effects.
- **Device:** local raw health/sensitive values and signed device acknowledgements where required.
- **Model store:** immutable signed artifacts and competency receipts.
- **Memory store:** origin-bound episodic, authoritative, derived, procedural, quarantine, and contradiction records.

## 9. Release evidence

Every package produces distinct evidence:

```text
source/test proof
migration/RLS/atomicity proof
local runtime proof
provider sandbox/test-account proof
simulator/physical-device UI proof
production Worker route/binding/secret/ref proof
installed TestFlight build/ref proof
cohort live-action, verifier, recovery, risk, and incident proof
```

No single screenshot, test suite, migration file, model checkpoint, provider acknowledgement, or deployed flag substitutes for another lane.

## 10. Definition of done

The implementation is not globally “done” once one domain ships. Use scoped states:

```text
kernel_implemented
kernel_provider_proven
action_family_registered
action_family_test_account_proven
action_family_internal_canary
action_family_cohort_graduated
model_l1_promoted
model_l2_promoted
model_l3_promoted
product_program_graduated
```

The first target is `kernel_provider_proven` through private Google Calendar work. Advanced neural models are optional challengers whose rejection must not block the proven operator kernel.
