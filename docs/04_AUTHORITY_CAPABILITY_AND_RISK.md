# Authority, Capability Lattice, Earned Autonomy, and Runtime Risk

## 1. Authorization sources

Every committing logical action binds to exactly one current source:

1. **`direct_command`** — server-attested recent exact instruction, single use, run-bound, maximum 15-minute lifetime.
2. **`recorded_approval`** — exact server-recorded canonical action approval, single use and version-bound.
3. **`operator_mandate`** — current mandate version plus an exact promoted capability cell.

The source does not bypass protected-field provenance, budget reservation, policy, current epochs, risk, idempotency, verification, or receipt requirements.

## 2. Capability lattice

The actual permission primitive is an exact cell:

```text
user
× mandate version
× domain
× action family
× provider
× account
× target class/policy
× purpose
× consequence vector/band
× amount band
× audience
× time policy
× reversibility
× minimum verifier grade
× allowed idempotency classes
× evidence epoch
```

The A0–A5 tier is a user-facing summary of one or more cells. A product tier alone cannot authorize an action.

## 3. Product tiers

| Tier | Behavior | Maximum scope |
|---|---|---|
| A0 Observe | prediction/comparison only | no committing action |
| A1 Directed | exact current command or approval | one exact action |
| A2 Reversible private operator | unattended low-propagation action with proven full/time-bounded reversal | exact enrolled cells |
| A3 Bounded external operator | communications or connected-system changes | exact enrolled cells and audiences |
| A4 Sensitive operator | consented sensitive/private workflows | explicit category/purpose inclusion |
| A5 Consequential operator | financial, public, destructive, recurring, legal-clerical, hard-to-reverse | explicit category and consequence-band inclusion |

## 4. Maximum-autonomy envelope

Enrollment defines the maximum cells that may ever be promoted without a new authority grant. Promotion cannot:

- add a provider/account/target;
- raise a budget or amount band;
- broaden an audience;
- add a purpose or context source;
- enable A4/A5 category not explicitly included;
- change reversibility requirements;
- reduce minimum verifier grade;
- permit a weaker idempotency class.

## 5. Deterministic gate algorithm

```text
1. Load logical action, GoalSpec, Plan IR node, provenance slice, authorization source.
2. Verify signatures, hashes, nonce, expiry, and single-use state.
3. Verify current intent, mandate, consent, connector, policy, registry, and kill-switch epochs.
4. Verify action is registered and adapter version is eligible.
5. Verify all protected fields meet origin/integrity/purpose rules.
6. Intersect exact action with mandate and capability cell.
7. Verify consequence, amount, audience, time, target, account, and purpose limits.
8. Verify budget/rate reservation can be made atomically.
9. Verify required idempotency and verifier strategies are available.
10. Verify required trace state and preconditions.
11. Return allow with signed execution capability, or structured denial.
```

The gate is deterministic and reproducible from authoritative inputs. Model confidence contributes zero positive authority.

## 6. Runtime risk guardian

After deterministic authorization, a veto-only controller evaluates the current exact action:

```text
execute iff
  hard_gate == allow
  and upper_bound(action_loss | current_belief) <= cell_risk_budget
  and OOD/support score passes
  and observation freshness passes
  and required verifier remains available
```

Risk dimensions include:

- financial expected/tail loss;
- privacy and sensitive-data exposure;
- public reach and propagation;
- legal finality;
- health or physical impact;
- account/security impact;
- reversibility and time-to-reverse;
- user interruption/regret;
- provider uncertainty and stale state.

### Risk outcomes

```text
execute
refresh_authoritative_state
wait_for_propagation
invoke_stronger_verifier
ask_missing_information
request_authentication
request_new_authority
abstain_and_abort
compensate_or_mitigate
```

## 7. Evidence gates

Promotion is conjunctive:

1. **Adapter/effect reliability** — authorization, dedupe, execution, verification, reconciliation, and recovery.
2. **Autonomous decision value** — correct action, target, timing, silence/support, and goal utility.
3. **Current runtime risk** — every action passes current action-level constraints.
4. **Hard invariants** — zero-tolerance failures cannot be averaged away.

Direct commands and approvals can build adapter evidence but do not prove that Operator Kit should independently decide to act.

## 8. Promotion evaluation

Operational exposure floors are minimum coverage, not statistical proof. Use versioned one-sided anytime-valid bounds or predeclared checkpoint/alpha-spending designs with clustering and capped per-user contribution.

Recommended initial policy envelope:

| Promotion | Operational floor | Reliability target | Decision/risk requirement |
|---|---:|---:|---|
| A2 | 100 provider test-account round trips per exact adapter contract | zero scope/cap/replay failures; contract-specific lower bound | connector/verifier/compensator self-test; private low-propagation only |
| A3 | 2,000 mature actions / 100 users across critical strata | lower bound near 99.5%, unresolved upper bound <=1% | false-act/regret bounds, support/OOD coverage, live canary |
| A4 | 3,000 mature actions / 150 users across purpose strata | lower bound near 99.7% | zero privacy/consent/recipient/erasure incidents; explicit envelope |
| A5 | 5,000 mature actions / 200 users across consequence and amount strata | lower bound near 99.9% where feasible | exact tail-loss budget, zero cap/wrong-target/prohibited/material-loss incidents; explicit envelope |

These values are starting policy targets, not universal laws. The action registry must define the denominator, clustering, maturity horizon, verifier grade, amount/consequence strata, expected/tail loss, and acceptable risk for each capability.

## 9. Demotion

Immediate on:

- mandate/connector revocation;
- consent withdrawal;
- stale/incompatible policy or adapter version;
- severe invariant incident;
- verifier false positive;
- wrong target/audience/amount;
- duplicate accepted effect;
- privacy, purpose, cap, prohibited-category, or material-loss violation.

Rate/shift-based demotion occurs at the signed sequential boundary. Demotion closes the evidence epoch. Re-promotion requires incident closure, a compatibility decision, and the configured clean-execution/time window.

## 10. Hard invariants

The following never become averageable metrics:

- unauthorized provider attempt;
- wrong protected target/argument;
- stale intent/mandate/consent epoch attempt;
- credential exposure to planner/model/log/ledger;
- duplicate accepted effect outside declared strategy;
- verifier false positive used to claim completion;
- prohibited commerce;
- unsupported clinical judgment;
- public audience or destructive target mismatch;
- cap violation;
- authority elevation from untrusted/model-derived memory.
