import { describe, expect, it } from "vitest";
import { DOMAIN_CAPABILITY_MANIFEST } from "../src/lib/operator/domain-manifest.js";

describe("domain capability manifest", () => {
  it("keeps sensitive/consequential cells separate from lower-risk evidence", () => {
    const ride = DOMAIN_CAPABILITY_MANIFEST.find((item) => item.capabilityKey === "ride.request");
    const commerce = DOMAIN_CAPABILITY_MANIFEST.find((item) => item.capabilityKey === "commerce.repeat_merchant");
    expect(ride?.maximumTier).toBe("A5");
    expect(commerce?.minimumVerificationGrade).toBe("V4");
    expect(commerce?.nonTransferableFrom).toContain("ride.request");
  });
});
