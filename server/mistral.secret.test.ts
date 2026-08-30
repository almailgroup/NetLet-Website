import { describe, expect, it } from "vitest";

describe("Mistral API credential", () => {
  it("authenticates against the Mistral models endpoint", async () => {
    const apiKey = process.env.MISTRAL_API_KEY;
    expect(apiKey, "MISTRAL_API_KEY must be configured").toBeTruthy();

    const response = await fetch("https://api.mistral.ai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.status, "Mistral credentials must be accepted").toBe(200);
    const payload = (await response.json()) as { data?: unknown[] };
    expect(Array.isArray(payload.data)).toBe(true);
  }, 20_000);
});
