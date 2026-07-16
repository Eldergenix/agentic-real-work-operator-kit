# ADR 0001 — Single server authority and credential broker

**Decision:** all committing action families route through one deterministic server reference monitor and private credential-bearing broker before graduation. Legacy approvals/grants compile into inputs and cease being independent allow/deny owners.

**Why:** parallel authorities create inconsistent target, cap, replay and revocation semantics. Models and planners must remain credential-free.

**Consequence:** any unregistered or parallel committing path is hard-disabled in Operator Mode until migrated.
