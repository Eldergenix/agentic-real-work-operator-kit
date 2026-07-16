# Agentic Real-Work Operator Kit — Frontier V5 implementation package

**Package date:** 2026-07-16  
**Status:** implementation-grade technical specification, tested deterministic kernel, deployment scaffold, and review package  
**Target:** Human Context Operator / Real Operator Mode

## Purpose

This repository is the Agentic Real-Work Operator Kit: a concrete technical, feature, security, data, machine-learning, evaluation, deployment, and operations implementation package.

It is designed to move Operator Kit from the current proposal/read-only Mission seam to one governed closed loop:

```text
authenticated intent
→ frozen GoalSpec
→ immutable Plan IR
→ causal provenance and protected-field checks
→ capability-lattice authorization
→ action-conditional risk and abstention
→ credential-isolated broker
→ provider or device mutation
→ independent verification
→ mission-goal evaluation
→ reconciliation or truthful recovery
→ durable receipts and governed learning
```

The product invariant remains strict: Operator Kit is not complete because it generated a proposal, draft, simulation, approval card, provider acknowledgement, screenshot, or passing unit test. A graduated capability must change real provider/device state under current authority, independently verify the resulting state, preserve uncertainty honestly, record an authoritative lifecycle, expose truthful recovery semantics, and pass provider, backend, client, UI, and incident proof.

## What is implemented in this archive

### Executable kernel

- strict TypeScript and Zod contracts for `GoalSpec`, intent epochs, immutable `PlanIR`, canonical actions, mandates, capability cells, provenance, risk, lifecycle events, verification, mission outcomes, memory authority, model influence, and promotion evidence;
- deterministic authorization with exact user, source-message, target, purpose, amount, policy, epoch, idempotency, adapter, and verification binding;
- causal protected-field provenance checks;
- action-conditional risk guardian and support-controller contracts;
- event-sourced action lifecycle with separate provider attempts and mission outcomes;
- explicit `uncertain`, reconciliation, compensation, and permanent-effect semantics;
- origin-bound memory authority and bitemporal observation utilities;
- effect registry with a fixture calendar adapter and Google Calendar create/reference adapter;
- private Cloudflare Worker RPC, Service Binding boundary, Supabase authority reload, credential-owner binding, and Durable Object lease/fencing coordinator;
- additive Postgres/Supabase migrations for intent, plans, mandates, capability cells, direct commands, approvals, budgets, actions, attempts, verification observations, outbox, mission outcomes, memory, consent, model influence, and promotion evidence;
- OpenAPI, ML manifests, TLA+ starter specifications, CI, validation scripts, runbooks, and review checklists.

### Complete review and planning material

- feature and functionality specification;
- architecture, ownership, and trust-boundary design;
- provider adapter and domain-action registry standards;
- Operator enrollment, Autonomy Passport, Workers, Agenda, chat receipt, recovery, context-control, and Teach the Operator UX requirements;
- calendar, communications, connected-app, browser, device/health, smart-home, ride, commerce, public, destructive, recurring, travel, and clerical-submission waves;
- Human Context Operating Model, procedural world model, temporal backbone tournament, safe contextual-bandit, constrained MPC, and late Dreamer-style challenger plan;
- statistical promotion/demotion, OPE, conformal risk, support, shift, privacy, erasure, formal verification, incident, deployment, canary, and rollback requirements;
- machine-readable feature catalog, work breakdown, API contracts, feature flags, observability events, acceptance matrix, repository file map, 33-source research index, and 29-repository implementation index.

## Verified local package result

Run with Node.js 22 or later:

```sh
npm ci
npm run ci:full
```

The package CI performs:

```text
shared TypeScript typecheck
Cloudflare Worker typecheck
21 Vitest files / 40 deterministic TypeScript tests
runnable provider-simulator create/read/delete smoke test
3 deterministic Swift device-lease tests
registry completeness validation
research/repository index validation
local documentation-link validation
cross-runtime TypeScript/Swift contract-drift validation
package integrity and obvious secret/card-data scan
```

The tests use fixtures and mocked provider I/O. They do not substitute for Postgres concurrency tests, real Google Calendar proof, Cloudflare deployment, device proof, TestFlight proof, or production canaries.

## Repository map

```text
.
├── docs/                    Complete product, architecture, security, ML, UX, test, and operations specifications
│   ├── adrs/                Architectural decisions
│   └── source/              Frontier V3 research amendment retained for history
├── src/lib/operator/        Canonical tested deterministic operator kernel
├── tests/                   Unit and contract tests
├── infra/cloudflare/        Private credential-isolated Worker and coordination implementation scaffold
├── supabase/migrations/     Additive authority, lifecycle, outcome, memory, consent, and model schema
├── supabase/tests/          Database/RLS/race qualification templates
├── openapi/                 Operator control-plane API contract
├── ml/                      Dataset, model tournament, and promotion manifests
├── specs/tla/               Formal lifecycle, budget, revocation, and interruption starter models
├── planning/                Feature catalog, WBS, flags, APIs, events, acceptance matrix, and integration map
├── provider-sim/            Provider-fault catalog plus runnable Calendar-shaped simulator
├── mobile/                  Device-command, Operator UI contracts, and compiled Swift lease validator
├── checklists/              Repository, adapter, security, privacy, model, and production gates
├── runbooks/                Migration, calendar canary, memory incident, model release, rollback, and production procedures
├── references/              Verified paper, official documentation, BibTeX, and GitHub repository indexes
├── examples/                Review-only examples; `src/` and `infra/` remain canonical
├── evidence/                Generated validation report, manifest, and checksums
└── AGENT_IMPLEMENTATION_PROMPT.md
```

