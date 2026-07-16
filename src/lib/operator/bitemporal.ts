export type MissingnessCode =
  | "not_observed"
  | "permission_denied"
  | "device_offline"
  | "provider_unavailable"
  | "not_applicable"
  | "source_not_connected"
  | "observation_delayed";

export type BitemporalEnvelope<T> = {
  eventId: string;
  value?: T;
  occurredAt?: string;
  observedAt: string;
  ingestedAt: string;
  validFrom: string;
  validTo?: string;
  revision: number;
  supersedes?: string;
  sourceLatencyMs?: number;
  freshnessTtlMs: number;
  missingness?: MissingnessCode;
};

export function isFresh<T>(event: BitemporalEnvelope<T>, now: Date): boolean {
  return now.getTime() - new Date(event.observedAt).getTime() <= event.freshnessTtlMs;
}

export function assertObservationUsable<T>(event: BitemporalEnvelope<T>, now: Date): T {
  if (event.missingness !== undefined) throw new Error(`Observation is missing: ${event.missingness}`);
  if (!isFresh(event, now)) throw new Error("Observation is stale");
  if (event.value === undefined) throw new Error("Observation has no value");
  if (new Date(event.validFrom).getTime() > now.getTime()) throw new Error("Observation is not yet valid");
  if (event.validTo !== undefined && new Date(event.validTo).getTime() <= now.getTime()) {
    throw new Error("Observation is no longer valid");
  }
  return event.value;
}
