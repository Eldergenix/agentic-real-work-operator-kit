# Private Cloudflare operator Worker

This Worker is designed to have **no public route**. Router/AI Workers call the exported `OperatorBroker` RPC entrypoint through a Service Binding. Network isolation is not authorization: every RPC still carries a short-lived signed action capability and is rechecked against current server state.

## Required production steps

1. Install the current Wrangler and Workers types in the Operator Kit repository.
2. Run `npx wrangler types` and use the generated `Env`; do not maintain a handwritten binding type.
3. Configure secrets with `wrangler secret put`; never place connector credentials in `wrangler.jsonc`.
4. Add a Hyperdrive binding or an internal authority-store Service Binding for Postgres access. Do not call the Cloudflare management REST API from the Worker.
5. Add a credential-vault binding whose API releases a credential only after exact authorization.
6. Deploy `mozi-operator` before callers that bind to it.
7. Keep `workers_dev=false` and do not configure a route.
8. Enable structured logs/traces, but redact action arguments, credentials, protected health data, and raw external content.

The Durable Object coordinates only short claims and fencing tokens. It never holds `blockConcurrencyWhile` or a storage transaction across provider network I/O.
