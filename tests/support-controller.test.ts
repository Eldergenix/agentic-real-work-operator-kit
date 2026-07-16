import { describe, expect, it } from "vitest";
import { chooseMinimumBurdenSupport } from "../src/lib/operator/support-controller.js";

describe("support controller", () => {
  it("refreshes state before interrupting the user", () => {
    expect(chooseMinimumBurdenSupport(
      ["missing_non_authority_information", "stale_authoritative_state"],
      { allowBackgroundWait: true, allowAutomaticStateRefresh: true, allowAuthenticationHandoff: true, allowAuthorityPrompt: true },
    )).toBe("refresh_provider_state");
  });

  it("falls back safely when a preferred support action is disabled", () => {
    expect(chooseMinimumBurdenSupport(
      ["authentication_required"],
      { allowBackgroundWait: false, allowAutomaticStateRefresh: false, allowAuthenticationHandoff: false, allowAuthorityPrompt: false },
    )).toBe("abort_or_recover");
  });
});
