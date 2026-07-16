# Official platform and provider documentation

**Review date:** 2026-07-16. Platform APIs, limits and configuration change. Retrieve and compile against current official documentation during implementation and release qualification.

## Cloudflare

- Workers best practices: https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
- Workers Service Bindings: https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/
- Workflows rules: https://developers.cloudflare.com/workflows/build/rules-of-workflows/
- Durable Objects documentation: https://developers.cloudflare.com/durable-objects/
- Durable Objects best practices: https://developers.cloudflare.com/durable-objects/best-practices/
- Wrangler configuration: https://developers.cloudflare.com/workers/wrangler/configuration/
- Hyperdrive: https://developers.cloudflare.com/hyperdrive/
- Workers observability: https://developers.cloudflare.com/workers/observability/

Implementation obligations:

- use private Service Bindings rather than a public operator route;
- treat Workflow steps as replayable;
- use Durable Objects for bounded coordination atoms, not global state;
- never hold `blockConcurrencyWhile` or a database transaction across provider I/O;
- generate current binding types with Wrangler;
- keep secrets out of source/config and use structured redacted telemetry.

## Supabase and PostgreSQL

- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Database migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Database functions: https://supabase.com/docs/guides/database/functions
- Realtime: https://supabase.com/docs/guides/realtime
- PostgreSQL transaction isolation: https://www.postgresql.org/docs/current/transaction-iso.html
- PostgreSQL row security policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

Implementation obligations:

- test RLS with authenticated users, not only a service role;
- use fixed `search_path` and minimal grants on `SECURITY DEFINER` functions;
- keep authority-mutating RPCs server-only;
- use an exact migration allowlist, staging clone, backup, rollback and drift proof.

## Google Calendar

- Events insert: https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
- Events get: https://developers.google.com/workspace/calendar/api/v3/reference/events/get
- Events update: https://developers.google.com/workspace/calendar/api/v3/reference/events/update
- Events delete: https://developers.google.com/workspace/calendar/api/v3/reference/events/delete
- Event resource: https://developers.google.com/workspace/calendar/api/v3/reference/events
- Incremental synchronization: https://developers.google.com/workspace/calendar/api/guides/sync
- Push notifications: https://developers.google.com/workspace/calendar/api/guides/push

Review event-ID rules, ETags, recurrence, notifications, OAuth scopes, time zones and eventual visibility before canarying.

## Apple device and HealthKit

- HealthKit: https://developer.apple.com/documentation/healthkit
- HKHealthStore: https://developer.apple.com/documentation/healthkit/hkhealthstore
- App Attest: https://developer.apple.com/documentation/devicecheck/establishing-your-app-s-integrity
- BackgroundTasks: https://developer.apple.com/documentation/backgroundtasks
- LocalAuthentication: https://developer.apple.com/documentation/localauthentication

Raw health data remains local unless a separate reviewed contract and consent authorize a bounded projection.

## Payments and consequential operations

- Stripe idempotent requests: https://docs.stripe.com/api/idempotent_requests
- Stripe webhooks: https://docs.stripe.com/webhooks
- PCI DSS: https://www.pcisecuritystandards.org/standards/pci-dss/

Authorization, capture, order, fulfillment, settlement, refund and chargeback must remain separate outcomes.

## Formal verification, provenance and security governance

- TLA+ official resources: https://lamport.azurewebsites.net/tla/tla.html
- SLSA provenance: https://slsa.dev/provenance/v1
- in-toto: https://in-toto.io/
- Sigstore Cosign: https://docs.sigstore.dev/cosign/
- NIST AI RMF: https://www.nist.gov/itl/ai-risk-management-framework
- NIST Generative AI Profile: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
- OWASP Top 10 for LLM Applications: https://owasp.org/www-project-top-10-for-large-language-model-applications/
- OpenTelemetry JavaScript: https://opentelemetry.io/docs/languages/js/
