/**
 * Static catalog used by the GitHub Pages demo build.
 *
 * The live storefront gets its products from Shopify through the `commerce.*`
 * tRPC procedures. A static host runs no server, so this module supplies the
 * same `Product` shapes from `@shared/commerce/types` to keep every screen
 * rendering with realistic data. Nothing here is a real product or price.
 *
 * Images are inline SVG data URIs on purpose: the demo then has no external
 * image host to go down, rate-limit, or need licensing for.
 */
import type { Product } from "@shared/commerce/types";

const CURRENCY = "KWD";

/** Deterministic placeholder artwork — a soft two-tone panel with the product initials. */
function placeholderImage(title: string, from: string, to: string): string {
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <circle cx="640" cy="168" r="128" fill="#ffffff" opacity="0.22"/>
  <circle cx="168" cy="640" r="96" fill="#0a285a" opacity="0.06"/>
  <rect x="176" y="232" width="448" height="336" rx="44" fill="#ffffff" opacity="0.62"/>
  <text x="400" y="437" font-family="Georgia, 'Times New Roman', serif" font-size="132" font-weight="700"
        fill="#0a285a" opacity="0.72" text-anchor="middle">${initials}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\n\s*/g, " "))}`;
}

type Seed = {
  handle: string;
  title: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  price: number;
  compareAt?: number;
  soldOut?: boolean;
  options?: { name: string; values: string[] };
  palette: [string, string];
};

const SEEDS: Seed[] = [
  {
    handle: "aurora-desk-lamp",
    title: "Aurora Desk Lamp",
    description:
      "A warm, dimmable desk light with a brushed aluminium arm. Three colour temperatures move it from focused work to a softer evening glow.",
    productType: "Home & Kitchen",
    vendor: "Lumen Studio",
    tags: ["Lighting", "Workspace", "Bestseller"],
    price: 24.5,
    compareAt: 31,
    options: { name: "Finish", values: ["Brushed Silver", "Matte Black"] },
    palette: ["#f5e4c9", "#e7d3b4"],
  },
  {
    handle: "harbour-wireless-earbuds",
    title: "Harbour Wireless Earbuds",
    description:
      "Compact earbuds with active noise cancelling and a pocketable charging case. Around 28 hours of total listening with the case topped up.",
    productType: "Electronics",
    vendor: "Northbank Audio",
    tags: ["Audio", "Bestseller", "New"],
    price: 39.9,
    compareAt: 52,
    options: { name: "Colour", values: ["Ivory", "Navy", "Graphite"] },
    palette: ["#dce5e9", "#c4d3da"],
  },
  {
    handle: "clay-pour-over-set",
    title: "Clay Pour-Over Set",
    description:
      "A stoneware dripper and carafe finished in a soft matte glaze. Brews two cups at a time and sits well on an open shelf.",
    productType: "Home & Kitchen",
    vendor: "Kiln & Co",
    tags: ["Coffee", "Ceramics"],
    price: 18,
    palette: ["#f0ddd0", "#e2c8b6"],
  },
  {
    handle: "meridian-mechanical-keyboard",
    title: "Meridian Mechanical Keyboard",
    description:
      "A 75% layout with hot-swappable switches, a machined aluminium case, and per-key backlighting. Connects over USB-C or Bluetooth.",
    productType: "Electronics",
    vendor: "Meridian Works",
    tags: ["Workspace", "Bestseller"],
    price: 62,
    compareAt: 74,
    options: { name: "Switch", values: ["Tactile", "Linear", "Silent"] },
    palette: ["#e7edf5", "#ccd9e8"],
  },
  {
    handle: "rosewater-facial-mist",
    title: "Rosewater Facial Mist",
    description:
      "A light hydrating mist of steam-distilled rosewater and glycerin. Settles quickly and layers cleanly under the rest of a routine.",
    productType: "Beauty",
    vendor: "Petal House",
    tags: ["Skincare", "New"],
    price: 8.75,
    palette: ["#f6d9d2", "#eec2b8"],
  },
  {
    handle: "linen-weekend-shirt",
    title: "Linen Weekend Shirt",
    description:
      "A relaxed shirt cut from washed European linen, with a soft collar and a slightly dropped shoulder. Gets better with every wash.",
    productType: "Style",
    vendor: "Coastline Supply",
    tags: ["Apparel", "Summer"],
    price: 29,
    options: { name: "Size", values: ["S", "M", "L", "XL"] },
    palette: ["#e4dfd0", "#d2ccb9"],
  },
  {
    handle: "cardamom-coffee-beans",
    title: "Cardamom Coffee Beans",
    description:
      "Medium-roast arabica ground with green cardamom, in the Gulf tradition. Sweet and aromatic, whether brewed as qahwa or drip.",
    productType: "Grocery",
    vendor: "Souk Roasters",
    tags: ["Coffee", "Pantry", "Bestseller"],
    price: 5.25,
    palette: ["#dce7cf", "#c6d6b6"],
  },
  {
    handle: "terrace-planter-trio",
    title: "Terrace Planter Trio",
    description:
      "Three nesting planters in unglazed terracotta with matching drainage saucers. Sized for herbs on a kitchen windowsill.",
    productType: "Home & Kitchen",
    vendor: "Kiln & Co",
    tags: ["Garden", "Ceramics"],
    price: 14.5,
    compareAt: 19,
    palette: ["#f0ddd0", "#dcbda9"],
  },
  {
    handle: "atlas-travel-backpack",
    title: "Atlas Travel Backpack",
    description:
      "A 28-litre carry-on backpack in recycled ripstop, with a padded laptop sleeve and a clamshell opening that lies flat.",
    productType: "Style",
    vendor: "Atlas Goods",
    tags: ["Travel", "Bags", "New"],
    price: 45,
    options: { name: "Colour", values: ["Sand", "Olive", "Black"] },
    palette: ["#dce5e9", "#bfd0d7"],
  },
  {
    handle: "midnight-sleep-balm",
    title: "Midnight Sleep Balm",
    description:
      "A shea and lavender balm for pulse points at the end of the day. Unhurried, faintly herbal, and not at all sweet.",
    productType: "Beauty",
    vendor: "Petal House",
    tags: ["Skincare", "Wellness"],
    price: 11.4,
    soldOut: true,
    palette: ["#e6ddef", "#d0c2e0"],
  },
  {
    handle: "orchard-honey-jar",
    title: "Orchard Blossom Honey",
    description:
      "Raw, unfiltered blossom honey in a 450g jar. Thick, slowly crystallising, and gathered from a single season's pressing.",
    productType: "Grocery",
    vendor: "Souk Roasters",
    tags: ["Pantry", "Gift"],
    price: 6.9,
    palette: ["#f7ecc9", "#ecd79c"],
  },
  {
    handle: "studio-monitor-speakers",
    title: "Studio Monitor Speakers",
    description:
      "A compact pair of near-field monitors with a woven mid driver and a silk dome tweeter. Balanced enough for mixing, easy to live with.",
    productType: "Electronics",
    vendor: "Northbank Audio",
    tags: ["Audio", "Workspace"],
    price: 118,
    compareAt: 139,
    palette: ["#e7edf5", "#c9d8e9"],
  },
];

function money(amount: number) {
  return { amount: amount.toFixed(2), currencyCode: CURRENCY };
}

function toProduct(seed: Seed, index: number): Product {
  const optionValues = seed.options?.values ?? ["Default Title"];
  const variants = optionValues.map((value, variantIndex) => ({
    id: `demo-variant-${index + 1}-${variantIndex + 1}`,
    title: value,
    price: money(seed.price),
    compareAtPrice: seed.compareAt ? money(seed.compareAt) : null,
    // Sold-out seeds are fully unavailable; otherwise the last variant of a
    // multi-option product is out of stock so the picker's disabled state shows.
    availableForSale: seed.soldOut
      ? false
      : !(optionValues.length > 2 && variantIndex === optionValues.length - 1),
    selectedOptions: [{ name: seed.options?.name ?? "Title", value }],
  }));

  return {
    id: `demo-product-${index + 1}`,
    handle: seed.handle,
    title: seed.title,
    description: seed.description,
    descriptionHtml: `<p>${seed.description}</p>`,
    productType: seed.productType,
    vendor: seed.vendor,
    tags: seed.tags,
    attributes: [
      {
        namespace: "demo",
        key: "origin",
        label: "Ships from",
        value: "Kuwait City",
      },
      {
        namespace: "demo",
        key: "warranty",
        label: "Warranty",
        value: "12 months",
      },
    ],
    images: [
      {
        url: placeholderImage(seed.title, seed.palette[0], seed.palette[1]),
        altText: seed.title,
        width: 800,
        height: 800,
      },
      {
        url: placeholderImage(
          `${seed.title} detail`,
          seed.palette[1],
          seed.palette[0]
        ),
        altText: `${seed.title} — detail view`,
        width: 800,
        height: 800,
      },
    ],
    priceRange: { min: money(seed.price), max: money(seed.price) },
    options: seed.options
      ? [{ name: seed.options.name, values: seed.options.values }]
      : [],
    variants,
  };
}

export const demoCatalog: Product[] = SEEDS.map(toProduct);

export function demoProductByHandle(handle: string): Product | null {
  return demoCatalog.find(product => product.handle === handle) ?? null;
}

export function demoVariant(variantId: string) {
  for (const product of demoCatalog) {
    const variant = product.variants.find(
      candidate => candidate.id === variantId
    );
    if (variant) return { product, variant };
  }
  return null;
}
