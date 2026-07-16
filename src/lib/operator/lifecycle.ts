import { z } from "zod";
import {
  HashSchema,
  IsoDateTimeSchema,
  VerificationObservationSchema,
  type VerificationObservation,
} from "./schemas.js";

export const ActionStatusSchema = z.enum([
  "planned",
  "authorized",
  "reserved",
  "executing",
  "provider_acknowledged",
  "verified",
  "permanent_verified",
  "denied",
  "risk_abstained",
  "awaiting_authentication",
  "failed",
  "uncertain",
  "reconciling",
  "compensating",
  "compensated",
  "compensation_failed",
  "expired",
  "superseded",
  "aborted",
]);
export type ActionStatus = z.infer<typeof ActionStatusSchema>;

const ActionEventBaseSchema = z
  .object({
    eventId: z.string().uuid(),
    actionId: z.string().uuid(),
    sequence: z.number().int().positive(),
    occurredAt: IsoDateTimeSchema,
    actor: z.string().min(1),
    intentEpoch: z.number().int().nonnegative(),
    mandateVersion: z.number().int().positive(),
    policyHash: HashSchema,
    consentEpoch: z.string().min(1),
    connectorEpoch: z.string().min(1),
    killSwitchEpoch: z.string().min(1),
    fencingToken: z.string().regex(/^\d+$/u),
  })
  .strict();

export const ActionEventSchema = z.discriminatedUnion("type", [
  ActionEventBaseSchema.extend({ type: z.literal("action_planned"), planHash: HashSchema }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("action_authorized"),
    authorizationKind: z.enum(["direct_command", "recorded_approval", "operator_mandate"]),
    authorizationRef: z.string().min(1),
    capabilityCellId: z.string().uuid().optional(),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("reservation_acquired"),
    reservationId: z.string().uuid(),
    idempotencyKey: z.string().min(8),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("attempt_started"),
    attemptId: z.string().uuid(),
    attemptNumber: z.number().int().positive(),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("provider_acknowledged"),
    attemptId: z.string().uuid(),
    providerObjectId: z.string().min(1),
    providerReceiptRef: z.string().min(1).optional(),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("verification_observed"),
    observation: VerificationObservationSchema,
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("action_verified"),
    permanent: z.boolean(),
    evidenceClass: z.enum([
      "fixture",
      "sandbox",
      "test_account",
      "internal_canary",
      "production_cohort",
    ]),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("action_denied"),
    reasonCode: z.string().min(1),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("risk_abstained"),
    riskReceiptRef: z.string().min(1),
    recommendedSupport: z.string().min(1),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("authentication_required"),
    handoffRef: z.string().min(1),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("action_failed"),
    failureCode: z.string().min(1),
    providerProvedNoEffect: z.boolean(),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("action_uncertain"),
    reasonCode: z.string().min(1),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("reconciliation_started"),
    attemptId: z.string().uuid(),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("compensation_started"),
    compensationAttemptId: z.string().uuid(),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("action_compensated"),
    observation: VerificationObservationSchema,
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("compensation_failed"),
    failureCode: z.string().min(1),
  }).strict(),
  ActionEventBaseSchema.extend({ type: z.literal("action_expired") }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("action_superseded"),
    supersedingIntentEpoch: z.number().int().positive(),
  }).strict(),
  ActionEventBaseSchema.extend({
    type: z.literal("action_aborted"),
    reasonCode: z.string().min(1),
  }).strict(),
]);
export type ActionEvent = z.infer<typeof ActionEventSchema>;

export type ActionAggregate = {
  actionId: string;
  status: ActionStatus;
  sequence: number;
  fencingToken: bigint;
  intentEpoch: number;
  attemptCount: number;
  reservationId?: string;
  idempotencyKey?: string;
  providerObjectId?: string;
  lastVerification?: VerificationObservation;
  verifiedAt?: string;
  terminal: boolean;
  events: ActionEvent[];
};

const terminal = new Set<ActionStatus>([
  "verified",
  "permanent_verified",
  "denied",
  "failed",
  "compensated",
  "compensation_failed",
  "expired",
  "superseded",
  "aborted",
]);

