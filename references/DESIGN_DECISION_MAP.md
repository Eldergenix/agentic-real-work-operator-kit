# Research-to-design decision map

This file makes the research influence reviewable without turning papers into authority.

| Operator Kit design decision | Primary inputs | Concrete package artifacts | Required local evidence |
|---|---|---|---|
| HCOM capability levels rather than one monolithic world model | R01, R02 | `docs/08_WORLD_MODEL_AND_ML_ROADMAP.md`, `src/lib/operator/world-model.ts`, `ml/model-tournament.yaml` | head/domain/horizon calibration, intervention fidelity, closed-loop lift |
| Procedural preplay and mismatch memory | R03, R04 | procedure graph specification, mismatch ledger, model influence receipts | verified procedure transitions, reliability bounds, poisoning tests |
| Model architecture tournament | R08–R13 | `ml/model-tournament.yaml`, model release checklist | forward user/time splits, scaling curves, ablation, runtime/energy/cost |
| Frozen GoalSpec and intent epochs | R16, R23, R30 | `goal-spec.ts`, `intent-diff.ts`, `plan-ir.ts` | ambiguous target, revision, retraction and stale-epoch tests |
| Causal provenance reference monitor | R14, R15, R17 | `provenance.ts`, authorization gate, protected-field rules | prompt injection, transitive data-flow and denial-laundering tests |
| Certified-prefix execution | R18, R19 | Plan IR, trace specifications, saga/replanning design | formal feasibility check, fixed-risk boundary, rollback |
| Origin-bound memory authority | R20–R22 | `memory-authority.ts`, `memory-ledger.ts`, memory poisoning runbook | sleeper, compaction, trusted-tool echo and corroboration tests |
| Action-conditional risk and support | R23–R27 | `risk-guardian.ts`, `support-controller.ts`, promotion manifests | risk-coverage frontier, missed-support and unnecessary-support bounds |
| Long-horizon qualification | R28–R31 | test strategy, provider simulator and canary runbooks | hundreds-of-step, dynamic state, interruption and injection suites |
| Selective replay as engineering prior | R32, R33 | procedure preplay and mismatch/uncertainty episode design | operator-local utility and latency evidence; no biological-equivalence claim |
