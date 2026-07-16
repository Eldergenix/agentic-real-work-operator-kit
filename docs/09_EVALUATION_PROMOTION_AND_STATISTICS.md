# Evaluation, Promotion, and Statistical Design

## 1. Evaluation units

Keep separate:

- logical action;
- provider attempt;
- provider effect;
- verification observation;
- mission opportunity;
- autonomous decision opportunity;
- support/abstention decision;
- user correction/regret outcome;
- policy/model version epoch.

Retries and duplicate deliveries are not new independent examples.

## 2. Denominators

Every metric declares its eligible denominator. Examples:

```text
verified effect rate = independently verified effects / mature logical actions attempted
false-act rate = autonomous actions judged unnecessary or harmful / mature autonomous action opportunities
missed-act rate = eligible opportunities where action would have helped but Operator Kit remained silent / mature eligible opportunities
support rate = support requests / eligible decisions
mission success = satisfied terminal goals / mature missions
```

Do not report autonomous completion by mixing direct commands or exact approvals with standing-mandate decisions.

## 3. Four promotion layers

### Layer 1 — hard invariants

Zero-tolerance, immediate demotion:

- unauthorized attempt/effect;
- wrong protected target/argument;
- cap/purpose/consent violation;
- credential exposure;
- duplicate accepted effect outside contract;
- verifier false positive;
- prohibited category;
- public audience/destructive target mismatch;
- material loss outside policy;
- memory authority elevation.

### Layer 2 — adapter/effect reliability

Stratify by:

```text
provider × adapter version × action contract × verifier grade × consequence band × amount band
```

Outcomes:

- verified completion;
- unresolved/uncertain;
- provider/read-back mismatch;
- duplicate prevention;
- reconciliation;
- compensation/mitigation;
- maturity latency.

### Layer 3 — autonomous decision value

Outcomes:

- verified goal utility;
- false intervention;
- missed beneficial intervention;
- wrong timing;
- regret/correction;
- interruption burden;
- missed/unnecessary support;
- abstention coverage.

### Layer 4 — current action risk

Every action passes current state freshness, OOD/support, verifier availability, and action-conditional expected/tail-loss limits.

## 4. Sequential monitoring

Because promotion is checked repeatedly and observations cluster, use:

- one-sided anytime-valid confidence sequences/e-processes where assumptions are satisfied;
- or predeclared checkpoint schedules with alpha spending;
- cluster-aware resampling/robust variance by user/provider/target/time;
- capped per-user contribution;
- signed stopping, maturity, censoring, and compatibility rules.

Do not reselect metrics or thresholds after observing a favored model.

## 5. Personal evidence

A single Beta-Binomial rate is insufficient for delayed contextual outcomes. Use a transparent hierarchical dynamic model with:

- user random effect;
- provider/action effect;
- target/consequence/amount effect;
- context regime;
- time decay/change-point epoch;
- delayed outcome survival/censoring;
- exact policy and selection probabilities.

A Beta-Binomial model may remain a conservative baseline for homogeneous adapter success.

## 6. Off-policy evaluation

Log every prospective decision opportunity:

```text
eligible candidate set
candidate validity/capability cells
probability of each candidate
selected candidate
abstention/support probability
model/policy version
context regime/support score
current risk budget
mature outcome
```

Requirements:

- known propensities;
- minimum support/overlap;
- effective sample size;
- maximum importance-weight cap;
- direct-method diagnostics;
- inverse propensity and doubly robust estimates where assumptions hold;
- cluster-aware anytime-valid intervals;
- no narrow claim in unsupported regions.

Shadow/OPE can qualify a bounded canary but cannot complete a product wave.

## 7. Model metrics

### Prediction

- negative log likelihood;
- Brier score;
- calibration error and reliability curves;
- time-to-event concordance/calibration;
- interval/coverage by horizon;
- missingness/censoring sensitivity;
- critical-stratum worst case.

### Simulation

- one-step and rollout fidelity;
- intervention sensitivity;
- constraint violations;
- error growth by horizon;
- closed-loop decision value;
- certified horizon coverage.

### Risk/abstention

- risk–coverage frontier;
- upper loss bound calibration;
- OOD detection;
- false-safe rate;
- unnecessary abstention;
- missed support;
- tail-loss coverage.

### Policy

- verified goal utility at fixed risk;
- false/missed action;
- interruption burden;
- recovery cost;
- expected and CVaR loss;
- support overlap;
- rollback performance.

## 8. Promotion compatibility

Evidence binds to:

```text
action contract
adapter/provider API
reference monitor/policy
verifier
model/policy
connector
consent
canonicalization
runtime/deployment
```

Evidence transfers only through an explicit compatibility receipt describing unchanged semantics and validation. A material change starts a new epoch.

## 9. Maturity horizons

Examples:

- calendar private event: immediate read-back plus configured conflict horizon;
- attendee event: provider read-back plus notification/response window;
- email: sent object, bounce/delivery horizon, optional reply goal;
- commerce: order/capture/settlement/refund/chargeback horizons;
- public/destructive: declared permanence/propagation window;
- user regret: action-specific correction window.

Right censoring remains explicit. Immature examples do not silently count as success.

## 10. Experiment safety

- randomized only inside current mandates/capability cells;
- low-risk comparable candidates only;
- hard gate and risk guardian always active;
- predeclared exposure/risk budget;
- global/domain/capability kill switches;
- no experimentation on credentials, prohibited categories, clinical decisions, unsupported public/destructive actions, or unverified providers;
- signed canary manifest and rollback rehearsal.

## 11. Product metrics

Primary operational metric:

> Verified Work Completions per active Operator per week.

Primary decision-quality metric:

> Verified Goal Utility per Eligible Operator Opportunity at a Fixed Risk Budget.

Supporting metrics:

- verified effect and mission-satisfaction rates;
- autonomous coverage at fixed risk;
- false/missed action;
- missed/unnecessary support;
- wrong-target/argument;
- unresolved exposure time;
- compensation/mitigation effectiveness;
- value per interruption;
- tail loss by capability cell;
- calibration by horizon;
- procedure reuse success;
- memory contradiction/poisoning rate;
- permanent-effect complaint rate;
- retention lift reported causally only after a valid experiment.
