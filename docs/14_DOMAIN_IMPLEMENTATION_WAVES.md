# Domain Implementation Waves

## 1. Wave ordering principle

Graduate the lowest-propagation, best-verifiable capability cells first. Evidence never transfers merely because two actions share a provider or UI.

## 2. Wave 1 — Google Calendar private events

### Actions

```text
create private event
update operator-created private event
move private event
cancel operator-created private event
restore exact pre-state where supported
```

### Required controls

- exact account/calendar/timezone;
- deterministic create ID;
- conflict policy;
- current revision/ETag strategy;
- provider GET verification;
- exact pre-state snapshot;
- no attendees/notifications in A2 cell.

### Exit

Chat and scheduled Mission each execute through the same broker, mutate the dedicated test calendar, read back exact provider state, survive duplicate delivery, expose receipt, and verify cancellation/restoration.

## 3. Wave 2 — attendee calendar and communications

Separate cells for:

- attendee event create/update/cancel;
- delayed exact-recipient email;
- immediate exact-recipient email;
- reviewed groups/bulk classes;
- non-calendar connected-app write.

Require target/content/audience/notification policy and delayed outcome states. Sent communication is irreversible.

## 4. Wave 3 — connected apps and persistent browser

- typed API/Composio writes before browser where possible;
- exact provider resource/arguments;
- browser host/account/form/commit graph;
- authentication handoff;
- system-of-record verification outside the automation trace;
- workflow-specific recovery.

## 5. Wave 4 — device, HealthKit, and smart home

### Device/Health

- physical device and signed command;
- online short lease;
- local raw sensitive data;
- read-back from HealthKit/native system;
- nonclinical user-defined actions only.

### Smart home

Separate capability cells by physical risk:

```text
lights/media/benign scenes
thermostat within safe band
locks/garage/access
alarms/security
appliances/fire-risk controls
```

Evidence from lights cannot promote locks, doors, alarms, or hazardous appliances.

## 6. Wave 5 — rides and logistics

Bind exact rider account, corridor, origin/destination, time, product class, accessibility, passenger count, quote, maximum fare/surge, and cancellation-fee policy.

Model states:

```text
quote → requested → matched → driver_assigned → arriving → picked_up → completed
                            ↘ cancelled → fee_pending → fee_settled
```

A request receipt is not a completed commute.

## 7. Wave 6 — A5 commerce

Subwave 10A only:

- repeat merchant;
- exact item/variant/quantity/substitution;
- small amount band;
- exact address;
- checkout snapshot;
- authorization/capture/order/settlement states;
- cancel/refund/reconciliation;
- sandbox then tightly capped internal live canary.

## 8. Wave 7 — A5 recurring, travel, high-value

Separate cells for each cadence/itinerary/provider/amount band. Stop on material price, item, traveler, itinerary, merchant, cancellation, or address drift. Do not infer a replacement itinerary.

## 9. Wave 8 — public communication

Bind exact account, audience, content hash/class, timing, and provider object. Verification requires provider read-back. Deletion is mitigation, not full reversal.

## 10. Wave 9 — destructive and clerical form/legal submission

- exact object/form;
- pre-state snapshot;
- protected user-attested content;
- material consequence;
- point of no return;
- fresh reauthorization as contract requires;
- provider confirmation;
- no legal/clinical judgment substitution.

## 11. Context programs

The Morning Operator, Relationship Keeper, Project Chief, Health/Routine Steward, Commute/Errand Operator, and Attention Firewall compose already graduated capability cells. They receive no hidden broader authority.

## 12. Domain readiness table

| Domain | First verifier | First recovery | Initial maximum tier |
|---|---|---|---|
| private calendar | exact provider GET | cancel/restore | A2 |
| attendee calendar | GET + event/notification evidence | cancellation/communication | A3 |
| exact email | sent object + delivery/bounce horizon | queue cancel or correction | A3 |
| connected app | provider GET/list/event | resource-specific | A3 |
| browser | independent account state | workflow-specific | A3 |
| HealthKit log | native read-back | delete/restore where supported | A4 explicit |
| benign smart home | provider/device state | reverse state | A3/A4 by physical risk |
| ride | provider status polling | cancel/fee reconciliation | A5 explicit |
| commerce | order/transaction/settlement | cancel/refund | A5 explicit |
| public | provider object + propagation window | delete/correct/mitigate | A5 explicit |
| destructive/form | provider confirmation + pre-state | restore if real, otherwise permanent | A5 explicit |
