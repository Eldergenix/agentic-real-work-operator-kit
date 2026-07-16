import { z } from "zod";
import { canonicalHash, sha256Hex } from "../canonical.js";
import type {
  OperatorProviderAdapter,
  ProviderAttemptContext,
  ProviderCompensationResult,
  ProviderExecutionResult,
  ProviderReconciliationResult,
  ProviderVerificationResult,
} from "../provider-adapter.js";
import {
  EffectContractSchema,
  JsonValueSchema,
  type CanonicalOperatorAction,
  type EffectContract,
  type JsonValue,
  type VerificationObservation,
} from "../schemas.js";

const CalendarDateTimeSchema = z
  .object({
    dateTime: z.string().datetime({ offset: true }),
    timeZone: z.string().min(1).optional(),
  })
  .strict();

export const GoogleCalendarCreateArgumentsSchema = z
  .object({
    calendarId: z.string().min(1),
    summary: z.string().min(1),
    description: z.string().optional(),
    location: z.string().optional(),
    start: CalendarDateTimeSchema,
    end: CalendarDateTimeSchema,
    attendees: z.array(z.object({ email: z.string().email() }).strict()).default([]),
    sendUpdates: z.enum(["all", "externalOnly", "none"]).default("none"),
    visibility: z.enum(["default", "public", "private", "confidential"]).default("private"),
    transparency: z.enum(["opaque", "transparent"]).default("opaque"),
  })
  .strict()
  .refine(
    (value) => new Date(value.start.dateTime).getTime() < new Date(value.end.dateTime).getTime(),
    "Calendar event end must be after start",
  );
export type GoogleCalendarCreateArguments = z.infer<typeof GoogleCalendarCreateArgumentsSchema>;

const GoogleCalendarEventSchema = z
  .object({
    id: z.string().min(1),
    etag: z.string().min(1).optional(),
    status: z.string().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    start: z.object({ dateTime: z.string().optional(), timeZone: z.string().optional() }).passthrough(),
    end: z.object({ dateTime: z.string().optional(), timeZone: z.string().optional() }).passthrough(),
    attendees: z.array(z.object({ email: z.string() }).passthrough()).optional(),
    visibility: z.string().optional(),
    transparency: z.string().optional(),
    extendedProperties: z
      .object({ private: z.record(z.string(), z.string()).optional() })
      .passthrough()
      .optional(),
    updated: z.string().optional(),
  })
  .passthrough();

type GoogleCalendarEvent = z.infer<typeof GoogleCalendarEventSchema>;

export interface GoogleCalendarTokenProvider {
  getAccessToken(input: {
    userId: string;
    providerAccountId: string;
    requiredScopes: string[];
  }): Promise<string>;
}

export type GoogleCalendarAdapterOptions = {
  tokenProvider: GoogleCalendarTokenProvider;
  fetchImpl?: typeof fetch;
  apiBaseUrl?: string;
};

export class GoogleCalendarCreateAdapter implements OperatorProviderAdapter {
  readonly contract: EffectContract = EffectContractSchema.parse({
    actionFamily: "calendar.event.create",
    version: "google-calendar-v1",
    domain: "calendar",
    provider: "google_calendar",
    committing: true,
    idempotencyClass: "client_generated_object_id",
    minimumVerificationGrade: "V2",
    recoverySemantics: "time_limited_cancellation",
    sourceOfTruth: "Google Calendar Events resource",
    sourceOfTruthRank: 100,
    maturityHorizonMs: 0,
    expectedVisibilityDelayMs: 2_000,
    verifierRef: "google-calendar-events.get-v1",
    reconciliationRef: "google-calendar-events.get-v1",
    compensationRef: "google-calendar-events.delete-and-get-v1",
    explicitIrreversibility: false,
    pointOfNoReturn: "attendee_notifications_may_propagate_when_sendUpdates_is_not_none",
    graduationState: "registered",
  });

  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;

  constructor(private readonly options: GoogleCalendarAdapterOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = options.apiBaseUrl ?? "https://www.googleapis.com/calendar/v3";
  }

