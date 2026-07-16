import { z } from "zod";
import { VerificationGradeSchema } from "./schemas.js";

export const DomainCapabilityManifestEntrySchema = z
  .object({
    capabilityKey: z.string().min(1),
    domain: z.string().min(1),
    actionFamilies: z.array(z.string().min(1)).min(1),
    maximumTier: z.enum(["A0", "A1", "A2", "A3", "A4", "A5"]),
    minimumVerificationGrade: VerificationGradeSchema,
    implementationState: z.enum([
      "planned",
      "contracted",
      "registered",
      "test_account_proven",
      "internal_canary",
      "cohort_graduated",
      "disabled",
    ]),
    independentEvidenceRequired: z.array(z.string().min(1)).min(1),
    nonTransferableFrom: z.array(z.string().min(1)).default([]),
  })
  .strict();

export type DomainCapabilityManifestEntry = z.infer<typeof DomainCapabilityManifestEntrySchema>;

export const DOMAIN_CAPABILITY_MANIFEST: DomainCapabilityManifestEntry[] = [
  {
    capabilityKey: "calendar.private",
    domain: "calendar",
    actionFamilies: ["calendar.event.create", "calendar.event.update", "calendar.event.cancel"],
    maximumTier: "A2",
    minimumVerificationGrade: "V2",
    implementationState: "registered",
    independentEvidenceRequired: ["provider_event_get", "provider_revision_or_etag"],
    nonTransferableFrom: [],
  },
  {
    capabilityKey: "calendar.attendee",
    domain: "calendar",
    actionFamilies: ["calendar.invitation.create", "calendar.invitation.update", "calendar.invitation.cancel"],
    maximumTier: "A3",
    minimumVerificationGrade: "V3",
    implementationState: "planned",
    independentEvidenceRequired: ["provider_event_get", "attendee_state", "notification_or_delivery_event"],
    nonTransferableFrom: ["calendar.private"],
  },
  {
    capabilityKey: "communications.exact_recipient",
    domain: "communications",
    actionFamilies: ["email.queued_send", "email.send", "email.correct"],
    maximumTier: "A3",
    minimumVerificationGrade: "V3",
    implementationState: "planned",
    independentEvidenceRequired: ["sent_object", "delivery_or_bounce_event"],
    nonTransferableFrom: ["calendar.attendee"],
  },
  {
    capabilityKey: "browser.typed_commit",
    domain: "browser",
    actionFamilies: ["browser.form.submit", "browser.account.write"],
    maximumTier: "A3",
    minimumVerificationGrade: "V3",
    implementationState: "planned",
    independentEvidenceRequired: ["provider_api_or_refreshed_account_object"],
    nonTransferableFrom: ["connected_app.write"],
  },
  {
    capabilityKey: "health.user_defined_log",
    domain: "health",
    actionFamilies: ["health.workout.log", "health.routine.log"],
    maximumTier: "A4",
    minimumVerificationGrade: "V3",
    implementationState: "contracted",
    independentEvidenceRequired: ["physical_device_ack", "healthkit_readback", "device_attestation"],
    nonTransferableFrom: ["device.reminder"],
  },
  {
    capabilityKey: "ride.request",
    domain: "ride",
    actionFamilies: ["ride.request", "ride.cancel"],
    maximumTier: "A5",
    minimumVerificationGrade: "V3",
    implementationState: "planned",
    independentEvidenceRequired: ["ride_state", "fee_state"],
    nonTransferableFrom: ["commute.predict"],
  },
  {
    capabilityKey: "commerce.repeat_merchant",
    domain: "commerce",
    actionFamilies: ["commerce.order.create", "commerce.order.cancel", "commerce.refund.request"],
    maximumTier: "A5",
    minimumVerificationGrade: "V4",
    implementationState: "planned",
    independentEvidenceRequired: ["order_record", "transaction_record", "settlement_or_refund_record"],
    nonTransferableFrom: ["ride.request", "commerce.quote"],
  },
  {
    capabilityKey: "public.publish",
    domain: "public_communication",
    actionFamilies: ["public.post.publish", "public.post.correct", "public.post.delete"],
    maximumTier: "A5",
    minimumVerificationGrade: "V4",
    implementationState: "planned",
    independentEvidenceRequired: ["provider_post_object", "audience_state"],
    nonTransferableFrom: ["communications.exact_recipient"],
  },
].map((entry) => DomainCapabilityManifestEntrySchema.parse(entry));
