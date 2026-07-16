# Complete Implementation Backlog

**Program:** Agentic Real-Work Operator Kit  
**Version:** Frontier V5  
**Planning unit:** independently reviewable package with an external proof gate  
**Source of machine-readable truth:** [`implementation/WORK_BREAKDOWN.yaml`](../planning/WORK_BREAKDOWN.yaml)

## 1. Delivery strategy

The program is intentionally sequenced so that product breadth does not outrun the authority and execution kernel. The critical path is:

```text
GoalSpec and Plan IR
→ causal provenance/reference monitor
→ action/effect registry
→ event-sourced lifecycle
→ mandate capability lattice
→ private credential broker
→ real Google Calendar mutation and verification
```

Other work may proceed in parallel only when it does not create an alternate authorization, credential, execution, verification, or action-state owner.

## 2. Program epics

### Epic P0A — Intent and Plan Integrity

**Outcome:** authenticated natural-language intent is compiled into a frozen, inspectable, hash-bound goal and plan.

**Implementation:**

- create authenticated source-message attestations;
- implement protected authority slots and unique provider resolution;
- implement `GoalSpec`, `intent_epoch`, semantic diff, interruption, cancellation, and supersession;
- implement immutable `PlanIR`, nodes, edges, preconditions, expected postconditions, terminal predicates, and forbidden effects;
- implement causal provenance nodes/edges and denial-aware backward slices;
- implement high-integrity protected-field rules;
- split planner-safe denial information from authenticated-user explanations;
- persist and hash all contracts before authorization.

**Exit gate:** ambiguous or low-integrity target/account/amount/audience cannot execute; stale intent invalidates changed nodes; unchanged nodes can be deterministically re-certified.

### Epic P0B — Action and Effect Registry

**Outcome:** every committing capability has one exhaustive, versioned contract.

Each contract declares:

```text
domain and action family
provider and adapter version
protected fields and target extraction
consequence vector and maximum residual harm
idempotency class and retry policy
provider identity and object-version strategy
verification grade and verifier identity
visibility delay and maturity horizon
reconciliation and recovery semantics
point of no return
mission predicate template
redaction rules
legacy path retirement state
```

**Exit gate:** CI rejects an unknown committing tool or a promoted action lacking executor, independent verifier, receipt mapping, and recovery/permanence semantics.

### Epic P1 — Event-Sourced Action and Mission Lifecycle

**Outcome:** one logical action can contain several attempts and observations without converting uncertainty into success or counting retries as new evidence.

**Implementation:**

- append-only logical action events;
- separate provider attempts and fencing tokens;
- reservation acquire/commit/refund/reconcile;
- provider acknowledgement, verification observations, reconciliation, recovery, and compensation attempts;
- deterministic reducer/materialized projection;
- mission outcome lifecycle separate from effect lifecycle;
- transactional outbox for projections;
- exact approved/direct-command resume;
- stale-worker and stale-epoch protection.

**Exit gate:** timeout after probable commit remains `uncertain`; replay first reconciles; stale workers cannot reattempt or finalize; verified effect can still produce a partial or failed mission outcome.

### Epic P2 — Mandates, Capability Lattice, and Earned Autonomy

**Outcome:** one inspectable enrollment creates a bounded maximum-autonomy envelope and exact capability cells.

**Implementation:**

- versioned mandates and canonical policy;
- direct-command and recorded-approval exact attestations;
- capability cells keyed by user, mandate, provider, account, action, target, purpose, consequence, amount, verifier, idempotency, and time policy;
- automatic promotion only inside the enrolled envelope;
- one-time explicit category/consequence inclusion for A4/A5;
- legacy grant/journey compiler and per-family gate retirement;
- sequential promotion/demotion evidence epochs;
- immediate severe-incident demotion.

**Exit gate:** enrolled exact cell can execute without repeated taps; adjacent targets, domains, providers, audiences, consequences, or amount bands fail.

### Epic P3 — Private Credential-Isolated Broker

**Outcome:** no planner, model, browser runtime, or client receives provider credentials.

**Implementation:**

- private `mozi-operator` WorkerEntrypoint invoked by Service Binding only;
- signed single-use broker capabilities;
- current intent, mandate, consent, connector, kill-switch, and fencing epochs;
- atomic budget/reservation claims;
- narrowly partitioned Durable Object coordination atoms;
- provider credential resolution immediately before execution;
- external I/O outside database/DO locks;
- provider adapters for execute, verify, reconcile, and recover;
- high-consequence receipt persistence fail-closed.

**Exit gate:** public HTTP/JWT alone cannot execute; capability replay fails; credential scans pass; exactly one accepted logical effect is established under the adapter’s declared idempotency strategy.

### Epic P4 — Outcome, Context, Memory, and Model-Influence Ledger

**Outcome:** every committing attempt, relevant decision opportunity, context influence, and persistent memory write is attributable, purpose-bound, erasable, and non-authoritative unless explicitly elevated.

**Implementation:**

- bitemporal context observations and explicit missingness;
- prospective decision opportunity, candidate-set, propensity, abstention, support, and outcome records;
- model artifacts and influence receipts;
- immutable episodic ledger;
- authoritative user/provider facts;
- derived hypotheses, procedural memories, contradiction state, and quarantine;
- origin-bound authority that cannot increase through summarization or compaction;
- erasure propagation through descendants and datasets;
- external procedural reliability and prediction–observation mismatch records.

**Exit gate:** complete action trace without credentials/forbidden raw context; compaction cannot strip origin authority; erasure proof traverses derived records.

