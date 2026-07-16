# Database qualification tests

Run only against a disposable local Supabase database or staging clone after all four additive migrations are applied:

```sh
supabase db start
supabase test db supabase/tests/*.sql
```

## Included suites

- `001_schema_and_security_contract.sql` — required relations, RLS, server RPCs, fixed `search_path`, and dedicated-schema checks.
- `002_lifecycle_contract.sql` — lifecycle transition and verification-grade contracts.
- `003_rls_contract.sql` — RLS enablement and untrusted write-grant checks.
- `010_pgtap_schema_and_rls.sql` — pgTAP schema/RLS presence suite.
- `011_pgtap_lifecycle.sql` — pgTAP lifecycle and function suite.
- `012_pgtap_append_only_and_functions.sql` — immutable-ledger, privilege, and `SECURITY DEFINER` suite.
- `013_pgtap_budget_reservation.sql` — transactional budget idempotency and fencing suite.
- `020_operator_qualification_template.sql` — repository-specific concurrency, JWT-role, revocation, outbox, and erasure scenarios that must be converted to executable target-repository assertions.

Required execution identities are the dedicated server writer, authenticated owner, authenticated different user, anonymous client, and concurrent database sessions. Never run the budget or mutation suites against production.
