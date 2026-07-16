-- Agentic Real-Work Operator Kit: bitemporal observations, origin-bound memory, decision opportunities and model influence.

create table if not exists operator.context_observations (
  observation_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_class text not null,
  source_ref text not null,
  purpose text not null,
  consent_epoch text not null,
  payload_class text not null,
  coarse_value jsonb,
  value_hash text not null check (value_hash ~ '^[a-f0-9]{64}$'),
  occurred_at timestamptz,
  observed_at timestamptz not null,
  ingested_at timestamptz not null default now(),
  valid_from timestamptz,
  valid_to timestamptz,
  revision text,
  supersedes_observation_id uuid references operator.context_observations(observation_id),
  source_latency_ms bigint,
  freshness_ttl_ms bigint,
  missingness_code text check (
    missingness_code is null or missingness_code in (
      'not_observed','permission_denied','device_offline','provider_unavailable',
      'not_applicable','source_not_connected','observation_delayed'
    )
  ),
  retention_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists operator.memory_items (
  memory_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_class text not null check (
    memory_class in (
      'authoritative_user_fact','authoritative_provider_fact','immutable_episode',
      'derived_hypothesis','procedural_memory','run_local_working_memory','quarantine'
    )
  ),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  encrypted_content_ref text,
  authority_ceiling text not null check (
    authority_ceiling in ('none','display_only','preference_ranking','planning_only','authoritative_fact')
  ),
  purposes text[] not null,
  consent_epoch text not null,
  contradiction_state text not null default 'none' check (
    contradiction_state in ('none','open','resolved')
  ),
  writer_identity text not null,
  model_artifact_id uuid,
  policy_hash text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists operator.memory_origins (
  memory_id uuid not null references operator.memory_items(memory_id) on delete cascade,
  origin_key text not null,
  principal_id text not null,
  trust_domain text not null,
  origin_authority text not null,
  origin_ref text not null,
  value_hash text not null check (value_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  primary key (memory_id, origin_key)
);

create table if not exists operator.memory_derivations (
  parent_memory_id uuid not null references operator.memory_items(memory_id) on delete cascade,
  child_memory_id uuid not null references operator.memory_items(memory_id) on delete cascade,
  transformation_ref text not null,
  created_at timestamptz not null default now(),
  primary key (parent_memory_id, child_memory_id, transformation_ref),
  check (parent_memory_id <> child_memory_id)
);

create table if not exists operator.memory_elevation_receipts (
  elevation_receipt_id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references operator.memory_items(memory_id) on delete cascade,
  method text not null check (
    method in ('authenticated_user_confirmation','independent_provider_corroboration')
  ),
  requested_authority text not null,
  independent_principals text[] not null,
  independent_trust_domains text[] not null,
  policy_hash text not null,
  expires_at timestamptz,
  signed_receipt jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists operator.decision_opportunities (
  decision_opportunity_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mandate_id uuid not null references operator.operator_mandates(mandate_id) on delete cascade,
  capability_cell_id uuid not null references operator.capability_cells(capability_cell_id) on delete cascade,
  context_regime text not null,
  eligible_candidates jsonb not null,
  selection_probabilities jsonb not null,
  selected_candidate_hash text,
  abstention_probability numeric not null check (abstention_probability between 0 and 1),
  support_action text,
  policy_artifact_id uuid,
  model_artifact_ids uuid[] not null default '{}',
  occurred_at timestamptz not null,
  outcome_matures_at timestamptz not null,
  outcome_status text not null default 'pending' check (
    outcome_status in ('pending','mature','censored','invalid')
  ),
  outcome jsonb,
  created_at timestamptz not null default now()
);

create table if not exists operator.model_artifacts (
  model_artifact_id uuid primary key default gen_random_uuid(),
  artifact_kind text not null,
  domain text not null,
  output_head text not null,
  capability_level text not null check (capability_level in ('L1','L2','L3')),
  artifact_hash text not null check (artifact_hash ~ '^[a-f0-9]{64}$'),
  dataset_manifest_hash text not null check (dataset_manifest_hash ~ '^[a-f0-9]{64}$'),
  evaluation_receipt jsonb not null,
  calibrated_support jsonb not null,
  maximum_horizon_ms bigint,
  status text not null check (status in ('candidate','shadow','canary','promoted','rejected','rolled_back')),
  signed_release_receipt jsonb,
  created_at timestamptz not null default now(),
  unique (artifact_hash)
);

create table if not exists operator.model_influence_receipts (
  influence_receipt_id uuid primary key default gen_random_uuid(),
  action_id uuid references operator.operator_actions(action_id) on delete set null,
  plan_id uuid not null,
  plan_version integer not null,
  model_artifact_id uuid not null references operator.model_artifacts(model_artifact_id),
  influence_kind text not null check (
    influence_kind in ('belief_update','prediction','candidate_generation','ranking','risk_veto','procedure_retrieval')
  ),
  input_projection_hash text not null check (input_projection_hash ~ '^[a-f0-9]{64}$'),
  output_hash text not null check (output_hash ~ '^[a-f0-9]{64}$'),
  uncertainty jsonb not null,
  support_region text not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists operator.world_model_mismatches (
  mismatch_id uuid primary key default gen_random_uuid(),
  model_artifact_id uuid references operator.model_artifacts(model_artifact_id),
  action_id uuid references operator.operator_actions(action_id),
  transition_family text not null,
  prediction_hash text not null,
  observation_hash text not null,
  prediction_error numeric,
  prediction_uncertainty numeric,
  mismatch_class text not null,
  proposed_rule_change jsonb,
  quarantine_status text not null default 'quarantined' check (
    quarantine_status in ('quarantined','test_proven','promoted','rejected')
  ),
  created_at timestamptz not null default now()
);

create trigger context_observations_immutable
before update or delete on operator.context_observations
for each row execute function operator.reject_update_delete();
create trigger memory_items_immutable
before update or delete on operator.memory_items
for each row execute function operator.reject_update_delete();
create trigger memory_origins_immutable
before update or delete on operator.memory_origins
for each row execute function operator.reject_update_delete();
create trigger memory_derivations_immutable
before update or delete on operator.memory_derivations
for each row execute function operator.reject_update_delete();
create trigger memory_elevation_receipts_immutable
before update or delete on operator.memory_elevation_receipts
for each row execute function operator.reject_update_delete();
create trigger model_influence_receipts_immutable
before update or delete on operator.model_influence_receipts
for each row execute function operator.reject_update_delete();

alter table operator.context_observations enable row level security;
alter table operator.memory_items enable row level security;
alter table operator.memory_origins enable row level security;
alter table operator.memory_derivations enable row level security;
alter table operator.memory_elevation_receipts enable row level security;
alter table operator.decision_opportunities enable row level security;
alter table operator.model_artifacts enable row level security;
alter table operator.model_influence_receipts enable row level security;
alter table operator.world_model_mismatches enable row level security;

create policy observations_owner_select on operator.context_observations
for select to authenticated using ((select auth.uid()) = user_id);
create policy memories_owner_select on operator.memory_items
for select to authenticated using ((select auth.uid()) = user_id);
create policy decisions_owner_select on operator.decision_opportunities
for select to authenticated using ((select auth.uid()) = user_id);

revoke all on all tables in schema operator from anon, authenticated;
grant select on operator.context_observations, operator.memory_items,
  operator.decision_opportunities to authenticated;
grant all on all tables in schema operator to service_role;
