/**
 * Checked-in review type only. Regenerate from the final Wrangler config in the
 * target repository with `npx wrangler types` and fail CI on drift.
 */
import type { OperatorLeaseCoordinator } from "./lease-coordinator.js";

declare global {
  interface Env {
    OPERATOR_LEASES: DurableObjectNamespace<OperatorLeaseCoordinator>;
    CREDENTIAL_OWNER: Fetcher;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    ACTION_CAPABILITY_SECRET: string;
    ACTION_CAPABILITY_ISSUER: string;
    ACTION_CAPABILITY_AUDIENCE: "mozi-operator";
    ENVIRONMENT: "development" | "staging" | "production";
  }
}

export {};
