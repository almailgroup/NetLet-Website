/**
 * Brand artwork paths, resolved once for the whole app.
 *
 * In a normal deployment these come from `/manus-storage/...`, proxied by
 * `server/_core/storageProxy.ts` against Manus Forge storage. A static build has
 * neither that route nor the API credentials it needs, so the demo falls back to
 * committed placeholders under `client/public/brand/`.
 *
 * To use the real artwork in the static demo, drop the files into
 * `client/public/brand/` and point the DEMO_* constants below at them.
 */
import { appPath } from "@/lib/basePath";
import { DEMO_MODE } from "@/lib/demoMode";

const STORAGE_LOGO = "/manus-storage/netlet-logo-transparent_3d66ed60.png";
const STORAGE_FOOTER_LOGO =
  "/manus-storage/netlet-footer-white-transparent_a243ae75.png";
const STORAGE_HERO = "/manus-storage/soukora-hero-living_ef30008d.jpg";

const DEMO_LOGO = appPath("/brand/netlet-logo.svg");
const DEMO_FOOTER_LOGO = appPath("/brand/netlet-logo-white.svg");
const DEMO_HERO = appPath("/brand/hero.svg");

export const logoImage = DEMO_MODE ? DEMO_LOGO : STORAGE_LOGO;
export const footerLogoImage = DEMO_MODE
  ? DEMO_FOOTER_LOGO
  : STORAGE_FOOTER_LOGO;
export const heroImage = DEMO_MODE ? DEMO_HERO : STORAGE_HERO;

/** Artwork for the home-page rail support cards, in tech / home / style order. */
export const collectionImages = DEMO_MODE
  ? [
      appPath("/brand/collection-tech.svg"),
      appPath("/brand/collection-home.svg"),
      appPath("/brand/collection-style.svg"),
    ]
  : [
      "/manus-storage/soukora-tech-collection_ec5980d5.jpg",
      "/manus-storage/soukora-home-collection_e04322e4.jpg",
      "/manus-storage/soukora-style-collection_696fb7a8.jpg",
    ];
