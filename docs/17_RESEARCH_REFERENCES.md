# Annotated Research and Official Documentation

## Review policy

- 2026 papers are frequently preprints; treat them as research inputs, not production guarantees.
- The design adopts principles only where they survive operator-specific tests.
- A paper or benchmark never provides action authority.
- Official provider/platform documentation controls current API behavior.

## A. World models and long-horizon planning

1. **Agentic World Modeling: Foundations, Capabilities, Laws, and Beyond** — arXiv:2604.22748  
   https://arxiv.org/abs/2604.22748  
   **Operator Kit use:** capability-oriented world-model framing, factorized components, intervention and closed-loop requirements.

2. **World Model for Robot Learning: A Comprehensive Survey** — arXiv:2605.00080  
   https://arxiv.org/abs/2605.00080  
   **Operator Kit use:** taxonomy and evaluation dimensions; not a direct service-agent architecture.

3. **How Should World Models Be Evaluated? A Decision-Centric Perspective** — arXiv:2606.15032  
   https://arxiv.org/abs/2606.15032  
   **Operator Kit use:** action-conditioned, interventional, rollout and closed-loop evaluation rather than plausible generation alone.

4. **SPIRAL: Self-Play on Zero-Sum Games Incentivizes Reasoning via Action World Models** — arXiv:2603.08403  
   https://arxiv.org/abs/2603.08403  
   **Operator Kit use:** research signal for action-conditioned closed-loop modeling; domain assumptions differ from Operator Kit.

5. **Training Agents Inside of Scalable World Models (Dreamer 4)** — arXiv:2509.24527  
   https://arxiv.org/abs/2509.24527  
   **Operator Kit use:** late challenger for imagination-based policy learning after action-conditioned data, MPC, risk, and OPE gates.

6. **Procedural World Models for Self-Evolving LLM Agents (ProPlay)** — arXiv:2606.12780  
   https://arxiv.org/abs/2606.12780  
   **Operator Kit use:** procedure graph, transition reliability, preplay, and verified workflow memory.

7. **Self-Evolving World Models for LLM Agent Planning (WorldEvolver)** — arXiv:2606.30639  
   https://arxiv.org/abs/2606.30639  
   **Operator Kit use:** frozen live weights, episodic mismatch memory, and selective foresight.

8. **Policy and World Modeling Co-Training for Language Agents** — arXiv:2606.02388  
   https://arxiv.org/abs/2606.02388  
   **Operator Kit use:** action/next-observation supervision from real interaction; policy co-training remains evidence-gated.

## B. Sequence, temporal, and memory architectures

9. **Mamba-3** — arXiv:2603.15569  
   https://arxiv.org/abs/2603.15569  
   **Operator Kit use:** recurrent long-history challenger, not predetermined winner.

10. **Gated DeltaNet-2** — arXiv:2605.22791  
    https://arxiv.org/abs/2605.22791  
    **Operator Kit use:** recurrent/linear-attention challenger in the per-head tournament.

11. **Kimi Linear** — arXiv:2510.26692  
    https://arxiv.org/abs/2510.26692  
    **Operator Kit use:** hybrid recurrent/attention efficiency challenger.

12. **Neural Controlled Differential Equations for Irregular Time Series** — arXiv:2005.08926  
    https://arxiv.org/abs/2005.08926  
    **Operator Kit use:** irregular continuous-time Human Context observations.

13. **Neural CDEs for Online Prediction Tasks** — arXiv:2106.11028  
    https://arxiv.org/abs/2106.11028  
    **Operator Kit use:** causal/online irregular-stream modeling.

14. **EventFlow: Forecasting Temporal Event Sequences with Flow Matching** — arXiv:2410.07430  
    https://arxiv.org/abs/2410.07430  
    **Operator Kit use:** joint future event-sequence challenger that can reduce autoregressive cascade effects.

15. **Titans: Learning to Memorize at Test Time** — arXiv:2501.00663  
    https://arxiv.org/abs/2501.00663  
    **Operator Kit use:** learned-memory research challenger; exact authority remains external.

16. **ATLAS: Learning to Optimally Memorize the Context at Test Time** — arXiv:2505.23735  
    https://arxiv.org/abs/2505.23735  
    **Operator Kit use:** test-time memory research input.

17. **TNT: Improving Transformer Reasoning Through Test-Time Training** — arXiv:2511.07343  
    https://arxiv.org/abs/2511.07343  
    **Operator Kit use:** research challenger only; live adaptation must remain bounded, erasable, and non-authoritative.

