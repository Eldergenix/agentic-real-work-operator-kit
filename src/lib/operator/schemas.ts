import { z } from "zod";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

export const IsoDateTimeSchema = z.string().datetime({ offset: true });
export const HashSchema = z.string().regex(/^[a-f0-9]{64}$/u, "expected SHA-256 hex");
export const CurrencySchema = z.string().regex(/^[A-Z]{3}$/u);

export const MoneySchema = z
  .object({
    amountMinor: z.number().int().nonnegative(),
    currency: CurrencySchema,
  })
  .strict();

export const IntegritySchema = z.enum(["untrusted", "low", "medium", "high"]);
export const SensitivitySchema = z.enum([
  "public",
  "internal",
  "private",
  "sensitive",
  "highly_sensitive",
]);
export const OriginSchema = z.enum([
  "authenticated_user",
  "provider_system_of_record",
  "trusted_system",
  "model_derived",
  "external_untrusted",
]);
export const MemoryAuthoritySchema = z.enum([
  "none",
  "display_only",
  "preference_ranking",
  "planning_only",
  "authoritative_fact",
]);

export const ProvenanceLabelSchema = z
  .object({
    origin: OriginSchema,
    integrity: IntegritySchema,
    sensitivity: SensitivitySchema,
    purposes: z.array(z.string().min(1)).min(1),
    occurredAt: IsoDateTimeSchema.optional(),
    observedAt: IsoDateTimeSchema,
    ingestedAt: IsoDateTimeSchema,
    originRef: z.string().min(1),
    transformationRefs: z.array(z.string().min(1)).default([]),
    authorityCeiling: MemoryAuthoritySchema,
  })
  .strict();

export const ProvenanceNodeSchema = z
  .object({
    nodeId: z.string().min(1),
    kind: z.enum([
      "user_message",
      "provider_observation",
      "tool_result",
      "model_output",
      "memory_item",
      "denial_event",
      "system_value",
      "action_field",
    ]),
    valueHash: HashSchema,
    label: ProvenanceLabelSchema,
  })
  .strict();

export const ProvenanceEdgeSchema = z
  .object({
    fromNodeId: z.string().min(1),
    toNodeId: z.string().min(1),
    transformation: z.string().min(1),
  })
  .strict();

export const ProvenanceGraphSchema = z
  .object({
    rootNodeId: z.string().min(1),
    nodes: z.array(ProvenanceNodeSchema).min(1),
    edges: z.array(ProvenanceEdgeSchema),
  })
  .strict();

export const TargetRefSchema = z
  .object({
    type: z.string().min(1),
    id: z.string().min(1),
    provider: z.string().min(1).optional(),
    accountId: z.string().min(1).optional(),
  })
  .strict();

