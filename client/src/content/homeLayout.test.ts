import { describe, expect, it } from "vitest";
import { categoryRail, editorialUpdates, footerGroups, homeRailDefinitions } from "./homeLayout";

describe("NetLet home layout content", () => {
  it("defines the requested marketplace rail hierarchy", () => {
    expect(homeRailDefinitions.map((rail) => rail.title)).toEqual(["Deals", "Bestsellers", "Most popular", "Newest"]);
  });

  it("keeps category, editorial, and support/footer sections available", () => {
    expect(categoryRail).toHaveLength(6);
    expect(editorialUpdates).toHaveLength(3);
    expect(footerGroups).toHaveLength(4);
  });
});
