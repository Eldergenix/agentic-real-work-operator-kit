# Cloudflare Integration Examples

These examples demonstrate the intended split. They are not wired to Operator Kit's repository and will require current Cloudflare types, generated `Env`, database access, signing keys, and provider adapters.

Before use:

```sh
npm install
npx wrangler types --config wrangler.operator.example.jsonc
```

Retrieve and review current Cloudflare Worker, Workflow, Durable Object, service-binding, and Wrangler documentation. Do not copy an old API signature without compiling against current types.

## Rules demonstrated

- private `WorkerEntrypoint` RPC rather than a public operator route;
- caller awaits service-binding RPC;
- per-action Durable Object for claim/fencing only;
- no provider/network I/O inside `blockConcurrencyWhile`;
- Workflow side effect inside a retry-aware `step.do`;
- credentials resolved only in the private operator Worker;
- authoritative lifecycle stored in Postgres, not only in the Workflow or DO.

The placeholder signature/database/provider functions intentionally throw. They must be replaced with reviewed implementations.
