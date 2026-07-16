import type { GoogleCalendarTokenProvider } from "../../../../src/lib/operator/adapters/google-calendar.js";

export class CredentialOwnerGoogleTokenProvider implements GoogleCalendarTokenProvider {
  constructor(
    private readonly binding: Fetcher,
    private readonly connectorEpoch: string,
  ) {}

  async getAccessToken(input: {
    userId: string;
    providerAccountId: string;
    requiredScopes: string[];
  }): Promise<string> {
    const response = await this.binding.fetch(
      new Request("https://credential-owner.internal/v1/google/access-token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...input, expectedConnectorEpoch: this.connectorEpoch }),
      }),
    );
    if (!response.ok) {
      throw new Error(`Credential owner rejected Google token request (${response.status})`);
    }
    const payload = (await response.json()) as unknown;
    if (
      payload === null ||
      typeof payload !== "object" ||
      typeof (payload as Record<string, unknown>)["accessToken"] !== "string"
    ) {
      throw new Error("Credential owner returned a malformed token response");
    }
    return (payload as Record<string, string>)["accessToken"] ?? "";
  }
}