  async execute(
    action: CanonicalOperatorAction,
    context: ProviderAttemptContext,
  ): Promise<ProviderExecutionResult> {
    const args = GoogleCalendarCreateArgumentsSchema.parse(action.arguments);
    const eventId = await deterministicGoogleEventId(action.logicalEffectId);
    const token = await this.options.tokenProvider.getAccessToken({
      userId: action.userId,
      providerAccountId: action.providerAccountId,
      requiredScopes: ["https://www.googleapis.com/auth/calendar.events"],
    });
    const body = {
      id: eventId,
      summary: args.summary,
      ...(args.description === undefined ? {} : { description: args.description }),
      ...(args.location === undefined ? {} : { location: args.location }),
      start: args.start,
      end: args.end,
      attendees: args.attendees,
      visibility: args.visibility,
      transparency: args.transparency,
      extendedProperties: {
        private: {
          operatorLogicalEffectId: action.logicalEffectId,
          operatorActionId: action.actionId,
          operatorIntentEpoch: String(action.intentEpoch),
        },
      },
    };
    const url = `${this.baseUrl}/calendars/${encodeURIComponent(args.calendarId)}/events?sendUpdates=${encodeURIComponent(args.sendUpdates)}`;

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          "x-operator-attempt-id": context.attemptId,
        },
        body: JSON.stringify(body),
        ...(context.signal === undefined ? {} : { signal: context.signal }),
      });
    } catch {
      return { status: "uncertain", reasonCode: "network_failure_during_insert", providerObjectId: eventId };
    }

    if (response.ok) {
      const event = GoogleCalendarEventSchema.parse(await response.json());
      return {
        status: "acknowledged",
        providerObjectId: event.id,
        ...(event.etag === undefined ? {} : { providerReceiptRef: event.etag }),
        providerReceipt: JsonValueSchema.parse(event),
      };
    }

    if (response.status === 409) {
      const existing = await this.getEvent(args.calendarId, eventId, token, context.signal);
      if (existing !== undefined && eventMatches(action, args, existing)) {
        return {
          status: "acknowledged",
          providerObjectId: eventId,
          ...(existing.etag === undefined ? {} : { providerReceiptRef: existing.etag }),
          providerReceipt: JsonValueSchema.parse(existing),
        };
      }
      return { status: "uncertain", reasonCode: "event_id_conflict_with_nonmatching_object", providerObjectId: eventId };
    }

    const payload = await safeJson(response);
    if (response.status === 401 || response.status === 403) {
      return {
        status: "authentication_required",
        handoffRef: `google_calendar_reauth:${action.providerAccountId}`,
        ...(payload === undefined ? {} : { providerReceipt: payload }),
      };
    }
    if (response.status >= 400 && response.status < 500) {
      return {
        status: "failed",
        failureCode: `google_calendar_${response.status}`,
        providerProvedNoEffect: true,
        ...(payload === undefined ? {} : { providerReceipt: payload }),
      };
    }
    return {
      status: "uncertain",
      reasonCode: `google_calendar_${response.status}_after_insert`,
      providerObjectId: eventId,
      ...(payload === undefined ? {} : { providerReceipt: payload }),
    };
  }

  async verify(
    action: CanonicalOperatorAction,
    providerObjectId: string,
    context: ProviderAttemptContext,
  ): Promise<ProviderVerificationResult> {
    const args = GoogleCalendarCreateArgumentsSchema.parse(action.arguments);
    const token = await this.options.tokenProvider.getAccessToken({
      userId: action.userId,
      providerAccountId: action.providerAccountId,
      requiredScopes: ["https://www.googleapis.com/auth/calendar.events.readonly"],
    });
    const event = await this.getEvent(args.calendarId, providerObjectId, token, context.signal);
    if (event === undefined) {
      return { status: "not_visible_yet", observedAt: new Date().toISOString(), retryAfterMs: 2_000 };
    }
    const matched = eventMatches(action, args, event);
    const observation = await makeObservation(action, context.attemptId, event, matched, false);
    return matched
      ? { status: "verified", observation, providerState: JsonValueSchema.parse(event) }
      : {
          status: "mismatch",
          observation,
          providerState: JsonValueSchema.parse(event),
          mismatchFields: mismatchFields(action, args, event),
        };
  }

  async reconcile(
    action: CanonicalOperatorAction,
    providerObjectId: string | undefined,
    context: ProviderAttemptContext,
  ): Promise<ProviderReconciliationResult> {
    const args = GoogleCalendarCreateArgumentsSchema.parse(action.arguments);
    const objectId = providerObjectId ?? (await deterministicGoogleEventId(action.logicalEffectId));
    const token = await this.options.tokenProvider.getAccessToken({
      userId: action.userId,
      providerAccountId: action.providerAccountId,
      requiredScopes: ["https://www.googleapis.com/auth/calendar.events.readonly"],
    });
    const event = await this.getEvent(args.calendarId, objectId, token, context.signal);
    if (event === undefined) return { status: "uncertain", reasonCode: "event_not_visible_during_reconciliation", retryAfterMs: 5_000 };
    const matched = eventMatches(action, args, event);
    const observation = await makeObservation(action, context.attemptId, event, matched, false);
    return matched
      ? {
          status: "verified",
          verification: { status: "verified", observation, providerState: JsonValueSchema.parse(event) },
        }
      : { status: "uncertain", reasonCode: "reconciled_event_mismatch" };
  }

  async compensate(
    action: CanonicalOperatorAction,
    providerObjectId: string,
    _preState: JsonValue | undefined,
    context: ProviderAttemptContext,
  ): Promise<ProviderCompensationResult> {
    const args = GoogleCalendarCreateArgumentsSchema.parse(action.arguments);
    const token = await this.options.tokenProvider.getAccessToken({
      userId: action.userId,
      providerAccountId: action.providerAccountId,
      requiredScopes: ["https://www.googleapis.com/auth/calendar.events"],
    });
    const url = `${this.baseUrl}/calendars/${encodeURIComponent(args.calendarId)}/events/${encodeURIComponent(providerObjectId)}?sendUpdates=${encodeURIComponent(args.sendUpdates)}`;
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}`, "x-operator-attempt-id": context.attemptId },
        ...(context.signal === undefined ? {} : { signal: context.signal }),
      });
    } catch {
      return { status: "uncertain", reasonCode: "network_failure_during_delete" };
    }
    if (!response.ok && response.status !== 404 && response.status !== 410) {
      if (response.status >= 400 && response.status < 500) {
        return { status: "failed", failureCode: `google_calendar_delete_${response.status}` };
      }
      return { status: "uncertain", reasonCode: `google_calendar_delete_${response.status}` };
    }

    const remaining = await this.getEvent(args.calendarId, providerObjectId, token, context.signal);
    if (remaining !== undefined && remaining.status !== "cancelled") {
      return { status: "uncertain", reasonCode: "event_still_visible_after_delete" };
    }
    const tombstone = { id: providerObjectId, status: "deleted_or_cancelled" };
    const observation: VerificationObservation = {
      observationId: crypto.randomUUID(),
      actionId: action.actionId,
      attemptId: context.attemptId,
      providerObjectId,
      verifierRef: "compensation:google-calendar-delete-readback-v1",
      grade: "V2",
      observedAt: new Date().toISOString(),
      matched: true,
      predicateResults: { absent_or_cancelled: true },
      redactedEvidenceHash: await canonicalHash(tombstone),
    };
    return {
      status: "compensated",
      observation,
      providerState: JsonValueSchema.parse(tombstone),
    };
  }

  private async getEvent(
    calendarId: string,
    eventId: string,
    token: string,
    signal?: AbortSignal,
  ): Promise<GoogleCalendarEvent | undefined> {
    const url = `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
    const response = await this.fetchImpl(url, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
      ...(signal === undefined ? {} : { signal }),
    });
    if (response.status === 404 || response.status === 410) return undefined;
    if (!response.ok) throw new Error(`Google Calendar GET failed with ${response.status}`);
    return GoogleCalendarEventSchema.parse(await response.json());
  }
}

