import type { JsonValue } from "./schemas.js";
import type { ElevationReceipt, MemoryAuthority, MemoryOrigin } from "./memory-authority.js";
import { elevateMemoryAuthority, propagateMemoryAuthority } from "./memory-authority.js";

export type MemoryClass =
  | "authoritative_user_fact"
  | "authoritative_provider_fact"
  | "immutable_episode"
  | "derived_hypothesis"
  | "procedure"
  | "run_local"
  | "quarantine";

export type MemoryWriteReceipt = {
  memoryId: string;
  memoryClass: MemoryClass;
  contentHash: string;
  originRefs: string[];
  immutableOrigins: MemoryOrigin[];
  transformationRefs: string[];
  authority: MemoryAuthority;
  purposes: string[];
  consentEpoch: string;
  writerIdentity: string;
  policyHash: string;
  modelArtifactId?: string;
  elevationReceipt?: ElevationReceipt;
  contradictionState: "none" | "open" | "resolved";
  expiresAt?: string;
};

export function admitMemory(input: {
  memoryId: string;
  memoryClass: MemoryClass;
  contentHash: string;
  origins: MemoryOrigin[];
  transformationRefs: string[];
  purposes: string[];
  consentEpoch: string;
  writerIdentity: string;
  policyHash: string;
  requestedAuthority: MemoryAuthority;
  elevationReceipt?: ElevationReceipt;
  modelArtifactId?: string;
  expiresAt?: string;
  now: Date;
}): MemoryWriteReceipt {
  let authority = propagateMemoryAuthority(input.origins);
  if (input.requestedAuthority !== authority) {
    if (input.elevationReceipt === undefined) {
      throw new Error("Memory authority cannot be elevated without a durable elevation receipt");
    }
    authority = elevateMemoryAuthority(authority, input.elevationReceipt, input.now);
  }

  if (
    input.memoryClass === "derived_hypothesis" ||
    input.memoryClass === "procedure" ||
    input.memoryClass === "quarantine"
  ) {
    if (authority === "authoritative_fact") {
      throw new Error(`${input.memoryClass} cannot be written directly as an authoritative fact`);
    }
  }

  return {
    memoryId: input.memoryId,
    memoryClass: input.memoryClass,
    contentHash: input.contentHash,
    originRefs: input.origins.map((origin) => origin.originId),
    immutableOrigins: input.origins,
    transformationRefs: input.transformationRefs,
    authority,
    purposes: input.purposes,
    consentEpoch: input.consentEpoch,
    writerIdentity: input.writerIdentity,
    policyHash: input.policyHash,
    ...(input.modelArtifactId === undefined ? {} : { modelArtifactId: input.modelArtifactId }),
    ...(input.elevationReceipt === undefined ? {} : { elevationReceipt: input.elevationReceipt }),
    contradictionState: "none",
    ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt }),
  };
}

export type MemoryInfluenceReceipt = {
  influenceId: string;
  memoryId: string;
  actionId: string;
  fieldPath: string;
  authority: MemoryAuthority;
  allowed: boolean;
  reason: string;
};

export function evaluateMemoryInfluence(
  write: MemoryWriteReceipt,
  actionId: string,
  fieldPath: string,
  protectedField: boolean,
): MemoryInfluenceReceipt {
  const allowed = !protectedField || write.authority === "authoritative_fact";
  return {
    influenceId: crypto.randomUUID(),
    memoryId: write.memoryId,
    actionId,
    fieldPath,
    authority: write.authority,
    allowed,
    reason: allowed
      ? "Memory authority meets the field requirement"
      : "Non-authoritative memory cannot select a protected action field",
  };
}

export type MemoryRecord = { receipt: MemoryWriteReceipt; content: JsonValue };
