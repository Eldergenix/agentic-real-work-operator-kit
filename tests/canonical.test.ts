import { describe, expect, it } from "vitest";
import { canonicalHash, canonicalJson } from "../src/lib/operator/canonical.js";

 describe("canonical serialization", () => {
  it("sorts object keys recursively", async () => {
    expect(canonicalJson({ z: 1, a: { y: 2, b: 3 } })).toBe('{"a":{"b":3,"y":2},"z":1}');
    expect(await canonicalHash({ a: 1, b: 2 })).toBe(await canonicalHash({ b: 2, a: 1 }));
  });
});