const allowedFrom: Record<ActionEvent["type"], ActionStatus[]> = {
  action_planned: [],
  action_authorized: ["planned"],
  reservation_acquired: ["authorized"],
  attempt_started: ["reserved", "uncertain", "reconciling", "awaiting_authentication"],
  provider_acknowledged: ["executing"],
  verification_observed: ["provider_acknowledged", "uncertain", "reconciling", "compensating"],
  action_verified: ["provider_acknowledged", "uncertain", "reconciling"],
  action_denied: ["planned", "authorized"],
  risk_abstained: ["authorized", "reserved"],
  authentication_required: ["reserved", "executing"],
  action_failed: ["executing", "provider_acknowledged", "uncertain", "reconciling"],
  action_uncertain: ["executing", "provider_acknowledged", "reconciling", "compensating"],
  reconciliation_started: ["uncertain", "executing", "provider_acknowledged"],
  compensation_started: ["verified", "permanent_verified", "failed", "uncertain"],
  action_compensated: ["compensating"],
  compensation_failed: ["compensating"],
  action_expired: ["planned", "authorized", "reserved", "risk_abstained", "awaiting_authentication"],
  action_superseded: [
    "planned",
    "authorized",
    "reserved",
    "risk_abstained",
    "awaiting_authentication",
    "uncertain",
  ],
  action_aborted: [
    "planned",
    "authorized",
    "reserved",
    "risk_abstained",
    "awaiting_authentication",
    "uncertain",
    "reconciling",
  ],
};

function statusAfter(event: ActionEvent): ActionStatus {
  switch (event.type) {
    case "action_planned":
      return "planned";
    case "action_authorized":
      return "authorized";
    case "reservation_acquired":
      return "reserved";
    case "attempt_started":
      return "executing";
    case "provider_acknowledged":
      return "provider_acknowledged";
    case "verification_observed":
      if (event.observation.verifierRef.startsWith("compensation:")) return "compensating";
      if (event.observation.matched) return "provider_acknowledged";
      return "uncertain";
    case "action_verified":
      return event.permanent ? "permanent_verified" : "verified";
    case "action_denied":
      return "denied";
    case "risk_abstained":
      return "risk_abstained";
    case "authentication_required":
      return "awaiting_authentication";
    case "action_failed":
      return "failed";
    case "action_uncertain":
      return "uncertain";
    case "reconciliation_started":
      return "reconciling";
    case "compensation_started":
      return "compensating";
    case "action_compensated":
      return "compensated";
    case "compensation_failed":
      return "compensation_failed";
    case "action_expired":
      return "expired";
    case "action_superseded":
      return "superseded";
    case "action_aborted":
      return "aborted";
  }
}

export function reduceActionEvents(input: ActionEvent[]): ActionAggregate {
  const events = input.map((event) => ActionEventSchema.parse(event));
  const first = events[0];
  if (first === undefined || first.type !== "action_planned" || first.sequence !== 1) {
    throw new Error("Action stream must begin with action_planned sequence 1");
  }

  let aggregate: ActionAggregate = {
    actionId: first.actionId,
    status: "planned",
    sequence: 1,
    fencingToken: BigInt(first.fencingToken),
    intentEpoch: first.intentEpoch,
    attemptCount: 0,
    terminal: false,
    events: [first],
  };

  for (const event of events.slice(1)) {
    if (event.actionId !== aggregate.actionId) throw new Error("Mixed action IDs in one stream");
    if (event.sequence !== aggregate.sequence + 1) throw new Error("Non-contiguous action event sequence");
    if (BigInt(event.fencingToken) < aggregate.fencingToken) throw new Error("Stale fencing token");
    if (event.intentEpoch < aggregate.intentEpoch) throw new Error("Stale intent epoch");
    if (aggregate.terminal && event.type !== "compensation_started") {
      throw new Error(`Cannot append ${event.type} after terminal state ${aggregate.status}`);
    }
    if (!allowedFrom[event.type].includes(aggregate.status)) {
      throw new Error(`Invalid lifecycle transition ${aggregate.status} -> ${event.type}`);
    }
    if (event.type === "action_verified" && aggregate.lastVerification?.matched !== true) {
      throw new Error("Action cannot be verified without a matching independent verification observation");
    }
    if (
      event.type === "action_compensated" &&
      (aggregate.lastVerification?.matched !== true ||
        !aggregate.lastVerification.verifierRef.startsWith("compensation:"))
    ) {
      throw new Error("Compensation cannot complete without a matching compensation read-back");
    }

    aggregate = {
      ...aggregate,
      status: statusAfter(event),
      sequence: event.sequence,
      fencingToken: BigInt(event.fencingToken),
      intentEpoch: event.intentEpoch,
      attemptCount: aggregate.attemptCount + (event.type === "attempt_started" ? 1 : 0),
      events: [...aggregate.events, event],
    };

    if (event.type === "reservation_acquired") {
      aggregate.reservationId = event.reservationId;
      aggregate.idempotencyKey = event.idempotencyKey;
    }
    if (event.type === "provider_acknowledged") aggregate.providerObjectId = event.providerObjectId;
    if (event.type === "verification_observed") aggregate.lastVerification = event.observation;
    if (event.type === "action_verified") aggregate.verifiedAt = event.occurredAt;
    aggregate.terminal = terminal.has(aggregate.status);
  }

  return aggregate;
}

export function requiresReconciliation(aggregate: ActionAggregate): boolean {
  return aggregate.status === "uncertain" || aggregate.status === "reconciling";
}
