begin;
create extension if not exists pgtap;
select plan(22);

select has_schema('operator', 'operator schema exists');
select has_table('operator', 'goal_specs', 'goal_specs exists');
select has_table('operator', 'operator_mandates', 'operator_mandates exists');
select has_table('operator', 'capability_cells', 'capability_cells exists');
select has_table('operator', 'operator_actions', 'operator_actions exists');
select has_table('operator', 'operator_action_events', 'operator_action_events exists');
select has_table('operator', 'verification_observations', 'verification_observations exists');
select has_table('operator', 'mission_outcomes', 'mission_outcomes exists');
select has_table('operator', 'memory_items', 'memory_items exists');

select ok((select relrowsecurity from pg_class where oid = 'operator.goal_specs'::regclass), 'goal_specs RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'operator.operator_mandates'::regclass), 'mandates RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'operator.capability_cells'::regclass), 'capability cells RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'operator.operator_actions'::regclass), 'actions RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'operator.memory_items'::regclass), 'memory RLS enabled');

select ok(exists(
  select 1 from pg_policies
  where schemaname = 'operator' and tablename = 'goal_specs' and cmd = 'SELECT'
), 'goal_specs owner-select policy exists');
select ok(exists(
  select 1 from pg_policies
  where schemaname = 'operator' and tablename = 'operator_mandates' and cmd = 'SELECT'
), 'mandate owner-select policy exists');
select ok(exists(
  select 1 from pg_policies
  where schemaname = 'operator' and tablename = 'operator_actions' and cmd = 'SELECT'
), 'action owner-select policy exists');

select ok(not has_table_privilege('anon', 'operator.operator_actions', 'SELECT'), 'anon cannot select actions');
select ok(not has_table_privilege('authenticated', 'operator.operator_actions', 'INSERT'), 'authenticated cannot insert actions directly');
select ok(not has_table_privilege('authenticated', 'operator.operator_action_events', 'UPDATE'), 'authenticated cannot update events');
select ok(has_table_privilege('service_role', 'operator.operator_actions', 'SELECT'), 'service role can read actions');
select ok(has_table_privilege('service_role', 'operator.operator_action_events', 'INSERT'), 'service role can append events');

select * from finish();
rollback;
