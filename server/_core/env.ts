/**
 * Runtime configuration. Every value is optional at boot — the server starts on
 * an empty environment — so each unset entry disables a feature rather than
 * preventing startup. See .env.example for what each one switches off.
 */
export const ENV = {
  /** Signs session cookies. Required before any sign-in can succeed. */
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  /** Address granted the admin role when it registers. */
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  shopifyStoreDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  shopifyStorefrontApiAccessToken: process.env.SHOPIFY_STOREFRONT_API_ACCESS_TOKEN ?? "",
  mistralApiKey: process.env.MISTRAL_API_KEY ?? "",
};