async function deterministicGoogleEventId(logicalEffectId: string): Promise<string> {
  const digest = await sha256Hex(logicalEffectId);
  return `operator${toBase32Hex(hexToBytes(digest)).slice(0, 48)}`;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function toBase32Hex(bytes: Uint8Array): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuv";
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function eventMatches(
  action: CanonicalOperatorAction,
  args: GoogleCalendarCreateArguments,
  event: GoogleCalendarEvent,
): boolean {
  return mismatchFields(action, args, event).length === 0;
}

function mismatchFields(
  action: CanonicalOperatorAction,
  args: GoogleCalendarCreateArguments,
  event: GoogleCalendarEvent,
): string[] {
  const mismatches: string[] = [];
  if (event.summary !== args.summary) mismatches.push("summary");
  if (event.start.dateTime !== args.start.dateTime) mismatches.push("start.dateTime");
  if (event.end.dateTime !== args.end.dateTime) mismatches.push("end.dateTime");
  const expectedAttendees = args.attendees.map((item) => item.email.toLowerCase()).sort();
  const actualAttendees = (event.attendees ?? []).map((item) => item.email.toLowerCase()).sort();
  if (JSON.stringify(expectedAttendees) !== JSON.stringify(actualAttendees)) mismatches.push("attendees");
  if (event.extendedProperties?.private?.["operatorLogicalEffectId"] !== action.logicalEffectId) {
    mismatches.push("operatorLogicalEffectId");
  }
  return mismatches;
}

async function makeObservation(
  action: CanonicalOperatorAction,
  attemptId: string,
  event: GoogleCalendarEvent,
  matched: boolean,
  compensation: boolean,
): Promise<VerificationObservation> {
  const mismatches = mismatchFields(action, GoogleCalendarCreateArgumentsSchema.parse(action.arguments), event);
  return {
    observationId: crypto.randomUUID(),
    actionId: action.actionId,
    attemptId,
    providerObjectId: event.id,
    verifierRef: compensation
      ? "compensation:google-calendar-events.get-v1"
      : "google-calendar-events.get-v1",
    grade: "V2",
    observedAt: new Date().toISOString(),
    ...(event.etag === undefined ? {} : { sourceVersion: event.etag }),
    matched,
    predicateResults: {
      summary: !mismatches.includes("summary"),
      start: !mismatches.includes("start.dateTime"),
      end: !mismatches.includes("end.dateTime"),
      attendees: !mismatches.includes("attendees"),
      logical_effect: !mismatches.includes("operatorLogicalEffectId"),
    },
    redactedEvidenceHash: await canonicalHash(JsonValueSchema.parse(event)),
  };
}

async function safeJson(response: Response): Promise<JsonValue | undefined> {
  try {
    return JsonValueSchema.parse(await response.json());
  } catch {
    return undefined;
  }
}
