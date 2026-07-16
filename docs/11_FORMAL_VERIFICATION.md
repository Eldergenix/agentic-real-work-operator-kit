# Formal Verification and Runtime Trace Enforcement

## 1. Scope

Formal methods are used for finite, critical coordination and policy invariants. They do not prove the LLM is semantically correct, the provider will behave correctly, or the complete open-world product is safe.

Human review remains mandatory. Generated TLA+ or temporal policies must not be accepted solely because a model produced syntactically valid text.

## 2. Specifications in this package

```text
specs/tla/ActionLifecycle.tla
specs/tla/BudgetReservation.tla
specs/tla/RevocationEpoch.tla
specs/tla/IntentInterruption.tla
```

They model:

- lifecycle transitions and verification requirements;
- reservation/commit/refund bounds;
- stale epoch and fencing behavior;
- interruption/supersession of unstarted plan nodes.

## 3. Required invariants

### Authority and execution

1. No provider attempt starts without current authorization and reservation.
2. No stale intent/mandate/consent/connector/kill-switch epoch starts an attempt.
3. A capability nonce is consumed at most once.
4. A denied action cannot become allowed through a legacy path.

### Idempotency and lifecycle

5. One logical action has at most one accepted effect under the modeled adapter class.
6. `verified` requires a qualifying independent observation.
7. `compensated` requires a verified recovery effect.
8. `failed` is used only when no effect is established.
9. Unknown outcome remains `uncertain`/`reconciling`.
10. A stale fence cannot finalize current state.

### Budget

11. `reserved + committed <= cap` for every bucket.
12. A reservation is committed/refunded/reconciling exactly once.
13. Concurrent attempts cannot spend the same reservation.

### Saga and intent

14. A non-compensable step cannot start before required reversible predecessors are verified.
15. A superseded intent cannot start a conflicting unstarted node.
16. Completed conflicting nodes trigger explicit recovery/mitigation planning.
17. Mission completion cannot precede mature terminal predicates.

### Projections

18. UI/audit/AHCE projections cannot create or change action authority.
19. Every projection references an append-only authoritative event.
20. Projection failure cannot erase or transform authoritative state.

## 4. Runtime temporal policies

Compile selected finite-trace policies into the reference monitor/runtime guard:

```text
G(provider_attempt_started -> previously(current_authorized AND reservation_current))
G(provider_attempt_started -> intent_epoch == current_intent_epoch)
G(provider_attempt_started -> capability_nonce_unused)
G(verified -> previously(qualifying_verification_observation))
G(non_compensable_started -> all_required_reversible_predecessors_verified)
G(revoked -> G(not new_provider_attempt_started))
```

The implementation may use explicit state-machine checks rather than a generic temporal-logic runtime. The policy source and generated checks must remain versioned and testable.

## 5. Certified prefix execution

For long plans:

1. planner proposes the full typed DAG;
2. deterministic and risk systems certify the longest safe prefix;
3. execute one node or a tightly bounded prefix;
4. independently observe the world;
5. update belief and intent state;
6. re-certify the next prefix.

This prevents open-loop execution of a speculative long plan while avoiding expensive full replanning after every trivial read.

## 6. Model checking workflow

```sh
cd specs/tla
../../scripts/model-check.sh
```

The script accepts `TLA2TOOLS_JAR` or downloads a reviewable release to a local cache. CI should pin the jar checksum/version rather than relying on an unpinned latest download.

## 7. Property and concurrency testing

Formal models are complemented by:

- randomized lifecycle event sequences;
- database concurrency tests against real Postgres;
- Workflow duplicate/redelivery tests;
- Durable Object claim/fence tests;
- provider fault simulation;
- kill-switch/revocation races;
- semantic GoalSpec/Plan IR differential tests.

## 8. Proof records

Each model-check run records:

```text
spec hash
config hash
TLA+/TLC version
constants/model bounds
states generated/distinct
invariants checked
result/counterexample
reviewer
linked implementation tests
```

A bounded model check is evidence within its model bounds, not universal proof.
