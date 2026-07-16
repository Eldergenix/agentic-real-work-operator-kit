import { z } from "zod";
import {
  AuthorizationEvidenceSchema,
  CanonicalOperatorActionSchema,
  CapabilityCellSchema,
  GoalSpecSchema,
  IsoDateTimeSchema,
  MandateSchema,
  MoneySchema,
  PlanIRSchema,
  ProvenanceGraphSchema,
} from "../../../../src/lib/operator/schemas.js";
import type { BrokerExecutionRequest } from "../../../../src/lib/operator/broker.js";

const RiskEstimateSchema = z
  .object({
    expectedLoss: MoneySchema.optional(),
    tailLoss95: MoneySchema.optional(),
    wrongTargetUpperBound: z.number().min(0).max(1),
    policyViolationUpperBound: z.number().min(0).max(1),
    irreversibleRegretUpperBound: z.number().min(0).max(1),
    privacyIncidentUpperBound: z.number().min(0).max(1),
    oodScore: z.number().nonnegative(),
    supportRegion: z.enum(["in_support", "weak_support", "out_of_support"]),
    artifactId: z.string().min(1).optional(),
    calibratedAt: IsoDateTimeSchema,
  })
  .strict();

const RiskBudgetSchema = z
  .object({
    expectedLossCeiling: MoneySchema.optional(),
    tailLoss95Ceiling: MoneySchema.optional(),
    wrongTargetUpperBound: z.number().min(0).max(1),
    policyViolationUpperBound: z.number().min(0).max(1),
    irreversibleRegretUpperBound: z.number().min(0).max(1),
    privacyIncidentUpperBound: z.number().min(0).max(1),
    maxOodScore: z.number().nonnegative(),
    allowWeakSupport: z.boolean(),
  })
  .strict();

export const BrokerExecutionRequestWireSchema = z
  .object({
    runId: z.string().min(1),
    attemptId: z.string().uuid(),
    action: CanonicalOperatorActionSchema,
    goal: GoalSpecSchema,
    plan: PlanIRSchema,
    authorization: AuthorizationEvidenceSchema,
    provenance: ProvenanceGraphSchema,
    current: z
      .object({
        intentEpoch: z.number().int().nonnegative(),
        mandateVersion: z.number().int().positive(),
        consentEpoch: z.string().min(1),
        connectorEpoch: z.string().min(1),
        killSwitchEpoch: z.string().min(1),
        killSwitchActive: z.boolean(),
        fencingToken: z.string().regex(/^\d+$/u),
        now: IsoDateTimeSchema,
      })
      .strict(),
    mandate: MandateSchema.optional(),
    capabilityCell: CapabilityCellSchema.optional(),
    idempotencyKey: z.string().min(8),
    reservationId: z.string().uuid(),
    maxBudget: MoneySchema.optional(),
    riskEstimate: RiskEstimateSchema,
    riskBudget: RiskBudgetSchema,
    evidenceClass: z.enum(["fixture", "sandbox", "test_account", "internal_canary", "production_cohort"]),
  })
  .strict();

export const OperatorRpcEnvelopeSchema = z
  .object({
    capabilityToken: z.string().min(32),
    request: BrokerExecutionRequestWireSchema,
    preState: z.unknown().optional(),
  })
  .strict();

export type OperatorRpcEnvelope = z.infer<typeof OperatorRpcEnvelopeSchema>;

export function decodeRequest(wire: z.infer<typeof BrokerExecutionRequestWireSchema>): BrokerExecutionRequest {
  return {
    runId: wire.runId,
    attemptId: wire.attemptId,
    action: wire.action,
    goal: wire.goal,
    plan: wire.plan,
    authorization: wire.authorization,
    provenance: wire.provenance,
    current: {
      ...wire.current,
      fencingToken: BigInt(wire.current.fencingToken),
      now: new Date(wire.current.now),
    },
    ...(wire.mandate === undefined ? {} : { mandate: wire.mandate }),
    ...(wire.capabilityCell === undefined ? {} : { capabilityCell: wire.capabilityCell }),
    idempotencyKey: wire.idempotencyKey,
    reservationId: wire.reservationId,
    ...(wire.maxBudget === undefined ? {} : { maxBudget: wire.maxBudget }),
    riskEstimate: {
      wrongTargetUpperBound: wire.riskEstimate.wrongTargetUpperBound,
      policyViolationUpperBound: wire.riskEstimate.policyViolationUpperBound,
      irreversibleRegretUpperBound: wire.riskEstimate.irreversibleRegretUpperBound,
      privacyIncidentUpperBound: wire.riskEstimate.privacyIncidentUpperBound,
      oodScore: wire.riskEstimate.oodScore,
      supportRegion: wire.riskEstimate.supportRegion,
      calibratedAt: wire.riskEstimate.calibratedAt,
      ...(wire.riskEstimate.expectedLoss === undefined ? {} : { expectedLoss: wire.riskEstimate.expectedLoss }),
      ...(wire.riskEstimate.tailLoss95 === undefined ? {} : { tailLoss95: wire.riskEstimate.tailLoss95 }),
      ...(wire.riskEstimate.artifactId === undefined ? {} : { artifactId: wire.riskEstimate.artifactId }),
    },
    riskBudget: {
      wrongTargetUpperBound: wire.riskBudget.wrongTargetUpperBound,
      policyViolationUpperBound: wire.riskBudget.policyViolationUpperBound,
      irreversibleRegretUpperBound: wire.riskBudget.irreversibleRegretUpperBound,
      privacyIncidentUpperBound: wire.riskBudget.privacyIncidentUpperBound,
      maxOodScore: wire.riskBudget.maxOodScore,
      allowWeakSupport: wire.riskBudget.allowWeakSupport,
      ...(wire.riskBudget.expectedLossCeiling === undefined
        ? {}
        : { expectedLossCeiling: wire.riskBudget.expectedLossCeiling }),
      ...(wire.riskBudget.tailLoss95Ceiling === undefined
        ? {}
        : { tailLoss95Ceiling: wire.riskBudget.tailLoss95Ceiling }),
    },
    evidenceClass: wire.evidenceClass,
  };
}
