# Glossary

| Term | Definition |
|---|---|
| **Agentic Real-Work Operator** | The governed system that turns a user goal into verified real-world or digital work. |
| **HCOM** | Human Context Operating Model: authoritative state, observation process, belief state, procedure graph, dynamics, outcome, risk, and planning components. |
| **GoalSpec** | Frozen, versioned, canonical representation of the user's objective, terminal predicates, forbidden effects, protected slots, and current intent epoch. |
| **Intent epoch** | Monotonically increasing version changed by a material user revision, cancellation, replacement, or narrowing. |
| **Plan IR** | Immutable typed directed acyclic graph of candidate action nodes, dependencies, preconditions, postconditions, verification, recovery, and consequence metadata. |
| **Protected field** | Action data such as target, account, amount, audience, mandate, purpose, or cap that may only derive from high-integrity sources. |
| **Causal provenance graph** | Dependency graph connecting observations, memories, model outputs, plan fields, policy decisions, and actions. |
| **Reference monitor** | Non-bypassable deterministic authorization and information-flow evaluator. |
| **Capability cell** | Exact authority tuple over user, mandate, provider, account, action family, target class, purpose, consequence, amount, audience, time, reversibility, and verifier requirements. |
| **Product autonomy tier** | Human-readable A0–A5 label. It is a presentation layer over capability cells, not the permission primitive. |
| **Risk guardian** | Veto-only action-conditional risk and out-of-distribution controller operating after deterministic authorization. |
| **Logical action** | One canonical intended external effect, possibly involving multiple execution attempts. |
| **Execution attempt** | One fenced provider invocation for a logical action. |
| **Effect verification** | Evidence that provider or device state matches the intended action. |
| **Mission outcome** | Evidence that the user's terminal goal was satisfied, partially satisfied, failed, uncertain, or superseded. |
| **Effectively once** | At most one accepted logical effect under the adapter's registered idempotency and reconciliation strategy. |
| **Verification grade** | V0–V4 classification of independent evidence strength. |
| **Compensation** | A follow-on action that reduces or reverses harm. It may be full, partial, time-limited, corrective, mitigative, or irreversible. |
| **Outcome maturity horizon** | Time after which delayed provider/user outcomes are sufficiently observed for evaluation or promotion. |
| **Model influence receipt** | Signed record that a specific model artifact influenced a candidate, rank, abstention, or plan. It provides zero action authority. |
| **Memory authority ceiling** | Maximum authority a memory item can ever provide, immutably bound to its origin unless elevated through an explicit approved receipt. |
| **Procedural world model** | Verified graph of workflow stages, transitions, expected observations, failure branches, verifiers, compensators, and reliability. |
| **Selective foresight** | Use of world-model predictions only in certified transition families, horizons, and support regions. |
