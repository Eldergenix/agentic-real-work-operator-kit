-- Integration template for a Supabase CLI test database.
-- It deliberately uses a transaction and rolls back all rows.
begin;
create extension if not exists pgtap;
select plan(9);

-- Create a minimal auth user only in the disposable test database.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values (
  '11111111-1111-4111-8111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'operator-test@example.invalid',
  '',
  now(),
  now()
) on conflict (id) do nothing;

insert into operator.operator_budget_accounts(
  budget_account_id, user_id, mandate_id, scope_key, currency, limit_minor
) values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  null,
  'test:calendar',
  'USD',
  1000
);

select lives_ok($$
  select operator.reserve_budget(
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    400,
    'USD',
    1
  )
$$, 'initial reservation succeeds');

select is((select reserved_minor from operator.operator_budget_accounts where budget_account_id = '22222222-2222-4222-8222-222222222222'), 400::bigint, 'reserved balance updated');
select lives_ok($$
  select operator.reserve_budget(
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    400,
    'USD',
    2
  )
$$, 'same logical reservation is idempotent');
select is((select reserved_minor from operator.operator_budget_accounts where budget_account_id = '22222222-2222-4222-8222-222222222222'), 400::bigint, 'idempotent reserve does not double count');

select throws_ok($$
  select operator.reserve_budget(
    '22222222-2222-4222-8222-222222222222',
    '44444444-4444-4444-8444-444444444444',
    700,
    'USD',
    3
  )
$$, 'P0001', 'budget exhausted', 'over-cap concurrent effect denied');

select lives_ok($$
  select operator.commit_budget_reservation(
    (select reservation_id from operator.operator_budget_reservations where action_id = '33333333-3333-4333-8333-333333333333'),
    2
  )
$$, 'commit succeeds');
select is((select committed_minor from operator.operator_budget_accounts where budget_account_id = '22222222-2222-4222-8222-222222222222'), 400::bigint, 'committed balance updated');
select is((select reserved_minor from operator.operator_budget_accounts where budget_account_id = '22222222-2222-4222-8222-222222222222'), 0::bigint, 'reserved balance released');
select throws_ok($$
  select operator.refund_budget_reservation(
    (select reservation_id from operator.operator_budget_reservations where action_id = '33333333-3333-4333-8333-333333333333'),
    1
  )
$$, '40001', 'stale reservation fencing token', 'stale fence denied');

select * from finish();
rollback;
