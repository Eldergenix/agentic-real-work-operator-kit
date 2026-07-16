# Test and Qualification Plan

## 1. Test layers

```text
pure contract/schema tests
property/fuzz tests
database migration/RLS/atomicity tests
reference monitor and lifecycle tests
adapter simulator tests
Cloudflare local integration tests
provider sandbox/test-account tests
mobile simulator and physical-device tests
security/adversarial tests
model/offline evaluation
production canary and rollback drills
```

A passing lower layer never substitutes for a higher layer.

## 2. Contract tests

- canonicalization and cross-runtime test vectors;
- GoalSpec protected slot binding;
- Plan IR immutability and semantic versioning;
- provenance authority monotonicity;
- capability-cell exact matching;
- consequence and verifier classification;
- unknown committing action denial;
- recovery semantics copy registry.

## 3. Lifecycle property tests

Generate random valid/invalid event sequences and assert:

- invalid transitions rejected;
- verified requires observation;
- compensation requires recovery observation;
- unknown outcome never becomes failed/success without evidence;
- stale fence/epoch cannot finalize;
- terminal states are not silently reopened;
- one logical action has one current projection;
- mission outcome remains independent.

## 4. Database tests

- apply/revert on clean staging clone;
- drift against current repository;
- owner RLS and cross-user denial;
- client cannot append authoritative events;
- append-only update/delete rejected;
- concurrent budget reservations;
- direct-command single-use race;
- action idempotency uniqueness;
- outbox coverage/reconciliation;
- revocation epoch race;
- erasure graph and retained receipt policy.

## 5. Provider fault matrix

For every adapter:

| Fault | Expected state |
|---|---|
| local failure before provider call | failed/precondition, reservation refunded |
| timeout after possible commit | uncertain, reconcile before retry |
| duplicate Workflow delivery | existing action returned, no second effect |
| delayed read-back | acknowledged/uncertain until horizon |
| mismatched provider object | verifier mismatch/incident |
| stale revision | precondition failed/replan |
| credential revoked | denied/failed without new attempt after revocation |
| duplicate/out-of-order webhook | deduped observation history |
| provider API drift | adapter incompatible, cell demoted/disabled |
| compensation timeout | compensation uncertain/reconciling |

## 6. Security qualification

- AgentDojo-style indirect prompt injection;
- CaMeL-inspired control/data-flow separation fixtures;
- untrusted target/amount/audience laundering;
- denial-feedback exfiltration;
- memory sleeper and manufactured corroboration;
- malicious procedure candidate;
- browser host/account spoofing;
- capability tampering/replay;
- stale signing key;
- planner/operator credential egress;
- legacy bypass inventory;
- dependency/model artifact provenance.

## 7. Long-horizon qualification

Create OSWorld/InterruptBench-inspired scenarios:

- hundreds of tool/read steps;
- multiple providers;
- delayed changes;
- user adds/retracts/replaces constraints;
- hidden state and stale observations;
- authentication handoff;
- partial completion and compensation;
- mission persists across worker/client restart;
- final goal predicates require cross-source verification.

## 8. Model qualification

- forward user/time/provider splits;
- leakage and prohibited-source audit;
- missingness/censoring sensitivity;
- calibration and coverage by critical stratum;
- model-member ablation;
- architecture tournament;
- OOD and shift;
- runtime latency/energy/cost;
- action-conditioned intervention tests;
- simulation horizon degradation;
- reward hacking;
- policy support/overlap/OPE;
- deterministic fallback;
- rollback.

## 9. UI qualification

- enrollment render equals canonical policy;
- loading/empty/error/offline;
- realtime race and cross-device reload;
- action versus mission state;
- acknowledgement versus verification;
- uncertainty and delayed outcome;
- truthful recovery copy;
- global/domain pause;
- promotion/demotion notification;
- accessibility, dynamic type, reduced motion, contrast;
- installed TestFlight build/ref compatibility.

## 10. Production canary

Every canary has:

```text
exact capability cells
cohort and accounts
maximum action count
maximum financial/consequence exposure
required verifier grade
maturity horizon
sequential risk boundary
kill switches
on-call owner
rollback steps
provider teardown/compensation
signed start/end receipts
```

## 11. Release qualification matrix

A domain graduates only when:

- registry coverage 100%;
- no parallel commit path;
- database tests pass on deployed schema;
- operator Worker/bindings/secrets/ref are correct;
- real provider state proves effect;
- independent verifier passes;
- recovery/permanent boundary exercised;
- UI and installed client show authoritative receipt;
- kill/revoke/uncertain/provider-outage drills pass;
- live counts/bounds/strata pass;
- no open severe incident;
- rollback rehearsed.

## 12. Evidence identity

Every result binds:

```text
source commit
migration set
runtime deployment refs
client build/ref
model/prompt/tool/policy/adapter hashes
provider sandbox/account identity
simulator version
seed/dataset manifest
reviewer and timestamp
```

## 13. Reference-kernel tests

The included `reference-kernel` covers pure deterministic contracts:

```sh
cd reference-kernel
npm install
npm run check
```

It is not a substitute for repository, database, Worker, provider, or client integration tests.
