-- Agentic Real-Work Operator database qualification template.
-- Replace fixture role/user helpers with the target repository conventions.
-- Run after all four additive migrations on a disposable staging clone.

begin;

-- Required test groups:
-- 1. operator schema objects exist and migration drift is zero.
-- 2. authenticated user can read only their own mandate/action/receipt projections.
-- 3. cross-user reads and all untrusted writes are denied by RLS/grants.
-- 4. server writer can append but cannot update/delete append-only events.
-- 5. two concurrent operator_reserve calls cannot exceed one cap/quota.
-- 6. one-shot direct command/approval can be consumed once only.
-- 7. stale fencing tokens cannot append/finalize or transition reservations.
-- 8. verified/permanent_verified requires an independent verification observation.
-- 9. committed reservations cannot be silently refunded; recovery uses a registered action.
-- 10. outbox retry cannot change authoritative lifecycle state.
-- 11. revoke/consent/kill epoch changes block every new attempt.
-- 12. erasure removes eligible descendants while preserving legally required redacted receipts.

-- Example harness pseudocode:
-- select plan(12);
-- select has_schema('operator');
-- select throws_ok($$ update operator.operator_action_events set ... $$, ...);
-- ...
-- select * from finish();

rollback;
