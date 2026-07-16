# Human Context and Planner Model Release Runbook

## Non-authority rule

A model-serving receipt permits an artifact to influence candidate generation, timing, ranking, risk veto, or abstention only for certified heads, domains, strata and horizons. It supplies zero positive action authority.

## Release stages

1. `dataset_ready`
2. `baseline_promoted`
3. `l1_predictor_promoted`
4. `l2_simulator_promoted`
5. `procedure_model_promoted`
6. `rank_only_canary`
7. `bandit_canary`
8. `mpc_canary`
9. `dreamer_challenger_decision`

## Dataset gate

- consent/purpose manifest;
- immutable lineage and erasure graph;
- forward user/time separation;
- action-conditioned transition counts;
- mature outcome and censoring report;
- provider/action/target/consequence coverage;
- effective sample size after clustering;
- support-overlap diagnostics;
- prohibited-source leakage = zero;
- privacy, retention and regional controls;
- dataset hash and build provenance.

## Model tournament

Compare deterministic, tree, survival, Hawkes/TPP, BOCPD, Neural CDE/CRU, event-sequence, Transformer, Mamba, Gated DeltaNet, Kimi-style hybrid, graph-temporal, procedural and memory challengers as relevant to each head.

No architecture advances by name. The champion is selected per domain/head on:

- proper scoring rules and calibration;
- intervention sensitivity;
- closed-loop utility at fixed risk;
- OOD and missingness behavior;
- critical-stratum performance;
- latency, energy, cost and memory;
- privacy and erasure compatibility;
- deterministic fallback and rollback.

## Learned control gates

### Rank-only

- finite candidates already inside deterministic feasibility;
- complete model-influence receipts;
- no authority violations;
- canary improvement at fixed risk.

### Contextual bandit

- known selection probabilities;
- adequate support overlap and ESS;
- bounded/capped weights;
- doubly robust and anytime-valid analysis where assumptions hold;
- randomized only among comparable, low-risk eligible candidates.

### Receding-horizon MPC

- typed horizon;
- certified reliable transition scope;
- execute one node, verify, update belief, replan;
- no open-loop provider sequence.

### Dreamer-style challenger

- mature action-conditioned data;
- stable reward and tail-loss definitions;
- reward-hacking tests;
- OOD abstention;
- marginal fixed-risk utility over champion MPC;
- same deterministic gate/broker/verifier path.

## Release manifest

```yaml
artifact_id:
artifact_hash:
training_code_ref:
dataset_manifest_hash:
feature_contract_hash:
policy_hash:
certified_domains: []
certified_heads: []
certified_horizons: []
calibration_epoch:
privacy_receipt:
runtime_budget:
rollback_artifact:
container_or_environment_digest:
build_provenance:
reviewers: []
decision:
```

## Rollback

Model rollback must not affect deterministic authority or prevent ongoing reconciliation. On shift, calibration breach, severe incident, missing receipt, artifact mismatch, or unsupported input, fall back to the signed deterministic/champion planner.
