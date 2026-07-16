# Security Threat Model

## 1. Security objectives

- preserve authenticated user intent through execution;
- prevent untrusted data from controlling protected fields;
- keep credentials outside planners/models/logs/ledgers;
- prevent replay, stale capabilities, duplicate effects, budget races, and legacy bypass;
- preserve revocation and kill-switch effectiveness;
- prevent persistent-memory authority laundering;
- prevent tool/provider/browser content from changing policy;
- provide auditability without storing forbidden raw data;
- fail honestly under uncertainty.

## 2. Assets

- provider OAuth tokens and service credentials;
- mandate/capability policy;
- direct-command/approval attestations;
- budgets and payment authority;
- private/sensitive context;
- canonical actions and targets;
- provider objects;
- verification and receipts;
- model artifacts and policy versions;
- memory authority/origin records;
- deployment and signing keys.

## 3. Adversaries and failure sources

- malicious external email/document/web page;
- compromised or deceptive provider response;
- prompt injection through browser or connectors;
- user-account attacker;
- malicious or buggy model output;
- poisoned persistent memory or procedure;
- stale/duplicated Workflow delivery;
- race between revoke and provider attempt;
- compromised legacy action path;
- supply-chain package or model artifact;
- insider/operator misuse;
- correlated verifier/executor defect;
- provider outage or API semantic drift.

## 4. Trust boundaries and mitigations

### Prompt/data injection

Mitigations:

- causal provenance graph;
- protected-field integrity requirements;
- typed Plan IR;
- model output cannot authorize;
- external data limited to bounded fields;
- browser DOM/page remains untrusted;
- reference monitor checks backward dependency slice;
- security benchmarks and adversarial fixtures.

### Intent substitution

- GoalSpec and source-message hashes;
- protected slot provenance;
- ambiguity resolution;
- intent epochs and semantic diff;
- capability bound to GoalSpec/Plan IR hash.

### Credential exposure

- private service-bound Worker;
- secrets only in operator environment;
- no secret fields in action contracts;
- bundle/secret-superset checks;
- structured redaction;
- egress tests;
- credential resolution immediately before attempt.

### Replay/stale execution

- short-lived signed capability;
- nonce claimed atomically;
- attempt fencing token;
- current intent/mandate/consent/connector/kill epochs;
- stable logical idempotency key;
- adapter-specific duplicate strategy.

### Budget race/double spend

- serializable/row-locked atomic reservation;
- separate reserved/committed/refunded/reconciling amounts;
- capability bound to reservation/fence;
- uniqueness constraints;
- concurrent property tests.

### Provider ambiguity

- explicit `uncertain` state;
- independent read-back;
- no blind retry;
- maturity and propagation horizons;
- provider fault simulator;
- reconciler.

### Verifier corruption

- verifier identity and grade;
- separate credentials/path where possible;
- provider revision and freshness;
- cross-source corroboration for high consequence;
- no learned-only verifier;
- correlated-failure drills.

### Persistent-memory poisoning

- immutable origin authority;
- no authority increase through transformation;
- quarantine;
- contradiction state;
- source-independent corroboration;
- compaction treated as write;
- procedure graduation;
- erasure graph;
- sleeper/delayed attack tests.

### Denial-policy leakage

- planner-safe denial code;
- richer explanation only to authenticated user;
- internal policy trace isolated;
- denial recorded in causal graph;
- no hidden policy text injected into future model context.

### Legacy bypass

- action-family ownership inventory;
- CI scans/admission registry;
- hard-disable parallel commit paths before graduation;
- broker is the sole authority owner;
- legacy grants compile into capability cells only.

### Supply chain

- lockfiles and provenance;
- dependency/license review;
- signed model artifacts and hashes;
- SBOM;
- secret scanning;
- pinned deployment refs;
- prompt/tool/model registry hashes;
- canary and rollback.

## 5. Cryptographic requirements

- use Web Crypto/approved cryptographic libraries;
- cryptographically secure nonces/UUIDs;
- versioned canonicalization and test vectors;
- rotating signing keys with `kid`;
- constant-time verification where applicable;
- HMAC/hash target identities with scoped salts when raw target retention is unnecessary;
- encrypt provider credentials at rest through provider/platform owners;
- do not invent custom encryption protocols.

## 6. Information classification

| Class | Examples | Handling |
|---|---|---|
| Secret | OAuth tokens, service keys, PAN/CVV, passwords, OTP | operator/provider vault only; never model/ledger/log |
| Highly sensitive | raw health, identity verification, private messages | local/minimum-purpose; strict consent and retention |
| Sensitive | relationships, location, financial outcomes | purpose-bound, redacted, limited projections |
| Operational | action IDs, states, hashes, adapter versions | structured logs with retention controls |
| Public | published provider object already public | still target/audience governed; propagation acknowledged |

## 7. Security test suites

- prompt injection and tool poisoning;
- tainted target/amount/audience;
- memory sleeper and compaction attacks;
- capability replay/tampering;
- key rotation/stale `kid`;
- cross-user RLS;
- revoke-between-sign-and-claim;
- stale intent and policy;
- duplicate and out-of-order Workflow/provider events;
- exfiltration through denial and error messages;
- credential grep/bundle inspection;
- browser host/account spoofing;
- provider/verifier correlated bug;
- high-consequence UI comprehension.

## 8. Incident severity

- **SEV-0:** active credential compromise, unauthorized high-consequence/public/physical action, widespread policy bypass.
- **SEV-1:** wrong target, cap/purpose violation, duplicate accepted financial/public effect, verifier false positive, sensitive data exposure.
- **SEV-2:** unresolved high-consequence outcome, compensation failure, provider semantic drift, contained unauthorized low-consequence attempt.
- **SEV-3:** degraded planner/model/UX without policy or effect integrity loss.

SEV-0/1 automatically invokes global/domain/capability kill switches, evidence-epoch closure, cohort demotion, credential rotation where indicated, and incident preservation.
