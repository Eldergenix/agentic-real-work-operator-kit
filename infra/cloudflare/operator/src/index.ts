import { WorkerEntrypoint } from "cloudflare:workers";
import { hashAction } from "../../../../src/lib/operator/action-hash.js";
import {
  verifyBrokerCapability,
  type BrokerCapability,
} from "../../../../src/lib/operator/broker-capability.js";
import { OperatorBroker as CoreOperatorBroker } from "../../../../src/lib/operator/broker.js";
import { canonicalHash, sha256Hex } from "../../../../src/lib/operator/canonical.js";
import { EffectRegistry } from "../../../../src/lib/operator/effect-registry.js";
import {
  JsonValueSchema,
  type JsonValue,
} from "../../../../src/lib/operator/schemas.js";
import { GoogleCalendarCreateAdapter } from "../../../../src/lib/operator/adapters/google-calendar.js";
import { SupabaseAuthorityLoader } from "./authority-loader.js";
import { CredentialOwnerGoogleTokenProvider } from "./credential-token-provider.js";
import { OperatorLeaseCoordinator } from "./lease-coordinator.js";
import {
  OperatorRpcEnvelopeSchema,
  decodeRequest,
  type OperatorRpcEnvelope,
} from "./rpc-schema.js";
import { SupabaseOperatorRepository } from "./supabase-repository.js";

export { OperatorLeaseCoordinator };

export type OperatorRpcResult = {
  status: string;
  actionId: string;
  sequence: number;
  fencingToken: string;
  effectOccurred: boolean | "unknown";
  missionEvaluationRequired: boolean;
  providerObjectId?: string;
};

export type OperatorRpcDenied = {
  status: "denied";
  code: string;
};

type PreparedExecution = {
  envelope: OperatorRpcEnvelope;
  capability: BrokerCapability;
  broker: CoreOperatorBroker;
  request: ReturnType<typeof decodeRequest>;
};

/**
 * Private, credential-isolated action Worker.
 *
 * It is intentionally exposed only as a WorkerEntrypoint for Service Binding
 * RPC. Every invocation still requires a short-lived exact capability, a
 * single-use nonce, an increasing fencing token, and a fresh server-side
 * authority reload. Network isolation is never treated as authorization.
 */
export class OperatorBroker extends WorkerEntrypoint<Env> {
  async execute(input: unknown): Promise<OperatorRpcResult | OperatorRpcDenied> {
    return this.run("execute", input);
  }

  async reconcile(input: unknown): Promise<OperatorRpcResult | OperatorRpcDenied> {
    return this.run("reconcile", input);
  }

  async compensate(input: unknown): Promise<OperatorRpcResult | OperatorRpcDenied> {
    return this.run("compensate", input);
  }

  private async run(
    operation: "execute" | "reconcile" | "compensate",
    input: unknown,
  ): Promise<OperatorRpcResult | OperatorRpcDenied> {
    try {
      const prepared = await this.prepare(input);
      const result =
        operation === "execute"
          ? await prepared.broker.execute(prepared.request)
          : operation === "reconcile"
            ? await prepared.broker.reconcile(prepared.request)
            : await prepared.broker.compensate(
                prepared.request,
                prepared.envelope.preState === undefined
                  ? undefined
                  : JsonValueSchema.parse(prepared.envelope.preState),
              );

      return {
        status: result.aggregate.status,
        actionId: result.aggregate.actionId,
        sequence: result.aggregate.sequence,
        fencingToken: result.aggregate.fencingToken.toString(),
        effectOccurred: result.effectOccurred,
        missionEvaluationRequired: result.missionEvaluationRequired,
        ...(result.aggregate.providerObjectId === undefined
          ? {}
          : { providerObjectId: result.aggregate.providerObjectId }),
      };
    } catch (error) {
      const safeCode = classifyError(error);
      console.error(
        JSON.stringify({
          event: "operator_rpc_denied_or_failed",
          operation,
          code: safeCode,
          errorName: error instanceof Error ? error.name : "UnknownError",
        }),
      );
      return { status: "denied", code: safeCode };
    }
  }