### Epic P5 — Google Calendar Kernel Provider Proof

**Outcome:** the common kernel performs and verifies real reversible work from both chat and a durable Mission.

**Implementation:**

- dedicated Google Workspace test account and calendar;
- private-event create/update/move/cancel first;
- deterministic client event identity and exact metadata;
- direct provider `events.get` read-back and ETag/revision capture;
- conflict, timezone, DST, attendee, notification, and drift policy;
- pre-state snapshot and compensation;
- separate effect and calendar-goal predicates;
- Agenda `Run Now` dispatch;
- real Operator Kit receipt and recovery UI.

**Exit gate:** provider, database, Worker, UI, and installed-client proof; duplicate Workflow delivery creates no second logical effect; compensation is independently verified.

### Epics P6–P10 — Domain Graduation

Each domain must reuse the kernel and graduate independent capability cells.

- **P6 Communications/connected apps:** exact recipient/account/content/audience, delayed-send cancellation, sent-object/delivery/bounce states, typed Composio arguments.
- **P7 Browser:** exact host/account/workflow/form/commit graph, prompt-injection isolation, human authentication handoff, independent account-state verifier.
- **P8 Device/Health/Smart Home:** signed device queue, online lease, local raw health, physical read-back, physical-safety-separated device cells.
- **P9 Ride:** quote binding, corridor and fare limits, request/match/pickup/completion/cancel/fee states.
- **P10A Commerce:** authorization, capture, order, fulfillment, substitution, settlement, refund, chargeback.
- **P10B Recurring/travel/high value:** exact cadence/itinerary, traveler, amount band, cancellation/permanence.
- **P10C Public communication:** exact account, audience, content hash, publish/read-back, delete/correction residual propagation.
- **P10D Destructive/clerical form:** exact object/form, user-attested fields, pre-state, reauthorization, point of no return, permanent receipt.

### Epic P11 — Governed Human Context Runtime

**Outcome:** consented context improves a real authorized action without creating authority.

**Implementation:**

- authoritative state and observation process;
- source-specific bitemporal adapters;
- purpose-minimal projections;
- belief state for hidden context and staleness;
- event-boundary and change-point detection;
- explicit-versus-inferred precedence;
- local-only sensitive health path;
- source revocation, TTL, erasure, and latent rebuild.

### Epic P12 — Procedural and Temporal Model Tournament

**Outcome:** each domain/output head has an evidence-selected champion.

**Candidate families:** deterministic rules, Hawkes/TPP, BOCPD, boosted trees, survival/competing-risk models, Neural CDE/CRU, EventFlow-like sequence models, Transformer, Mamba-3, Gated DeltaNet-2, Kimi/KDA hybrids, learned-memory models, graph-temporal models, JEPA-style latent prediction, and procedure graphs.

**Exit gate:** predeclared fixed-risk or predictive lift; calibration, support, privacy, latency, energy, rollback, and per-stratum gates; no architecture promoted by name alone.

### Epic P13 — Learned Decision Control

**Stages:**

1. finite eligible-candidate ranker;
2. safe contextual bandit with known propensities;
3. constrained receding-horizon MPC with read-back after each action/prefix;
4. Dreamer-style latent policy challenger only after sufficient mature action-conditioned data.

**Exit gate:** known overlap, anytime-valid/OPE evidence, hard gate and risk guardian always active, no direct credentials or execution path, and marginal verified-goal utility over the current champion at the same risk budget.

### Epic P14 — Unified Operator UX

**Features:** Operator enrollment, canonical mandate review, Autonomy Passport, Workers/Missions, Agenda, effect and mission receipts, live verification, uncertainty, Recovery Center, incident state, model influence, source freshness, promotion/demotion, global/domain pause, and cross-device truth.

### Epic P15 — Production Qualification

**Outcome:** exact capability cells graduate rather than a broad domain label.

**Required evidence:** migration allowlist, staging clone, backup/rollback, RLS and atomicity, four-Worker route/binding/secret/ref parity, provider canary, installed TestFlight ref, kill/revoke/outage/recovery drills, live statistical bounds, no severe incident, and truthful UI.

## 3. Suggested delivery increments

| Increment | Contents | Product claim allowed |
|---|---|---|
| I0 | P0A–P0B contracts/tests | `kernel_contracts_implemented` |
| I1 | P1–P4 deterministic kernel | `kernel_implemented` |
| I2 | P5 real calendar proof | `kernel_provider_proven` and exact calendar cells only |
| I3 | P6–P8 lower-consequence domains | exact graduated cells only |
| I4 | P11 context + P12 predictors/procedures | certified model heads/horizons only |
| I5 | P9/P10 bounded canaries | exact A5 subwave cells only |
| I6 | P13 learned control | exact policy/cell/cohort only |

## 4. Parallel work rules

Safe to parallelize:

- UI shells against mock read-only queries;
- provider simulators;
- adapter contracts and fixtures;
- formal specifications;
- evaluation harnesses;
- dataset/export privacy checks;
- documentation and runbooks.

Do not parallelize into separate owners:

- authorization;
- credential resolution;
- action terminal state;
- provider verification;
- promotion/demotion;
- budget reservation;
- kill-switch enforcement.

## 5. Backlog status vocabulary

```text
not_started
in_design
contract_implemented
test_proven
provider_test_account_proven
internal_canary
cohort_graduated
blocked
rejected
rolled_back
```

Every status must link to an evidence artifact. No global “complete” label replaces per-package, per-capability, per-model-head, and per-cohort status.
