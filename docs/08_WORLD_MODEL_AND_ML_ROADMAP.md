# Human Context Operating Model and ML Roadmap

## 1. Design principle

Operator Kit should not train one monolithic “world model” and expect it to store exact facts, infer human state, predict providers, plan, assess risk, and execute. The Human Context Operating Model (HCOM) is a factorized system in which learned components are individually certified for their transitions, heads, horizons, support regions, calibration, privacy, latency, and decision value.

## 2. HCOM components

| Component | Output | Primary model candidates |
|---|---|---|
| Authoritative state | exact current facts/objects/mandates | deterministic event graph and provider reads |
| Observation model | latency, missingness, source reliability | survival/empirical models, rules |
| Belief estimator | hidden state distribution | boosted trees, Bayesian filters, CRU/Neural CDE, recurrent hybrids |
| Temporal event model | next event/type/time | Hawkes, marked TPP, EventFlow-like model |
| Change detector | regime/change probability | BOCPD, anomaly models |
| Procedure graph | workflow stages/transitions/failures | symbolic graph + LLM-assisted candidate induction |
| Provider dynamics | action-conditioned state transition | deterministic state machines, supervised transition models |
| Human response | acceptance, regret, interruption | hierarchical/calibrated classifiers/survival models |
| Goal outcome | terminal mission utility/probability | multitask outcome models |
| Risk/OOD | action loss upper bound/support | conformal/ensemble/OOD methods |
| Candidate ranker | ordered finite valid plans | tree/neural ranker, contextual bandit |
| Simulator/MPC | bounded future distributions | certified action-conditioned latent models |

## 3. World-model capability certification

### L0 Registered dynamics

- typed state machine/procedure;
- preconditions/postconditions;
- provider revision rules;
- verifier/recovery paths;
- no learned rollout claim.

### L1 Predictor

- calibrated one-step/next-event distribution;
- forward user/time holdout;
- critical-stratum metrics;
- OOD/abstention;
- no claim of decision-usable multi-step simulation.

### L2 Simulator

- action-conditioned rollout;
- intervention sensitivity;
- constraint consistency;
- open-loop degradation curve;
- closed-loop utility improvement;
- certified horizon and support region.

### L3 Evolver

- prediction-observation mismatch creates external candidate knowledge;
- poisoning-resistant admission;
- selective validated update improves held-out/online prediction;
- live global weights remain frozen;
- no authority elevation.

Certification is per transition family and head, not global.

## 4. Dataset contract

Each dataset manifest includes:

```text
dataset_id/version/hash
consent policy and epoch filters
source lineage and prohibited-source audit
user/time/provider/action split policy
observation/missingness model
candidate sets and propensities
action-conditioned transitions
verification grade
mission outcomes and maturity horizon
censoring rules
corrections/regret/support labels
privacy transformations
erasure dependencies
```

## 5. Data-readiness report

Raw event counts are insufficient. Report:

- unique users and active days;
- action-conditioned transitions;
- mature outcomes;
- effective sample size after clustering;
- provider/action/target/consequence/amount coverage;
- support overlap and maximum importance weights;
- missingness/censoring;
- class/rare-event balance;
- scaling curves;
- leakage and poisoning results;
- privacy and retention budget.

The original `5,000 events / 50 users` threshold is an exporter/baseline-readiness floor, not evidence that a custom neural world model or offline-RL policy is production-ready.

## 6. Pretraining objectives

Potential self-supervised tasks:

- masked value/channel reconstruction;
- time-gap prediction;
- next-event contrast;
- order corruption detection;
- cross-window consistency;
- source/missingness reconstruction;
- action-conditioned next observation;
- procedure-stage prediction;
- prediction-error versus prediction-uncertainty event segmentation.

Pretraining excludes sources lacking training consent.

## 7. Supervised heads

- next channel/type/mark;
- time-to-event and competing transition risks;
- change-point probability;
- interruptibility;
- action acceptance;
- correction/regret;
- verification mismatch;
- unresolved-outcome risk;
- mission goal satisfaction;
- action-conditional loss and tail risk;
- abstain/support selection.

