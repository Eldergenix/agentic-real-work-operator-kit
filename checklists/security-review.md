# Security Review Checklist

- [ ] Threat model updated for action family.
- [ ] Trust boundaries and credential owners verified.
- [ ] Causal provenance backward slice covers every protected field.
- [ ] Denial responses do not leak hidden policy to untrusted/model context.
- [ ] Capability signature/audience/expiry/nonce/current epochs/fence validated.
- [ ] Canonicalization has cross-language test vectors.
- [ ] No hard-coded secrets or secret logging.
- [ ] Planner/router/AI bundles exclude operator secret names/modules.
- [ ] RLS and server-writer privileges are minimal.
- [ ] Security-definer functions use fixed search path and minimal grants.
- [ ] Cross-user, replay, target drift, budget race, and revocation race tests pass.
- [ ] Prompt injection and browser host/account spoofing tests pass.
- [ ] Memory sleeper/compaction/manufactured corroboration tests pass.
- [ ] Provider/verifier correlated-failure scenario passes.
- [ ] Supply-chain dependencies and model artifacts are pinned/reviewed.
- [ ] Kill/rotation/incident response runbook is current.
