# Operator UX Implementation

## 1. Surface ownership

- **Settings:** authority, mandates, consent, context sources, caps, promotion controls.
- **Workers:** durable mission execution and worker status.
- **Agenda:** time-oriented missions, schedules, conditions, next actions.
- **Chat:** intent capture, one precise question, progress, receipts, corrections.
- **Operator Center/Passport:** cross-domain authority/evidence/outcome overview.
- **Recovery Center:** uncertainty, reconciliation, compensation, mitigation, permanence.

Do not create a parallel dashboard with independent state. All surfaces read authoritative API projections.

## 2. Enrollment flow

### Step 1 — Explain Operator Mode

Show:

- real work can occur without repeated taps inside exact scopes;
- categories, targets, budgets, purposes, and consequence bands remain bounded;
- automatic promotion does not widen scope;
- authentication and new authority still require the user;
- receipts, pause, revocation, and recovery controls.

### Step 2 — Connect accounts/sources

Display exact credential scopes and source consent separately from action authority.

### Step 3 — Choose maximum envelope

- domains/action families;
- exact/rule-bound targets;
- A4/A5 explicit category inclusion;
- amount/audience/consequence bands;
- reversibility/verification requirements;
- time/quiet hours;
- budgets;
- notifications and review cadence.

### Step 4 — Render canonical review

The server returns the canonical human-readable policy and hash. The client displays that response, not a separately reconstructed summary.

### Step 5 — Self-test

Run connector/verifier/compensator tests. A2 only activates for cells that pass.

## 3. Mission card

Required fields:

```text
objective
current mission state
next condition/action
bounded target summary
authority source/capability
risk/support state
provider effect state
verification grade/state
mission outcome state
recovery availability
last update and expected next update
```

## 4. Receipt design

The receipt visually separates:

1. **What Operator Kit intended** — GoalSpec summary.
2. **What Operator Kit attempted** — provider/action/target.
3. **What the provider reported** — acknowledgement.
4. **What Operator Kit independently observed** — verification.
5. **Whether the user's goal was satisfied** — mission outcome.
6. **What can still change** — maturity horizon/reconciliation.
7. **What recovery means** — reversal/cancellation/restoration/refund/correction/mitigation/permanent.

## 5. Uncertainty UI

Use exact language:

- “Google accepted the request; I am checking whether the event exists.”
- “The provider timed out. I will not repeat the purchase until I confirm whether it happened.”
- “The message was sent; delivery is not yet known.”
- “The refund was requested; settlement is pending.”
- “This public post was deleted, but copies or notifications may remain.”

Never use success animation/color for acknowledgement-only states.

## 6. One precise question

A question is allowed only when:

- protected target/account/amount/audience is ambiguous;
- required information cannot be obtained authoritatively;
- authentication is required;
- new authority is required;
- a high-impact recovery choice has materially different consequences.

Combine related missing information into one clear prompt without asking for passwords, codes, or secrets in chat.

## 7. Interruption and correction

- user can cancel/modify a mission from chat, Agenda, Workers, or receipt;
- UI sends a material intent change, not merely a local hide action;
- unstarted nodes freeze immediately;
- in-flight action displays “checking what happened”;
- completed conflicting nodes display recovery/mitigation options;
- a new GoalSpec version is visible in history.

## 8. Autonomy Passport

Sections:

- active capability cells grouped by domain;
- product tier label;
- targets/accounts/purposes/consequence/budget;
- verification requirement;
- evidence remaining and recent outcomes;
- model influence status;
- promotion/demotion history;
- open incidents/uncertain actions;
- pause/freeze/demote/revoke.

Avoid gamification that pressures a user toward higher consequence autonomy.

## 9. Recovery Center

Filters:

```text
needs observation
reconciling
can cancel/reverse
can correct/mitigate
refund pending
permanent
requires authentication
requires new authority
failed recovery
```

Actions are broker-routed and freshly authorized. A recovery button never invokes a legacy direct tool path.

## 10. Accessibility and reliability

- VoiceOver/TalkBack labels include action, target, state, consequence, and control result.
- Dynamic Type and text wrapping for receipts and policies.
- Reduced motion disables nonessential progress animation.
- Do not encode state only by color.
- Offline mode clearly shows stale projections and queues only non-committing local operations.
- Realtime races resolve from versioned authoritative state.
- Cross-device changes use optimistic UI only for convenience, never authority.

## 11. Analytics

Track product interaction without raw sensitive content:

```text
enrollment_started/completed
mandate_scope_changed
operator_paused/revoked
mission_created/interrupt_requested
precise_question_asked
receipt_viewed
reconciliation_requested
recovery_invoked
promotion_notice_viewed
```

Link to server action/mission IDs under consent and retention controls. UI analytics cannot serve as effect verification.
