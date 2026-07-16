# ADR 0003 — Separate effect verification from mission success

**Decision:** provider-effect lifecycle and user-goal lifecycle are independent. A verified API object does not automatically satisfy the mission.

**Why:** timing, conflict, delivery, fulfillment and user utility can fail after a technically correct provider write.
