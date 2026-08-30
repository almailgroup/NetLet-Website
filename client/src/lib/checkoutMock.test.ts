import { describe, expect, it } from "vitest";
import { CHECKOUT_IS_MOCK_ONLY, KUWAIT_PAYMENT_METHODS } from "./checkoutMock";

describe("Kuwait native checkout mock configuration", () => {
  it("keeps the four requested payment brands visible and non-functional", () => {
    expect(CHECKOUT_IS_MOCK_ONLY).toBe(true);
    expect(KUWAIT_PAYMENT_METHODS.map((method) => method.id)).toEqual([
      "knet",
      "visa",
      "mastercard",
      "google-pay",
    ]);
  });
});