## Recommended review order

1. [`REVIEW_GUIDE.md`](REVIEW_GUIDE.md)
2. [`docs/00_MASTER_IMPLEMENTATION_PLAN.md`](docs/00_MASTER_IMPLEMENTATION_PLAN.md)
3. [`docs/01_FEATURE_AND_FUNCTIONAL_SPEC.md`](docs/01_FEATURE_AND_FUNCTIONAL_SPEC.md)
4. [`docs/02_SYSTEM_ARCHITECTURE.md`](docs/02_SYSTEM_ARCHITECTURE.md)
5. [`docs/03_INTENT_COMPILER_AND_PLAN_IR.md`](docs/03_INTENT_COMPILER_AND_PLAN_IR.md)
6. [`docs/04_AUTHORITY_CAPABILITY_AND_RISK.md`](docs/04_AUTHORITY_CAPABILITY_AND_RISK.md)
7. [`docs/05_BROKER_LIFECYCLE_AND_RECOVERY.md`](docs/05_BROKER_LIFECYCLE_AND_RECOVERY.md)
8. [`docs/06_PROVIDER_ADAPTER_STANDARD.md`](docs/06_PROVIDER_ADAPTER_STANDARD.md)
9. [`docs/07_HUMAN_CONTEXT_MEMORY_AND_CONSENT.md`](docs/07_HUMAN_CONTEXT_MEMORY_AND_CONSENT.md)
10. [`docs/08_WORLD_MODEL_AND_ML_ROADMAP.md`](docs/08_WORLD_MODEL_AND_ML_ROADMAP.md)
11. [`docs/09_EVALUATION_PROMOTION_AND_STATISTICS.md`](docs/09_EVALUATION_PROMOTION_AND_STATISTICS.md)
12. [`docs/21_IMPLEMENTATION_BACKLOG.md`](docs/21_IMPLEMENTATION_BACKLOG.md)
13. [`docs/22_ACCEPTANCE_AND_TRACEABILITY.md`](docs/22_ACCEPTANCE_AND_TRACEABILITY.md)
14. [`references/DESIGN_DECISION_MAP.md`](references/DESIGN_DECISION_MAP.md)
15. [`AGENT_IMPLEMENTATION_PROMPT.md`](AGENT_IMPLEMENTATION_PROMPT.md)

## First real product exit

The first production proof remains a private Google Calendar event created through the same broker path from authenticated chat and a durable Mission. It must:

1. bind to an authenticated source message, frozen `GoalSpec`, immutable `PlanIR`, current authority, exact calendar, and protected-field provenance;
2. execute through the private Worker without exposing OAuth credentials to the planner or AI Worker;
3. use a registered idempotency strategy and current fencing token;
4. independently read the event back from Google by provider identity;
5. distinguish provider-effect verification from terminal mission satisfaction;
6. survive Workflow replay without a second logical effect;
7. expose acknowledgement, verification, mission outcome, uncertainty, and recovery truthfully in Operator Kit;
8. delete/restore only where the action contract truthfully supports it and verify the result;
9. prove migration, RLS, Worker bindings/ref, provider object, installed client, kill switch, and rollback evidence.

Until that passes, the kernel is **implemented and locally tested, not provider-proven**.

## Integration boundary

This archive is not represented as:

- merged into Operator Kit’s private repository;
- reconciled with every current migration, generated database type, legacy approval/grant path, or connector owner;
- deployed to Cloudflare;
- applied to the named Supabase project;
- connected to real Composio, Google, AgentMail, AgentCard, Uber, browser, HealthKit, smart-home, or device credentials;
- validated against the current TestFlight build;
- trained on Operator Kit user data;
- proven by a real provider/device canary.

Repository paths, SHAs, Worker refs, project refs, and TestFlight identifiers inherited from the supplied plan remain assertions to verify in the target control planes. Review [`STATUS_AND_ASSUMPTIONS.md`](STATUS_AND_ASSUMPTIONS.md) and [`INTEGRATION_NOTICE.md`](INTEGRATION_NOTICE.md).

## External code and research

No third-party repository is vendored. Research and related code are indexed under [`references/`](references/). Verify exact commits, licenses, security posture, data terms, and architectural fit before adoption. A research result or public checkpoint contributes zero positive action authority and zero live Real Work Completion exposure.
