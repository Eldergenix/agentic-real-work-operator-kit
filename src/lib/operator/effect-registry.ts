import { EffectContractSchema, type EffectContract } from "./schemas.js";
import type { OperatorProviderAdapter } from "./provider-adapter.js";

export class EffectRegistry {
  private readonly adapters = new Map<string, OperatorProviderAdapter>();

  register(adapter: OperatorProviderAdapter): void {
    const contract = EffectContractSchema.parse(adapter.contract);
    const key = EffectRegistry.key(contract.actionFamily, contract.version);
    if (this.adapters.has(key)) throw new Error(`Duplicate effect contract ${key}`);
    this.assertGraduationInvariant(contract);
    this.adapters.set(key, adapter);
  }

  get(actionFamily: string, version: string): OperatorProviderAdapter | undefined {
    return this.adapters.get(EffectRegistry.key(actionFamily, version));
  }

  require(actionFamily: string, version: string): OperatorProviderAdapter {
    const adapter = this.get(actionFamily, version);
    if (adapter === undefined) throw new Error(`Unregistered committing action ${actionFamily}@${version}`);
    return adapter;
  }

  contracts(): EffectContract[] {
    return [...this.adapters.values()].map((adapter) => adapter.contract);
  }

  assertCompleteForGraduation(actionFamily: string, version: string): void {
    const contract = this.require(actionFamily, version).contract;
    this.assertGraduationInvariant(contract);
    if (contract.graduationState === "graduated" && contract.minimumVerificationGrade === "V1") {
      throw new Error(`${actionFamily}@${version} cannot graduate with write-response-only verification`);
    }
  }

  private assertGraduationInvariant(contract: EffectContract): void {
    if (contract.minimumVerificationGrade === "V0") {
      throw new Error(`${contract.actionFamily} has no independent verifier`);
    }
    if (contract.compensationRef === undefined && !contract.explicitIrreversibility) {
      throw new Error(`${contract.actionFamily} has neither compensation nor explicit irreversibility`);
    }
    if (
      contract.idempotencyClass === "non_idempotent_unattended_forbidden" &&
      contract.graduationState === "graduated"
    ) {
      throw new Error(`${contract.actionFamily} cannot graduate for unattended execution without safe idempotency`);
    }
  }

  static key(actionFamily: string, version: string): string {
    return `${actionFamily}@${version}`;
  }
}
