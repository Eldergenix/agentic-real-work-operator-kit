import { describe, expect, it } from "vitest";
import { GoogleCalendarCreateAdapter } from "../src/lib/operator/adapters/google-calendar.js";
import { makeFixtureBundle } from "./fixtures.js";

 describe("Google Calendar provider adapter", () => {
  it("uses a deterministic provider object ID, performs separate GET verification, and verifies deletion", async () => {
    const bundle = await makeFixtureBundle({
      provider: "google_calendar",
      adapterVersion: "google-calendar-v1",
    });
    let event: Record<string, unknown> | undefined;
    let postCount = 0;
    let getCount = 0;

    const fetchImpl: typeof fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (method === "POST") {
        postCount += 1;
        const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        event = {
          ...body,
          etag: '"etag-1"',
          status: "confirmed",
          updated: new Date().toISOString(),
        };
        return new Response(JSON.stringify(event), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (method === "DELETE") {
        event = undefined;
        return new Response(null, { status: 204 });
      }
      if (method === "GET" && url.includes("/events/")) {
        getCount += 1;
        return event === undefined
          ? new Response(JSON.stringify({ error: { code: 404 } }), { status: 404 })
          : new Response(JSON.stringify(event), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
      }
      return new Response("unsupported", { status: 500 });
    }) as typeof fetch;

    const adapter = new GoogleCalendarCreateAdapter({
      tokenProvider: { getAccessToken: async () => "test-token" },
      fetchImpl,
    });
    const context = {
      attemptId: crypto.randomUUID(),
      idempotencyKey: bundle.request.idempotencyKey,
      fencingToken: 1n,
      intentEpoch: 1,
      mandateVersion: 1,
      consentEpoch: "consent-1",
      connectorEpoch: "connector-1",
      killSwitchEpoch: "kill-1",
    };
    const execution = await adapter.execute(bundle.action, context);
    expect(execution.status).toBe("acknowledged");
    if (execution.status !== "acknowledged") throw new Error("Expected acknowledgement");
    expect(execution.providerObjectId.startsWith("operator")).toBe(true);

    const verification = await adapter.verify(bundle.action, execution.providerObjectId, context);
    expect(verification.status).toBe("verified");
    expect(postCount).toBe(1);
    expect(getCount).toBeGreaterThanOrEqual(1);

    const compensated = await adapter.compensate(
      bundle.action,
      execution.providerObjectId,
      undefined,
      context,
    );
    expect(compensated.status).toBe("compensated");
  });
});
