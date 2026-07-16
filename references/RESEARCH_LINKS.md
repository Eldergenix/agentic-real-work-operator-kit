# Research links and implementation mapping

**Verification date:** 2026-07-16  
**Policy:** 2026 papers are generally preprints. They are design and evaluation inputs, not production guarantees. No paper, checkpoint, simulation, or benchmark creates action authority or counts as a verified Operator Kit work completion.

The package uses primary papers or official publication pages wherever possible. Every research-derived mechanism must pass operator-local threat, privacy, calibration, provider, runtime, energy, cost, and user-value evaluation.

## 1. Agentic world models and procedural dynamics

| ID | Publication | Status | Direct link | Operator Kit implementation use | Adoption constraint |
|---|---|---|---|---|---|
| R01 | *Agentic World Modeling: Foundations, Capabilities, Laws, and Beyond* (2026) | preprint | https://arxiv.org/abs/2604.22748 | HCOM L1 predictor/L2 simulator/L3 evolver taxonomy; digital/social law regimes; decision-centric evidence. | Adopt taxonomy and evaluation obligations, not reported results as Operator Kit proof. |
| R02 | *How Should World Models Be Evaluated? A Decision-Making-Centric Position* (2026) | preprint | https://arxiv.org/abs/2606.15032 | Counterfactual action fidelity, closed-loop validity, policy ranking, model exploitability, uncertainty calibration. | Use to certify model capabilities by use case and horizon. |
| R03 | *ProPlay: Procedural World Models for Self-Evolving LLM Agents* (2026) | preprint + code | https://arxiv.org/abs/2606.12780 | Procedure graph, procedure-level preplay, transition reliability and feedback-driven refinement. | Adopt as a challenger for verified procedural memory; require operator-local reliability evidence. |
| R04 | *Self-Evolving World Models for LLM Agent Planning* (2026) | preprint | https://arxiv.org/abs/2606.30639 | External episodic/semantic mismatch memory and selective foresight while live parameters remain frozen. | Use as design input for mismatch ledger and selective model influence. |
| R05 | *Policy and World Modeling Co-Training for Language Agents* (2026) | preprint | https://arxiv.org/abs/2606.02388 | Action/next-observation supervision from real interaction. | Use only after governed, mature action-conditioned outcomes exist. |
| R06 | *Training Agents Inside of Scalable World Models* (2025) | preprint (Dreamer 4) | https://arxiv.org/abs/2509.24527 | Imagination-based control training in a scalable learned world model. | Late challenger only; Operator Kit service workflows are sparse, delayed and policy constrained. |
| R07 | *DreamerV3: Mastering Diverse Domains through World Models* (2023) | preprint + code | https://arxiv.org/abs/2301.04104 | Mature open implementation patterns for latent world-model control. | Reference implementation only; not evidence that Dreamer is appropriate for Operator Kit. |

## 2. Sequence, continuous-time and event architectures

| ID | Publication | Status | Direct link | Operator Kit implementation use | Adoption constraint |
|---|---|---|---|---|---|
| R08 | *Mamba-3: Improved Sequence Modeling using State Space Principles* (2026) | preprint + code | https://arxiv.org/abs/2603.15569 | Efficient recurrent long-history representation and state tracking. | Enter the per-head model tournament; never predetermined as the winner. |
| R09 | *Gated DeltaNet-2: Decoupling Erase and Write in Linear Attention* (2026) | preprint + code | https://arxiv.org/abs/2605.22791 | Recurrent linear-attention challenger with separate erase/write control. | Benchmark against Mamba, attention hybrids and temporal baselines on Operator Kit data. |
| R10 | *Kimi Linear: An Expressive, Efficient Attention Architecture* (2025) | preprint + code | https://arxiv.org/abs/2510.26692 | KDA and hybrid linear-attention architecture for long contexts. | Use as an efficiency/quality challenger, not a universal world-model prescription. |
| R11 | *Neural Controlled Differential Equations for Irregular Time Series* (2020) | peer-reviewed/preprint | https://arxiv.org/abs/2005.08926 | Continuous-time modeling of irregular observations. | Candidate for Human Context observations with source latency and missingness. |
| R12 | *EventFlow: Forecasting Event Sequences with Flow Matching* (2024) | preprint | https://arxiv.org/abs/2410.07430 | Joint temporal event-sequence forecasting. | Candidate for event-time/type forecasting after strong deterministic and point-process baselines. |
| R13 | *Bayesian Online Changepoint Detection* (2007) | preprint | https://arxiv.org/abs/0710.3742 | Online regime-change detection. | Use for routine/provider regime shifts and evidence-epoch boundaries. |

