-- Agentic Real-Work Operator Kit: event-sourced action lifecycle, attempts,
-- verification observations, generic atomic reservations, mission outcomes,
-- and a transactional outbox.
--
-- The TypeScript lifecycle reducer is the executable reference. These SQL
-- functions mirror the same event vocabulary and fail closed on stale
-- sequence/fencing tokens or missing independent verification.

create table if not exists operator.operator_actions (
  action_id uuid primary key,
  logical_effect_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  plan_id uuid not null,
  plan_version integer not null,
  node_id text not null,
  intent_epoch bigint not null check (intent_epoch >= 0),
  mandate_id uuid references operator.operator_mandates(mandate_id),
  capability_cell_id uuid references operator.capability_cells(capability_cell_id),
  authorization_kind text check (
    authorization_kind is null or
    authorization_kind in ('direct_command','recorded_approval','operator_mandate')
  ),
  authorization_ref text,
  domain text not null,
  action_family text not null,
  provider text not null,
  provider_account_id text not null,
  target_hash text not null check (target_hash ~ '^[a-f0-9]{64}$'),
  action_hash text not null check (action_hash ~ '^[a-f0-9]{64}$'),
  idempotency_class text not null,
  consequence jsonb not null,
  amount_minor bigint,
  currency text,
  action_payload jsonb not null,
  status text not null default 'planned',
  version bigint not null default 1,
  next_sequence bigint not null default 2,
  fencing_token bigint not null default 0,
  provider_object_id text,
  provider_version text,
  strongest_verification_grade text,
  current_attempt_id uuid,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((amount_minor is null) = (currency is null)),
  foreign key (plan_id, plan_version, node_id)
    references operator.plan_nodes(plan_id, plan_version, node_id)
);

create table if not exists operator.operator_attempts (
  attempt_id uuid primary key,
  action_id uuid not null references operator.operator_actions(action_id) on delete cascade,
  attempt_number integer not null check (attempt_number > 0),
  fencing_token bigint not null check (fencing_token > 0),
  state text not null check (
    state in ('claimed','executing','acknowledged','uncertain','verified','failed','abandoned')
  ),
  provider_request_id text,
  provider_object_id text,
  provider_version text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (action_id, attempt_number),
  unique (action_id, fencing_token)
);

