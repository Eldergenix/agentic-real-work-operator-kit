import { WorkerEntrypoint } from "cloudflare:workers";
import { ActionCoordinator } from "./action-coordinator.js";

export { ActionCoordinator };

export type ExecuteRequest = {
  signedCapability: string;
  actionId: string;
  attemptId: string;
};

export type ExecuteResponse = {
  actionId: string;
  attemptId: string;
  state: "provider_acknowledged" | "verified" | "uncertain" | "failed";
  providerObjectId?: string;
};

type VerifiedCapability = {
  actionId: string;
  attemptId: string;
  nonceHash: string;
  fencingToken: number;
  expiresAtMs: number;
};

async function verifyCapabilityAndReloadCurrentState(_env: Env, _request: ExecuteRequest): Promise<VerifiedCapability> {
  // Replace with signature/audience/nonce/current-epoch/action-row validation.
  throw new Error("not_implemented: verifyCapabilityAndReloadCurrentState");
}

async function executeRegisteredAdapter(_env: Env, _capability: VerifiedCapability): Promise<ExecuteResponse> {
  // Resolve credentials here, immediately before the exact adapter call.
  // Perform external I/O outside the Durable Object claim method.
  // Append acknowledgement/uncertainty and independent verification to Postgres.
  throw new Error("not_implemented: executeRegisteredAdapter");
}

export default class OperatorEntrypoint extends WorkerEntrypoint<Env> {
  async execute(request: ExecuteRequest): Promise<ExecuteResponse> {
    const capability = await verifyCapabilityAndReloadCurrentState(this.env, request);
    if (capability.actionId !== request.actionId || capability.attemptId !== request.attemptId) {
      throw new Error("capability_request_mismatch");
    }
    if (capability.expiresAtMs <= Date.now()) throw new Error("capability_expired");

    const coordinator = this.env.ACTION_COORDINATOR.getByName(request.actionId);
    const claim = await coordinator.claim(request.actionId, capability.nonceHash, capability.fencingToken);
    if (!claim.ok) throw new Error(claim.reason);

    try {
      const response = await executeRegisteredAdapter(this.env, capability);
      await coordinator.close(request.actionId, claim.fence, response.state === "uncertain" ? "uncertain" : "closed");
      return response;
    } catch (error) {
      await coordinator.close(request.actionId, claim.fence, "uncertain");
      throw error;
    }
  }
}
