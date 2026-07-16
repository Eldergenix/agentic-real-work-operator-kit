# Feature and Functional Specification

## 1. Product promise

Operator Kit performs governed work, not merely suggestions. A user defines a maximum authority envelope once, sees what Operator Kit can do, and receives after-the-fact evidence for work that falls inside a promoted capability cell. Operator Kit asks only for missing high-integrity information, authentication, or new authority.

## 2. Personas

- **Individual operator:** delegates calendar, communications, routines, errands, travel, purchasing, and personal workflows.
- **Founder/high-agency operator:** delegates project coordination, team follow-up, inbox, meetings, business systems, and recurring operations.
- **Administrator/organization owner:** defines organization caps, prohibited categories, required verification grades, incidents, and cohort rollout.
- **Reviewer/security operator:** inspects policies, receipts, provenance, model influence, incidents, and deployment evidence.

## 3. User-facing features

### F-001 Operator enrollment and maximum-autonomy envelope

**Functionality**

- Present supported domains, accounts, targets, purposes, budgets, time windows, consequence bands, reversibility, notification preferences, and exclusions.
- Separate source consent, purpose consent, cloud persistence consent, and training consent.
- Require one-time explicit inclusion for A4/A5 categories and consequence bands.
- Compile UI choices into a canonical mandate version and capability cells.
- Render the exact canonical policy the server will enforce.
- Support global pause, per-mandate pause, per-domain pause, expiry, revocation, cap lowering, and promotion freeze.

**States**

```text
draft → validating → active → paused → revoked | expired
```

**Acceptance**

- rendered summary hash equals stored canonical policy hash;
- cross-user reads/writes fail;
- changing a protected field creates a new version and invalidates stale capabilities;
- revocation increments the revocation epoch atomically.

### F-002 Autonomy Passport

Displays:

- current product tier and exact capability cells;
- domains/actions/targets/providers included and excluded;
- current evidence epoch;
- effect reliability and decision-quality status;
- verification grade requirement;
- remaining evidence, current risk coverage, and promotion/demotion reasons;
- last policy, connector, consent, and model version used;
- open incidents and unresolved high-consequence actions.

Tier labels are explanatory. The screen must never imply that A3 in one capability applies to an adjacent capability.

### F-003 Goal capture and intent lock

- Accept authenticated chat, voice transcript, Agenda, schedule, event trigger, browser demonstration, or existing approval.
- Compile a GoalSpec and show a compact goal/target/consequence summary for direct commands when ambiguity or consequence requires confirmation.
- Resolve authority-sensitive slots only from authenticated user data, provider-verified unique objects, current mandate defaults, or exact approvals.
- Increment the intent epoch on material revision, cancellation, replacement, or narrowing.
- Freeze or re-certify unstarted plan nodes after interruption.

### F-004 Durable Missions

- Represent a mission as GoalSpec + versioned Plan IR + runs + logical actions + attempts + mission outcome.
- Support dependency order, waits, conditions, schedules, authentication pause/resume, bounded replan, partial completion, compensation, supersession, and expiry.
- Resume the same logical action after authentication rather than creating a new unbound action.
- Reauthorize every committing node immediately before a provider attempt.

Mission states:

```text
created
→ planning
→ active
→ waiting_condition | awaiting_authentication | awaiting_authority
→ evaluating
→ goal_satisfied | partially_satisfied | goal_failed | goal_uncertain | superseded | cancelled
```

### F-005 Agenda and Workers

- Agenda shows time-oriented missions, conditions, next attempt, blocked reason, and outcome horizon.
- Workers shows ongoing durable execution, not static playbooks.
- “Run Now” creates a real run and dispatches through the same broker.
- Recurring work is represented by a mandate-bound schedule that generates fresh GoalSpecs/runs and re-evaluates current policy and caps.

### F-006 Action receipts and outcome feed

Each receipt displays:

