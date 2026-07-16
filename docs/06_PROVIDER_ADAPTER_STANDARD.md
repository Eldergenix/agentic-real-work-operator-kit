# Provider Adapter Standard

## 1. Purpose

Every committing provider or device integration must implement one contract. A tool name, Composio slug, browser macro, native module, or SDK call is not sufficient for autonomous admission.

## 2. Adapter identity

Each adapter has:

```text
adapter_id
adapter_version
domain
action_family
provider
provider_api_version
contract_hash
supported_capability_cells
required_credential_scope
idempotency_class
minimum_verification_grade
recovery_semantics
maturity_horizon
fault_simulator_version
```

Any material change creates a new adapter version and evidence epoch unless an explicit compatibility receipt permits transfer.

## 3. Required interface

```ts
interface OperatorProviderAdapter<A, Ack, Obs, Comp> {
  describe(): AdapterDescriptor;
  canonicalize(input: unknown): A;
  extractTarget(action: A): TargetIdentity;
  classifyConsequence(action: A): ConsequenceVector;
  preflight(ctx: PreflightContext<A>): Promise<PreflightResult>;
  execute(ctx: ExecutionContext<A>): Promise<ProviderAttemptResult<Ack>>;
  observe(ctx: VerificationContext<A, Ack>): Promise<Obs[]>;
  verify(ctx: PredicateContext<A, Obs>): VerificationResult;
  reconcile(ctx: ReconciliationContext<A, Ack>): Promise<ReconciliationResult<Obs>>;
  compensate(ctx: CompensationContext<A, Ack, Obs>): Promise<Comp>;
  redactReceipt(ctx: ReceiptContext<A, Ack, Obs, Comp>): RedactedReceipt;
}
```

A provider may not be promoted if any applicable method is a placeholder. An irreversible action can omit a compensator only when its permanent-effect contract, point of no return, and UI copy are explicit.

## 4. Action contract fields

- canonical input schema;
- protected fields and permitted provenance classes;
- target extraction and normalization;
- preconditions;
- expected postconditions;
- provider object identity strategy;
- idempotency strategy;
- provider revision/ETag strategy;
- timeout classification;
- read-back and webhook/event strategies;
- stale-read detection;
- verification grade;
- expected propagation delay;
- maturity horizon;
- recovery/mitigation;
- point of no return;
- redaction policy;
- budget/amount extraction;
- prohibited states/categories;
- simulator and test vectors.

## 5. Adapter execution rules

1. Credential resolution happens only in the private broker.
2. The adapter receives the exact frozen canonical action, not a model-generated free-form prompt.
3. It cannot widen targets, infer an amount, change audience, add recipients, or choose a different account.
4. It uses the registered idempotency strategy.
5. It records request identity and provider acknowledgement without secrets.
6. A timeout is not converted to failure or success without evidence.
7. It performs read-back through a separately identified observation path.
8. It returns structured predicates rather than prose-only success.
9. It never writes the authoritative action state directly; it emits facts for the lifecycle writer.
10. It exposes provider version drift and unsupported states as typed errors.

## 6. Google Calendar canonical adapter

### Capability families

```text
calendar.private_event.create
calendar.private_event.update
calendar.private_event.cancel
calendar.attendee_event.create
calendar.attendee_event.update
calendar.attendee_event.cancel
```

Private and attendee events are separate capability cells because notifications and social propagation make attendee actions less reversible.

### Canonical protected fields

```text
provider account
calendar ID
event ID or exact target query
title/content class
start/end/timezone
attendee identities
notification mode
conference creation policy
visibility
conflict policy
```

### Idempotency

For creates, generate a deterministic provider-compatible event ID from the logical action/idempotency key. Google Calendar permits a client-specified event ID using base32hex characters; use a versioned deterministic generator and store Operator Kit action/hash metadata in private extended properties. A collision or mismatched pre-existing object becomes an incident/uncertain condition, not an overwrite.

For updates/cancels, bind the provider event ID and revision/ETag where available. Read the object immediately before the write when the action contract requires compare-and-swap semantics.

### Verification

At minimum V2:

- provider `events.get` by exact calendar and event ID;
- object status is expected;
- time, timezone, attendee set, notification policy, title/content hash, and relevant recurrence fields match;
- private Operator Kit metadata matches the logical action;
- provider revision/ETag is recorded.

For attendee or higher-consequence flows, add provider event/webhook evidence where practical and wait through the configured propagation window.

### Compensation

- operator-created private event: cancel/delete and verify absent/cancelled state.
- Updated existing event: restore exact pre-state snapshot when provider revision remains compatible.
- Attendee event: cancellation is a compensation with residual notification/social propagation; do not label it full undo.

### Mission predicates

Examples:

- event exists in requested time window;
- no policy-defined conflict remains;
- attendee event was created and notification state is known;
- rescheduling did not violate a protected commitment;
- focus block remains valid until its horizon.

## 7. Email/message adapter

Separate states:

```text
queued → provider_accepted → sent_object_verified → delivered | bounced | unknown
```

Cancellation is possible only before dispatch. A sent message is irreversible and may permit correction or follow-up. Bind exact account, recipients, BCC/bulk class, content class, tone, volume, quiet hours, delay window, and audience.

## 8. Browser adapter

- exact host/account/workflow/field/submit/spend policy;
- visual/DOM content is untrusted;
- freeze a commit graph before a consequential submit;
- bind protected field values outside the page's control;
- re-check account/host/object identity immediately before commit;
- verify using API, account-state page refreshed independently, or another system-of-record path;
- screenshot/toast/automation trace are supporting evidence only;
- authentication is a human handoff bound to the same action/intent epoch.

## 9. Device adapter

- signed command bound to user, device, action, epochs, expiry, expected result;
- online atomic claim and server re-evaluation immediately before commit;
- device independently validates lease/capability;
- signed acknowledgement and native/system read-back;
- offline committing execution fails closed;
- raw sensitive values remain local unless a separately consented bounded contract allows upload.

## 10. Commerce adapter

Separate:

```text
quote/cart
authorization
capture
order
fulfillment
substitution
settlement
cancel
refund_initiated
refund_settled
chargeback
```

Bind merchant, category, items, variants, quantity, amount/currency, taxes/shipping bounds, address, cadence, rolling budget, substitution policy, checkout snapshot, and permanent boundary.

## 11. Fault simulator

Every adapter must provide deterministic faults:

- timeout before provider sees request;
- timeout after provider commit;
- duplicate request;
- stale object revision;
- delayed read-back;
- wrong/mutated provider response;
- out-of-order webhook;
- credential revocation;
- partial provider outage;
- compensation failure;
- provider API version drift.

## 12. Graduation checklist

See [`checklists/adapter-graduation.md`](../checklists/adapter-graduation.md). No adapter graduates solely because its happy-path SDK call succeeds.