  private async prepare(input: unknown): Promise<PreparedExecution> {
    assertEnv(this.env);
    const envelope = OperatorRpcEnvelopeSchema.parse(input);
    const now = new Date();
    const capability = await verifyBrokerCapability(
      envelope.capabilityToken,
      this.env.ACTION_CAPABILITY_SECRET,
      now,
    );

    if (capability.issuer !== this.env.ACTION_CAPABILITY_ISSUER) throw new Error("issuer_mismatch");
    if (capability.audience !== this.env.ACTION_CAPABILITY_AUDIENCE) throw new Error("audience_mismatch");

    await assertCapabilityBindings(capability, envelope);

    const nonceHash = await sha256Hex(capability.nonce);
    const lease = this.env.OPERATOR_LEASES.getByName(capability.actionId);
    const claim = await lease.claim({
      nonceHash,
      actionId: capability.actionId,
      attemptId: capability.attemptId,
      fencingToken: capability.fencingToken,
      expiresAt: capability.expiresAt,
    });
    if (!claim.claimed) throw new Error(`capability_claim_rejected:${claim.reason ?? "unknown"}`);

    const authorityLoader = new SupabaseAuthorityLoader(
      this.env.SUPABASE_URL,
      this.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    const loaded = await authorityLoader.load(capability, {
      goalId: envelope.request.goal.goalId,
      planId: envelope.request.plan.planId,
      planVersion: envelope.request.plan.planVersion,
      domain: envelope.request.action.domain,
      actionFamily: envelope.request.action.actionFamily,
    });

    if (loaded.current.intentEpoch !== capability.intentEpoch) throw new Error("intent_epoch_changed");
    if (loaded.current.mandateVersion !== capability.mandateVersion) throw new Error("mandate_version_changed");
    if (loaded.current.consentEpoch !== capability.consentEpoch) throw new Error("consent_epoch_changed");
    if (loaded.current.killSwitchEpoch !== capability.killSwitchEpoch) throw new Error("kill_switch_epoch_changed");
    if (loaded.current.killSwitchActive) throw new Error("kill_switch_active");

    const request = decodeRequest(envelope.request);
    request.current = loaded.current;
    request.attemptId = capability.attemptId;
    if (loaded.mandate === undefined) delete request.mandate;
    else request.mandate = loaded.mandate;
    if (loaded.capabilityCell === undefined) delete request.capabilityCell;
    else request.capabilityCell = loaded.capabilityCell;

    const repository = new SupabaseOperatorRepository(
      this.env.SUPABASE_URL,
      this.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    const registry = new EffectRegistry();
    registry.register(
      new GoogleCalendarCreateAdapter({
        tokenProvider: new CredentialOwnerGoogleTokenProvider(
          this.env.CREDENTIAL_OWNER,
          loaded.current.connectorEpoch,
        ),
      }),
    );

    return {
      envelope,
      capability,
      broker: new CoreOperatorBroker(repository, registry),
      request,
    };
  }
}

async function assertCapabilityBindings(
  capability: BrokerCapability,
  envelope: OperatorRpcEnvelope,
): Promise<void> {
  const request = envelope.request;
  const requestHash = await canonicalHash(request as unknown as JsonValue);
  if (requestHash !== capability.requestHash) throw new Error("request_hash_mismatch");
  if (await hashAction(request.action) !== capability.actionHash) throw new Error("action_hash_mismatch");

  const exactChecks: Array<[boolean, string]> = [
    [request.action.userId === capability.subjectUserId, "subject_user_mismatch"],
    [request.runId === capability.runId, "run_id_mismatch"],
    [request.action.actionId === capability.actionId, "action_id_mismatch"],
    [request.attemptId === capability.attemptId, "attempt_id_mismatch"],
    [request.goal.canonicalHash === capability.goalSpecHash, "goal_hash_mismatch"],
    [request.plan.canonicalHash === capability.planHash, "plan_hash_mismatch"],
    [request.plan.provenanceRootHash === capability.provenanceRootHash, "provenance_hash_mismatch"],
    [request.plan.policyHash === capability.policyHash, "policy_hash_mismatch"],
    [request.current.intentEpoch === capability.intentEpoch, "caller_intent_epoch_mismatch"],
    [request.current.mandateVersion === capability.mandateVersion, "caller_mandate_version_mismatch"],
    [request.current.consentEpoch === capability.consentEpoch, "caller_consent_epoch_mismatch"],
    [request.current.connectorEpoch === capability.connectorEpoch, "caller_connector_epoch_mismatch"],
    [request.current.killSwitchEpoch === capability.killSwitchEpoch, "caller_kill_epoch_mismatch"],
    [request.current.fencingToken === capability.fencingToken, "caller_fence_mismatch"],
    [request.reservationId === capability.reservationId, "reservation_id_mismatch"],
    [request.idempotencyKey === capability.idempotencyKey, "idempotency_key_mismatch"],
    [request.action.adapterVersion === capability.adapterVersion, "adapter_version_mismatch"],
  ];
  for (const [condition, code] of exactChecks) if (!condition) throw new Error(code);

  if (request.authorization.kind === "operator_mandate") {
    if (capability.mandateId !== request.authorization.mandateId) throw new Error("mandate_id_mismatch");
    if (capability.capabilityCellId !== request.authorization.capabilityCellId) {
      throw new Error("capability_cell_id_mismatch");
    }
  } else if (capability.capabilityCellId !== undefined) {
    throw new Error("unexpected_capability_cell_claim");
  }
}

function assertEnv(env: Env): void {
  const required: Array<[string, unknown]> = [
    ["SUPABASE_URL", env.SUPABASE_URL],
    ["SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY],
    ["ACTION_CAPABILITY_SECRET", env.ACTION_CAPABILITY_SECRET],
    ["ACTION_CAPABILITY_ISSUER", env.ACTION_CAPABILITY_ISSUER],
    ["ACTION_CAPABILITY_AUDIENCE", env.ACTION_CAPABILITY_AUDIENCE],
    ["CREDENTIAL_OWNER", env.CREDENTIAL_OWNER],
    ["OPERATOR_LEASES", env.OPERATOR_LEASES],
  ];
  const missing = required.filter(([, value]) => value === undefined || value === "").map(([name]) => name);
  if (missing.length > 0) throw new Error(`operator_env_missing:${missing.join(",")}`);
}

function classifyError(error: unknown): string {
  const message = error instanceof Error ? error.message : "unknown";
  if (
    message.includes("mismatch") ||
    message.includes("expired") ||
    message.includes("stale") ||
    message.includes("replay") ||
    message.includes("kill_switch") ||
    message.includes("superseded") ||
    message.includes("claim_rejected")
  ) {
    return "capability_or_authority_denied";
  }
  if (message.includes("authentication")) return "authentication_required";
  if (message.includes("Unregistered committing action")) return "unregistered_effect";
  return "operator_execution_failed_closed";
}

export default OperatorBroker;