18. **NS-Mem: Neuro-Symbolic Memory for Long-Horizon Agents** — arXiv:2603.15280  
    https://arxiv.org/abs/2603.15280  
    **Operator Kit use:** research input for exact symbolic memory plus learned retrieval/reasoning.

## C. Agent security, provenance, and trace enforcement

19. **Policy Compiler for Secure Agentic Systems** — arXiv:2602.16708  
    https://arxiv.org/abs/2602.16708  
    **Operator Kit use:** causal dependency graph, policy compilation, and non-bypassable reference monitor.

20. **CaMeL: Defeating Prompt Injections by Design** — arXiv:2503.18813  
    https://arxiv.org/abs/2503.18813  
    **Operator Kit use:** control/data-flow separation and capability principles. The public code is a research artifact, not a production dependency.

21. **Securing LLM Agents Needs Intent-to-Execution Integrity** — arXiv:2605.16976  
    https://arxiv.org/abs/2605.16976  
    **Operator Kit use:** GoalSpec/Plan IR/trace integrity across instruction, data, judgment, and tools.

22. **VIGIL: Runtime Enforcement of Behavioral Specifications in AI Agents** — arXiv:2606.26524  
    https://arxiv.org/abs/2606.26524  
    **Operator Kit use:** finite-trace runtime behavioral policies.

23. **Certified Speculative Execution for Untrusted AI Agents** — arXiv:2606.31023  
    https://arxiv.org/abs/2606.31023  
    **Operator Kit use:** certified safe prefixes and separation of untrusted proposal from trusted verifier.

24. **Certified Traces for AI Agent Execution** — arXiv:2605.24462  
    https://arxiv.org/abs/2605.24462  
    **Operator Kit use:** research input for verifiable execution traces and evidence packaging.

25. **TraceFix: Repairing Agent Protocols with TLA+/PlusCal Counterexamples** — arXiv:2605.07935  
    https://arxiv.org/abs/2605.07935  
    **Operator Kit use:** model-checking critical distributed coordination protocols.

26. **AgentThread: Formal Protocol Composition for Multi-Agent Systems** — arXiv:2606.28690  
    https://arxiv.org/abs/2606.28690  
    **Operator Kit use:** research input for typed/formal multi-agent protocol boundaries.

27. **Evaluating LLM Generation of TLA+ Specifications** — arXiv:2606.05792  
    https://arxiv.org/abs/2606.05792  
    **Operator Kit use:** caution: syntactic generation is not semantic proof; expert review and bounded model checking remain mandatory.

## D. Persistent-memory security

28. **Securing LLM-Agent Long-Term Memory Against Poisoning** — arXiv:2606.24322  
    https://arxiv.org/abs/2606.24322  
    **Operator Kit use:** non-malleable, origin-bound memory authority.

29. **Sleeper Memory Poisoning in LLM Agents** — arXiv:2605.15338  
    https://arxiv.org/abs/2605.15338  
    **Operator Kit use:** delayed-trigger, compaction, and persistent-memory adversarial tests.

30. **Certified Runtime Defense for Agent Memory Poisoning (SMSR)** — arXiv:2606.12703  
    https://arxiv.org/abs/2606.12703  
    **Operator Kit use:** research input for memory admission and runtime influence constraints.

31. **Zombie Agents: Persistent Memory Attacks in LLM Systems** — arXiv:2602.15654  
    https://arxiv.org/abs/2602.15654  
    **Operator Kit use:** threat-model coverage for long-lived compromised behavior.

## E. Risk, abstention, and policy evaluation

32. **CORA: Conformal Risk-Controlled Agents** — arXiv:2604.09155  
    https://arxiv.org/abs/2604.09155  
    **Operator Kit use:** action-conditional guardian and execute/abstain control under a risk budget.

33. **ToolChain-CRC** — arXiv:2606.18467  
    https://arxiv.org/abs/2606.18467  
    **Operator Kit use:** trajectory-level risk control and repeated monitoring under drift.

34. **AgentAbstain** — arXiv:2607.10059  
    https://arxiv.org/abs/2607.10059  
    **Operator Kit use:** evaluate whether agents abstain before irreversible action rather than after it.

35. **Agentic Abstention** — arXiv:2606.28733  
    https://arxiv.org/abs/2606.28733  
    **Operator Kit use:** abstention as a distinct agent capability.

