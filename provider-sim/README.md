# Provider fault simulator contract

Every committing adapter must pass deterministic fault scenarios before real-account canaries. The simulator is not promotion evidence; it proves that lifecycle, reservation, idempotency, verification and recovery code responds honestly.

The scenario catalog in `scenarios.yaml` is provider-neutral. An adapter-specific simulator must bind each scenario to concrete API calls, object identity, revision strategy, propagation windows, webhook behavior and maturity horizons.


## Runnable Google Calendar-shaped simulator

`calendar-server.mjs` provides a local Calendar-shaped create/get/delete system of record and supports controlled scenarios such as timeout before commit, timeout after commit, delayed visibility, duplicate conflict, read-back mismatch, transient failure, authentication expiry, and lingering deletion.

```sh
npm run sim:provider
npm run test:provider-sim
```

The smoke test proves local create, independent GET read-back, delete, and post-delete absence. It is control-flow evidence only and never substitutes for a dedicated Google Workspace test account.