create table if not exists operator.verification_observations (
  observation_id uuid primary key,
  action_id uuid not null references operator.operator_actions(action_id) on delete cascade,
  attempt_id uuid not null,
  phase text not null check (phase in ('effect','compensation')),
  provider_object_id text not null,
  verifier_ref text not null,
  verifier_identity text not null,
  grade text not null check (grade in ('V0','V1','V2','V3','V4')),
  source_version text,
  observed_at timestamptz not null,
  matched boolean not null,
  predicate_results jsonb not null,
  redacted_evidence_hash text not null check (redacted_evidence_hash ~ '^[a-f0-9]{64}$'),
  observation_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists operator.compensation_attempts (
  compensation_attempt_id uuid primary key,
  action_id uuid not null references operator.operator_actions(action_id) on delete cascade,
  fencing_token bigint not null,
  recovery_semantics text not null,
  state text not null check (state in ('planned','executing','acknowledged','verified','failed','uncertain')),
  provider_object_id text,
  redacted_receipt jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists operator.operator_action_events (
  event_id uuid primary key,
  action_id uuid not null references operator.operator_actions(action_id) on delete cascade,
  sequence bigint not null,
  event_type text not null,
  from_status text,
  to_status text not null,
  attempt_id uuid,
  fencing_token bigint not null,
  provider_object_id text,
  reason_code text,
  event_payload jsonb not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  unique (action_id, sequence)
);

-- Generic logical-action reservation used by the reference broker. Production
-- can additionally project into period-specific budget accounts in the prior
-- migration. The idempotency key is unique per provider account.
create table if not exists operator.operator_reservations (
  reservation_id uuid primary key,
  action_id uuid not null references operator.operator_actions(action_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  mandate_id uuid not null,
  provider text not null,
  provider_account_id text not null,
  idempotency_key text not null,
  amount_minor bigint,
  currency text,
  state text not null check (state in ('reserved','committed','refunded','reconciling')),
  fencing_token bigint not null check (fencing_token > 0),
  created_at timestamptz not null,
  updated_at timestamptz not null default now(),
  check ((amount_minor is null) = (currency is null)),
  unique (provider, provider_account_id, idempotency_key),
  unique (action_id)
);

create table if not exists operator.mission_outcomes (
  mission_outcome_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  plan_id uuid not null,
  plan_version integer not null,
  status text not null check (
    status in ('open','evaluating','goal_satisfied','partially_satisfied','goal_failed','goal_uncertain','superseded')
  ),
  terminal_predicate_results jsonb not null default '{}'::jsonb,
  maturity_horizon_closed boolean not null default false,
  verified_utility numeric,
  attribution_horizon_end timestamptz,
  updated_at timestamptz not null default now(),
  unique (goal_id, plan_id, plan_version)
);

create table if not exists operator.operator_outbox (
  outbox_id uuid primary key default gen_random_uuid(),
  aggregate_type text not null,
  aggregate_id uuid not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  publish_attempts integer not null default 0,
  last_error text
);

alter table operator.operator_budget_reservations
  add constraint operator_budget_reservations_action_fk
  foreign key (action_id) references operator.operator_actions(action_id) on delete cascade;
alter table operator.operator_authorizations
  add constraint operator_authorizations_consumed_action_fk
  foreign key (consumed_by_action_id) references operator.operator_actions(action_id) on delete set null;
alter table operator.autonomy_incidents
  add constraint autonomy_incidents_action_fk
  foreign key (action_id) references operator.operator_actions(action_id) on delete set null;

create index if not exists operator_actions_reconcile_idx
  on operator.operator_actions(status, updated_at)
  where status in ('executing','provider_acknowledged','uncertain','reconciling','compensating');
create index if not exists operator_action_events_action_idx
  on operator.operator_action_events(action_id, sequence);
create index if not exists operator_outbox_pending_idx
  on operator.operator_outbox(created_at)
  where published_at is null;
create index if not exists operator_reservations_budget_idx
  on operator.operator_reservations(user_id, mandate_id, currency, state);

create or replace function operator.verification_grade_rank(p_grade text)
returns integer
language sql
immutable
set search_path = operator, pg_temp
as $$
  select case p_grade when 'V0' then 0 when 'V1' then 1 when 'V2' then 2 when 'V3' then 3 when 'V4' then 4 else -1 end;
$$;

create or replace function operator.lifecycle_transition_allowed(p_from text, p_to text, p_event_type text)
returns boolean
language sql
immutable
set search_path = operator, pg_temp
as $$
  select case
    when p_event_type = 'verification_observed'
      then p_from in ('provider_acknowledged','uncertain','reconciling','compensating')
    when p_from = 'planned'
      then p_to in ('authorized','denied','expired','superseded','aborted')
    when p_from = 'authorized'
      then p_to in ('reserved','denied','risk_abstained','expired','superseded','aborted')
    when p_from = 'risk_abstained'
      then p_to in ('expired','superseded','aborted')
    when p_from = 'reserved'
      then p_to in ('executing','risk_abstained','awaiting_authentication','expired','superseded','aborted')
    when p_from = 'awaiting_authentication'
      then p_to in ('executing','expired','superseded','aborted')
    when p_from = 'executing'
      then p_to in ('provider_acknowledged','uncertain','failed','awaiting_authentication')
    when p_from = 'provider_acknowledged'
      then p_to in ('provider_acknowledged','verified','permanent_verified','uncertain','failed','reconciling','compensating')
    when p_from = 'uncertain'
      then p_to in ('executing','reconciling','failed','compensating','superseded','aborted')
    when p_from = 'reconciling'
      then p_to in ('reconciling','provider_acknowledged','verified','permanent_verified','failed','uncertain','compensating')
    when p_from in ('verified','permanent_verified','failed')
      then p_to = 'compensating'
    when p_from = 'compensating'
      then p_to in ('compensating','compensated','compensation_failed','uncertain')
    else false
  end;
$$;

create or replace function operator.operator_create_action(
  p_action jsonb,
  p_event jsonb,
  p_action_hash text,
  p_target_hash text
) returns void
language plpgsql
security definer
set search_path = operator, pg_temp
as $$
declare
  v_action_id uuid := (p_action->>'actionId')::uuid;
  v_event_id uuid := (p_event->>'eventId')::uuid;
  v_sequence bigint := (p_event->>'sequence')::bigint;
  v_fence bigint := (p_event->>'fencingToken')::bigint;
begin
  if p_event->>'type' <> 'action_planned' or v_sequence <> 1 then
    raise exception 'action stream must begin with action_planned sequence 1' using errcode = '23514';
  end if;
  if p_action_hash !~ '^[a-f0-9]{64}$' or p_target_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid canonical hash' using errcode = '22023';
  end if;

  insert into operator.operator_actions(
    action_id, logical_effect_id, user_id, goal_id, plan_id, plan_version, node_id,
    intent_epoch, domain, action_family, provider, provider_account_id, target_hash,
    action_hash, idempotency_class, consequence, amount_minor, currency,
    action_payload, status, version, next_sequence, fencing_token, expires_at
  ) values (
    v_action_id,
    (p_action->>'logicalEffectId')::uuid,
    (p_action->>'userId')::uuid,
    (p_action->>'goalId')::uuid,
    (p_action->>'planId')::uuid,
    (p_action->>'planVersion')::integer,
    p_action->>'nodeId',
    (p_action->>'intentEpoch')::bigint,
    p_action->>'domain',
    p_action->>'actionFamily',
    p_action->>'provider',
    p_action->>'providerAccountId',
    p_target_hash,
    p_action_hash,
    p_action->>'idempotencyClass',
    p_action->'consequence',
    case when p_action ? 'amount' then (p_action->'amount'->>'amountMinor')::bigint else null end,
    case when p_action ? 'amount' then p_action->'amount'->>'currency' else null end,
    p_action,
    'planned',
    1,
    2,
    v_fence,
    (p_action->>'expiresAt')::timestamptz
  );

  insert into operator.operator_action_events(
    event_id, action_id, sequence, event_type, from_status, to_status,
    fencing_token, event_payload, occurred_at
  ) values (
    v_event_id, v_action_id, 1, 'action_planned', null, 'planned',
    v_fence, p_event, (p_event->>'occurredAt')::timestamptz
  );

  insert into operator.operator_outbox(aggregate_type, aggregate_id, event_type, payload)
  values ('operator_action', v_action_id, 'action_planned', p_event);
end;
$$;

create or replace function operator.operator_append_action_event(
  p_event jsonb,
  p_expected_sequence bigint
) returns void
language plpgsql
security definer
set search_path = operator, pg_temp
as $$
declare
  v_action operator.operator_actions%rowtype;
  v_action_id uuid := (p_event->>'actionId')::uuid;
  v_event_id uuid := (p_event->>'eventId')::uuid;
  v_event_type text := p_event->>'type';
  v_sequence bigint := (p_event->>'sequence')::bigint;
  v_fence bigint := (p_event->>'fencingToken')::bigint;
  v_attempt_id uuid;
  v_provider_object_id text;
  v_to_status text;
  v_observation jsonb;
  v_grade text;
  v_phase text;
begin
  select * into v_action
  from operator.operator_actions
  where action_id = v_action_id
  for update;

  if not found then raise exception 'operator action not found' using errcode = 'P0002'; end if;
  if v_action.next_sequence - 1 <> p_expected_sequence or v_sequence <> v_action.next_sequence then
    raise exception 'operator action sequence conflict' using errcode = '40001';
  end if;
  if v_fence < v_action.fencing_token then
    raise exception 'stale action fencing token' using errcode = '40001';
  end if;
  if (p_event->>'intentEpoch')::bigint < v_action.intent_epoch then
    raise exception 'stale intent epoch' using errcode = '40001';
  end if;

  v_attempt_id := case
    when p_event ? 'attemptId' then (p_event->>'attemptId')::uuid
    when p_event ? 'compensationAttemptId' then (p_event->>'compensationAttemptId')::uuid
    else v_action.current_attempt_id
  end;
  v_provider_object_id := coalesce(p_event->>'providerObjectId', v_action.provider_object_id);

  v_to_status := case v_event_type
    when 'action_authorized' then 'authorized'
    when 'reservation_acquired' then 'reserved'
    when 'attempt_started' then 'executing'
    when 'provider_acknowledged' then 'provider_acknowledged'
    when 'verification_observed' then
      case
        when p_event->'observation'->>'verifierRef' like 'compensation:%' then 'compensating'
        when coalesce((p_event->'observation'->>'matched')::boolean, false) then 'provider_acknowledged'
        else 'uncertain'
      end
    when 'action_verified' then case when coalesce((p_event->>'permanent')::boolean, false) then 'permanent_verified' else 'verified' end
    when 'action_denied' then 'denied'
    when 'risk_abstained' then 'risk_abstained'
    when 'authentication_required' then 'awaiting_authentication'
    when 'action_failed' then 'failed'
    when 'action_uncertain' then 'uncertain'
    when 'reconciliation_started' then 'reconciling'
    when 'compensation_started' then 'compensating'
    when 'action_compensated' then 'compensated'
    when 'compensation_failed' then 'compensation_failed'
    when 'action_expired' then 'expired'
    when 'action_superseded' then 'superseded'
    when 'action_aborted' then 'aborted'
    else null
  end;

  if v_to_status is null or not operator.lifecycle_transition_allowed(v_action.status, v_to_status, v_event_type) then
    raise exception 'invalid lifecycle transition % --%--> %', v_action.status, v_event_type, v_to_status
      using errcode = '23514';
  end if;

  if v_event_type = 'verification_observed' then
    v_observation := p_event->'observation';
    v_phase := case when v_observation->>'verifierRef' like 'compensation:%' then 'compensation' else 'effect' end;
    insert into operator.verification_observations(
      observation_id, action_id, attempt_id, phase, provider_object_id,
      verifier_ref, verifier_identity, grade, source_version, observed_at,
      matched, predicate_results, redacted_evidence_hash, observation_payload
    ) values (
      (v_observation->>'observationId')::uuid,
      v_action_id,
      (v_observation->>'attemptId')::uuid,
      v_phase,
      v_observation->>'providerObjectId',
      v_observation->>'verifierRef',
      split_part(v_observation->>'verifierRef', ':', 1),
      v_observation->>'grade',
      v_observation->>'sourceVersion',
      (v_observation->>'observedAt')::timestamptz,
      (v_observation->>'matched')::boolean,
      v_observation->'predicateResults',
      v_observation->>'redactedEvidenceHash',
      v_observation
    ) on conflict (observation_id) do nothing;
  end if;

  if v_event_type = 'action_verified' then
    v_grade := v_action.action_payload->>'requiredVerificationGrade';
    if not exists (
      select 1 from operator.verification_observations o
      where o.action_id = v_action_id
        and o.phase = 'effect'
        and o.matched = true
        and o.provider_object_id = v_provider_object_id
        and operator.verification_grade_rank(o.grade) >= operator.verification_grade_rank(v_grade)
    ) then
      raise exception 'matching independent verification observation required' using errcode = '23514';
    end if;
  end if;

  if v_event_type = 'action_compensated' and not exists (
    select 1 from operator.verification_observations o
    where o.action_id = v_action_id and o.phase = 'compensation' and o.matched = true
  ) then
    raise exception 'matching compensation read-back required' using errcode = '23514';
  end if;

  if v_event_type = 'attempt_started' then
    insert into operator.operator_attempts(
      attempt_id, action_id, attempt_number, fencing_token, state, started_at
    ) values (
      v_attempt_id, v_action_id, (p_event->>'attemptNumber')::integer, v_fence, 'executing',
      (p_event->>'occurredAt')::timestamptz
    ) on conflict (attempt_id) do nothing;
  elsif v_event_type = 'provider_acknowledged' and v_attempt_id is not null then
    update operator.operator_attempts
    set state = 'acknowledged', provider_object_id = v_provider_object_id
    where attempt_id = v_attempt_id and action_id = v_action_id;
  elsif v_event_type = 'action_verified' and v_attempt_id is not null then
    update operator.operator_attempts
    set state = 'verified', finished_at = (p_event->>'occurredAt')::timestamptz
    where attempt_id = v_attempt_id and action_id = v_action_id;
  elsif v_event_type = 'action_failed' and v_attempt_id is not null then
    update operator.operator_attempts
    set state = 'failed', finished_at = (p_event->>'occurredAt')::timestamptz
    where attempt_id = v_attempt_id and action_id = v_action_id;
  elsif v_event_type = 'action_uncertain' and v_attempt_id is not null then
    update operator.operator_attempts
    set state = 'uncertain'
    where attempt_id = v_attempt_id and action_id = v_action_id;
  end if;

  insert into operator.operator_action_events(
    event_id, action_id, sequence, event_type, from_status, to_status,
    attempt_id, fencing_token, provider_object_id, reason_code, event_payload, occurred_at
  ) values (
    v_event_id, v_action_id, v_sequence, v_event_type, v_action.status, v_to_status,
    v_attempt_id, v_fence, v_provider_object_id,
    coalesce(p_event->>'reasonCode', p_event->>'failureCode'), p_event,
    (p_event->>'occurredAt')::timestamptz
  );

  update operator.operator_actions
  set status = v_to_status,
      version = version + 1,
      next_sequence = next_sequence + 1,
      fencing_token = greatest(fencing_token, v_fence),
      intent_epoch = greatest(intent_epoch, (p_event->>'intentEpoch')::bigint),
      current_attempt_id = coalesce(v_attempt_id, current_attempt_id),
      provider_object_id = coalesce(v_provider_object_id, provider_object_id),
      authorization_kind = case when v_event_type = 'action_authorized' then p_event->>'authorizationKind' else authorization_kind end,
      authorization_ref = case when v_event_type = 'action_authorized' then p_event->>'authorizationRef' else authorization_ref end,
      capability_cell_id = case
        when v_event_type = 'action_authorized' and p_event ? 'capabilityCellId'
          then (p_event->>'capabilityCellId')::uuid
        else capability_cell_id
      end,
      strongest_verification_grade = case
        when v_event_type = 'verification_observed' and coalesce((p_event->'observation'->>'matched')::boolean, false)
          then p_event->'observation'->>'grade'
        else strongest_verification_grade
      end,
      updated_at = now()
  where action_id = v_action_id;

  insert into operator.operator_outbox(aggregate_type, aggregate_id, event_type, payload)
  values ('operator_action', v_action_id, v_event_type, p_event);
end;
$$;

create or replace function operator.operator_reserve(p_request jsonb)
returns jsonb
language plpgsql
security definer
set search_path = operator, pg_temp
as $$
declare
  v_existing operator.operator_reservations%rowtype;
  v_row operator.operator_reservations%rowtype;
  v_amount bigint;
  v_currency text;
  v_max bigint;
  v_in_use bigint;
  v_lock_key bigint;
begin
  v_amount := case when p_request ? 'amount' then (p_request->'amount'->>'amountMinor')::bigint else null end;
  v_currency := case when p_request ? 'amount' then p_request->'amount'->>'currency' else null end;
  v_max := case when p_request ? 'maxBudget' then (p_request->'maxBudget'->>'amountMinor')::bigint else null end;
  if p_request ? 'maxBudget' and p_request->'maxBudget'->>'currency' <> v_currency then
    raise exception 'budget currency mismatch' using errcode = '22023';
  end if;

  v_lock_key := hashtextextended(
    (p_request->>'userId') || ':' || (p_request->>'mandateId') || ':' || coalesce(v_currency, 'none'),
    0
  );
  perform pg_advisory_xact_lock(v_lock_key);

  select * into v_existing
  from operator.operator_reservations
  where reservation_id = (p_request->>'reservationId')::uuid
  for update;
  if found then
    if v_existing.action_id <> (p_request->>'actionId')::uuid
       or v_existing.idempotency_key <> p_request->>'idempotencyKey' then
      raise exception 'reservation identity collision' using errcode = '23505';
    end if;
    return to_jsonb(v_existing);
  end if;

  if exists (
    select 1 from operator.operator_reservations
    where provider = (select provider from operator.operator_actions where action_id = (p_request->>'actionId')::uuid)
      and provider_account_id = (select provider_account_id from operator.operator_actions where action_id = (p_request->>'actionId')::uuid)
      and idempotency_key = p_request->>'idempotencyKey'
      and action_id <> (p_request->>'actionId')::uuid
  ) then
    raise exception 'idempotency key is bound to another logical action' using errcode = '23505';
  end if;

  if v_amount is not null and v_max is not null then
    select coalesce(sum(amount_minor), 0) into v_in_use
    from operator.operator_reservations
    where user_id = (p_request->>'userId')::uuid
      and mandate_id = (p_request->>'mandateId')::uuid
      and currency = v_currency
      and state <> 'refunded';
    if v_in_use + v_amount > v_max then
      raise exception 'atomic mandate budget exceeded' using errcode = 'P0001';
    end if;
  end if;

  insert into operator.operator_reservations(
    reservation_id, action_id, user_id, mandate_id, provider, provider_account_id,
    idempotency_key, amount_minor, currency, state, fencing_token, created_at
  )
  select
    (p_request->>'reservationId')::uuid,
    (p_request->>'actionId')::uuid,
    (p_request->>'userId')::uuid,
    (p_request->>'mandateId')::uuid,
    a.provider,
    a.provider_account_id,
    p_request->>'idempotencyKey',
    v_amount,
    v_currency,
    'reserved',
    (p_request->>'fencingToken')::bigint,
    (p_request->>'createdAt')::timestamptz
  from operator.operator_actions a
  where a.action_id = (p_request->>'actionId')::uuid
  returning * into v_row;

  if not found then raise exception 'operator action not found for reservation' using errcode = 'P0002'; end if;
  return to_jsonb(v_row);
end;
$$;

create or replace function operator.operator_transition_reservation(
  p_reservation_id uuid,
  p_fencing_token bigint,
  p_next_state text
) returns void
language plpgsql
security definer
set search_path = operator, pg_temp
as $$
declare
  v_row operator.operator_reservations%rowtype;
begin
  if p_next_state not in ('reserved','committed','refunded','reconciling') then
    raise exception 'invalid reservation state' using errcode = '22023';
  end if;
  select * into v_row from operator.operator_reservations
  where reservation_id = p_reservation_id for update;
  if not found then raise exception 'reservation not found' using errcode = 'P0002'; end if;
  if p_fencing_token < v_row.fencing_token then
    raise exception 'stale reservation fencing token' using errcode = '40001';
  end if;
  if v_row.state = 'refunded' and p_next_state <> 'refunded' then
    raise exception 'refunded reservation is terminal' using errcode = '23514';
  end if;
  if v_row.state = 'committed' and p_next_state = 'refunded' then
    raise exception 'committed reservation requires an explicit compensation or refund action' using errcode = '23514';
  end if;
  if v_row.state = 'committed' and p_next_state not in ('committed','reconciling') then
    raise exception 'invalid committed reservation transition' using errcode = '23514';
  end if;
  if v_row.state = 'reserved' and p_next_state not in ('reserved','committed','refunded','reconciling') then
    raise exception 'invalid reserved reservation transition' using errcode = '23514';
  end if;
  if v_row.state = 'reconciling' and p_next_state not in ('reconciling','committed','refunded') then
    raise exception 'invalid reconciling reservation transition' using errcode = '23514';
  end if;
  update operator.operator_reservations
  set state = p_next_state,
      fencing_token = greatest(fencing_token, p_fencing_token),
      updated_at = now()
  where reservation_id = p_reservation_id;
end;
$$;

create trigger operator_action_events_immutable
before update or delete on operator.operator_action_events
for each row execute function operator.reject_update_delete();
create trigger verification_observations_immutable
before update or delete on operator.verification_observations
for each row execute function operator.reject_update_delete();

alter table operator.operator_actions enable row level security;
alter table operator.operator_attempts enable row level security;
alter table operator.operator_action_events enable row level security;
alter table operator.verification_observations enable row level security;
alter table operator.compensation_attempts enable row level security;
alter table operator.operator_reservations enable row level security;
alter table operator.mission_outcomes enable row level security;
alter table operator.operator_outbox enable row level security;

create policy operator_actions_owner_select on operator.operator_actions
for select to authenticated using ((select auth.uid()) = user_id);
create policy mission_outcomes_owner_select on operator.mission_outcomes
for select to authenticated using ((select auth.uid()) = user_id);

revoke all on all tables in schema operator from anon, authenticated;
grant select on operator.operator_actions, operator.mission_outcomes to authenticated;
grant all on all tables in schema operator to service_role;
grant execute on function operator.operator_create_action(jsonb, jsonb, text, text) to service_role;
grant execute on function operator.operator_append_action_event(jsonb, bigint) to service_role;
grant execute on function operator.operator_reserve(jsonb) to service_role;
grant execute on function operator.operator_transition_reservation(uuid, bigint, text) to service_role;
