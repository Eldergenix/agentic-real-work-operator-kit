# Technical Review Guide

## Review passes

### Pass 1 — Product truth

Confirm that each feature ends in a real provider/device effect and does not use proposal, shadow, acknowledgement, or fixture success as the delivered claim.

### Pass 2 — Authority and intent

Review GoalSpec construction, protected-field source rules, Plan IR immutability, intent interruption, mandate cells, maximum-autonomy envelope, and exact action binding.

### Pass 3 — Security and credentials

Trace untrusted content, denial feedback, memory writes, model outputs, and subagent delegation through the causal provenance graph. Confirm that only the private broker resolves credentials.

### Pass 4 — Distributed correctness

Review reservations, fencing, Workflow redelivery, provider timeout, stale workers, revocation epochs, idempotency class, reconciliation, saga boundaries, and event projection.

### Pass 5 — Verification and recovery

Confirm the verifier is independent enough, detects stale reads, declares maturity, and distinguishes reversal, cancellation, restoration, correction, mitigation, refund initiation, refund settlement, and irreversibility.

### Pass 6 — Human Context and memory

Review source/purpose/training consent separation, bitemporal observations, missingness, minimum-purpose projection, origin-bound memory authority, contradiction handling, quarantine, erasure, and frozen live model weights.

### Pass 7 — ML and statistics

Review data readiness, cluster-aware splits, censoring, support overlap, calibration, model tournament, selective foresight, OPE, anytime-valid bounds, risk–coverage frontier, tail loss, and rollback.

### Pass 8 — Product UX and operations

Confirm the UI renders authoritative state, not optimistic local state. Exercise global/domain pause, uncertainty, authentication handoff, recovery, permanent effects, cross-device synchronization, provider outage, and rollback.

## Required review artifacts

- architecture decision records;
- action-family ownership inventory;
- migration dry run and RLS tests;
- Worker binding/secret/bundle checks;
- provider simulator and test-account evidence;
- model/data/evaluation receipts;
- formal-model outputs;
- UI accessibility and cross-device proof;
- production canary and incident review.

## High-risk review questions

1. Can a model or untrusted source select any protected field?
2. Can a legacy route execute after a family is broker-graduated?
3. Can a stale capability act after revocation or intent change?
4. Can a timeout create an unattended duplicate?
5. Can the executor verify its own write without independent evidence?
6. Can a memory summary gain authority through a trusted model/tool?
7. Can successful directed commands improperly prove autonomous decision quality?
8. Can evidence transfer across targets, providers, audiences, amounts, or consequence bands?
9. Can the UI say “done” before verification or mission maturity?
10. Can a learned policy act outside its logged support or declared risk budget?

A “yes” or “unknown” blocks graduation.
