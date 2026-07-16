# Domain Production Graduation Runbook

## Principle

Graduation applies to an exact capability cell, not an informal domain label. A calendar private-event capability cannot graduate attendee invitations; a repeat-merchant purchase cannot graduate travel, public posting, destructive changes, or legal forms.

## Required gates

### Contract and authority

- [ ] GoalSpec and Plan IR contracts are immutable and versioned.
- [ ] Protected fields have high-integrity provenance.
- [ ] One canonical server reference monitor owns allow/deny.
- [ ] Legacy commit paths are broker-routed or hard-disabled.
- [ ] Capability cell, maximum-autonomy envelope, purpose, target and consequence band are exact.
- [ ] A4/A5 category inclusion is explicit.

### Execution and verification

- [ ] Registered idempotency class is truthful for the provider.
- [ ] At-most-one accepted logical effect is demonstrated under retry and redelivery.
- [ ] Independent verification meets the declared minimum grade.
- [ ] Visibility delay, maturity horizon and stale-read behavior are tested.
- [ ] Effect success is separate from mission success.
- [ ] Recovery semantics are named truthfully.

### Security and privacy

- [ ] Credentials are isolated from planners/models/sandboxes.
- [ ] Prompt injection, confused deputy, denial laundering and over-privilege tests pass.
- [ ] Memory origin authority and compaction tests pass.
- [ ] Consent, erasure, retention and purpose projection pass.
- [ ] No forbidden raw credential or sensitive field appears in traces/receipts.

### Reliability and operations

- [ ] Provider fault simulator passes timeout, rate limit, stale state, duplicate webhook and outage cases.
- [ ] Revocation, kill switch, stale lease, fencing and budget race tests pass.
- [ ] Reconciliation and compensation SLOs are met.
- [ ] Incident owner, rollback, support and provider escalation paths exist.
- [ ] Migrations have staging, backup, exact allowlist and rollback proof.
- [ ] Worker and installed-client compatibility refs are verified.

### Evidence and statistics

- [ ] Only outcome-mature, independently verified live/canary actions enter live exposure.
- [ ] Retries and deliveries are deduplicated from exposure counts.
- [ ] Effect reliability and autonomous decision value pass separately.
- [ ] Candidate sets, propensities, abstentions, support decisions and outcomes are complete.
- [ ] Support overlap and effective sample size are sufficient.
- [ ] Anytime-valid or predeclared sequential analysis policy is followed.
- [ ] No open severe incident or high-consequence unresolved action exists.

## Cohort states

```text
registered
→ fixture_proven
→ test_account_proven
→ internal_canary
→ limited_cohort
→ graduated
→ demoted_or_retired
```

Each transition writes a signed promotion receipt containing contract, adapter, verifier, policy, model, dataset, deployment and evidence hashes.

## Stop conditions

Immediately stop or demote on:

- authorization false positive;
- wrong target or protected argument;
- duplicate accepted effect;
- cap, purpose, consent or prohibited-category violation;
- verifier false positive;
- credential leakage;
- material loss outside policy;
- public-audience mismatch;
- unresolved high-consequence outcome beyond SLO;
- incompatible provider or deployment version;
- kill-switch or revocation failure.

## Reviewer decision

The final decision must be one of:

```text
go
no_go
hold_for_more_evidence
rollback
retire
```

A `no_go` or model rejection does not block the already-proven deterministic operator kernel and must not trigger a post-hoc relaxation of predeclared thresholds.
