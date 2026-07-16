# Formal-model starter set

These TLA+ modules are deliberately small review models, not a claim that the production system is proven. Extend them with the exact Operator Kit state space, then run TLC in CI for bounded configurations.

Required invariants: no false verification, no stale-epoch start, at-most-one accepted effect under the adapter idempotency model, no budget overrun, no stale intent execution, and no compensation success without a matching observation.
