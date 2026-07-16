-- Agentic Real-Work Operator Kit: mandates, capability lattice, single-use authority,
-- atomic budgets, promotion state, incidents, and kill switches.
-- Apply only after review on a staging clone. This migration is additive.

create table if not exists operator.operator_mandates (
  mandate_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  version integer not null check (version > 0),
  status text not null check (status in ('active','paused','revoked','expired')),
  automatic_promotion boolean not null default true,
  maximum_autonomy_envelope jsonb not null,
  human_summary text not null,
  canonical_policy jsonb not null,
  policy_hash text not null check (policy_hash ~ '^[a-f0-9]{64}$'),
  consent_epoch text not null,
  kill_switch_epoch bigint not null default 0 check (kill_switch_epoch >= 0),
  valid_from timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  supersedes_mandate_id uuid references operator.operator_mandates(mandate_id),
  unique (user_id, mandate_id, version),
  check (expires_at > valid_from)
);

create table if not exists operator.capability_cells (
  capability_cell_id uuid primary key default gen_random_uuid(),
  mandate_id uuid not null references operator.operator_mandates(mandate_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  mandate_version integer not null check (mandate_version > 0),
  product_tier text not null check (product_tier in ('A0','A1','A2','A3','A4','A5')),
  domain text not null,
  action_family text not null,
  provider text not null,
  provider_account_id text not null,
  target_type text not null,
  exact_target_ids text[] not null,
  target_policy jsonb not null default '{}'::jsonb,
  purpose text not null,
  consequence_ceiling jsonb not null,
  amount_ceiling_minor bigint,
  amount_currency text,
  minimum_verification_grade text not null check (minimum_verification_grade in ('V0','V1','V2','V3','V4')),
  allowed_idempotency_classes text[] not null,
  time_policy jsonb not null default '{}'::jsonb,
  support_preferences jsonb not null default '{}'::jsonb,
  evidence_epoch text not null,
  policy_hash text not null check (policy_hash ~ '^[a-f0-9]{64}$'),
  valid_from timestamptz not null,
  expires_at timestamptz not null,
  demoted_at timestamptz,
  created_at timestamptz not null default now(),
  check ((amount_ceiling_minor is null) = (amount_currency is null)),
  check (amount_ceiling_minor is null or amount_ceiling_minor >= 0),
  check (expires_at > valid_from)
);

create table if not exists operator.operator_authorizations (
  authorization_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('direct_command','recorded_approval')),
  conversation_id text,
  source_message_id text,
  action_hash text not null check (action_hash ~ '^[a-f0-9]{64}$'),
  target_hash text not null check (target_hash ~ '^[a-f0-9]{64}$'),
  policy_hash text not null check (policy_hash ~ '^[a-f0-9]{64}$'),
  nonce_hash text not null check (nonce_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  consumed_by_action_id uuid,
  created_at timestamptz not null default now(),
  unique (nonce_hash)
);

create table if not exists operator.operator_kill_switches (
  scope_type text not null check (scope_type in ('global','user','mandate','domain','action_family')),
  scope_id text not null,
  active boolean not null,
  epoch bigint not null check (epoch >= 0),
  reason text,
  changed_by uuid,
  changed_at timestamptz not null default now(),
  primary key (scope_type, scope_id)
);

create table if not exists operator.operator_budget_accounts (
  budget_account_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mandate_id uuid not null references operator.operator_mandates(mandate_id) on delete cascade,
  scope_key text not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  limit_minor bigint not null check (limit_minor >= 0),
  committed_minor bigint not null default 0 check (committed_minor >= 0),
  reserved_minor bigint not null default 0 check (reserved_minor >= 0),
  reset_at timestamptz,
  version bigint not null default 0,
  unique (mandate_id, scope_key, currency),
  check (committed_minor + reserved_minor <= limit_minor)
);

create table if not exists operator.operator_budget_reservations (
  reservation_id uuid primary key default gen_random_uuid(),
  budget_account_id uuid not null references operator.operator_budget_accounts(budget_account_id) on delete cascade,
  action_id uuid not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  state text not null check (state in ('reserved','reconciling','committed','refunded')),
  fencing_token bigint not null check (fencing_token > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (action_id, budget_account_id)
);

create table if not exists operator.autonomy_domain_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  capability_cell_id uuid not null references operator.capability_cells(capability_cell_id) on delete cascade,
  current_tier text not null check (current_tier in ('A0','A1','A2','A3','A4','A5')),
  state text not null check (state in ('learning','eligible','promoted','frozen','demoted','re_earning')),
  evidence_epoch text not null,
  last_evaluated_at timestamptz,
  next_evaluation_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, capability_cell_id)
);

