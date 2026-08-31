import { describe, expect, it } from "vitest";

/**
 * Live credential check, not a unit test: it calls Mistral for real. Skipped
 * when the key is absent so an unconfigured checkout or CI run stays green,
 * and runs as a genuine smoke test wherever the secret is configured.
 */
describe.skipIf(!process.env.MISTRAL_API_KEY)("Mistral API credential", () => {
  it("authenticates against the Mistral models endpoint", async () => {
    const apiKey = process.env.MISTRAL_API_KEY;

    const response = await fetch("https://api.mistral.ai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.status, "Mistral credentials must be accepted").toBe(200);
    const payload = (await response.json()) as { data?: unknown[] };
    expect(Array.isArray(payload.data)).toBe(true);
  }, 20_000);
});
