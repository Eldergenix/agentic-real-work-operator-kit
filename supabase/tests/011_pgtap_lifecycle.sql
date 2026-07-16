begin;
create extension if not exists pgtap;
select plan(18);

select has_function('operator', 'operator_create_action', array['jsonb','jsonb','text','text'], 'create-action RPC exists');
select has_function('operator', 'operator_append_action_event', array['jsonb','bigint'], 'append-event RPC exists');
select has_function('operator', 'operator_reserve', array['jsonb'], 'reservation RPC exists');
select has_function('operator', 'operator_transition_reservation', array['uuid','bigint','text'], 'reservation transition RPC exists');
select has_function('operator', 'lifecycle_transition_allowed', array['text','text','text'], 'transition guard exists');

select is(operator.verification_grade_rank('V0'), 0, 'V0 rank');
select is(operator.verification_grade_rank('V2'), 2, 'V2 rank');
select is(operator.verification_grade_rank('V4'), 4, 'V4 rank');

select ok(operator.lifecycle_transition_allowed('planned','authorized','authorized'), 'planned → authorized allowed');
select ok(operator.lifecycle_transition_allowed('authorized','reserved','reserved'), 'authorized → reserved allowed');
select ok(operator.lifecycle_transition_allowed('reserved','executing','executing'), 'reserved → executing allowed');
select ok(operator.lifecycle_transition_allowed('executing','provider_acknowledged','provider_acknowledged'), 'provider acknowledgement allowed');
select ok(operator.lifecycle_transition_allowed('provider_acknowledged','verified','verified'), 'verified after acknowledgement allowed');
select ok(operator.lifecycle_transition_allowed('executing','uncertain','uncertain'), 'uncertain after execution allowed');
select ok(operator.lifecycle_transition_allowed('uncertain','reconciling','reconciling'), 'reconciliation allowed');
select ok(operator.lifecycle_transition_allowed('verified','compensating','compensating'), 'compensation start allowed');
select ok(not operator.lifecycle_transition_allowed('planned','verified','verified'), 'planned → verified denied');
select ok(not operator.lifecycle_transition_allowed('failed','verified','verified'), 'failed → verified denied');

select * from finish();
rollback;
