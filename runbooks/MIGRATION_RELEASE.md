# Migration release runbook

1. Confirm the linked Supabase project/ref and current migration list.
2. Copy package SQL into new target-repository timestamps; do not rewrite applied migrations.
3. Generate an exact reviewed allowlist.
4. Apply to a staging clone.
5. Run schema syntax, RLS, cross-user, atomic reservation, event append and rollback tests.
6. Inspect every `SECURITY DEFINER` function and fixed `search_path`.
7. Take the declared backup and record restore proof.
8. Apply only the allowlisted migrations in the approved window.
9. Run drift check and regenerate database types.
10. Record hashes, operator Worker ref and rollback decision.

Never run an unconditional linked `db push` over unrelated pending migrations.
