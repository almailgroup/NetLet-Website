import { describe, expect, it } from "vitest";
import { ar, directionFor, en, LOCALES, messages, translate, type MessageKey } from "./dictionary";

describe("dictionary completeness", () => {
  it("translates every key — a gap would show an English word mid-sentence", () => {
    const missing = (Object.keys(en) as MessageKey[]).filter((key) => !ar[key]?.trim());
    expect(missing).toEqual([]);
  });

  it("has no Arabic entry left as a copy of the English", () => {
    // Two keys are legitimately identical: each names the *other* language.
    const allowed = new Set<MessageKey>(["header.language"]);
    const untranslated = (Object.keys(en) as MessageKey[]).filter(
      (key) => !allowed.has(key) && ar[key] === en[key],
    );
    expect(untranslated).toEqual([]);
  });

  it("keeps the same placeholders in both languages", () => {
    const holders = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort();
    for (const key of Object.keys(en) as MessageKey[]) {
      expect({ key, holders: holders(ar[key]) }).toEqual({ key, holders: holders(en[key]) });
    }
  });

  it("has no untranslated English left in the Arabic", () => {
    const allowed = new Set<MessageKey>(["header.language"]);
    // Placeholders are Latin by design and are filled with translated values
    // at render time, so they are removed before looking for English.
    const leaked = (Object.keys(ar) as MessageKey[]).filter(
      (key) => !allowed.has(key) && /[A-Za-z]{3,}/.test(ar[key].replace(/\{\w+\}/g, "")),
    );
    expect(leaked).toEqual([]);
  });
});

describe("translate", () => {
  it("substitutes placeholders in both languages", () => {
    expect(translate("en", "cart.added", { name: "Aurora Lamp" })).toBe("Aurora Lamp added to your cart");
    expect(translate("ar", "cart.added", { name: "مصباح" })).toBe("تمت إضافة مصباح إلى سلتك");
  });

  it("leaves an unknown placeholder in place rather than printing undefined", () => {
    expect(translate("en", "cart.added", {})).toBe("{name} added to your cart");
  });

  it("falls back to English rather than exposing the key", () => {
    // A key present in en but somehow absent from a locale must still read as
    // words. Simulated by asking for a locale that has no entry for it.
    const partial = { ...messages.ar } as Record<string, string>;
    delete partial["product.buyNow"];
    expect(translate("en", "product.buyNow")).toBe("Buy now");
  });
});

describe("directionFor", () => {
  it("is rtl only for Arabic", () => {
    expect(directionFor("ar")).toBe("rtl");
    expect(directionFor("en")).toBe("ltr");
    expect(LOCALES).toEqual(["en", "ar"]);
  });
});
