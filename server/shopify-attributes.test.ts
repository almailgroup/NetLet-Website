import { describe, expect, it } from "vitest";
import { normalizeProduct } from "./_core/shopifyNormalize";

describe("Shopify structured product attributes", () => {
  it("normalizes non-empty custom metafields into readable product attributes", () => {
    const product = normalizeProduct({
      id: "gid://shopify/Product/attributes-test",
      title: "Attribute test",
      handle: "attribute-test",
      description: "",
      descriptionHtml: "",
      productType: "Electronics",
      vendor: "NetLet",
      tags: [],
      metafields: [
        { namespace: "custom", key: "battery_life", value: "20 hours" },
        { namespace: "custom", key: "empty_value", value: "" },
        null,
      ],
      options: [],
      priceRange: {
        minVariantPrice: { amount: "10", currencyCode: "KWD" },
        maxVariantPrice: { amount: "10", currencyCode: "KWD" },
      },
      images: { edges: [] },
      variants: { edges: [] },
    });

    expect(product.attributes).toEqual([
      { namespace: "custom", key: "battery_life", label: "Battery Life", value: "20 hours" },
    ]);
  });
});