create table if not exists operator.autonomy_promotion_receipts (
  promotion_receipt_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mandate_id uuid not null references operator.operator_mandates(mandate_id) on delete cascade,
  capability_cell_id uuid not null references operator.capability_cells(capability_cell_id) on delete cascade,
  from_tier text not null,
  to_tier text not null,
  decision text not null check (decision in ('promote','hold','demote','freeze','re_promote')),
  evidence_epoch text not null,
  policy_version text not null,
  policy_hash text not null check (policy_hash ~ '^[a-f0-9]{64}$'),
  effect_reliability_evidence jsonb not null,
  decision_appropriateness_evidence jsonb not null,
  sequential_test_receipt jsonb not null,
  signed_receipt jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists operator.autonomy_incidents (
  incident_id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  mandate_id uuid references operator.operator_mandates(mandate_id) on delete set null,
  capability_cell_id uuid references operator.capability_cells(capability_cell_id) on delete set null,
  action_id uuid,
  severity text not null check (severity in ('low','medium','high','severe')),
  invariant_code text not null,
  status text not null check (status in ('open','contained','resolved','false_positive')),
  redacted_summary text not null,
  evidence jsonb not null default '{}'::jsonb,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  evidence_epoch_closed boolean not null default false
);

create index if not exists capability_cells_gate_idx
  on operator.capability_cells(user_id, mandate_id, domain, action_family, provider, provider_account_id, expires_at)
  where demoted_at is null;
create index if not exists operator_authorizations_unconsumed_idx
  on operator.operator_authorizations(user_id, expires_at)
  where consumed_at is null;
create index if not exists autonomy_incidents_open_idx
  on operator.autonomy_incidents(capability_cell_id, severity)
  where status in ('open','contained');

create or replace function operator.reserve_budget(
  p_budget_account_id uuid,
  p_action_id uuid,
  p_amount_minor bigint,
  p_currency text,
  p_fencing_token bigint
) returns uuid
language plpgsql
security definer
set search_path = operator, pg_temp
as $$
declare
  v_account operator.operator_budget_accounts%rowtype;
  v_existing operator.operator_budget_reservations%rowtype;
  v_reservation_id uuid;
begin
  if p_amount_minor < 0 or p_fencing_token <= 0 then
    raise exception 'invalid reservation arguments' using errcode = '22023';
  end if;

  select * into v_account
  from operator.operator_budget_accounts
  where budget_account_id = p_budget_account_id
  for update;

  if not found then
    raise exception 'budget account not found' using errcode = 'P0002';
  end if;
  if v_account.currency <> p_currency then
    raise exception 'currency mismatch' using errcode = '22023';
  end if;

  select * into v_existing
  from operator.operator_budget_reservations
  where action_id = p_action_id and budget_account_id = p_budget_account_id
  for update;

  if found then
    if v_existing.amount_minor <> p_amount_minor or v_existing.currency <> p_currency then
      raise exception 'idempotency conflict for budget reservation' using errcode = '23505';
    end if;
    if p_fencing_token < v_existing.fencing_token then
      raise exception 'stale reservation fencing token' using errcode = '40001';
    end if;
    update operator.operator_budget_reservations
    set fencing_token = greatest(fencing_token, p_fencing_token), updated_at = now()
    where reservation_id = v_existing.reservation_id;
    return v_existing.reservation_id;
  end if;

  if v_account.committed_minor + v_account.reserved_minor + p_amount_minor > v_account.limit_minor then
    raise exception 'budget exhausted' using errcode = 'P0001';
  end if;

  insert into operator.operator_budget_reservations(
    budget_account_id, action_id, amount_minor, currency, state, fencing_token
  ) values (
    p_budget_account_id, p_action_id, p_amount_minor, p_currency, 'reserved', p_fencing_token
  ) returning reservation_id into v_reservation_id;

  update operator.operator_budget_accounts
  set reserved_minor = reserved_minor + p_amount_minor, version = version + 1
  where budget_account_id = p_budget_account_id;

  return v_reservation_id;
end;
$$;

create or replace function operator.mark_budget_reservation_reconciling(
  p_reservation_id uuid,
  p_fencing_token bigint
) returns text
language plpgsql
security definer
set search_path = operator, pg_temp
as $$
declare
  v_reservation operator.operator_budget_reservations%rowtype;
begin
  select * into v_reservation from operator.operator_budget_reservations
  where reservation_id = p_reservation_id for update;
  if not found then raise exception 'budget reservation not found' using errcode = 'P0002'; end if;
  if p_fencing_token < v_reservation.fencing_token then
    raise exception 'stale reservation fencing token' using errcode = '40001';
  end if;
  if v_reservation.state in ('committed','refunded') then
    return v_reservation.state;
  end if;
  update operator.operator_budget_reservations
  set state = 'reconciling', fencing_token = greatest(fencing_token, p_fencing_token), updated_at = now()
  where reservation_id = p_reservation_id;
  return 'reconciling';
end;
$$;

create or replace function operator.commit_budget_reservation(
  p_reservation_id uuid,
  p_fencing_token bigint
) returns text
language plpgsql
security definer
set search_path = operator, pg_temp
as $$
declare
  v_account_id uuid;
  v_reservation operator.operator_budget_reservations%rowtype;
begin
  select budget_account_id into v_account_id
  from operator.operator_budget_reservations where reservation_id = p_reservation_id;
  if v_account_id is null then raise exception 'budget reservation not found' using errcode = 'P0002'; end if;

  perform 1 from operator.operator_budget_accounts where budget_account_id = v_account_id for update;
  select * into v_reservation from operator.operator_budget_reservations
  where reservation_id = p_reservation_id for update;

  if p_fencing_token < v_reservation.fencing_token then
    raise exception 'stale reservation fencing token' using errcode = '40001';
  end if;
  if v_reservation.state = 'committed' then return 'committed'; end if;
  if v_reservation.state not in ('reserved','reconciling') then
    raise exception 'reservation cannot commit from state %', v_reservation.state using errcode = '23514';
  end if;

  update operator.operator_budget_accounts
  set reserved_minor = reserved_minor - v_reservation.amount_minor,
      committed_minor = committed_minor + v_reservation.amount_minor,
      version = version + 1
  where budget_account_id = v_reservation.budget_account_id;

  update operator.operator_budget_reservations
  set state = 'committed', fencing_token = greatest(fencing_token, p_fencing_token), updated_at = now()
  where reservation_id = p_reservation_id;
  return 'committed';
end;
$$;

create or replace function operator.refund_budget_reservation(
  p_reservation_id uuid,
  p_fencing_token bigint
) returns text
language plpgsql
security definer
set search_path = operator, pg_temp
as $$
declare
  v_account_id uuid;
  v_reservation operator.operator_budget_reservations%rowtype;
begin
  select budget_account_id into v_account_id
  from operator.operator_budget_reservations where reservation_id = p_reservation_id;
  if v_account_id is null then raise exception 'budget reservation not found' using errcode = 'P0002'; end if;

  perform 1 from operator.operator_budget_accounts where budget_account_id = v_account_id for update;
  select * into v_reservation from operator.operator_budget_reservations
  where reservation_id = p_reservation_id for update;

  if p_fencing_token < v_reservation.fencing_token then
    raise exception 'stale reservation fencing token' using errcode = '40001';
  end if;
  if v_reservation.state = 'refunded' then return 'refunded'; end if;
  if v_reservation.state not in ('reserved','reconciling','committed') then
    raise exception 'reservation cannot refund from state %', v_reservation.state using errcode = '23514';
  end if;

  update operator.operator_budget_accounts
  set reserved_minor = reserved_minor - case when v_reservation.state in ('reserved','reconciling') then v_reservation.amount_minor else 0 end,
      committed_minor = committed_minor - case when v_reservation.state = 'committed' then v_reservation.amount_minor else 0 end,
      version = version + 1
  where budget_account_id = v_reservation.budget_account_id;

  update operator.operator_budget_reservations
  set state = 'refunded', fencing_token = greatest(fencing_token, p_fencing_token), updated_at = now()
  where reservation_id = p_reservation_id;
  return 'refunded';
end;
$$;

create or replace function operator.consume_authorization(
  p_authorization_id uuid,
  p_user_id uuid,
  p_action_id uuid,
  p_action_hash text,
  p_target_hash text,
  p_policy_hash text
) returns timestamptz
language plpgsql
security definer
set search_path = operator, pg_temp
as $$
declare
  v_consumed_at timestamptz;
begin
  update operator.operator_authorizations
  set consumed_at = now(), consumed_by_action_id = p_action_id
  where authorization_id = p_authorization_id
    and user_id = p_user_id
    and action_hash = p_action_hash
    and target_hash = p_target_hash
    and policy_hash = p_policy_hash
    and consumed_at is null
    and expires_at > now()
  returning consumed_at into v_consumed_at;

  if v_consumed_at is null then
    raise exception 'authorization unavailable, mismatched, expired, or already consumed' using errcode = '42501';
  end if;
  return v_consumed_at;
end;
$$;

create or replace function operator.revoke_mandate(p_mandate_id uuid)
returns bigint
language plpgsql
security definer
set search_path = operator, auth, pg_temp
as $$
declare
  v_epoch bigint;
begin
  update operator.operator_mandates
  set status = 'revoked', kill_switch_epoch = kill_switch_epoch + 1
  where mandate_id = p_mandate_id
    and (user_id = (select auth.uid()) or (select auth.role()) = 'service_role')
  returning kill_switch_epoch into v_epoch;

  if v_epoch is null then
    raise exception 'mandate not found or not owned by caller' using errcode = '42501';
  end if;

  update operator.capability_cells
  set demoted_at = coalesce(demoted_at, now())
  where mandate_id = p_mandate_id;
  return v_epoch;
end;
$$;

create trigger autonomy_promotion_receipts_immutable
before update or delete on operator.autonomy_promotion_receipts
for each row execute function operator.reject_update_delete();

alter table operator.operator_mandates enable row level security;
alter table operator.capability_cells enable row level security;
alter table operator.operator_authorizations enable row level security;
alter table operator.operator_kill_switches enable row level security;
alter table operator.operator_budget_accounts enable row level security;
alter table operator.operator_budget_reservations enable row level security;
alter table operator.autonomy_domain_state enable row level security;
alter table operator.autonomy_promotion_receipts enable row level security;
alter table operator.autonomy_incidents enable row level security;

create policy mandates_owner_select on operator.operator_mandates
for select to authenticated using ((select auth.uid()) = user_id);
create policy capabilities_owner_select on operator.capability_cells
for select to authenticated using ((select auth.uid()) = user_id);
create policy budget_accounts_owner_select on operator.operator_budget_accounts
for select to authenticated using ((select auth.uid()) = user_id);
create policy autonomy_state_owner_select on operator.autonomy_domain_state
for select to authenticated using ((select auth.uid()) = user_id);
create policy promotion_owner_select on operator.autonomy_promotion_receipts
for select to authenticated using ((select auth.uid()) = user_id);
create policy incidents_owner_select on operator.autonomy_incidents
for select to authenticated using ((select auth.uid()) = user_id);

revoke all on all tables in schema operator from anon, authenticated;
grant select on operator.operator_mandates, operator.capability_cells,
  operator.operator_budget_accounts, operator.autonomy_domain_state,
  operator.autonomy_promotion_receipts, operator.autonomy_incidents to authenticated;
grant all on all tables in schema operator to service_role;
grant execute on function operator.reserve_budget(uuid, uuid, bigint, text, bigint) to service_role;
grant execute on function operator.mark_budget_reservation_reconciling(uuid, bigint) to service_role;
grant execute on function operator.commit_budget_reservation(uuid, bigint) to service_role;
grant execute on function operator.refund_budget_reservation(uuid, bigint) to service_role;
grant execute on function operator.consume_authorization(uuid, uuid, uuid, text, text, text) to service_role;
grant execute on function operator.revoke_mandate(uuid) to authenticated, service_role;
