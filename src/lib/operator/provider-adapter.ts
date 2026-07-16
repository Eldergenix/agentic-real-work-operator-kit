import type {
  CanonicalOperatorAction,
  EffectContract,
  JsonValue,
  VerificationObservation,
} from "./schemas.js";

export type ProviderExecutionResult =
  | {
      status: "acknowledged";
      providerObjectId: string;
      providerReceiptRef?: string;
      providerReceipt: JsonValue;
    }
  | {
      status: "failed";
      failureCode: string;
      providerProvedNoEffect: true;
      providerReceipt?: JsonValue;
    }
  | {
      status: "uncertain";
      reasonCode: string;
      providerObjectId?: string;
      providerReceipt?: JsonValue;
    }
  | {
      status: "authentication_required";
      handoffRef: string;
      providerReceipt?: JsonValue;
    };

export type ProviderVerificationResult =
  | {
      status: "verified";
      observation: VerificationObservation;
      providerState: JsonValue;
    }
  | {
      status: "mismatch";
      observation: VerificationObservation;
      providerState: JsonValue;
      mismatchFields: string[];
    }
  | {
      status: "not_visible_yet";
      observedAt: string;
      retryAfterMs: number;
    }
  | {
      status: "uncertain";
      observedAt: string;
      reasonCode: string;
    };

export type ProviderReconciliationResult =
  | { status: "verified"; verification: Extract<ProviderVerificationResult, { status: "verified" }> }
  | { status: "failed"; failureCode: string; providerProvedNoEffect: true }
  | { status: "uncertain"; reasonCode: string; retryAfterMs?: number };

export type ProviderCompensationResult =
  | {
      status: "compensated";
      observation: VerificationObservation;
      providerState: JsonValue;
    }
  | { status: "failed"; failureCode: string }
  | { status: "uncertain"; reasonCode: string };

export type ProviderAttemptContext = {
  attemptId: string;
  idempotencyKey: string;
  fencingToken: bigint;
  intentEpoch: number;
  mandateVersion: number;
  consentEpoch: string;
  connectorEpoch: string;
  killSwitchEpoch: string;
  signal?: AbortSignal;
};

export interface OperatorProviderAdapter {
  readonly contract: EffectContract;

  execute(action: CanonicalOperatorAction, context: ProviderAttemptContext): Promise<ProviderExecutionResult>;

  verify(
    action: CanonicalOperatorAction,
    providerObjectId: string,
    context: ProviderAttemptContext,
  ): Promise<ProviderVerificationResult>;

  reconcile(
    action: CanonicalOperatorAction,
    providerObjectId: string | undefined,
    context: ProviderAttemptContext,
  ): Promise<ProviderReconciliationResult>;

  compensate?(
    action: CanonicalOperatorAction,
    providerObjectId: string,
    preState: JsonValue | undefined,
    context: ProviderAttemptContext,
  ): Promise<ProviderCompensationResult>;
}
