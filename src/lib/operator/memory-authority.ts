import type { MemoryAuthoritySchema } from "./schemas.js";
import type { z } from "zod";

export type MemoryAuthority = z.infer<typeof MemoryAuthoritySchema>;

const authorityRank: Record<MemoryAuthority, number> = {
  none: 0,
  display_only: 1,
  preference_ranking: 2,
  planning_only: 3,
  authoritative_fact: 4,
};

const authorities = Object.entries(authorityRank) as [MemoryAuthority, number][];

export type MemoryOrigin = {
  originId: string;
  principalId: string;
  trustDomain: string;
  authority: MemoryAuthority;
};

export type ElevationReceipt = {
  receiptId: string;
  requestedAuthority: MemoryAuthority;
  method: "authenticated_user_confirmation" | "independent_provider_corroboration";
  independentPrincipalIds: string[];
  independentTrustDomains: string[];
  expiresAt?: string;
};

function authorityAtRank(rank: number): MemoryAuthority {
  const match = authorities.find(([, candidate]) => candidate === rank);
  if (match === undefined) throw new Error(`No authority at rank ${rank}`);
  return match[0];
}

export function propagateMemoryAuthority(origins: MemoryOrigin[]): MemoryAuthority {
  if (origins.length === 0) return "none";
  const weakest = Math.min(...origins.map((origin) => authorityRank[origin.authority]));
  return authorityAtRank(weakest);
}

export function elevateMemoryAuthority(
  baseAuthority: MemoryAuthority,
  receipt: ElevationReceipt,
  now: Date,
): MemoryAuthority {
  if (receipt.expiresAt !== undefined && new Date(receipt.expiresAt).getTime() <= now.getTime()) {
    throw new Error("Elevation receipt has expired");
  }
  if (authorityRank[receipt.requestedAuthority] <= authorityRank[baseAuthority]) return baseAuthority;

  if (receipt.method === "authenticated_user_confirmation") {
    if (receipt.independentPrincipalIds.length !== 1) {
      throw new Error("Authenticated user confirmation must bind one authenticated principal");
    }
    return receipt.requestedAuthority;
  }

  const principals = new Set(receipt.independentPrincipalIds);
  const domains = new Set(receipt.independentTrustDomains);
  if (principals.size < 2 || domains.size < 2) {
    throw new Error("Provider corroboration requires at least two independent principals and trust domains");
  }
  return receipt.requestedAuthority;
}

export function canInfluenceProtectedActionField(authority: MemoryAuthority): boolean {
  return authority === "authoritative_fact";
}