## 3. Intent integrity, provenance and certified execution

| ID | Publication | Status | Direct link | Operator Kit implementation use | Adoption constraint |
|---|---|---|---|---|---|
| R14 | *Policy Compiler for Secure Agentic Systems* (2026) | preprint | https://arxiv.org/abs/2602.16708 | Causal dependency graph, transitive information flow, declarative policy and deterministic reference monitor. | Adopt the architecture principle; Operator Kit keeps one canonical typed policy owner. |
| R15 | *Defeating Prompt Injections by Design* (2025) | preprint/research artifact | https://arxiv.org/abs/2503.18813 | Separates trusted control flow from untrusted data flow and constrains capabilities. | Use for protected-field and provenance rules; do not treat the research artifact as production-ready. |
| R16 | *Securing LLM Agents Need Intent-to-Execution Integrity* (2026) | position paper | https://arxiv.org/abs/2605.16976 | Instruction, judgment, data-flow and tool integrity across natural-language intent to concrete execution. | Drives GoalSpec, protected slots, Plan IR and tool-integrity tests. |
| R17 | *VIGIL: Runtime Enforcement of Behavioral Specifications in AI Agent Skills* (2026) | preprint | https://arxiv.org/abs/2606.26524 | Finite-trace temporal, argument and value-flow enforcement. | Drives trace guards and runtime policy tests. |
| R18 | *Certified Speculative Execution for Untrusted AI Agents* (2026) | preprint | https://arxiv.org/abs/2606.31023 | Trusted verification of the longest safe prefix from an untrusted proposal source. | Use for certified-prefix execution after hard feasibility and risk calibration. |
| R19 | *No Certificate, No Execution: Certified Traces as a Foundation for Trustworthy AI Agents* (2026) | position paper | https://arxiv.org/abs/2605.24462 | Proposal-certification-execution architecture and trace certification. | Supports immutable Plan IR and execution certificates; generation is never permission. |

## 4. Persistent-memory security

| ID | Publication | Status | Direct link | Operator Kit implementation use | Adoption constraint |
|---|---|---|---|---|---|
| R20 | *Securing LLM-Agent Long-Term Memory Against Poisoning: Non-Malleable, Origin-Bound Authority with Machine-Checked Guarantees* (2026) | preprint + benchmark/code | https://arxiv.org/abs/2606.24322 | Write-time origin authority, non-malleable propagation, corroboration-gated elevation and TLA+ models. | Adopt authority-ceiling invariants; independently review assumptions and reproduce operator-specific tests. |
| R21 | *Hidden in Memory: Sleeper Memory Poisoning in LLM Agents* (2026) | preprint | https://arxiv.org/abs/2605.15338 | Delayed poisoning through persistent memory. | Drives sleeper, compaction and cross-session poisoning tests. |
| R22 | *MemMorph: Tool Hijacking in LLM Agents via Memory Poisoning* (2026) | preprint | https://arxiv.org/abs/2605.26154 | Memory poisoning that biases tool selection. | Drives protected action-family and tool-selection tests. |

## 5. Runtime risk, support and sequential evaluation

