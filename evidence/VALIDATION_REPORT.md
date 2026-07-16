# Local validation report

**Date:** 2026-07-16  
**Scope:** standalone implementation archive; no private Operator Kit repository, deployed Worker, production database, provider credential, TestFlight build, or customer data was available.

## Passed locally

- `npm ci` completed with zero reported npm audit vulnerabilities.
- Shared strict TypeScript typecheck passed.
- Cloudflare Worker typecheck passed against the packaged Worker types.
- Emitted TypeScript build passed.
- Vitest: **21 test files / 40 tests passed**.
- Runnable provider simulator: create, independent GET read-back, delete, and post-delete 404 passed.
- Effect registry validation passed for the fixture and Google Calendar reference contracts.
- Reference validation passed for **33 research sources and 29 related repositories**.
- Local documentation-link validation passed.
- Cross-runtime contract validation passed for **11 denial codes and 19 protected fields**.
- Package integrity, required-file, migration-set, private-Worker-boundary, secret-pattern, JSON, numbering, and append-only-memory checks passed.
- SwiftPM device validator compiled and **3 Swift tests passed**.

## Not executed in this environment

- Supabase/PostgreSQL migrations against Operator Kit's actual schema and major version.
- Multi-session database race, RLS/JWT-role, backup, rollback, and drift qualification.
- TLA+ model checking; packaged specifications are starter models.
- Real Google Workspace/Composio/AgentMail/AgentCard/Uber/browser/device/HealthKit/smart-home effects.
- Cloudflare deployment, binding/secret verification, or production fault injection.
- Expo app build, App Attest/Play Integrity, physical-device execution, TestFlight, or backend/client compatibility.
- Training or promotion of any learned model or policy.

The package therefore establishes a reproducible deterministic kernel and implementation contract, not production graduation.
