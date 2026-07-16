# Operations, SLOs, and Incident Runbook

## 1. Operational objectives

- prevent unauthorized or duplicate effects;
- preserve honest uncertainty;
- reconcile outcomes within domain SLO;
- keep kill switches and revocation effective;
- restore service without hiding historical state;
- provide evidence for every incident and recovery.

## 2. Suggested SLOs

SLOs are domain-specific. Initial operator-kernel examples:

| SLI | Target |
|---|---|
| authorization decision availability | 99.95% excluding planned maintenance |
| action event write durability | 99.99%; fail closed before new high-consequence attempt |
| duplicate accepted effects | zero invariant |
| wrong target/argument | zero invariant |
| calendar read-back reconciliation | 99% within 2 minutes; 99.9% within 15 minutes |
| unresolved low-consequence action | contract-specific upper bound |
| global kill propagation | <=60 seconds to all new attempt gates |
| domain kill propagation | <=60 seconds |
| receipt projection lag | p95 <=10 seconds; does not affect authority |

Do not turn zero-tolerance security invariants into error-budget allowances.

## 3. Alerts

- unauthorized/stale epoch attempt;
- wrong-target/verifier mismatch;
- duplicate provider identity or effect;
- budget/cap reservation anomaly;
- increasing `uncertain` backlog;
- stuck executing/provider-acknowledged/compensating;
- verifier availability/latency degradation;
- provider API schema/version drift;
- connector revocation failures;
- outbox/projection gaps;
- memory quarantine spike;
- risk/OOD coverage shift;
- model/policy performance sequential boundary;
- client/backend compatibility mismatch.

## 4. Kill switches

```text
global operator
provider
adapter/action family
capability cell/domain
user/mandate
model artifact/policy
browser/device lane
A5 subwave
```

A kill switch blocks new provider attempts at the server gate and operator claim. It does not erase already-started effects; those enter reconciliation/recovery.

## 5. Incident procedure

### Detect and contain

1. identify affected actions/capability cells/epochs;
2. engage narrowest effective kill switch, escalating to global as needed;
3. stop promotion and close evidence epoch;
4. preserve append-only events/logs/provider observations;
5. rotate/disable credentials or signing keys where indicated;
6. reconcile all in-flight/uncertain actions;
7. notify impacted users according to severity and policy.

### Diagnose

- GoalSpec/source message;
- Plan IR/provenance slice;
- authorization and risk decision;
- capability/epoch/fence;
- provider attempt/request identity;
- provider object and verification observations;
- model influence;
- deployment refs;
- parallel/legacy paths;
- user correction/regret.

### Recover

- compensate/mitigate where authorized and useful;
- correct provider/client state;
- deploy narrow fix;
- run regression and replay suite;
- execute staging and internal canary;
- issue compatibility/evidence reset decision;
- restore capability gradually.

### Close

- root cause and contributing factors;
- affected users/actions/effects;
- material harm;
- detection and containment times;
- failed/missing controls;
- corrective actions and owners;
- evidence invalidation/re-earning policy;
- user communication;
- updated threat/fault/model tests.

## 6. Provider outage

- stop new nonessential attempts;
- retain scheduled missions;
- mark source freshness/provider availability;
- reconcile existing unknown effects before retry;
- avoid swapping to a different provider/account without authority;
- expose delay and next check in UI;
- evaluate mission deadline and safe alternatives.

## 7. Reconciliation backlog

Prioritize:

```text
financial/public/destructive/physical
→ near point-of-no-return
→ user-visible communication
→ other external actions
→ private reversible actions
```

Apply provider rate limits, bounded exponential backoff, and maximum horizon. Escalate unresolved high-consequence actions to human review without pretending failure/success.

## 8. Rollback

Separate rollback planes:

- model artifact;
- prompt/tool registry;
- policy/reference monitor;
- adapter version;
- Worker code/config;
- client feature flag/build;
- migration/schema.

Schema rollback must not delete append-only evidence. Prefer forward-compatible additive migrations and projection rebuilds.

## 9. Routine drills

At least quarterly and before broad A4/A5 expansion:

- global/domain kill;
- revoke during execution;
- provider timeout after commit;
- duplicate Workflow delivery;
- stale signer/adapter;
- compensation failure;
- provider/verifier correlated defect;
- memory poisoning detection;
- client/backend incompatibility;
- database failover/outbox recovery;
- incident demotion/re-promotion.

## 10. Runbook artifacts

Store durable proof under the Aegis work record:

```text
incident timeline
query/run IDs
redacted receipts
provider evidence
kill/rollback logs
deploy refs
model/policy/adapter hashes
migration state
client build/ref
corrective test links
review sign-off
```
