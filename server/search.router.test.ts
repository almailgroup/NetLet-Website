import { afterEach, describe, expect, it, vi } from "vitest";
import { parseRefinedSearch, searchRouter } from "./routers/search";

afterEach(() => vi.unstubAllGlobals());

describe("AI search response parsing", () => {
  it("uses Mistral's structured refinement while bounding the returned terms", () => {
    const result = parseRefinedSearch('{"query":"espresso maker","terms":["espresso","coffee","maker","kitchen","morning","extra"]}', "coffee machine");
    expect(result).toEqual({ query: "espresso maker", terms: ["espresso", "coffee", "maker", "kitchen", "morning"] });
  });

  it("falls back to the shopper's original query when a response is malformed", () => {
    expect(parseRefinedSearch("not json", "wireless audio")).toEqual({ query: "wireless audio", terms: [] });
  });

  it("returns a typed error when Mistral is unavailable so local search can remain active", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("service unavailable", { status: 503 })));
    const caller = searchRouter.createCaller({} as never);
    await expect(caller.refine({ query: "quiet coffee", catalogTitles: ["Brew Mini Espresso Maker"] })).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
