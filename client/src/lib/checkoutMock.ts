/**
 * NetLet checkout mock: Kuwait payment brands are display-only until a secure
 * payment service is chosen and integrated in the final payment phase.
 */
export const KUWAIT_PAYMENT_METHODS = [
  { id: "knet", label: "KNET", tone: "navy" },
  { id: "visa", label: "VISA", tone: "blue" },
  { id: "mastercard", label: "Mastercard", tone: "red" },
  { id: "google-pay", label: "Google Pay", tone: "ink" },
] as const;

export const CHECKOUT_IS_MOCK_ONLY = true;
