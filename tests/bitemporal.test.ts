import { describe, expect, it } from "vitest";
import { assertObservationUsable } from "../src/lib/operator/bitemporal.js";

 describe("bitemporal observations", () => {
  it("distinguishes stale or missing observations from negative state", () => {
    const now = new Date();
    expect(() =>
      assertObservationUsable(
        {
          eventId: "event-1",
          observedAt: now.toISOString(),
          ingestedAt: now.toISOString(),
          validFrom: now.toISOString(),
          revision: 1,
          freshnessTtlMs: 1_000,
          missingness: "permission_denied",
        },
        now,
      ),
    ).toThrow(/permission_denied/u);
  });
});
