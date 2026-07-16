# Cloudflare, Supabase/Postgres, and Deployment Design

## 1. Worker split

Recommended topology:

```text
mozi-router      public routing/auth/product API
mozi-chat        chat streaming and client-facing chat state
mozi-ai          planning/model/tool discovery, no provider credentials
mozi-operator    private WorkerEntrypoint, provider credentials and exact execution
```

`mozi-operator` has no public route. Callers use a service binding and await its RPC response. A user JWT alone cannot invoke an action.

## 2. Service-binding contract

The caller sends only:

```text
signed execution capability
action/attempt IDs
canonical action hash
minimal trace context
```

The operator Worker retrieves the canonical action and current authoritative state server-side. Do not trust a complete client/caller-supplied action payload when an authoritative row exists.

## 3. Cloudflare Worker rules

- use `wrangler.jsonc` and current compatibility date after repository review;
- run `wrangler types`; do not maintain drifting manual binding types;
- use service bindings rather than public HTTP for Worker-to-Worker calls;
- use Workflows/Queues for background work;
- use structured logging and observability sampling;
- never store request-scoped mutable state at module scope;
- every promise is awaited, returned, intentionally `void`ed, or passed to `ctx.waitUntil()`;
- use Web Crypto for IDs/nonces/signatures;
- no hard-coded secrets;
- stream unbounded payloads;
- use explicit error handling rather than fail-open passthrough.

## 4. Workflows

Every durable step must be replay-safe. External side effects occur inside a named `step.do` with stable idempotency. Keep steps granular enough that retries do not repeat unrelated work.

Workflow state outside a completed step is not assumed durable. Persist canonical plans and action state in Postgres.

Recommended step pattern:

```text
load current plan/node
→ certify current node
→ reserve and create attempt
→ execute broker RPC
→ verify/reconcile
→ evaluate mission
→ schedule next condition/horizon
```

## 5. Durable Objects

Use per coordination atom:

- logical action claim/fence;
- user/mandate budget partition where latency/serialization requires it;
- per-device command lease;
- per-provider webhook dedupe partition where justified.

Rules:

- deterministic `getByName` routing;
- SQLite storage and persisted state;
- constructor `blockConcurrencyWhile` only for initialization;
- no provider fetch/database network I/O while holding a concurrency block;
- no single global object;
- Postgres remains authoritative for action history.

## 6. Postgres access

Two reviewed approaches:

- direct Postgres through Cloudflare Hyperdrive for transactional server operations; or
- Supabase/PostgREST RPC for explicit atomic database functions over HTTPS.

Do not mix multiple uncoordinated writers. Whichever method is selected, authority-changing writes use narrowly scoped database functions/roles, idempotency keys, row locks or serializable semantics, and explicit audit events.

## 7. Supabase RLS

- owner can read own mandates/actions/receipts under RLS;
- user clients cannot insert authoritative lifecycle events or promotion receipts;
- server writer identity is separate from client-authored convenience data;
- append-only tables reject update/delete through triggers/privileges;
- service-role bypass is treated as a powerful secret and exists only in the private server environment;
- security-definer functions set a fixed `search_path`, validate ownership/arguments, and expose minimal operations.

The SQL directory contains additive templates. Review against existing migrations and never rewrite an applied migration.

## 8. Secrets and egress

- provider secrets exist only in `mozi-operator` or the current provider credential owner;
- `mozi-ai`, router, models, sandboxes, and clients do not receive them;
- egress allowlists/host policies are adapter-specific where feasible;
- bundle inspection asserts the AI/router artifacts do not contain operator-only secret names/modules;
- receipts and traces redact provider tokens, authorization headers, cookies, PAN/CVV, passwords, OTPs, and raw sensitive values.

## 9. Deployment order

```text
1. review/apply additive database migrations to staging clone
2. run RLS, atomicity, rollback, and drift checks
3. deploy private operator Worker and coordination classes
4. deploy AI/chat/router callers with service binding
5. verify all deploy refs and binding routes
6. run provider test-account canary
7. release compatible TestFlight build
8. verify installed client build/ref and backend compatibility
9. enable internal capability cells
10. expand cohort only after evidence gates
```

Never deploy only the public router when a schema/broker contract changes.

## 10. Feature flags

Flags limit cohort and rollback; they do not constitute completion. See [`implementation/FEATURE_FLAGS.yaml`](../planning/FEATURE_FLAGS.yaml).

High-level flags:

```text
operator_kernel_enabled
operator_broker_required
operator_calendar_private_enabled
operator_calendar_attendee_enabled
operator_communications_enabled
operator_browser_enabled
operator_device_enabled
operator_rides_enabled
operator_a5_*_enabled
operator_learned_ranker_enabled
operator_mpc_enabled
operator_dreamer_challenger_enabled
```

## 11. Migration release

The release script must:

- assert the expected project reference;
- list linked/applied/pending migrations;
- require an exact reviewed allowlist;
- reject unrelated pending migrations;
- run against a staging clone first;
- capture backup and rollback evidence;
- require an explicit production-apply argument;
- verify drift after apply.

## 12. Deployment parity receipt

Record:

```text
repository ref
migration set/hash
router/chat/AI/operator Worker refs
wrangler config/binding hash
secret-name set hash (not secret values)
model artifact/prompt/tool registry hashes
TestFlight build number and source ref
minimum compatible backend/client versions
provider adapter versions
```

## 13. Operational endpoints

Private/admin-authorized:

```text
/__deploy-version
/operator/health
/operator/registry-coverage
/operator/reconciliation-status
/operator/kill-switch-status
/operator/deployment-compatibility
```

Do not expose sensitive environment, policies, secrets, target identities, or open incident details through public health responses.