export const AudiencePolicySchema = z
  .object({
    scope: z.enum(["private", "bounded_group", "organization", "public"]),
    exactIds: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const TimeWindowSchema = z
  .object({
    notBefore: IsoDateTimeSchema.optional(),
    notAfter: IsoDateTimeSchema,
    timezone: z.string().min(1),
  })
  .strict()
  .refine(
    (value) =>
      value.notBefore === undefined ||
      new Date(value.notBefore).getTime() <= new Date(value.notAfter).getTime(),
    "notBefore must not exceed notAfter",
  );

export const ConsequenceVectorSchema = z
  .object({
    financialMaxLoss: MoneySchema.optional(),
    privacySeverity: z.number().int().min(0).max(4),
    publicReach: z.enum(["private", "bounded_group", "organization", "public"]),
    legalFinality: z.number().int().min(0).max(4),
    healthImpact: z.number().int().min(0).max(4),
    physicalImpact: z.number().int().min(0).max(4),
    accountSecurityImpact: z.number().int().min(0).max(4),
    propagation: z.enum(["single_object", "multiple_objects", "external_people", "public"]),
    reversibility: z.enum(["full", "partial", "time_limited", "none"]),
  })
  .strict();

export const VerificationGradeSchema = z.enum(["V0", "V1", "V2", "V3", "V4"]);
export const IdempotencyClassSchema = z.enum([
  "provider_native_key",
  "client_generated_object_id",
  "compare_and_swap_version",
  "read_before_retry",
  "single_attempt_reconcile_only",
  "non_idempotent_unattended_forbidden",
]);
export const RecoverySemanticsSchema = z.enum([
  "true_reversal",
  "time_limited_cancellation",
  "restoration",
  "refund_initiated",
  "refund_settled",
  "correction",
  "mitigation",
  "partial_reversal",
  "irreversible",
]);

export const BoundSlotSchema = z
  .object({
    value: JsonValueSchema,
    source: z.enum([
      "explicit_user_text",
      "provider_unique_resolution",
      "mandate_default",
      "recorded_approval",
    ]),
    provenanceNodeId: z.string().min(1),
  })
  .strict();

export const GoalPredicateSchema = z
  .object({
    predicateId: z.string().min(1),
    description: z.string().min(1),
    kind: z.enum(["provider_state", "device_state", "temporal", "user_attested", "compound"]),
    expression: JsonValueSchema,
    maturityHorizonMs: z.number().int().nonnegative(),
    requiredVerificationGrade: VerificationGradeSchema,
  })
  .strict();

export const GoalSpecSchema = z
  .object({
    goalId: z.string().uuid(),
    version: z.number().int().positive(),
    intentEpoch: z.number().int().nonnegative(),
    userId: z.string().uuid(),
    conversationId: z.string().min(1).optional(),
    sourceMessageIds: z.array(z.string().min(1)).min(1),
    objective: z.string().min(1),
    terminalPredicates: z.array(GoalPredicateSchema).min(1),
    forbiddenSideEffects: z.array(GoalPredicateSchema).default([]),
    authoritySlots: z.record(z.string(), BoundSlotSchema),
    unresolvedSlots: z.array(z.string().min(1)).default([]),
    mandateId: z.string().uuid().optional(),
    policyHash: HashSchema,
    consentEpoch: z.string().min(1),
    validUntil: IsoDateTimeSchema,
    canonicalHash: HashSchema,
  })
  .strict();

export const ProtectedInputBindingSchema = z
  .object({
    fieldPath: z.string().min(1),
    valueHash: HashSchema,
    provenanceNodeId: z.string().min(1),
    requiredIntegrity: IntegritySchema,
    requiredPurpose: z.string().min(1),
    minimumAuthority: MemoryAuthoritySchema,
  })
  .strict();

export const CanonicalOperatorActionSchema = z
  .object({
    actionId: z.string().uuid(),
    logicalEffectId: z.string().uuid(),
    userId: z.string().uuid(),
    goalId: z.string().uuid(),
    goalSpecHash: HashSchema,
    planId: z.string().uuid(),
    planVersion: z.number().int().positive(),
    nodeId: z.string().min(1),
    intentEpoch: z.number().int().nonnegative(),
    domain: z.string().min(1),
    actionFamily: z.string().min(1),
    provider: z.string().min(1),
    providerAccountId: z.string().min(1),
    target: TargetRefSchema,
    arguments: JsonValueSchema,
    argumentsHash: HashSchema,
    purpose: z.string().min(1),
    consequence: ConsequenceVectorSchema,
    amount: MoneySchema.optional(),
    requiredVerificationGrade: VerificationGradeSchema,
    idempotencyClass: IdempotencyClassSchema,
    adapterVersion: z.string().min(1),
    expiresAt: IsoDateTimeSchema,
  })
  .strict();

export const PlanNodeSchema = z
  .object({
    nodeId: z.string().min(1),
    action: CanonicalOperatorActionSchema,
    protectedInputBindings: z.array(ProtectedInputBindingSchema),
    preconditions: z.array(GoalPredicateSchema),
    expectedPostconditions: z.array(GoalPredicateSchema).min(1),
    verificationRef: z.string().min(1),
    compensationRef: z.string().min(1).optional(),
    pointOfNoReturn: z.string().min(1).optional(),
    recoverySemantics: RecoverySemanticsSchema,
    maxAttempts: z.number().int().positive(),
  })
  .strict();

export const PlanEdgeSchema = z
  .object({
    fromNodeId: z.string().min(1),
    toNodeId: z.string().min(1),
    condition: z.enum(["on_verified", "on_failed", "on_uncertain", "always"]),
  })
  .strict();

export const PlanIRSchema = z
  .object({
    planId: z.string().uuid(),
    planVersion: z.number().int().positive(),
    userId: z.string().uuid(),
    goalId: z.string().uuid(),
    goalSpecHash: HashSchema,
    intentEpoch: z.number().int().nonnegative(),
    mandateVersion: z.number().int().positive(),
    policyHash: HashSchema,
    consentEpoch: z.string().min(1),
    provenanceRootHash: HashSchema,
    expiresAt: IsoDateTimeSchema,
    nodes: z.array(PlanNodeSchema).min(1),
    edges: z.array(PlanEdgeSchema),
    terminalPredicates: z.array(GoalPredicateSchema).min(1),
    canonicalHash: HashSchema,
  })
  .strict();

export const MandateSchema = z
  .object({
    mandateId: z.string().uuid(),
    userId: z.string().uuid(),
    version: z.number().int().positive(),
    status: z.enum(["active", "paused", "revoked", "expired"]),
    automaticPromotion: z.boolean(),
    maximumEnvelope: z.array(z.string().min(1)),
    validFrom: IsoDateTimeSchema,
    expiresAt: IsoDateTimeSchema,
    policyHash: HashSchema,
    consentEpoch: z.string().min(1),
  })
  .strict();

export const CapabilityCellSchema = z
  .object({
    capabilityCellId: z.string().uuid(),
    userId: z.string().uuid(),
    mandateId: z.string().uuid(),
    mandateVersion: z.number().int().positive(),
    productTier: z.enum(["A0", "A1", "A2", "A3", "A4", "A5"]),
    domain: z.string().min(1),
    actionFamily: z.string().min(1),
    provider: z.string().min(1),
    providerAccountId: z.string().min(1),
    targetType: z.string().min(1),
    exactTargetIds: z.array(z.string().min(1)),
    purpose: z.string().min(1),
    consequenceCeiling: ConsequenceVectorSchema,
    amountCeiling: MoneySchema.optional(),
    minimumVerificationGrade: VerificationGradeSchema,
    allowedIdempotencyClasses: z.array(IdempotencyClassSchema).min(1),
    validFrom: IsoDateTimeSchema,
    expiresAt: IsoDateTimeSchema,
    evidenceEpoch: z.string().min(1),
    policyHash: HashSchema,
  })
  .strict();

export const DirectCommandAttestationSchema = z
  .object({
    kind: z.literal("direct_command"),
    attestationId: z.string().uuid(),
    userId: z.string().uuid(),
    conversationId: z.string().min(1),
    sourceMessageId: z.string().min(1),
    actionHash: HashSchema,
    targetHash: HashSchema,
    policyHash: HashSchema,
    nonce: z.string().min(16),
    expiresAt: IsoDateTimeSchema,
    consumedAt: IsoDateTimeSchema.optional(),
  })
  .strict();

export const RecordedApprovalSchema = z
  .object({
    kind: z.literal("recorded_approval"),
    approvalId: z.string().uuid(),
    userId: z.string().uuid(),
    actionHash: HashSchema,
    targetHash: HashSchema,
    policyHash: HashSchema,
    nonce: z.string().min(16),
    expiresAt: IsoDateTimeSchema,
    consumedAt: IsoDateTimeSchema.optional(),
  })
  .strict();

export const OperatorMandateEvidenceSchema = z
  .object({
    kind: z.literal("operator_mandate"),
    mandateId: z.string().uuid(),
    capabilityCellId: z.string().uuid(),
  })
  .strict();

export const AuthorizationEvidenceSchema = z.discriminatedUnion("kind", [
  DirectCommandAttestationSchema,
  RecordedApprovalSchema,
  OperatorMandateEvidenceSchema,
]);

export const EffectContractSchema = z
  .object({
    actionFamily: z.string().min(1),
    version: z.string().min(1),
    domain: z.string().min(1),
    provider: z.string().min(1),
    committing: z.literal(true),
    idempotencyClass: IdempotencyClassSchema,
    minimumVerificationGrade: VerificationGradeSchema,
    recoverySemantics: RecoverySemanticsSchema,
    sourceOfTruth: z.string().min(1),
    sourceOfTruthRank: z.number().int().positive(),
    maturityHorizonMs: z.number().int().nonnegative(),
    expectedVisibilityDelayMs: z.number().int().nonnegative(),
    verifierRef: z.string().min(1),
    reconciliationRef: z.string().min(1),
    compensationRef: z.string().min(1).optional(),
    explicitIrreversibility: z.boolean(),
    pointOfNoReturn: z.string().min(1).optional(),
    graduationState: z.enum(["unregistered", "registered", "test_proven", "canary", "graduated"]),
  })
  .strict()
  .superRefine((contract, context) => {
    if (contract.compensationRef === undefined && !contract.explicitIrreversibility) {
      context.addIssue({
        code: "custom",
        message: "committing effects require compensationRef or explicitIrreversibility",
        path: ["compensationRef"],
      });
    }
  });

export const VerificationObservationSchema = z
  .object({
    observationId: z.string().uuid(),
    actionId: z.string().uuid(),
    attemptId: z.string().uuid(),
    providerObjectId: z.string().min(1),
    verifierRef: z.string().min(1),
    grade: VerificationGradeSchema,
    observedAt: IsoDateTimeSchema,
    sourceVersion: z.string().min(1).optional(),
    matched: z.boolean(),
    predicateResults: z.record(z.string(), z.boolean()),
    redactedEvidenceHash: HashSchema,
  })
  .strict();

export type Money = z.infer<typeof MoneySchema>;
export type ProvenanceLabel = z.infer<typeof ProvenanceLabelSchema>;
export type ProvenanceNode = z.infer<typeof ProvenanceNodeSchema>;
export type ProvenanceGraph = z.infer<typeof ProvenanceGraphSchema>;
export type TargetRef = z.infer<typeof TargetRefSchema>;
export type ConsequenceVector = z.infer<typeof ConsequenceVectorSchema>;
export type VerificationGrade = z.infer<typeof VerificationGradeSchema>;
export type IdempotencyClass = z.infer<typeof IdempotencyClassSchema>;
export type RecoverySemantics = z.infer<typeof RecoverySemanticsSchema>;
export type GoalPredicate = z.infer<typeof GoalPredicateSchema>;
export type GoalSpec = z.infer<typeof GoalSpecSchema>;
export type ProtectedInputBinding = z.infer<typeof ProtectedInputBindingSchema>;
export type CanonicalOperatorAction = z.infer<typeof CanonicalOperatorActionSchema>;
export type PlanNode = z.infer<typeof PlanNodeSchema>;
export type PlanIR = z.infer<typeof PlanIRSchema>;
export type Mandate = z.infer<typeof MandateSchema>;
export type CapabilityCell = z.infer<typeof CapabilityCellSchema>;
export type AuthorizationEvidence = z.infer<typeof AuthorizationEvidenceSchema>;
export type EffectContract = z.infer<typeof EffectContractSchema>;
export type VerificationObservation = z.infer<typeof VerificationObservationSchema>;
