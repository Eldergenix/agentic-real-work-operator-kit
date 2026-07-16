# Changelog

## Frontier V5.1 consolidated package — 2026-07-16

- Fixed verifier-mismatch handling so one mismatched observation produces one honest `uncertain` transition rather than an illegal duplicate transition.
- Added domain graduation manifest, truthful Operator UI projection, provider-fault wrapper, saga and receipt coverage.
- Added a runnable Calendar-shaped provider simulator and CI smoke test.
- Added Expo iOS/Android local-module scaffolding alongside the compiled SwiftPM lease validator.
- Added executable database lifecycle/RLS/append-only/budget qualification suites and made memory-item records append-only.
- Removed the unused competing Durable Object coordinator from the canonical private Worker.
- Added emitted TypeScript build validation and expanded the deterministic suite to 40 TypeScript tests plus 3 Swift tests.

## Frontier V5 — 2026-07-16

### Architecture and authority

- Added frozen `GoalSpec`, intent epochs, immutable typed `PlanIR`, protected-field provenance and a deterministic reference-monitor gate.
- Replaced a scalar autonomy interpretation with exact capability cells and a maximum-autonomy envelope.
- Added action-conditional veto-only risk, abstention and support-selection contracts.
- Bound direct commands to the authenticated conversation and source message rather than accepting a model assertion.

### Execution and outcome truth

- Added an event-sourced action lifecycle with provider attempts, independent verification observations, mission outcomes, compensation and transactional outbox projections.
- Replaced universal exactly-once language with adapter-declared effectively-once/idempotency classes.
- Separated provider-effect verification from user-goal satisfaction.
- Added fencing, epochs, nonce claims, current authority reload and explicit uncertain/reconciliation states.

### Provider and device implementations

- Added a tested Google Calendar create/reference adapter with deterministic object identity, independent GET verification, ETag capture, conflict reconciliation and verified delete compensation.
- Added a private Cloudflare `WorkerEntrypoint` Service Binding scaffold and per-action Durable Object coordinator.
- Added deterministic TypeScript device-command leases and a compiled Swift package that mirrors fail-closed epoch, kill-switch, expiry and fencing checks.

### Data, memory and models

- Added bitemporal observation contracts, origin-bound non-malleable memory authority, model-influence receipts and mismatch ledgers.
- Replaced a predetermined Transformer–Mamba–Dreamer sequence with a per-domain/per-head model tournament, procedural preplay, safe ranker, contextual-bandit, constrained MPC and late Dreamer-style challenger.
- Added support-aware OPE, anytime-valid promotion, risk–coverage and model-release manifests.

### Review, testing and references

- Added four additive Supabase/Postgres migrations, static database contract checks and dynamic qualification scenarios.
- Added OpenAPI, machine-readable feature/WBS/flag/event/acceptance manifests, TLA+ starter specifications, provider-fault scenarios and release runbooks.
- Added 33 primary research/publication links, 29 related GitHub repositories, official platform documentation, BibTeX and a research-to-design decision map.
- Added TypeScript, Worker, Swift, registry, source-index, local-link, cross-runtime and package-integrity validation.
