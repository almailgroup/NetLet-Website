import { describe, expect, it } from "vitest";
import { isExpressEligible, productRating, savingsPercent, specifications } from "./productDetail";
import type { ProductAttribute } from "./types";

const kwd = (amount: string) => ({ amount, currencyCode: "KWD" });
const attribute = (namespace: string, key: string, value: string): ProductAttribute => ({
  namespace,
  key,
  label: key,
  value,
});

describe("savingsPercent", () => {
  it("rounds to the percentage the merchant advertises", () => {
    // 1 - 399.90/444.90 is 10.1%, which floors to 9 and would undersell the offer.
    expect(savingsPercent(kwd("399.90"), kwd("444.90"))).toBe(10);
  });

  it("is 0 when there is nothing to save", () => {
    expect(savingsPercent(kwd("25.00"), null)).toBe(0);
    expect(savingsPercent(kwd("25.00"), kwd("25.00"))).toBe(0);
    expect(savingsPercent(kwd("25.00"), kwd("19.00"))).toBe(0);
  });

  it("is 0 rather than NaN when an amount will not parse", () => {
    expect(savingsPercent(kwd("not-a-price"), kwd("40.00"))).toBe(0);
    expect(savingsPercent(kwd("30.00"), kwd(""))).toBe(0);
  });
});

describe("productRating", () => {
  it("reads Shopify's rating metafield, which stores JSON rather than a number", () => {
    const rating = productRating([
      attribute("reviews", "rating", '{"scale_min":"1.0","scale_max":"5.0","value":"5.0"}'),
      attribute("reviews", "rating_count", "21"),
    ]);
    expect(rating).toEqual({ value: 5, scaleMax: 5, count: 21 });
  });

  it("keeps the store's own scale, so a 5 on a 10-point scale is not five stars", () => {
    const rating = productRating([
      attribute("reviews", "rating", '{"scale_min":"1.0","scale_max":"10.0","value":"5.0"}'),
    ]);
    expect(rating).toEqual({ value: 5, scaleMax: 10, count: null });
  });

  it("accepts a plain numeric metafield too", () => {
    expect(productRating([attribute("reviews", "rating", "4.5")])).toEqual({
      value: 4.5,
      scaleMax: 5,
      count: null,
    });
  });

  it("is absent when unconfigured or unparseable", () => {
    expect(productRating([])).toBeNull();
    expect(productRating([attribute("custom", "rating", "5")])).toBeNull();
    expect(productRating([attribute("reviews", "rating", "excellent")])).toBeNull();
  });

  it("drops a count that will not parse rather than showing NaN reviews", () => {
    const rating = productRating([
      attribute("reviews", "rating", "5"),
      attribute("reviews", "rating_count", "lots"),
    ]);
    expect(rating?.count).toBeNull();
  });
});

describe("isExpressEligible", () => {
  it("matches the tag however the merchant cased or prefixed it", () => {
    expect(isExpressEligible({ tags: ["Express"] })).toBe(true);
    expect(isExpressEligible({ tags: ["express"] })).toBe(true);
    expect(isExpressEligible({ tags: ["NetLet Express"] })).toBe(true);
    expect(isExpressEligible({ tags: [" express "] })).toBe(true);
  });

  it("does not match a tag that merely contains the word", () => {
    expect(isExpressEligible({ tags: ["Espresso"] })).toBe(false);
    expect(isExpressEligible({ tags: ["Express Delivery Excluded"] })).toBe(false);
    expect(isExpressEligible({ tags: [] })).toBe(false);
  });
});

describe("specifications", () => {
  it("prefers structured metafields", () => {
    expect(
      specifications({
        attributes: [attribute("custom", "material", "Anodised aluminium")],
        description: "A lamp.",
      }),
    ).toEqual({ kind: "rows", rows: [{ label: "material", value: "Anodised aluminium" }] });
  });

  it("never lists the review score as a specification", () => {
    expect(
      specifications({
        attributes: [attribute("reviews", "rating", "5")],
        description: "A lamp.",
      }),
    ).toEqual({ kind: "text", text: "A lamp." });
  });

  it("falls back to the description, and reports nothing when there is none", () => {
    expect(specifications({ attributes: [], description: "Display: 6.9\"" })).toEqual({
      kind: "text",
      text: 'Display: 6.9"',
    });
    expect(specifications({ attributes: [], description: "   " })).toEqual({ kind: "empty" });
  });
});