- action and target;
- authorization source;
- mandate/capability scope;
- provider object ID or device identity;
- action state and mission state separately;
- independent verification grade and observations;
- amount/currency where applicable;
- model influence disclosure;
- context sources used at bounded summary level;
- recovery semantics and point of no return;
- policy/model/adapter/deployment versions;
- timestamps and maturity horizon.

Credentials, raw health values, forbidden raw context, PAN, CVV, passwords, authentication codes, and secrets are never displayed or stored.

### F-007 Recovery Center

- list `uncertain`, `reconciling`, `compensation_failed`, stale, and permanent effects;
- permit safe provider refresh/reconciliation;
- invoke registered compensation/mitigation where currently authorized;
- show fees, propagation limitations, and irreversible consequences;
- prevent a second provider attempt when safe duplicate handling is unavailable;
- escalate to one precise human resolution step when needed.

### F-008 Context Controls

- source-by-source and purpose-by-purpose consent;
- source freshness, last use, cloud/local status, retention, derived memories, and model influence;
- explicit-vs-inferred claim distinction;
- correction and contradiction resolution;
- source removal, erasure progress, provider deletion proof, and latent/procedure rebuild status;
- local-only raw HealthKit handling by default.

### F-009 Teach the Operator

```text
user demonstration
→ procedure candidate
→ protected-field extraction
→ typed Plan IR template
→ verifier discovery
→ static/information-flow checks
→ sandbox replay
→ exact directed real execution
→ evidence
→ bounded capability availability
```

The demonstration cannot become a credential, broad target selector, or unrestricted macro. External page content remains untrusted.

### F-010 Automatic promotion and demotion

- promotion happens only within the enrolled maximum envelope;
- adapter reliability, decision appropriateness, runtime support, and hard invariants are separate gates;
- direct commands may improve adapter reliability but do not alone prove autonomous intervention value;
- severe incidents cause immediate demotion and evidence-epoch closure;
- users receive an after-the-fact promotion notice and may freeze/demote/revoke immediately;
- re-promotion is automatic after incident closure and signed re-earning criteria.

## 4. Product programs

### Morning Operator

Uses consented sleep/commute/calendar/weather/tasks/context to choose timing, protect focus time, reschedule private blocks, send bounded updates, and arrange authorized logistics. Every external effect uses registered domain adapters.

### Relationship Keeper

Uses explicitly stated relationships and communication policies to schedule reminders, send bounded classes of messages, make reservations or capped gifts, and track follow-through. Frequency cannot create a relationship label or favorite claim.

### Project Chief

Protects focus blocks, updates project systems, coordinates collaborators, files artifacts, follows up, and evaluates whether blockers actually closed.

### Health and Routine Steward

Logs user-defined workouts, schedules appointments/reminders, and adapts nonclinical routines. It does not diagnose, prescribe, alter treatment, or infer medication instructions.

### Commute and Errand Operator

Times departure, requests bounded rides, adjusts calendar/communication, and handles repeat authorized replenishment within exact merchant/item/cadence/budget scopes.

### Attention Firewall

Applies verified external state changes such as notification routing, availability status, calendar focus, or message delay. It does not count a suggestion card as a completed firewall action.

## 5. UX principles

- Ask once only when the answer changes authority or resolves material ambiguity.
- Prefer progress and after-the-fact receipts over repetitive approval prompts.
- Preserve uncertainty visibly.
- Never label provider acceptance as success.
- Never show “Undo” unless a full reversal exists and is currently available.
- Name the target, consequence, audience, timing, and cost in plain language.
- Provide global pause within one interaction from all active Operator surfaces.
- Support accessibility, dynamic type, reduced motion, screen-reader labels, high contrast, offline state, and cross-device consistency.

## 6. Functional exclusions

- autonomous credential entry or authentication challenge completion;
- clinical judgment;
- prohibited commerce;
- authority expansion from inference, model confidence, repeated external text, or memory;
- blind retries of unknown non-idempotent effects;
- learned-only A3–A5 verification;
- live global neural-weight updates from individual production outcomes;
- hidden action paths outside the broker after a family graduates.
