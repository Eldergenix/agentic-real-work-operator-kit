-- Agentic Real-Work Operator Kit: frozen intent, Plan IR, and causal provenance.
-- Apply only after review on a staging clone. This migration is additive.

create extension if not exists pgcrypto;
create schema if not exists operator;
revoke all on schema operator from public, anon, authenticated;
grant usage on schema operator to authenticated, service_role;

create table if not exists operator.goal_specs (
  goal_spec_id uuid primary key default gen_random_uuid(),
  goal_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  version integer not null check (version > 0),
  intent_epoch bigint not null check (intent_epoch >= 0),
  objective text not null,
  source_message_ids text[] not null check (cardinality(source_message_ids) > 0),
  terminal_predicates jsonb not null,
  forbidden_side_effects jsonb not null default '[]'::jsonb,
  authority_slots jsonb not null,
  unresolved_slots text[] not null default '{}',
  mandate_id uuid,
  policy_hash text not null check (policy_hash ~ '^[a-f0-9]{64}$'),
  consent_epoch text not null,
  valid_until timestamptz not null,
  canonical_hash text not null check (canonical_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  unique (goal_id, version),
  unique (user_id, canonical_hash)
);

create table if not exists operator.plan_irs (
  plan_id uuid not null,
  plan_version integer not null check (plan_version > 0),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  goal_spec_hash text not null check (goal_spec_hash ~ '^[a-f0-9]{64}$'),
  intent_epoch bigint not null check (intent_epoch >= 0),
  mandate_version integer not null check (mandate_version > 0),
  policy_hash text not null check (policy_hash ~ '^[a-f0-9]{64}$'),
  consent_epoch text not null,
  provenance_root_hash text not null check (provenance_root_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null,
  terminal_predicates jsonb not null,
  canonical_hash text not null check (canonical_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  primary key (plan_id, plan_version),
  unique (user_id, canonical_hash)
);

create table if not exists operator.plan_nodes (
  plan_id uuid not null,
  plan_version integer not null,
  node_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id uuid not null unique,
  canonical_action jsonb not null,
  action_hash text not null check (action_hash ~ '^[a-f0-9]{64}$'),
  protected_bindings jsonb not null default '[]'::jsonb,
  preconditions jsonb not null default '[]'::jsonb,
  postconditions jsonb not null,
  verification_ref text not null,
  compensation_ref text,
  point_of_no_return text,
  recovery_semantics text not null,
  max_attempts integer not null check (max_attempts > 0),
  created_at timestamptz not null default now(),
  primary key (plan_id, plan_version, node_id),
  foreign key (plan_id, plan_version)
    references operator.plan_irs(plan_id, plan_version)
    on delete cascade
);

create table if not exists operator.plan_edges (
  plan_id uuid not null,
  plan_version integer not null,
  from_node_id text not null,
  to_node_id text not null,
  condition text not null check (condition in ('on_verified','on_failed','on_uncertain','always')),
  primary key (plan_id, plan_version, from_node_id, to_node_id, condition),
  foreign key (plan_id, plan_version, from_node_id)
    references operator.plan_nodes(plan_id, plan_version, node_id)
    on delete cascade,
  foreign key (plan_id, plan_version, to_node_id)
    references operator.plan_nodes(plan_id, plan_version, node_id)
    on delete cascade
);

create table if not exists operator.provenance_nodes (
  provenance_node_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  node_key text not null,
  node_kind text not null,
  value_hash text not null check (value_hash ~ '^[a-f0-9]{64}$'),
  origin text not null,
  integrity text not null check (integrity in ('untrusted','low','medium','high')),
  sensitivity text not null,
  purposes text[] not null,
  authority_ceiling text not null check (
    authority_ceiling in ('none','display_only','preference_ranking','planning_only','authoritative_fact')
  ),
  occurred_at timestamptz,
  observed_at timestamptz not null,
  ingested_at timestamptz not null,
  origin_ref text not null,
  transformation_refs text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, node_key)
);

create table if not exists operator.provenance_edges (
  user_id uuid not null references auth.users(id) on delete cascade,
  from_node_id uuid not null references operator.provenance_nodes(provenance_node_id) on delete cascade,
  to_node_id uuid not null references operator.provenance_nodes(provenance_node_id) on delete cascade,
  transformation text not null,
  created_at timestamptz not null default now(),
  primary key (from_node_id, to_node_id, transformation),
  check (from_node_id <> to_node_id)
);

create or replace function operator.reject_update_delete()
returns trigger
language plpgsql
set search_path = operator, pg_temp
as $$
begin
  raise exception '% is append-only', tg_table_name using errcode = '55000';
end;
$$;

create trigger goal_specs_immutable
before update or delete on operator.goal_specs
for each row execute function operator.reject_update_delete();

create trigger plan_irs_immutable
before update or delete on operator.plan_irs
for each row execute function operator.reject_update_delete();

create trigger plan_nodes_immutable
before update or delete on operator.plan_nodes
for each row execute function operator.reject_update_delete();

create trigger provenance_nodes_immutable
before update or delete on operator.provenance_nodes
for each row execute function operator.reject_update_delete();

create trigger provenance_edges_immutable
before update or delete on operator.provenance_edges
for each row execute function operator.reject_update_delete();

alter table operator.goal_specs enable row level security;
alter table operator.plan_irs enable row level security;
alter table operator.plan_nodes enable row level security;
alter table operator.plan_edges enable row level security;
alter table operator.provenance_nodes enable row level security;
alter table operator.provenance_edges enable row level security;

create policy goal_specs_owner_select on operator.goal_specs
for select to authenticated using ((select auth.uid()) = user_id);
create policy plan_irs_owner_select on operator.plan_irs
for select to authenticated using ((select auth.uid()) = user_id);
create policy plan_nodes_owner_select on operator.plan_nodes
for select to authenticated using ((select auth.uid()) = user_id);
create policy plan_edges_owner_select on operator.plan_edges
for select to authenticated using (exists (
  select 1 from operator.plan_irs p
  where p.plan_id = plan_edges.plan_id
    and p.plan_version = plan_edges.plan_version
    and p.user_id = (select auth.uid())
));
create policy provenance_nodes_owner_select on operator.provenance_nodes
for select to authenticated using ((select auth.uid()) = user_id);
create policy provenance_edges_owner_select on operator.provenance_edges
for select to authenticated using ((select auth.uid()) = user_id);

revoke all on all tables in schema operator from anon, authenticated;
grant select on operator.goal_specs, operator.plan_irs, operator.plan_nodes,
  operator.plan_edges, operator.provenance_nodes, operator.provenance_edges to authenticated;
grant all on all tables in schema operator to service_role;
