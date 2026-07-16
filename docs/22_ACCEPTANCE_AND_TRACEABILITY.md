# Acceptance and Traceability

This document maps the user-facing product, deterministic kernel, provider effects, learned components, and production claims to reviewable implementation and evidence.

## 1. Traceability chain

Every committing user-facing feature must be traceable through:

```text
feature
→ GoalSpec/intent source
→ Plan IR node
→ protected-field provenance
→ authorization source and capability cell
→ effect-registry contract
→ broker capability and attempt
→ provider object/identity
→ verification observations
→ effect aggregate
→ mission terminal predicates
→ recovery/permanence result
→ receipt and UI projection
→ promotion/model evidence, when applicable
```

A missing link prevents graduation.

## 2. Feature-to-implementation matrix

| Feature | Core backend owners | Minimum proof | Principal tests/evidence |
|---|---|---|---|
| Operator Enrollment | mandates, canonical policy, capability cells, consent | UI render equals stored/enforced policy; adjacent cell denied | RLS, concurrent edit, envelope, revoke, cross-device tests |
| Autonomy Passport | capability cells, evidence epochs, promotion receipts, incidents | exact tier/cell/reasons and evidence remaining | promotion/demotion and stale-version tests |
| Goal Lock | GoalSpec, intent epoch, direct-command attestation | exact protected slots; ambiguity asks; revisions invalidate | intent, canonical hash, stale epoch, interruption model |
| Durable Missions | Plan IR, Workflow, saga, action events | survives redelivery/restart; reauthorizes each step | lifecycle, replay, fault injection, TLA+ |
| Verified Action Receipt | action events, attempts, verifier observations | provider acknowledgement visibly distinct from verification | provider mismatch, stale read, maturity tests |
| Mission Outcome | terminal predicates and outcome evaluator | verified effect may still fail/partially satisfy goal | mission-outcome tests and domain predicates |
| Recovery Center | reconcile/compensate/mitigate adapters | truthful recovery semantics and verified result | compensation failure, residual propagation, UI tests |
| Context Controls | observation/purpose/consent/memory/erasure | minimum-purpose projection and revocation before next use | source race, local-health, erasure-descendant tests |
| Teach the Operator | procedure candidate, Plan IR template, verifier discovery | demonstration cannot create credential or unbounded macro | static policy, sandbox, directed execution evidence |
| Calendar Operator | Google adapter, broker, events.get verifier | real test-account mutation/read-back/recovery | duplicate, DST, conflict, ETag, provider proof |
| Communications | message adapter, provider object/event verifier | exact recipient/account/content class; sent is irreversible | wrong-recipient, bounce, delayed cancel, correction |
| Browser Operator | frozen commit graph, origin policy, account verifier | real account state independent of DOM/toast | injection, host drift, stale UI, auth handoff |
| Device/Health | signed queue, lease, native dispatcher, local data | physical write and read-back; offline commit denied | wrong device, reinstall, revoke race, local serialization |
| Smart Home | device/capability/risk-specific cells | real state/read-back/reverse; risk evidence non-transfer | target/capability drift, physical hazard tests |
| Ride | quote/request/status/cancel/fee states | sandbox plus bounded live canary | quote expiry, surge, duplicate, cancellation fee |
| Commerce | card/order/settlement/refund state machines | sandbox and small internal live canary | spend race, checkout uncertainty, substitution, refund |
| Human Context Planning | authoritative state, belief, procedure and outcome models | context changes real action and is explainable/erasable | influence receipt, minimal projection, shift/abstain |
| Learned Ranking/MPC | model artifacts, propensities, risk, OPE | fixed-risk goal-utility improvement with rollback | support, ESS, anytime bounds, OOD, reward hacking |

## 3. Kernel invariants and implementation owners

