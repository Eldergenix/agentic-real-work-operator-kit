# Domain action registry

This is a minimum registration matrix. Each row becomes one or more exact provider/version contracts; evidence never transfers between rows.

| Domain/action family | Minimum idempotency | Minimum verifier | Default recovery truth | Initial maximum tier |
|---|---|---|---|---|
| `calendar.private_event.create` | client-generated ID/provider key | V2 provider GET | true reversal/restoration | A2 |
| `calendar.attendee_event.create` | client-generated ID/provider key | V2/V3 | time-limited cancellation; notifications may persist | A3 |
| `email.queued_send.create` | provider native/client queue ID | V2 queue GET | time-limited cancellation | A3 |
| `email.message.send` | provider native key or reconcile-only | V2/V3 sent object + bounce horizon | correction/irreversible | A3 |
| `connected_app.object.write` | provider-specific | V2 | adapter-specific | A3 |
| `browser.workflow.commit` | read-before-retry or reconcile-only | V2 system-of-record | adapter-specific | A3/A5 |
| `device.healthkit.write` | client-generated object correlation | V2/V4 device read-back/attestation | deletion/restoration where supported | A4 |
| `smart_home.low_risk.set_state` | provider native/client correlation | V2/V4 provider/device state | reverse state | A3/A4 |
| `ride.request` | provider native/reconcile-only | V3 status transitions | cancellation/fee settlement | A5 |
| `commerce.order.create` | provider native/client order correlation | V3/V4 order+transaction state | cancel/refund lifecycle | A5 |
| `recurring.order.create` | provider native | V3/V4 | stop future runs; current effect separate | A5 |
| `travel.booking.create` | provider native/reconcile-only | V3/V4 booking/ticket state | cancellation rules/permanent boundary | A5 |
| `public.post.publish` | provider native/client ID | V3 | delete/correction is mitigation, not full reversal | A5 |
| `file.destructive.delete` | compare-and-swap/version | V3/V4 | restoration only if provider proves it | A5 |
| `form.clerical_submit` | provider native/reconcile-only | V3/V4 | irreversible after submission boundary | A5 |

## Registration invariant

No committing row is admitted unless it defines:

```text
canonical target and protected fields
argument schema and version
consequence vector
idempotency class
provider state machine
stable provider identity strategy
source of truth and verifier grade
expected visibility delay
maturity horizon
reconciliation strategy
recovery semantics
point of no return
redaction mapping
provider simulator
promotion strata
```