| ID | Publication | Status | Direct link | Operator Kit implementation use | Adoption constraint |
|---|---|---|---|---|---|
| R23 | *CORA: Conformal Risk-Controlled Agents for Safeguarded Mobile GUI Automation* (2026) | preprint + benchmark/code | https://arxiv.org/abs/2604.09155 | Goal lock, action-conditional guardian, calibrated execute/abstain decision and support routing. | Use as a risk-controller pattern; guardian remains veto-only. |
| R24 | *ToolChain-CRC: Conformal Risk Control for Agentic AI Under Retrieval and Tool-Use Drift* (2026) | preprint | https://arxiv.org/abs/2606.18467 | Trajectory-level conformal risk under tool and retrieval drift. | Evaluate whole trajectories and early escalation, not final outputs alone. |
| R25 | *Anytime-Valid Conformal Risk Control* (2026) | preprint | https://arxiv.org/abs/2602.04364 | Risk control under repeated monitoring/recalibration. | Use only after assumptions and exchangeability/drift conditions are reviewed. |
| R26 | *Strategic Decision Support for AI Agents* (2026) | preprint | https://arxiv.org/abs/2606.12587 | Counterfactual missed-support error and low-burden support selection. | Separate missed support from uncertainty and unnecessary support. |
| R27 | *Off-Policy Confidence Sequences* (2021) | ICML/PMLR | https://proceedings.mlr.press/v139/karampatziakis21a.html | Time-uniform off-policy evaluation under adaptive stopping. | Use with exact logged propensities, support diagnostics and predeclared deployment policies. |

## 6. Long-horizon and adversarial evaluation

| ID | Publication | Status | Direct link | Operator Kit implementation use | Adoption constraint |
|---|---|---|---|---|---|
| R28 | *AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents* (2024) | NeurIPS benchmark/code | https://arxiv.org/abs/2406.13352 | Tool-use utility and indirect prompt-injection security evaluation. | Adapt its attack classes to Operator Kit action contracts and causal provenance. |
| R29 | *OSWorld2.0: Benchmarking Computer Use Agents on Long-Horizon Real-World Tasks* (2026) | preprint + benchmark | https://arxiv.org/abs/2606.29537 | Long-horizon, dynamic, cross-source, stateful workflows and verification failures. | Drives hundreds-of-step qualification and hidden-state recovery tests. |
| R30 | *When Users Change Their Mind: Evaluating Interruptible Agents in Long-Horizon Web Navigation* (2026) | preprint + benchmark | https://arxiv.org/abs/2604.00892 | Addition, revision and retraction of user requirements during persistent tasks. | Drives intent epochs, semantic diff, cancellation and reauthorization tests. |
| R31 | *AgentDyn: A Dynamic Open-Ended Benchmark for Evaluating Prompt Injection Attacks of Real-World Agent Security System* (2026) | preprint + benchmark | https://arxiv.org/abs/2602.03117 | Dynamic open-ended tasks and prompt-injection cases. | Use as a complementary security benchmark; reproduce with operator-specific tools. |

## 7. Neuroscience-inspired engineering priors

| ID | Publication | Status | Direct link | Operator Kit implementation use | Adoption constraint |
|---|---|---|---|---|---|
| R32 | *A recurrent network model of planning explains hippocampal replay and human behavior* (2024) | Nature Neuroscience | https://www.nature.com/articles/s41593-024-01675-7 | Selective internal rollout as a computational planning prior. | Design inspiration only; no biological-equivalence or authority claim. |
| R33 | *Multiple Event Segmentation Mechanisms in the Human Brain* (2026) | eLife | https://elifesciences.org/articles/107955 | Prediction error and uncertainty as separable event-boundary signals. | Use as a hypothesis for mismatch versus uncertainty episodes, subject to operator-local evaluation. |

## Evidence-handling rules

1. Bind every experimental result to the exact dataset, model, prompt, harness, tool registry, policy, adapter, provider simulator, seed, code commit and artifact hash.
2. Distinguish the paper’s demonstrated environment from Operator Kit’s digital, social, financial and device workflows.
3. Promote a model only for the exact transition family, output head, support region and horizon it passed.
4. Keep deterministic authority, budgets, consent, target binding and credential isolation outside all learned models.
5. Retain signed go/no-go evidence when a fashionable architecture loses to a simpler champion.
