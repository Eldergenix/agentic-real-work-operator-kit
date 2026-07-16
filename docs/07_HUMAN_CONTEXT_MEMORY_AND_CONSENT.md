# Human Context, Memory Authority, Consent, and Erasure

## 1. Data planes

Operator Kit separates:

1. **Authoritative facts:** authenticated user statements and provider/device system-of-record facts.
2. **Observations:** potentially delayed, missing, stale, or permission-limited source events.
3. **Derived beliefs:** calibrated uncertain estimates for planning.
4. **Episodic history:** immutable action/context/outcome episodes.
5. **Procedural memory:** verified workflows and transition reliability.
6. **Quarantine:** suspicious, contradictory, low-integrity, or policy-violating writes.

A learned latent state is not an authority database.

## 2. Bitemporal observation model

Every source event/assertion supports:

```text
occurred_at
observed_at
ingested_at
valid_from
valid_to
revision
supersedes
source_latency
freshness_ttl
missingness_code
```

Missingness codes:

```text
not_observed
permission_denied
device_offline
provider_unavailable
not_applicable
source_not_connected
observation_delayed
redacted_by_policy
```

Absence of an observation is not evidence that an event did not occur.

## 3. Source integrity classes

| Source | Default integrity | Authority ceiling |
|---|---|---|
| authenticated user attestation | high | authoritative fact within stated scope |
| provider/device system of record | high | authoritative external fact |
| trusted deterministic system calculation | high/medium | calculation only |
| model extraction/summary | low/medium | planning hypothesis |
| external inbox, document, website, browser page | untrusted | content candidate only |
| repeated or corroborating untrusted sources | untrusted | unchanged without independent approved corroboration |

## 4. Memory classes

```text
authoritative_user_fact
authoritative_provider_fact
immutable_episode
derived_hypothesis
procedural_candidate
verified_procedure
run_local_working_memory
quarantine
```

Each persistent write has an immutable origin authority and authority ceiling.

### Non-malleability rule

```text
authority(transform(x)) <= authority(origin(x))
```

Summarization, compaction, model agreement, trusted-tool echo, retrieval frequency, or repeated attacker-controlled sources cannot raise authority.

## 5. Memory admission

A write receipt records:

- content hash and class;
- origin references and immutable origin authorities;
- transformation/model artifacts;
- writer identity;
- purpose and consent epoch;
- authority ceiling;
- corroboration/elevation receipt;
- expiry/retention;
- contradiction state;
- descendants for erasure.

### Required rules

- external content never becomes authoritative directly;
- compaction is a new memory write and retains origins;
- model-derived memory cannot fill protected action fields;
- relationship, identity, demographic, appearance, “favorite,” enemy, health, or private preference claims follow explicit registry policy;
- contact frequency/proximity alone cannot establish relationship or favorite;
- user correction outranks derived belief;
- contradictions remain visible until resolved;
- procedures require multiple verified trajectories and negative/failure evidence;
- suspicious writes enter quarantine and cannot influence committing plans.

## 6. Purpose-bound projection

For each mission, construct the minimum context projection:

```text
source allowed for this purpose?
→ observation fresh enough?
→ minimum resolution required?
→ raw value necessary or can a bounded feature be used?
→ can processing remain on device?
→ is model influence permitted?
```

Example: a calendar focus decision may need “sleep quality below personal baseline” rather than raw heart-rate/sleep samples.

## 7. Health and sensitive data

- raw HealthKit measurements remain device-local by default;
- only explicitly defined bounded features or outcome metadata leave the device;
- health purpose consent is separate from generic personalization;
- appointment scheduling, user-defined workout logging, reminders, and record routing are nonclinical actions only when they do not infer or alter clinical judgment;
- medication instructions must be user-attested or provider-verified and cannot be inferred or changed by Operator Kit;
- local erasure must include caches, embeddings, derived features, and queued commands.

## 8. Two-speed learning

### Live path

- append verified episodes;
- update bounded personal posterior/calibration state;
- update procedure reliability from mature observations;
- record model mismatch;
- quarantine anomalous writes;
- keep global neural weights frozen.

### Offline path

- consented exporter;
- data manifest and source lineage;
- forward user/time split;
- poisoning and leakage tests;
- model training and calibration;
- signed artifact and competency receipt;
- shadow/canary;
- rollback.

## 9. Erasure graph

Erasure must traverse:

```text
source records
→ observations/assertions
→ summaries/derived hypotheses
→ embeddings/index entries
→ graph edges
→ procedures/reliability
→ dataset manifests/examples
→ user adaptation state
→ model influence receipts where references must be tombstoned
→ cached client/device projections
```

Immutable action/accounting receipts may retain a minimal legally/operationally necessary redacted record under a declared retention basis. The system must distinguish deletion from cryptographic tombstoning/reference severing.

## 10. Consent epochs

Consent withdrawal increments the relevant epoch. No new action attempt, context projection, memory write, or training export may use an older epoch. Already-started external effects are reconciled honestly; withdrawal does not rewrite history.

## 11. Explainability

For each context-influenced action, Operator Kit can state:

- which bounded context categories influenced timing or choice;
- whether each was user-attested, provider-verified, or model-derived;
- source freshness;
- model artifact and support region;
- whether the action would have remained authorized without that context.

It does not expose raw sensitive values or hidden security policy internals.
