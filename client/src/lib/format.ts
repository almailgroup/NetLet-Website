import type { Money } from "@shared/commerce/types";
import type { LocaleCode } from "@shared/i18n/dictionary";

/**
 * The formatting locale for each language.
 *
 * Arabic uses `ar-KW`, so the currency renders as د.ك rather than the letters
 * KWD — but with `nu-latn` appended, which keeps Western digits. Gulf
 * storefronts price in Western digits even in Arabic copy, and Arabic-Indic
 * numerals on a price would read as unfamiliar rather than as localised.
 */
const NUMBER_LOCALE: Record<LocaleCode, string> = {
  en: "en-US",
  ar: "ar-KW-u-nu-latn",
};

/**
 * Format a Money or raw amount string into a localized currency string.
 * Falls back to `$X` rounding if Intl rejects the currency code.
 */
export function formatMoney(
  value: Money | string | number,
  options?: { currencyCode?: string; locale?: LocaleCode },
): string {
  let amountNum: number;
  let code: string;

  if (typeof value === "object" && value !== null && "amount" in value) {
    amountNum = Number.parseFloat(value.amount);
    code = value.currencyCode;
  } else {
    amountNum = typeof value === "string" ? Number.parseFloat(value) : value;
    code = options?.currencyCode ?? "USD";
  }

  if (Number.isNaN(amountNum)) return "—";

  try {
    return new Intl.NumberFormat(NUMBER_LOCALE[options?.locale ?? "en"], {
      style: "currency",
      currency: code,
      minimumFractionDigits: amountNum % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amountNum);
  } catch {
    return `$${amountNum.toFixed(0)}`;
  }
}
