# Provider Adapter Graduation Checklist

## Contract

- [ ] Action family and adapter version are registered.
- [ ] Canonical schema and cross-runtime test vectors exist.
- [ ] Protected fields and permitted provenance are explicit.
- [ ] Target/account/provider normalization is deterministic.
- [ ] Consequence vector and maximum tier are reviewed.
- [ ] Idempotency class is truthful.
- [ ] Provider object identity/revision strategy is defined.
- [ ] Verification grade, source, freshness, propagation, and maturity are defined.
- [ ] Reconciliation strategy covers timeout-after-commit.
- [ ] Recovery semantics and point of no return are truthful.
- [ ] Receipt redaction and retention are reviewed.
- [ ] Mission predicate templates are separate from effect predicates.

## Security and authority

- [ ] Broker is sole runtime authority for graduated family.
- [ ] All legacy/parallel commit paths are routed or hard-disabled.
- [ ] Planner/model/browser never receives provider credentials.
- [ ] External content cannot fill protected fields.
- [ ] Current intent/mandate/consent/connector/kill epochs are rechecked.
- [ ] Capability replay, stale fence, wrong user, and wrong target fail.
- [ ] Prohibited categories/clinical/credential ceilings are enforced.

## Reliability

- [ ] Provider simulator covers pre/post-commit timeout, duplicate, stale revision, delayed read-back, out-of-order webhook, revocation, API drift, and recovery failure.
- [ ] Concurrent reservation/idempotency tests pass.
- [ ] Unknown non-idempotent effects do not retry unattended.
- [ ] Independent read-back is proven in a real test account/device.
- [ ] Recovery/permanent boundary is exercised.
- [ ] Real UI renders acknowledgement, verification, mission outcome, and recovery separately.

## Production

- [ ] Migration/RLS/drift proof.
- [ ] Worker binding/secret/ref proof.
- [ ] TestFlight/client compatibility proof.
- [ ] Kill/revoke/provider-outage/rollback drill.
- [ ] Critical strata/live counts/sequential bounds pass.
- [ ] No open severe incident or unresolved high-consequence action.
- [ ] Signed graduation receipt created for exact capability cells.
