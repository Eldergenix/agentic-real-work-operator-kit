# Provider outage and ambiguous outcome

1. Freeze new effects for the affected provider/account/action families when the outage can produce ambiguity.
2. Keep read-only assistance available when safe.
3. Classify failures as proven-no-effect, unknown, authentication-required or rate-limited; do not collapse them into generic failure.
4. Persist the provider attempt and acknowledgement evidence before returning.
5. Move unknown outcomes to `uncertain`, reserve budgets/grants in reconciling state and schedule bounded polling/backoff.
6. Query the provider system of record using deterministic object identity/idempotency key before any retry.
7. For non-idempotent unattended-forbidden effects, never retry automatically.
8. Surface provider status and next reconciliation time without claiming success.
9. After recovery, verify version/semantic compatibility with a test account before re-enabling cohorts.
