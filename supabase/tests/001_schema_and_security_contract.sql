-- Agentic Real-Work Operator static database contract checks.
-- Run after applying all four additive migrations on a disposable database.
-- This script uses only core PostgreSQL and raises on the first failed invariant.

begin;

do $operator_static_contract$
declare
  object_name text;
  function_name text;
  rls_enabled boolean;
begin
  if to_regnamespace('operator') is null then
    raise exception 'operator schema is missing';
  end if;

  foreach object_name in array array[
    'goal_specs',
    'plan_irs',
    'plan_nodes',
    'plan_edges',
    'provenance_nodes',
    'provenance_edges',
    'operator_mandates',
    'capability_cells',
    'operator_authorizations',
    'operator_kill_switches',
    'operator_budget_accounts',
    'operator_budget_reservations',
    'autonomy_domain_state',
    'autonomy_promotion_receipts',
    'autonomy_incidents',
    'operator_actions',
    'operator_attempts',
    'operator_action_events',
    'verification_observations',
    'compensation_attempts',
    'operator_reservations',
    'mission_outcomes',
    'operator_outbox',
    'context_observations',
    'memory_items',
    'memory_origins',
    'memory_derivations',
    'memory_elevation_receipts',
    'decision_opportunities',
    'model_artifacts',
    'model_influence_receipts',
    'world_model_mismatches'
  ] loop
    if to_regclass(format('operator.%I', object_name)) is null then
      raise exception 'required relation operator.% is missing', object_name;
    end if;

    select c.relrowsecurity
      into rls_enabled
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'operator'
       and c.relname = object_name;

    if coalesce(rls_enabled, false) is not true then
      raise exception 'RLS is not enabled on operator.%', object_name;
    end if;
  end loop;

  foreach function_name in array array[
    'operator_create_action',
    'operator_append_action_event',
    'operator_reserve',
    'operator_transition_reservation',
    'reserve_budget',
    'commit_budget_reservation',
    'refund_budget_reservation',
    'mark_budget_reservation_reconciling',
    'consume_authorization',
    'revoke_mandate',
    'reject_update_delete',
    'lifecycle_transition_allowed',
    'verification_grade_rank'
  ] loop
    if not exists (
      select 1
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'operator'
         and p.proname = function_name
    ) then
      raise exception 'required function operator.% is missing', function_name;
    end if;
  end loop;

  if exists (
    select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'operator'
       and p.prosecdef
       and coalesce(array_to_string(p.proconfig, ','), '') !~ 'search_path='
  ) then
    raise exception 'one or more SECURITY DEFINER functions lack an explicit search_path';
  end if;

  if exists (
    select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname like 'operator\_%' escape '\\'
  ) then
    raise exception 'operator authority relation found in public schema';
  end if;
end
$operator_static_contract$;

rollback;
