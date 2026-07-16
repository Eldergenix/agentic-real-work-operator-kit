# Rollback runbook

Rollback may disable new action admission, revert planner/model influence, or deploy a previous broker/adapter. It must not erase or rewrite actions already attempted.

- activate domain/action-family kill switch;
- stop new capabilities and schedules;
- preserve reconciliation workers for ambiguous effects;
- deploy compatible previous Worker refs;
- verify database backward compatibility;
- verify installed client behavior under disabled feature;
- reconcile/compensate in-flight actions;
- record rollback receipt and evidence-epoch closure.
