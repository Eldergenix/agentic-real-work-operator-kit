import { z } from "zod";
import { canonicalHash, canonicalJson, sha256Hex, timingSafeEqualHex } from "./canonical.js";
import { hashAction } from "./action-hash.js";
import {
  HashSchema,
  IsoDateTimeSchema,
  JsonValueSchema,
  type CanonicalOperatorAction,
  type JsonValue,
} from "./schemas.js";

export const BrokerCapabilitySchema = z
  .object({
    issuer: z.string().min(1),
    audience: z.literal("mozi-operator"),
    subjectUserId: z.string().uuid(),
    runId: z.string().min(1),
    actionId: z.string().uuid(),
    attemptId: z.string().uuid(),
    goalSpecHash: HashSchema,
    planHash: HashSchema,
    provenanceRootHash: HashSchema,
    actionHash: HashSchema,
    requestHash: HashSchema,
    mandateId: z.string().uuid().optional(),
    capabilityCellId: z.string().uuid().optional(),
    mandateVersion: z.number().int().positive(),
    policyHash: HashSchema,
    consentEpoch: z.string().min(1),
    connectorEpoch: z.string().min(1),
    killSwitchEpoch: z.string().min(1),
    intentEpoch: z.number().int().nonnegative(),
    reservationId: z.string().uuid(),
    fencingToken: z.string().regex(/^\d+$/u),
    adapterVersion: z.string().min(1),
    idempotencyKey: z.string().min(8),
    notBefore: IsoDateTimeSchema,
    expiresAt: IsoDateTimeSchema,
    nonce: z.string().min(16),
  })
  .strict();
export type BrokerCapability = z.infer<typeof BrokerCapabilitySchema>;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  if (encoder.encode(secret).byteLength < 32) throw new Error("Capability secret must be at least 32 bytes");
  return crypto.subtle.importKey(
    "raw",
    Uint8Array.from(encoder.encode(secret)).buffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function signHex(secret: string, value: string): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, Uint8Array.from(encoder.encode(value)).buffer);
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function mintBrokerCapability(
  payload: BrokerCapability,
  secret: string,
): Promise<{ token: string; tokenHash: string }> {
  const parsed = BrokerCapabilitySchema.parse(payload);
  if (new Date(parsed.expiresAt).getTime() - new Date(parsed.notBefore).getTime() > 60_000) {
    throw new Error("Broker capability lifetime must not exceed 60 seconds");
  }
  const body = base64UrlEncode(encoder.encode(canonicalJson(parsed as unknown as JsonValue)));
  const signature = await signHex(secret, body);
  const token = `${body}.${signature}`;
  return { token, tokenHash: await sha256Hex(token) };
}

export async function verifyBrokerCapability(
  token: string,
  secret: string,
  now: Date,
): Promise<BrokerCapability> {
  const [body, signature, extra] = token.split(".");
  if (body === undefined || signature === undefined || extra !== undefined) throw new Error("Malformed capability");
  const expected = await signHex(secret, body);
  if (!timingSafeEqualHex(signature, expected)) throw new Error("Invalid capability signature");
  const parsed = BrokerCapabilitySchema.parse(JSON.parse(decoder.decode(base64UrlDecode(body))) as unknown);
  const timestamp = now.getTime();
  if (timestamp < new Date(parsed.notBefore).getTime()) throw new Error("Capability is not active yet");
  if (timestamp >= new Date(parsed.expiresAt).getTime()) throw new Error("Capability expired");
  return parsed;
}


export async function mintBoundBrokerCapability(
  input: {
    claims: Omit<BrokerCapability, "actionHash" | "requestHash">;
    action: CanonicalOperatorAction;
    wireRequest: unknown;
  },
  secret: string,
): Promise<{ token: string; tokenHash: string; payload: BrokerCapability }> {
  const payload = BrokerCapabilitySchema.parse({
    ...input.claims,
    actionHash: await hashAction(input.action),
    requestHash: await canonicalHash(JsonValueSchema.parse(input.wireRequest)),
  });
  const minted = await mintBrokerCapability(payload, secret);
  return { ...minted, payload };
}
