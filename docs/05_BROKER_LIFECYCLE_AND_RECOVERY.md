# Broker, Event-Sourced Lifecycle, Idempotency, Verification, and Recovery

## 1. Logical action versus attempt

A **logical action** is the canonical intended external effect. It may have several fenced attempts due to pre-provider failures or reconciliation, but retries never count as distinct promotion exposures.

An **attempt** is one provider invocation. Every attempt has a monotonically increasing fence and is bound to all current epochs.

## 2. Append-only source of truth

Use:

```text
operator_actions                    logical identity and current projection
operator_action_events             append-only state facts
operator_attempts                  each provider invocation
operator_verification_observations independent evidence
operator_compensation_attempts     recovery effects
operator_action_dependencies       plan/saga edges
operator_mission_outcomes          user-goal result
operator_outbox                    retryable projections
```

`operator_actions.state` is a rebuildable projection. Original event history is never rewritten.

## 3. Action states

```text
planned
authorized
reserved
awaiting_authentication
risk_abstained
executing
provider_acknowledged
verified
permanent_verified
precondition_failed
uncertain
reconciling
failed
compensating
compensated
compensation_failed
expired
superseded
aborted
denied
```

Not all transitions are valid. The reducer and database writer enforce a signed transition registry.

## 4. Mission outcome states

```text
open
evaluating
goal_satisfied
partially_satisfied
goal_failed
goal_uncertain
superseded
cancelled
```

A verified effect does not automatically satisfy the mission.

## 5. Effectively-once contract

Do not promise universal distributed exactly-once behavior. Each adapter declares one idempotency class:

```text
provider_native_key
client_generated_object_id
compare_and_swap_version
read_before_retry
single_attempt_reconcile_only
non_idempotent_unattended_forbidden
```

### Retry rules

| State/result | Retry rule |
|---|---|
| failure proven before provider received request | new fenced attempt may run |
| provider explicitly rejected with no effect | retry under adapter policy |
| timeout before outcome known | reconcile first |
| provider acknowledgement but read-back delayed | wait/re-read, do not repeat |
| unknown non-idempotent effect | no unattended retry |
| stale provider object version | replan/re-authorize; do not overwrite blindly |
| duplicate Workflow delivery | returns existing logical action/attempt state |

## 6. Reservation and fencing

Before provider I/O:

1. validate current epochs and gate result;
2. atomically reserve budget/quota/grant use;
3. create/claim an attempt and issue fencing token;
4. commit the local transaction;
5. invoke provider outside database/DO locks;
6. append acknowledgement/failure/uncertainty;
7. verify/reconcile;
8. commit/refund/reconcile reservation according to observed effect.

A stale worker may append diagnostic evidence but cannot start another attempt or finalize state.

## 7. Execution capability

The signed capability binds:

```text
issuer and audience
owner user
mission/run/action/attempt
GoalSpec and Plan IR hashes
provenance root
intent epoch
mandate version and revocation epoch
policy hash
consent epoch
connector epoch
kill-switch epoch
canonical action hash
target identity hash
adapter ID/version
reservation ID/fencing token
idempotency-key hash
not-before and <=60-second expiry
single-use nonce
```

Prefer asymmetric signatures or platform-key-bound MACs with key rotation and `kid`. The broker verifies audience, expiry, nonce claim, current epochs, exact action row, and key status.

## 8. Independent verification grades

| Grade | Evidence | Autonomous use |
|---|---|---|
| V0 | none | prohibited |
| V1 | write response only | fixture/development |
| V2 | separate provider GET/list or independently refreshed system-of-record view | low-consequence A2/A3 where contract allows |
| V3 | separate read-back plus webhook/event/state transition | preferred A3/A4 and many A5 |
| V4 | cross-source corroboration, device attestation, settlement, or independent outcome | highest consequence |

Verification records source identity, credential scope, observed object revision, time, freshness, predicate results, and source precedence. Learned judges may support extraction but cannot be the sole A3–A5 verifier.

## 9. Recovery semantics

```text
true_reversal
time_limited_cancellation
restoration
refund_initiated
refund_settled
correction
mitigation
partial_reversal
irreversible
```

The UI uses the registered term. Examples:

- queued email cancellation can be a reversal;
- sent email requires correction;
- deleting a public post is mitigation because propagation may persist;
- refund initiation is not settlement;
- restoring a file does not reverse prior disclosure.

## 10. Sagas

A durable saga owns:

- canonical Plan IR version;
- dependency order;
- precondition checks;
- per-node reauthorization;
- intent interruption;
- partial-completion receipts;
- bounded replan;
- authentication pause/resume;
- reverse-order compensation;
- explicit point-of-no-return boundary;
- mission-level evaluation.

A non-compensable step begins only after all required reversible prerequisites are verified and the current goal/authority/risk remains valid.

## 11. Reconciliation

Reconciliation workers select:

- `executing` beyond attempt timeout;
- `provider_acknowledged` beyond expected propagation delay;
- `uncertain` at scheduled read-back time;
- `compensating` beyond recovery SLO;
- open mission outcomes at maturity horizon.

They query the provider before considering re-execution. Reconciliation itself is idempotent and records each observation.

## 12. Provider and mission predicates

An adapter defines effect predicates such as:

```text
event exists by exact ID
calendar ID matches
start/end/timezone match
attendee set and notification policy match
provider revision is current
```

The mission defines goal predicates such as:

```text
focus block exists without conflict
message was delivered before deadline
ride arrived before appointment threshold
order fulfilled without prohibited substitution
project blocker is closed
```

These results remain distinct in data, UI, metrics, and training labels.