| Invariant | Primary code | Database/formal owner | Test class |
|---|---|---|---|
| Model creates no positive authority | `authorization-gate.ts` | mandates/capability cells | authorization |
| Plan mutation invalidates capability | `canonical.ts`, `plan-ir.ts` | GoalSpec/Plan tables | canonical, authorization |
| Untrusted data cannot select protected fields | `provenance.ts` | provenance graph | provenance |
| Stale intent/consent/mandate cannot execute | `authorization-gate.ts` | epochs and append-only plans | authorization, TLA+ |
| Broker credential isolation | `broker-capability.ts`, private Worker | Service Binding/secret policy | worker type/egress review |
| Retry cannot blindly repeat uncertain effect | `broker.ts`, adapter contract | attempts/events/reservations | broker, lifecycle |
| Provider acknowledgement is not verification | `lifecycle.ts` | verification observations | lifecycle |
| Effect success is not mission success | `mission-outcome.ts` | mission outcomes | mission outcome |
| Memory transform cannot increase authority | `memory-authority.ts` | memory origins/elevation receipts | memory |
| Promotion cannot average away severe incidents | `promotion.ts` | incident/promotion receipts | promotion |
| Runtime risk is veto-only | `risk-guardian.ts` | decision opportunities | risk/authorization |
| Projections cannot change action truth | repository/outbox contract | append-only events/current projection | DB/outbox/fault tests |

## 4. Acceptance evidence classes

```text
E0 static/source evidence
E1 unit/contract evidence
E2 database/RLS/atomicity evidence
E3 local Worker/runtime evidence
E4 provider simulator evidence
E5 provider sandbox/test-account evidence
E6 physical-device evidence
E7 deployed backend/ref evidence
E8 installed client/ref evidence
E9 internal live-canary evidence
E10 cohort statistical/incident evidence
```

A product claim must declare its minimum evidence class. For example:

- `kernel_implemented`: E0–E4;
- `kernel_provider_proven`: E0–E5 plus real UI, E7, and E8 where client changes exist;
- physical HealthKit graduation: E6;
- internal A5 graduation: E9;
- cohort graduation: E10.

## 5. Real Work Completion Gate

A capability cell is eligible for graduation only when:

1. a current exact authorization source exists;
2. the frozen action and protected provenance match;
3. mandate, consent, target, provider, account, time, budget, consequence, and verifier policies pass;
4. the action-level risk guardian permits execution inside its support region;
5. one fenced logical action produces at most one accepted external effect under the registered strategy;
6. a stable external identity or best available reconciliation key is recorded;
7. an independent verifier evaluates expected postconditions;
8. uncertainty remains explicit;
9. recovery/permanence semantics are truthful;
10. mission predicates are evaluated separately;
11. append-only events and the redacted receipt are durable;
12. revocation, cap exhaustion, stale epochs, and kill switches block new attempts;
13. real provider/device and Operator Kit surfaces reflect the result;
14. deployment and installed-client compatibility are proven for production waves.

## 6. Model traceability

Every learned influence must record:

```text
artifact and dataset hashes
training/evaluation policy version
input projection hash
output/prediction/ranking hash
calibrated support region
aleatoric and epistemic uncertainty
OOD/shift result
certified transition/head/horizon
candidate set and propensities
fallback/champion
Plan IR/action influenced
resulting mature goal outcome
```

A model-serving receipt permits influence only. It contributes zero authority and zero live promotion exposure by itself.

## 7. Machine-readable sources

- [`features/FEATURE_CATALOG.yaml`](../planning/FEATURE_CATALOG.yaml)
- [`implementation/WORK_BREAKDOWN.yaml`](../planning/WORK_BREAKDOWN.yaml)
- [`implementation/ACCEPTANCE_MATRIX.csv`](../planning/ACCEPTANCE_MATRIX.csv)
- [`implementation/API_CONTRACTS.yaml`](../planning/API_CONTRACTS.yaml)
- [`implementation/FEATURE_FLAGS.yaml`](../planning/FEATURE_FLAGS.yaml)
- [`implementation/OBSERVABILITY_EVENTS.yaml`](../planning/OBSERVABILITY_EVENTS.yaml)
- [`ml/model-tournament.yaml`](../ml/model-tournament.yaml)
- [`ml/promotion-policy.yaml`](../ml/promotion-policy.yaml)

## 8. Reviewer sign-off

Each graduated cell requires explicit sign-off from:

```text
product owner
authority/security owner
provider adapter owner
data/privacy owner
reliability/operations owner
mobile/client owner when applicable
model/evaluation owner when learned influence is active
```

Sign-off records acceptance evidence, open limitations, rollback mechanism, and the exact scope that is allowed to graduate.