36. **Off-Policy Confidence Sequences** — arXiv:2102.09540; ICML 2021  
    https://arxiv.org/abs/2102.09540  
    https://proceedings.mlr.press/v139/karampatziakis21a.html  
    **Operator Kit use:** time-uniform policy evaluation for gated sequential deployment.

37. **Anytime-Valid Off-Policy Evaluation for Contextual Bandits** — arXiv:2210.10768  
    https://arxiv.org/abs/2210.10768  
    **Operator Kit use:** repeated policy checks with known propensities and support diagnostics.

38. **Strategic Decision Support and the Value of Asking for Help** — arXiv:2606.12587  
    https://arxiv.org/abs/2606.12587  
    **Operator Kit use:** missed support and unnecessary support as distinct outcomes.

## F. Long-horizon and interruptible agent evaluation

39. **OSWorld 2.0** — arXiv:2606.29537  
    https://arxiv.org/abs/2606.29537  
    **Operator Kit use:** long workflows, cross-source state, dynamic changes, hidden information, and verification failures.

40. **InterruptBench** — arXiv:2604.00892  
    https://arxiv.org/abs/2604.00892  
    **Operator Kit use:** user revisions, additions, cancellations, and intent epochs in persistent web tasks.

41. **AgentDyn** — arXiv:2602.03117  
    https://arxiv.org/abs/2602.03117  
    **Operator Kit use:** dynamic tool/environment evaluation.

42. **AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents** — NeurIPS 2024  
    https://arxiv.org/abs/2406.13352  
    **Operator Kit use:** indirect prompt-injection benchmark and regression fixtures.

43. **Done, But Not Sure: Terminal Commitment and Outcome Verification in Agents** — arXiv:2605.08747  
    https://arxiv.org/abs/2605.08747  
    **Operator Kit use:** separate tool/effect completion from terminal mission confidence.

## G. Neuroscience-inspired engineering priors

44. **A Recurrent Network Model of Planning Explains Hippocampal Replay and Human Behavior** — Nature Neuroscience, 2024  
    https://www.nature.com/articles/s41593-024-01675-7  
    **Operator Kit use:** inspiration for selective internal rollout/replay; not an authority or direct software proof.

45. **Multiple Event Segmentation Mechanisms in the Human Brain** — eLife, 2026  
    https://elifesciences.org/articles/107955  
    **Operator Kit use:** distinguish high prediction error from high uncertainty when segmenting episodes and deciding refresh/abstention.

46. **GENESIS: Episodic–Semantic Interaction for Continual Learning** — arXiv:2510.15828  
    https://arxiv.org/abs/2510.15828  
    **Operator Kit use:** research input for fast episodic and slower semantic consolidation.

47. **Causal Replay through State-Space Models** — arXiv:2502.05394  
    https://arxiv.org/abs/2502.05394  
    **Operator Kit use:** research input for replay and state-space reasoning.

## H. Official platform/provider documentation

48. **Google Calendar API — Events: insert**  
    https://developers.google.com/workspace/calendar/api/v3/reference/events/insert  
    **Operator Kit use:** current event creation fields, client-specified ID rules, notification semantics.

49. **Google Calendar API — Events: get**  
    https://developers.google.com/workspace/calendar/api/v3/reference/events/get  
    **Operator Kit use:** exact provider read-back verification.

50. **Cloudflare Workflows — Rules of Workflows**  
    https://developers.cloudflare.com/workflows/build/rules-of-workflows/  
    **Operator Kit use:** replay-safe granular steps and idempotent external effects.

51. **Cloudflare Workers — Service Bindings**  
    https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/  
    **Operator Kit use:** private Worker-to-Worker RPC boundary.

52. **Cloudflare Workers Best Practices**  
    https://developers.cloudflare.com/workers/best-practices/workers-best-practices/  
    **Operator Kit use:** current Worker configuration, binding, promise, streaming, secret, and observability practices.

53. **Cloudflare Durable Objects — Best Practices**  
    https://developers.cloudflare.com/durable-objects/best-practices/  
    **Operator Kit use:** coordination atoms, persistence, no external I/O under concurrency initialization/locks.

54. **Supabase Row Level Security**  
    https://supabase.com/docs/guides/database/postgres/row-level-security  
    **Operator Kit use:** owner reads and client/server write separation.

55. **PostgreSQL Transaction Isolation**  
    https://www.postgresql.org/docs/current/transaction-iso.html  
    **Operator Kit use:** atomic reservation and race analysis.

56. **TLA+ Documentation**  
    https://lamport.azurewebsites.net/tla/tla.html  
    **Operator Kit use:** bounded distributed-state specifications and model checking.
