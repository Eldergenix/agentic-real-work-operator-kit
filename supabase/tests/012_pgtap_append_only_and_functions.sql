begin;
create extension if not exists pgtap;
select plan(14);

select has_trigger('operator', 'goal_specs', 'goal_specs_immutable', 'GoalSpec immutable trigger exists');
select has_trigger('operator', 'plan_irs', 'plan_irs_immutable', 'PlanIR immutable trigger exists');
select has_trigger('operator', 'operator_action_events', 'operator_action_events_immutable', 'action events immutable trigger exists');
select has_trigger('operator', 'verification_observations', 'verification_observations_immutable', 'verification observations immutable trigger exists');
select has_trigger('operator', 'memory_items', 'memory_items_immutable', 'memory item immutable trigger exists');

select ok((select prosecdef from pg_proc where oid = 'operator.operator_create_action(jsonb,jsonb,text,text)'::regprocedure), 'create action is security definer');
select ok((select prosecdef from pg_proc where oid = 'operator.operator_append_action_event(jsonb,bigint)'::regprocedure), 'append event is security definer');
select ok((select prosecdef from pg_proc where oid = 'operator.operator_reserve(jsonb)'::regprocedure), 'reserve is security definer');
select ok((select prosecdef from pg_proc where oid = 'operator.consume_authorization(uuid,uuid,uuid,text,text,text)'::regprocedure), 'consume authorization is security definer');

select ok('search_path=operator, pg_temp' = any((select proconfig from pg_proc where oid = 'operator.operator_create_action(jsonb,jsonb,text,text)'::regprocedure)), 'create action fixes search_path');
select ok('search_path=operator, pg_temp' = any((select proconfig from pg_proc where oid = 'operator.operator_append_action_event(jsonb,bigint)'::regprocedure)), 'append event fixes search_path');
select ok('search_path=operator, pg_temp' = any((select proconfig from pg_proc where oid = 'operator.operator_reserve(jsonb)'::regprocedure)), 'reserve fixes search_path');

select ok(not has_function_privilege('authenticated', 'operator.operator_create_action(jsonb,jsonb,text,text)', 'EXECUTE'), 'client cannot create authoritative action directly');
select ok(not has_function_privilege('anon', 'operator.operator_append_action_event(jsonb,bigint)', 'EXECUTE'), 'anon cannot append action events');

select * from finish();
rollback;
