# Proposed Repository File Map

This map is additive and must be reconciled with actual existing owners.

```text
src/lib/operator/
├── goal-spec.ts
├── intent-compiler.server.ts
├── intent-epoch.ts
├── plan-ir.ts
├── provenance.ts
├── information-flow.ts
├── reference-monitor.ts
├── denial-result.ts
├── action-contract.ts
├── effect-registry.ts
├── verification.ts
├── recovery.ts
├── risk-guardian.ts
├── support-controller.ts
├── broker-client.server.ts
└── adapters/
    ├── google-calendar.ts
    ├── communications.ts
    ├── composio.ts
    ├── browser.ts
    ├── device.ts
    ├── smart-home.ts
    ├── rides.ts
    └── commerce.ts

src/lib/autonomy/
├── domains.ts
├── consequence.ts
├── capability.ts
├── mandate.ts
├── direct-command.server.ts
├── legacy-grant-compiler.server.ts
├── evidence.ts
├── promotion.ts
├── thresholds.ts
└── gate.ts

src/lib/memory/
├── authority.ts
├── admission.ts
├── quarantine.ts
├── contradictions.ts
└── write-receipt.ts

src/lib/human-context/v3/
├── bitemporal.ts
├── observation-process.ts
├── authoritative-state.ts
├── belief-state.ts
└── mission-projection.ts

src/lib/ahce/world-model/v3/
├── procedure-graph.ts
├── selective-foresight.ts
├── mismatch-ledger.ts
├── model-influence-receipt.ts
├── data-readiness.ts
├── tournament.ts
├── ranker.ts
├── mpc.ts
└── dreamer-challenger.ts

infra/cloudflare-app/operator/
├── index.ts
├── authorization.server.ts
├── reservation.server.ts
├── execute.server.ts
├── verify.server.ts
├── reconcile.server.ts
├── compensate.server.ts
├── saga.server.ts
└── action-coordinator.ts

supabase/migrations/
├── 20260715125000_operator_intent_and_plan.sql
├── 20260715130000_operator_mandates.sql
├── 20260715140000_operator_action_lifecycle.sql
└── 20260715150000_ahce_operator_ledger_v2.sql
```

## Existing files to modify narrowly

```text
src/lib/agent-goal/run-context.server.ts
src/lib/agent-goal/run-turn.ts
src/lib/agent-goal/workflow-core.ts
src/lib/agent-goal/types.ts
src/lib/agent-goal/action-ledger.ts
infra/cloudflare-app/user-goal-workflow.ts
src/lib/trust/grants.server.ts
src/lib/tools/execution-ledger.ts
src/lib/composio/server.ts
src/lib/composio/approvals.server.ts
src/lib/tools/tool-safety.ts
src/lib/tools/mission-tools.ts
src/lib/agent-goal/event-sources/dispatch-adapter.ts
src/lib/ahce/ledger/*
Operator/Workers/Agenda/Settings/chat receipt components
```
