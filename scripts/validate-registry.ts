import { EffectRegistry } from "../src/lib/operator/effect-registry.js";
import { FixtureCalendarAdapter } from "../src/lib/operator/adapters/fixture-calendar.js";
import { GoogleCalendarCreateAdapter } from "../src/lib/operator/adapters/google-calendar.js";

const registry = new EffectRegistry();
registry.register(new FixtureCalendarAdapter());
registry.register(
  new GoogleCalendarCreateAdapter({
    tokenProvider: {
      async getAccessToken(): Promise<string> {
        throw new Error("validation-only token provider must never be called");
      },
    },
  }),
);

for (const contract of registry.contracts()) {
  registry.assertCompleteForGraduation(contract.actionFamily, contract.version);
  if (contract.minimumVerificationGrade === "V0") {
    throw new Error(`${contract.actionFamily}@${contract.version} has no independent verifier`);
  }
  if (contract.compensationRef === undefined && !contract.explicitIrreversibility) {
    throw new Error(`${contract.actionFamily}@${contract.version} lacks recovery semantics`);
  }
}

console.log(
  JSON.stringify({
    event: "operator_registry_validated",
    contracts: registry.contracts().map((contract) => ({
      actionFamily: contract.actionFamily,
      version: contract.version,
      provider: contract.provider,
      verification: contract.minimumVerificationGrade,
      graduationState: contract.graduationState,
    })),
  }),
);
