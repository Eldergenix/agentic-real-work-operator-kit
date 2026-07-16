# ADR 0002 — Effectively-once, not universal exactly-once

**Decision:** each adapter declares a safe idempotency/reconciliation class. Operator Kit guarantees at-most-one accepted logical effect only under that strategy. Non-idempotent ambiguous actions are not retried unattended.

**Why:** arbitrary external providers and network failures cannot provide universal physical exactly-once execution.
