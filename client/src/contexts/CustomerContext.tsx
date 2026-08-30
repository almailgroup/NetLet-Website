import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { kuwaitDeliveryZones, type LocaleCode } from "@shared/customer";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const SAVED_STORAGE_KEY = "netlet:saved-product-ids";
const DELIVERY_STORAGE_KEY = "netlet:delivery-zone";
const LOCALE_STORAGE_KEY = "netlet:locale";

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(stored) ? stored.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function readText(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeValue(key: string, value: string | string[] | null) {
  if (typeof window === "undefined") return;
  if (value === null) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, Array.isArray(value) ? JSON.stringify(value) : value);
}

const copy = {
  en: { home: "Home", browse: "Browse", saved: "Saved", account: "Account", bag: "Bag", language: "العربية", delivery: "Deliver to", deliverySetup: "Delivery details pending configuration" },
  ar: { home: "الرئيسية", browse: "تصفح", saved: "المحفوظات", account: "الحساب", bag: "الحقيبة", language: "English", delivery: "التوصيل إلى", deliverySetup: "تفاصيل التوصيل بانتظار الإعداد" },
} as const;

type CustomerContextValue = {
  locale: LocaleCode;
  isArabic: boolean;
  labels: { [K in keyof typeof copy.en]: string };
  setLocale: (locale: LocaleCode) => void;
  toggleLocale: () => void;
  savedIds: string[];
  toggleSaved: (productId: string) => void;
  deliveryZoneId: string | null;
  deliveryZone: (typeof kuwaitDeliveryZones)[number] | undefined;
  setDeliveryZoneId: (zoneId: string) => void;
  isSignedIn: boolean;
};

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [guestSavedIds, setGuestSavedIds] = useState(() => readList(SAVED_STORAGE_KEY));
  const [guestDeliveryZoneId, setGuestDeliveryZoneId] = useState(() => readText(DELIVERY_STORAGE_KEY));
  const [locale, setLocaleState] = useState<LocaleCode>(() => readText(LOCALE_STORAGE_KEY) === "ar" ? "ar" : "en");
  const syncedGuestIds = useRef<string | null>(null);
  const profile = trpc.customer.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const saved = trpc.customer.saved.list.useQuery(undefined, { enabled: isAuthenticated });
  const updateProfile = trpc.customer.profile.update.useMutation({
    onSuccess: () => profile.refetch(),
  });
  const updateSaved = trpc.customer.saved.set.useMutation({
    onSuccess: () => saved.refetch(),
  });

  useEffect(() => {
    document.documentElement.lang = locale === "ar" ? "ar" : "en";
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    if (!isAuthenticated || !profile.data) return;
    if (profile.data.locale !== locale) setLocaleState(profile.data.locale);
  }, [isAuthenticated, locale, profile.data]);

  useEffect(() => {
    if (!isAuthenticated || !saved.data?.length) return;
    const guestKey = guestSavedIds.slice().sort().join("|");
    if (!guestKey || syncedGuestIds.current === guestKey) return;
    const serverIds = new Set(saved.data);
    const missing = guestSavedIds.filter(productId => !serverIds.has(productId));
    if (!missing.length) {
      syncedGuestIds.current = guestKey;
      return;
    }
    missing.forEach(productId => updateSaved.mutate({ productId, saved: true }));
    syncedGuestIds.current = guestKey;
  }, [guestSavedIds, isAuthenticated, saved.data, updateSaved]);

  const savedIds = isAuthenticated ? saved.data ?? guestSavedIds : guestSavedIds;
  const deliveryZoneId = isAuthenticated ? profile.data?.deliveryZoneId ?? guestDeliveryZoneId : guestDeliveryZoneId;
  const deliveryZone = kuwaitDeliveryZones.find(zone => zone.id === deliveryZoneId);

  const setLocale = useCallback((nextLocale: LocaleCode) => {
    setLocaleState(nextLocale);
    writeValue(LOCALE_STORAGE_KEY, nextLocale);
    if (isAuthenticated) updateProfile.mutate({ locale: nextLocale });
  }, [isAuthenticated, updateProfile]);

  const toggleLocale = useCallback(() => setLocale(locale === "en" ? "ar" : "en"), [locale, setLocale]);

  const toggleSaved = useCallback((productId: string) => {
    const nextSaved = !savedIds.includes(productId);
    if (isAuthenticated) {
      updateSaved.mutate({ productId, saved: nextSaved });
      return;
    }
    setGuestSavedIds(current => {
      const next = nextSaved ? Array.from(new Set([...current, productId])) : current.filter(id => id !== productId);
      writeValue(SAVED_STORAGE_KEY, next);
      return next;
    });
  }, [isAuthenticated, savedIds, updateSaved]);

  const setDeliveryZoneId = useCallback((zoneId: string) => {
    if (!kuwaitDeliveryZones.some(zone => zone.id === zoneId)) return;
    setGuestDeliveryZoneId(zoneId);
    writeValue(DELIVERY_STORAGE_KEY, zoneId);
    if (isAuthenticated) updateProfile.mutate({ deliveryZoneId: zoneId });
  }, [isAuthenticated, updateProfile]);

  const value = useMemo<CustomerContextValue>(() => ({
    locale,
    isArabic: locale === "ar",
    labels: copy[locale],
    setLocale,
    toggleLocale,
    savedIds,
    toggleSaved,
    deliveryZoneId,
    deliveryZone,
    setDeliveryZoneId,
    isSignedIn: isAuthenticated,
  }), [deliveryZone, deliveryZoneId, isAuthenticated, locale, savedIds, setDeliveryZoneId, setLocale, toggleLocale, toggleSaved]);

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomer must be used inside CustomerProvider");
  return context;
}