Do not collapse false intervention, regret, wrong target, missed support, and missed beneficial action into one label.

## 8. Architecture tournament

Run per domain/head:

```text
deterministic rhythm and provider logic
Hawkes / marked temporal point process
BOCPD
boosted trees
survival / competing risks
Neural CDE / CRU
EventFlow-like joint event modeling
Transformer
Mamba-3
Gated DeltaNet-2
Kimi/KDA-style recurrent-attention hybrid
Titans/ATLAS/TNT-style memory challenger
graph-temporal model
JEPA/next-embedding action-conditioned model
procedure graph + LLM
```

No architecture is promoted by name. A simpler model remains champion unless a challenger produces a signed marginal improvement at fixed risk, calibration, privacy, latency, energy, cost, and rollback parity.

## 9. Ensemble policy

Ensemble members should add distinct decision value, not merely low pairwise error correlation. Evaluate:

- risk–coverage frontier;
- utility at fixed risk;
- incremental member value;
- oracle ensemble gap;
- calibration by critical stratum;
- latency/energy/cost;
- missed-support rate;
- shift robustness.

## 10. Personalization

Use bounded, interpretable adaptation first:

- hierarchical Bayesian posteriors;
- personal calibration offsets;
- user-specific rhythm/change-point parameters;
- local preference/ranking weights;
- retrieval of verified personal episodes/procedures.

Any personal neural adapter is trained offline or on-device under explicit consent, versioned, erasable, and bounded. It does not store authority-sensitive exact facts.

## 11. Procedural world model

Represent:

```text
procedure
→ stage
→ preconditions
→ action transition
→ expected observations
→ failure branches
→ verifier
→ compensation
→ reliability distribution
```

Procedure candidates can be induced from demonstrations or trajectories, but they graduate only after static checks, simulator tests, sandbox proof, exact directed real execution, and outcome evidence.

## 12. Selective foresight

A model prediction may influence planning only when:

- artifact and competency receipt are current;
- transition family/head/horizon is certified;
- current state is inside support;
- uncertainty and shift are below threshold;
- no protected field authority is inferred;
- deterministic fallback exists;
- a model influence receipt is written.

## 13. Learned control stages

### Stage 0 — deterministic champion

Rules, schedules, provider state machines, procedure graph, conflict checks, and simple utility ranking perform real work.

### Stage 1 — supervised prediction

Models predict transitions/outcomes/risk but do not select actions.

### Stage 2 — procedural preplay

Retrieve and evaluate verified procedures.

### Stage 3 — finite candidate ranker

Rank only already valid candidate plans. The reference monitor still checks the selected exact action.

### Stage 4 — safe contextual bandit

Randomize only among comparable, already authorized, low-consequence candidates with exact known propensities and support.

### Stage 5 — constrained receding-horizon MPC

```text
simulate short typed horizon
→ certify one node/prefix
→ execute one effect
→ independently observe
→ update belief
→ replan
```

### Stage 6 — Dreamer-style challenger

Only after sufficient action-conditioned trajectories, mature outcomes, stable rewards, overlap, digital/provider twins, OOD detection, recovery data, and reward-hacking tests. Dreamer emits Plan IR and remains subordinate to the same gate, risk, broker, and verifier.

Simulation contributes zero action authority, live promotion exposure, or verified completions.

## 14. Serving architecture

- immutable artifact registry;
- signed artifact/model card/competency receipt;
- feature and projection schema version;
- deterministic fallback;
- per-domain routing;
- shadow and canary flags;
- request-level model influence receipt;
- latency/energy/cost budget;
- drift and support monitoring;
- instant artifact rollback independent of broker/policy rollback.

## 15. Model release evidence

See [`checklists/model-release.md`](../checklists/model-release.md) and [`docs/09_EVALUATION_PROMOTION_AND_STATISTICS.md`](09_EVALUATION_PROMOTION_AND_STATISTICS.md).
