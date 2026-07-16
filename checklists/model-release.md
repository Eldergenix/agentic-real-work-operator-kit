# Model and Policy Release Checklist

## Data

- [ ] Dataset manifest/hash is immutable.
- [ ] Training consent and source-purpose filters pass.
- [ ] Forward user/time/provider split is enforced.
- [ ] Action-conditioned transitions and mature outcomes are sufficient.
- [ ] ESS, clustering, support, missingness, censoring, rare-event coverage, and scaling curves are reported.
- [ ] Prohibited-source leakage and memory-poisoning tests pass.
- [ ] Erasure dependencies are registered.

## Model capability

- [ ] Exact domain/head/transition/horizon claim is predeclared.
- [ ] Strongest deterministic/statistical champion is documented.
- [ ] Calibration and worst-stratum metrics pass.
- [ ] OOD/shift and abstention behavior pass.
- [ ] Runtime latency, memory, energy, and cost pass.
- [ ] Ablation proves marginal value.
- [ ] Simulation claim includes intervention, constraint, rollout, and closed-loop tests.

## Security and governance

- [ ] Artifact, code, prompt, projection schema, and dependency hashes are signed.
- [ ] Global live weights remain frozen.
- [ ] Model output provides zero authority.
- [ ] Protected fields cannot be model-filled.
- [ ] Model influence receipt is emitted.
- [ ] Deterministic fallback and instant rollback pass.

## Policy/OPE

- [ ] Complete candidate sets and propensities are logged.
- [ ] Support overlap and max importance weight pass.
- [ ] ESS and direct/IPW/DR diagnostics are reported.
- [ ] Anytime-valid/predeclared sequential design is signed.
- [ ] Fixed-risk verified goal utility improves or non-inferiority gate passes.
- [ ] Tail loss, false act, missed act, missed support, and recovery remain within capability limits.

## Live canary

- [ ] Exact eligible capability cells and risk budget.
- [ ] Maximum exposure/count and maturity horizon.
- [ ] Hard gate and risk guardian always active.
- [ ] Kill switch and rollback rehearsed.
- [ ] No severe invariant incident.
- [ ] Signed go/no-go receipt retained even when challenger is rejected.
