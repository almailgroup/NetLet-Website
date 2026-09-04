/**
 * NetLet storefront: Kuwait-focused discovery with a live product catalog,
 * persistent bag, native checkout mockup, and responsive marketplace rails.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { LiveSearch } from "@/components/LiveSearch";
import { categoryRail, editorialUpdates, footerGroups, homeRailDefinitions } from "@/content/homeLayout";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import AuthDialog from "@/components/AuthDialog";
import { DEMO_MODE } from "@/lib/demoMode";
import { formatMoney } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { filterAndSortCatalog, type AvailabilityFilter, type CatalogSort } from "@shared/commerce/catalog";
import type { Product } from "@shared/commerce/types";
import { kuwaitDeliveryZones } from "@shared/customer";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Apple,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Heart,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Play,
  Plus,
  QrCode,
  Search,
  ShoppingBag,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Store,
  Trash2,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { useCompactHeader } from "@/hooks/useCompactHeader";
import { appPath } from "@/lib/basePath";
import { SITE_URL, usePageMeta } from "@/lib/usePageMeta";
import { homeMeta } from "@shared/seo";
import { collectionImages, footerLogoImage, heroImage, logoImage, qrImage } from "@/lib/brandAssets";
import { toast } from "sonner";

const railSupportCards = [
  { eyebrow: "Slow mornings", title: "Home, in your own light.", image: collectionImages[1], category: "Home & Kitchen" },
  { eyebrow: "Connected living", title: "Good tech, better routines.", image: collectionImages[0], category: "Electronics" },
  { eyebrow: "The everyday edit", title: "A little lift for every day.", image: collectionImages[2], category: "All" },
];

function Logo() {
  return <a href="#top" className="flex shrink-0 items-center" aria-label="NetLet home"><img src={logoImage} alt="NetLet" className="h-11 w-auto max-w-[140px] object-contain" /></a>;
}

function FooterLogo() {
  return <a href="#top" className="flex w-fit items-center" aria-label="NetLet home"><img src={footerLogoImage} alt="NetLet" className="h-12 w-auto max-w-[165px] object-contain" /></a>;
}

function IconButton({ label, children, onClick, className = "" }: { label: string; children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button aria-label={label} title={label} onClick={onClick} className={`glass pressable grid size-10 place-items-center rounded-full ${className}`}>{children}</button>;
}

/**
 * Header control in the marketplace convention: an icon, then a stacked
 * caption/value pair that collapses to the icon alone on narrower viewports.
 */
function HeaderAction({ icon, caption, value, onClick, label, badge, tone = "quiet" }: { icon: React.ReactNode; caption: string; value: string; onClick: () => void; label: string; badge?: number; tone?: "quiet" | "primary" }) {
  return <button onClick={onClick} aria-label={label} title={label} className={`pressable flex h-12 shrink-0 items-center rounded-2xl px-3 ${badge !== undefined ? "gap-3.5" : "gap-2.5"} ${tone === "primary" ? "glass glass-navy" : "glass"}`}>
    <span className="relative grid shrink-0 place-items-center">{icon}{badge !== undefined && <span className="absolute -right-2 -top-2.5 grid min-w-4 place-items-center rounded-full bg-[#f2683a] px-1 text-[9px] font-extrabold text-white">{badge}</span>}</span>
    <span className="hidden max-w-[128px] text-left leading-[1.15] xl:block">
      <span className={`block truncate text-[10px] font-semibold ${tone === "primary" ? "text-white" : "text-[#536b8c]"}`}>{caption}</span>
      <span className="block truncate text-xs font-extrabold">{value}</span>
    </span>
  </button>;
}

/**
 * App-download header action with a QR panel on hover.
 *
 * Opens on focus as well as hover, so the panel is reachable from the keyboard
 * rather than being mouse-only. `invisible` (not `opacity-0` alone) keeps it out
 * of the accessibility tree while closed.
 *
 * The QR is a placeholder: a structurally convincing pattern that decodes to
 * nothing, so it cannot resolve anywhere unintended before the real code is
 * dropped in at client/public/brand/qr-placeholder.svg.
 */
function AppDownloadAction() {
  const pending = (store: string) => toast(`${store} link coming soon`, { description: "The NetLet app has not been published yet." });
  return <div className="group relative">
    <HeaderAction label="Download the NetLet app" onClick={() => toast("Scan the QR code to download the NetLet app.")} icon={<QrCode className="size-[19px] text-[#f2683a]" />} caption="Download the" value="NetLet app" />
    <div className="invisible absolute left-1/2 top-full z-50 w-[430px] -translate-x-1/2 pt-2.5 opacity-0 transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
      <div className="glass rounded-3xl p-5 !bg-[rgba(255,253,249,.9)] shadow-[0_20px_50px_rgba(10,40,90,.18)]">
        <div className="flex items-start gap-4">
          <img src={qrImage} alt="Placeholder QR code for the NetLet app" className="size-[116px] shrink-0 rounded-2xl bg-white p-1.5" />
          <div className="min-w-0">
            <p className="type-heading text-base text-[#0a285a]">Download the NetLet app</p>
            <p className="type-label mt-1 text-[#536b8c]">Scan the QR code to download</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => pending("App Store")} className="glass glass-navy pressable flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 text-[11px] font-extrabold"><Apple className="size-4" />App Store</button>
              <button onClick={() => pending("Google Play")} className="glass glass-navy pressable flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 text-[11px] font-extrabold"><Play className="size-4" />Google Play</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

async function shareProduct(product: Product) {
  const shareUrl = `${window.location.origin}/products/${encodeURIComponent(product.handle)}`;
  const shareData = { title: product.title, text: `Take a look at ${product.title} on NetLet.`, url: shareUrl };
  try {
    const nativeBridge = (window as Window & { ReactNativeWebView?: { postMessage: (message: string) => void } }).ReactNativeWebView;
    if (nativeBridge) {
      nativeBridge.postMessage(JSON.stringify({ type: "share", ...shareData }));
      return;
    }
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Product link copied to your clipboard.");
  } catch (error) {
    if ((error as DOMException)?.name !== "AbortError") toast.error("We couldn’t share that product right now.");
  }
}

function DeliveryZoneDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { deliveryZoneId, isArabic, labels, setDeliveryZoneId } = useCustomer();
  if (!open) return null;
  return <div className="fixed inset-0 z-[75] flex items-end bg-[#061b3b]/35 p-3 backdrop-blur-[2px] sm:items-center sm:justify-center" onClick={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="delivery-zone-title" className="w-full max-w-lg rounded-[1.5rem] bg-background p-5 shadow-2xl sm:p-7" onClick={event => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold tracking-[.14em] text-[#a44a2b] uppercase">Kuwait delivery</p><h2 id="delivery-zone-title" className="display-face mt-1 text-3xl text-[#0a285a]">{isArabic ? "اختر المحافظة" : "Choose your governorate"}</h2><p className="mt-2 text-sm leading-6 text-[#536b8c]">{isArabic ? "احفظ موقعك لمتابعة التوصيل عند إعداد الخدمة." : "Save your area now; timing and fees will appear once NetLet’s delivery policy is configured."}</p></div><IconButton label="Close delivery selection" onClick={onClose}><X className="size-5" /></IconButton></div>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">{kuwaitDeliveryZones.map(zone => <button key={zone.id} onClick={() => { setDeliveryZoneId(zone.id); onClose(); }} className={`pressable rounded-2xl border p-4 text-left ${deliveryZoneId === zone.id ? "border-[#f2683a] bg-[#fff7e3]" : "border-[#d5dfeb] bg-white hover:border-[#aac0da]"}`}><span className="block text-sm font-extrabold text-[#0a285a]">{isArabic ? zone.labelAr : zone.label}</span><span className="mt-1 block text-[10px] font-semibold text-[#778ba6]">{isArabic ? "التفاصيل بانتظار الإعداد" : zone.estimateLabel}</span></button>)}</div>
      <p className="mt-5 flex items-start gap-2 rounded-xl bg-[#fff0ab] p-3 text-xs leading-5 text-[#705523]"><Truck className="mt-0.5 size-4 shrink-0" />{labels.deliverySetup}. No fee or ETA has been set yet.</p>
    </section>
  </div>;
}

function CatalogSkeleton({ dark = false }: { dark?: boolean }) {
  return <div className="hide-scrollbar mt-5 flex gap-3 overflow-hidden">{[0, 1, 2, 3].map((item) => <div key={item} className={`min-w-[172px] animate-pulse rounded-2xl border p-3 sm:min-w-[195px] lg:min-w-0 lg:flex-1 ${dark ? "border-[#49658d] bg-white/10" : "border-[#d5dfeb] bg-white"}`}><div className={`aspect-[1.02] rounded-xl ${dark ? "bg-white/10" : "bg-[#e7edf5]"}`} /><div className={`mt-4 h-4 w-2/3 rounded ${dark ? "bg-white/10" : "bg-[#dce5e9]"}`} /><div className={`mt-2 h-3 w-1/3 rounded ${dark ? "bg-white/10" : "bg-[#e7edf5]"}`} /></div>)}</div>;
}

/**
 * How long each image holds, and how long it takes to cross into the next.
 *
 * The two are coupled: at a 450ms fade a 900ms hold would leave the card
 * mid-transition half the time, which reads as a blur rather than as a product
 * turning. The hold is the settled time plus the fade.
 */
const PREVIEW_HOLD = 1500;
const PREVIEW_FADE = 450;

/**
 * Card gallery: every image of the product, previewable without opening it.
 *
 * Hovering the artwork cycles the views; hovering a dot pins one and stops the
 * cycle, so a shopper who spots the angle they want can hold it. Leaving resets
 * to the first image, because a card left showing view five reads as a
 * different product when the eye comes back to the grid.
 *
 * Every image is stacked and cross-faded on opacity rather than swapped in the
 * src. Swapping would show a blank frame on the first pass while the next file
 * decodes, and this way they are all decoded after the first cycle.
 */
function CardGallery({ product, onDetails, compact }: { product: Product; onDetails: () => void; compact: boolean }) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const images = product.images;

  useEffect(() => {
    if (!hovering || pinned || images.length < 2) return;
    // Auto-advance is motion the user did not ask for, so it is off when they
    // have asked the system for less of it. The dots still work.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % images.length), PREVIEW_HOLD);
    return () => window.clearInterval(timer);
  }, [hovering, pinned, images.length]);

  const leave = () => { setHovering(false); setPinned(false); setIndex(0); };

  return (
    <>
      <button
        onClick={onDetails}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovering(true); }}
        onPointerLeave={leave}
        className="relative block w-full overflow-hidden rounded-xl bg-[#e7edf5] text-left"
        aria-label={`View ${product.title}`}
      >
        {images.length ? images.map((item, position) => (
          <img
            key={`${item.url}-${position}`}
            src={item.url}
            alt={position === 0 ? (item.altText ?? product.title) : ""}
            aria-hidden={position !== 0}
            style={{ transitionDuration: `${PREVIEW_FADE}ms` }}
            className={`aspect-[1.02] w-full object-cover transition-opacity ease-out group-hover:scale-105 motion-safe:transition-transform ${position === 0 ? "" : "absolute inset-0"} ${position === index ? "opacity-100" : "opacity-0"}`}
          />
        )) : <div className="grid aspect-[1.02] place-items-center text-sm font-bold text-[#536b8c]">Image processing</div>}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a285a]/20 to-transparent" />
      </button>

      {images.length > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-1.5" onPointerLeave={() => setPinned(false)}>
          {images.map((item, position) => (
            <button
              key={`dot-${item.url}-${position}`}
              onPointerEnter={(event) => { if (event.pointerType !== "mouse") return; setPinned(true); setIndex(position); }}
              onClick={(event) => { event.stopPropagation(); setIndex(position); setPinned(true); }}
              aria-label={`Preview image ${position + 1} of ${images.length} of ${product.title}`}
              aria-current={position === index}
              className={`pressable rounded-full transition-all duration-200 ${compact ? "size-1.5" : "size-2"} ${position === index ? "scale-125 bg-[#0a285a]" : "bg-[#c3ccda] hover:bg-[#8fa3bd]"}`}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

function ProductCard({ product, saved, onSave, onShare = () => void shareProduct(product), onDetails, onAdd, onBuyNow, isAdding, compact = false }: { product: Product; saved: boolean; onSave: () => void; onShare?: () => void; onDetails: () => void; onAdd: () => void; onBuyNow: () => void; isAdding: boolean; compact?: boolean }) {
  const variant = product.variants[0];
  const compareAt = variant?.compareAtPrice;
  const canBuy = Boolean(variant?.availableForSale);

  return (
    <article className={`product-card group relative @container flex flex-col overflow-hidden rounded-2xl border border-[#d5dfeb] bg-[#fffdf9] ${compact ? "p-2.5" : "p-3"}`}>
      <CardGallery product={product} onDetails={onDetails} compact={compact} />
      <span className="type-label absolute left-4 top-4 rounded-full bg-[#fff0ab] px-2 py-1 text-[8px] font-extrabold text-[#0a285a] shadow-sm">{product.productType || "NetLet edit"}</span>
      <button onClick={onSave} aria-label={`Save ${product.title}`} className={`glass pressable absolute right-4 top-4 grid size-7 place-items-center rounded-full ${saved ? "!text-[#f2683a]" : ""}`}><Heart className={`size-3.5 ${saved ? "fill-current" : ""}`} /></button><button onClick={onShare} aria-label={`Share ${product.title}`} className="glass pressable absolute right-12 top-4 grid size-7 place-items-center rounded-full"><Share2 className="size-3.5" /></button>
      <div className="flex flex-1 flex-col px-0.5 pb-0.5 pt-3">
        <button onClick={onDetails} className="text-left"><h3 className="type-product line-clamp-2 text-[15px] font-extrabold tracking-[-.025em] text-[#0a285a] transition-colors hover:text-[#f2683a]">{product.title}</h3></button>
        <p className="type-body mt-1 line-clamp-1 text-[10px] font-medium text-[#536b8c]">{product.description || "A considered NetLet everyday find."}</p>
        <div className="mt-2.5 flex items-baseline gap-2"><p className="type-price text-sm font-extrabold tracking-[-.04em] text-[#0a285a]">{formatMoney(product.priceRange.min)}</p>{compareAt && <p className="type-label text-[9px] text-[#778ba6] line-through">{formatMoney(compareAt)}</p>}</div>
        {/* Pushed to the bottom so the pair lines up across a row of cards whose
            titles wrap to different heights.

            Stacked by default and side by side only once the card itself is
            wide enough — a container query, not a viewport one, because the
            same card is 172px in a mobile rail and 280px in the desktop grid.
            Side by side at 172px gave two ~80px buttons whose labels had to
            shrink to 10px to fit, which is both cramped and under the 44px
            touch target a primary action should have. */}
        <div className="mt-auto flex flex-col gap-2 pt-3 @[15rem]:flex-row">
          <button disabled={!canBuy || isAdding} onClick={onAdd} className="glass glass-navy type-control pressable flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-xs font-extrabold @[15rem]:w-auto @[15rem]:flex-1 disabled:cursor-not-allowed disabled:opacity-50" aria-label={canBuy ? `Add ${product.title} to cart` : `${product.title} is unavailable`}>{isAdding ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}{canBuy ? "Add to cart" : "Unavailable"}</button>
          <button disabled={!canBuy || isAdding} onClick={onBuyNow} className="glass glass-accent type-control pressable flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-xs font-extrabold @[15rem]:w-auto @[15rem]:flex-1 disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Buy ${product.title} now`}><Zap className="size-4 fill-current" />Buy now</button>
        </div>
      </div>
    </article>
  );
}

function BagDrawer() {
  const { cart, isOpen, closeCart, loading, updateQuantity, removeItem } = useCart();
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[70] bg-[#061b3b]/35 backdrop-blur-[2px]" onClick={closeCart}><aside role="dialog" aria-modal="true" aria-label="Your NetLet cart" className="type-body ml-auto flex h-full w-full max-w-md flex-col bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-[#d5dfeb] px-6 py-5"><div><p className="text-[10px] font-extrabold tracking-[.14em] text-[#f2683a] uppercase">Your NetLet cart</p><h2 className="display-face mt-1 text-3xl text-[#0a285a]">Ready when you are.</h2></div><IconButton label="Close cart" onClick={closeCart}><X className="size-5" /></IconButton></div>{!cart?.items.length ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><div className="grid size-16 place-items-center rounded-full bg-[#e7edf5] text-[#0a285a]"><ShoppingBag className="size-7" /></div><h3 className="mt-5 text-lg font-extrabold text-[#0a285a]">Your cart is waiting.</h3><p className="mt-2 text-sm leading-6 text-[#536b8c]">Add a few considered finds and they’ll stay here while you browse.</p><button onClick={closeCart} className="glass glass-navy pressable mt-6 rounded-full px-5 py-3 text-xs font-extrabold">Keep browsing</button></div> : <><div className="hide-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5">{cart.items.map((item) => <div key={item.lineId} className="flex gap-3 border-b border-[#d5dfeb] pb-4"><div className="size-20 shrink-0 overflow-hidden rounded-xl bg-[#e7edf5]">{item.image ? <img src={item.image.url} alt={item.image.altText ?? item.productTitle} className="size-full object-cover" /> : <div className="grid size-full place-items-center"><ShoppingBag className="size-5 text-[#536b8c]" /></div>}</div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><div><p className="text-sm font-extrabold text-[#0a285a]">{item.productTitle}</p>{item.variantTitle !== "Default Title" && <p className="mt-0.5 text-[11px] text-[#536b8c]">{item.variantTitle}</p>}</div><button onClick={() => removeItem(item.lineId)} disabled={loading} aria-label={`Remove ${item.productTitle}`} className="text-[#778ba6] hover:text-[#f2683a]"><Trash2 className="size-4" /></button></div><div className="mt-3 flex items-center justify-between"><div className="glass inline-flex items-center rounded-full"><button disabled={loading} onClick={() => updateQuantity(item.lineId, item.quantity - 1)} className="grid size-7 place-items-center text-[#0a285a] disabled:opacity-40"><Minus className="size-3" /></button><span className="min-w-7 text-center text-xs font-extrabold text-[#0a285a]">{item.quantity}</span><button disabled={loading} onClick={() => updateQuantity(item.lineId, item.quantity + 1)} className="grid size-7 place-items-center text-[#0a285a] disabled:opacity-40"><Plus className="size-3" /></button></div><p className="text-sm font-extrabold text-[#0a285a]">{formatMoney(item.lineTotal)}</p></div></div></div>)}</div><div className="border-t border-[#d5dfeb] bg-white/70 px-6 py-5"><div className="flex items-center justify-between text-sm"><span className="font-semibold text-[#536b8c]">Subtotal</span><span className="text-lg font-extrabold text-[#0a285a]">{formatMoney(cart.subtotal)}</span></div><p className="mt-2 text-[11px] leading-5 text-[#778ba6]">Continue to the native NetLet checkout mockup to review Kuwait delivery and payment options.</p><button onClick={() => { closeCart(); window.location.assign(appPath("/checkout")); }} disabled={loading} className="glass glass-accent pressable mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-xs font-extrabold disabled:opacity-60">Continue to checkout <ArrowRight className="size-4" /></button></div></>}</aside></div>;
}

type RailSupportCard = { eyebrow: string; title: string; image: string; category: string };

type RailProps = {
  id: string;
  title: string;
  description: string;
  dark?: boolean;
  products: Product[];
  catalogLoading: boolean;
  catalogError: boolean;
  saved: string[];
  onSave: (id: string, title: string) => void;
  onDetails: (product: Product) => void;
  onAdd: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isAdding: boolean;
  onViewAll: () => void;
  supportCard?: RailSupportCard;
  onSelectSupport: (category: string) => void;
};

function ProductRail({ id, title, description, dark = false, products, catalogLoading, catalogError, saved, onSave, onDetails, onAdd, onBuyNow, isAdding, onViewAll, supportCard, onSelectSupport }: RailProps) {
  const railProducts = products.slice(0, 4);
  return <section id={id} className={dark ? "bg-[#0a285a] py-9 sm:py-12" : "py-9 sm:py-12"}><div className="container"><div className="flex items-end justify-between gap-4"><div><p className={`text-[10px] font-extrabold tracking-[.16em] uppercase ${dark ? "text-[#ffcc64]" : "text-[#a44a2b]"}`}>Live NetLet catalog</p><h2 className={`display-face mt-1 text-3xl sm:text-4xl ${dark ? "text-white" : "text-[#0a285a]"}`}>{title}</h2><p className={`mt-1 text-xs ${dark ? "text-[#b9cce5]" : "text-[#536b8c]"}`}>{description}</p></div><div className="hidden items-center gap-2 sm:flex"><IconButton label={`Previous ${title} products`} onClick={() => toast("More product browsing controls will arrive as the catalog grows.")} className={dark ? "border border-[#49658d] text-white hover:bg-white/10" : "border border-[#d5dfeb]"}><ChevronLeft className="size-4" /></IconButton><IconButton label={`Next ${title} products`} onClick={() => toast("More product browsing controls will arrive as the catalog grows.")} className={dark ? "border border-[#49658d] text-white hover:bg-white/10" : "border border-[#d5dfeb]"}><ChevronRight className="size-4" /></IconButton><button onClick={onViewAll} className={`pressable rounded-full px-3.5 py-2 text-[10px] font-extrabold tracking-[.08em] uppercase ${dark ? "bg-white/10 text-white hover:bg-white/20" : "border border-[#d5dfeb] bg-white text-[#0a285a] hover:bg-[#e7edf5]"}`}>View all</button></div></div>{catalogLoading ? <CatalogSkeleton dark={dark} /> : catalogError ? <div className={`mt-5 rounded-2xl border px-6 py-10 text-center ${dark ? "border-[#49658d] bg-white/5 text-white" : "border-[#f2b69e] bg-white text-[#0a285a]"}`}><p className="text-sm font-bold">The catalog is taking a moment to load.</p></div> : railProducts.length ? <div className="hide-scrollbar mt-5 flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible">{railProducts.map((product) => <div key={`${id}-${product.id}`} className="min-w-[172px] sm:min-w-[195px] lg:min-w-0"><ProductCard compact product={product} saved={saved.includes(product.id)} onSave={() => onSave(product.id, product.title)} onDetails={() => onDetails(product)} onAdd={() => void onAdd(product)} onBuyNow={() => void onBuyNow(product)} isAdding={isAdding} /></div>)}{supportCard && products.length < 4 ? <button onClick={() => onSelectSupport(supportCard.category)} className="group relative min-h-[248px] min-w-[230px] overflow-hidden rounded-2xl text-left sm:min-w-[260px] lg:min-w-0"><img src={supportCard.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#061b3b]/85 via-[#061b3b]/16 to-transparent" /><div className="absolute bottom-0 left-0 right-0 p-5 text-white"><p className="text-[9px] font-extrabold tracking-[.14em] text-[#ffe6b2] uppercase">{supportCard.eyebrow}</p><h3 className="display-face mt-2 max-w-[220px] text-3xl leading-[.92]">{supportCard.title}</h3><span className="mt-4 inline-flex items-center gap-1 text-[10px] font-extrabold tracking-[.08em] uppercase">Shop collection <ArrowRight className="size-3.5" /></span></div></button> : null}</div> : <div className={`mt-5 rounded-2xl border border-dashed px-6 py-10 text-center ${dark ? "border-[#49658d] bg-white/5 text-[#d9e7f7]" : "border-[#b8c9dc] bg-white/55 text-[#536b8c]"}`}><Search className="mx-auto size-5" /><p className="mt-2 text-sm font-bold">No products match this view yet.</p><button onClick={onViewAll} className="mt-3 text-xs font-extrabold text-[#f2683a] underline underline-offset-4">Show the live catalog</button></div>}</div></section>;
}

function CatalogDiscoveryPanel({ categories, activeCategory, availability, sort, resultCount, loading, onCategory, onAvailability, onSort }: {
  categories: string[];
  activeCategory: string;
  availability: AvailabilityFilter;
  sort: CatalogSort;
  resultCount: number;
  loading: boolean;
  onCategory: (category: string) => void;
  onAvailability: (filter: AvailabilityFilter) => void;
  onSort: (sort: CatalogSort) => void;
}) {
  return <section id="catalog-discovery" className="container pt-6 sm:pt-8"><div className="rounded-[1.5rem] border border-[#d5dfeb] bg-white/80 p-4 shadow-[0_10px_25px_rgba(10,40,90,.05)] backdrop-blur-sm sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#e7edf5] text-[#0a285a]"><SlidersHorizontal className="size-5" /></div><div><p className="text-[10px] font-extrabold tracking-[.14em] text-[#a44a2b] uppercase">Browse the live catalog</p><p className="mt-0.5 text-sm font-bold text-[#0a285a]">{loading ? "Refreshing live products…" : `${resultCount} ${resultCount === 1 ? "product" : "products"} in this view`}</p></div></div><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-xl border border-[#d5dfeb] bg-[#f3f2ed] p-1" aria-label="Availability filter">{(["all", "available", "unavailable"] as AvailabilityFilter[]).map((filter) => <button key={filter} onClick={() => onAvailability(filter)} className={`pressable rounded-lg px-3 py-2 text-[10px] font-extrabold capitalize ${availability === filter ? "bg-[#0a285a] text-white" : "text-[#536b8c] hover:bg-white"}`}>{filter === "all" ? "All" : filter}</button>)}</div><label className="flex items-center gap-2 rounded-xl border border-[#d5dfeb] bg-white px-3 py-2 text-[10px] font-extrabold text-[#536b8c]">Sort<select aria-label="Sort live catalog" value={sort} onChange={(event) => onSort(event.target.value as CatalogSort)} className="bg-transparent font-extrabold text-[#0a285a] outline-none"><option value="catalog">Catalog order</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="offers">Offers first</option></select></label></div></div><div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Live product categories"><button onClick={() => onCategory("All")} className={`pressable shrink-0 rounded-full px-3.5 py-2 text-[10px] font-extrabold ${activeCategory === "All" ? "bg-[#f2683a] text-white" : "border border-[#d5dfeb] bg-white text-[#0a285a] hover:border-[#aac0da]"}`}>All live products</button>{categories.map((category) => <button key={category} onClick={() => onCategory(category)} className={`pressable shrink-0 rounded-full px-3.5 py-2 text-[10px] font-extrabold ${activeCategory === category ? "bg-[#0a285a] text-white" : "border border-[#d5dfeb] bg-white text-[#0a285a] hover:border-[#aac0da]"}`}>{category}</button>)}</div></div></section>;
}

function DealsSurface({ loading, error, product, saved, onSave, onDetails, onAdd, onBuyNow, isAdding, onRetry, onViewAll }: { loading: boolean; error: boolean; product?: Product; saved: string[]; onSave: (id: string, title: string) => void; onDetails: (product: Product) => void; onAdd: (product: Product) => void; onBuyNow: (product: Product) => void; isAdding: boolean; onRetry: () => void; onViewAll: () => void }) {
  return <section id="deals" className="container py-9 sm:py-12"><div className="mb-5 flex items-end justify-between gap-5"><div><p className="text-[10px] font-extrabold tracking-[.16em] text-[#a44a2b] uppercase">Fresh right now</p><h2 className="display-face mt-1 text-3xl text-[#0a285a] sm:text-4xl">Deals</h2><p className="mt-1 text-xs text-[#536b8c]">Practical finds, made a little easier to take home.</p></div><button onClick={onViewAll} className="hidden items-center gap-1 text-xs font-extrabold text-[#0a285a] underline decoration-[#f2683a] decoration-2 underline-offset-4 sm:flex">View all <ArrowRight className="size-3.5" /></button></div>{loading ? <CatalogSkeleton /> : error ? <div className="rounded-[1.5rem] border border-[#f2b69e] bg-white px-6 py-14 text-center"><PackageCheck className="mx-auto size-7 text-[#f2683a]" /><h3 className="mt-3 text-lg font-extrabold text-[#0a285a]">The Deals edit is taking a moment.</h3><p className="mt-2 text-sm text-[#536b8c]">Please refresh the live catalog to see the latest available items.</p><button onClick={onRetry} className="glass glass-navy pressable mt-5 rounded-full px-4 py-3 text-xs font-extrabold">Refresh catalog</button></div> : !product ? <div className="rounded-[1.5rem] border border-dashed border-[#b8c9dc] bg-white/60 px-6 py-14 text-center"><Search className="mx-auto size-6 text-[#778ba6]" /><h3 className="mt-3 text-lg font-extrabold text-[#0a285a]">New deals are being selected.</h3><p className="mt-2 text-sm text-[#536b8c]">Try a different department or check back after the live catalog refreshes.</p><button onClick={onViewAll} className="mt-4 text-xs font-extrabold text-[#f2683a] underline underline-offset-4">Browse all departments</button></div> : <div className="grid gap-3 lg:grid-cols-[1.45fr_1fr_1fr]"><button onClick={() => onDetails(product)} className="pressable group relative min-h-[270px] overflow-hidden rounded-[1.5rem] bg-[#f2683a] p-6 text-left text-white sm:min-h-[330px]"><div className="absolute right-0 top-0 h-full w-[54%] overflow-hidden"><img src={product.images[0]?.url} alt="" className="size-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-[#f2683a] via-[#f2683a]/25 to-transparent" /></div><div className="relative z-10 flex h-full max-w-[250px] flex-col"><span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[9px] font-extrabold tracking-[.14em] uppercase">Today’s edit</span><p className="mt-6 text-[11px] font-bold text-white/75">{product.productType || "NetLet selection"}</p><h3 className="display-face mt-2 text-3xl leading-[.92]">{product.title}</h3><p className="mt-3 text-sm text-white/85">{formatMoney(product.priceRange.min)}</p><span className="mt-auto inline-flex items-center gap-2 text-xs font-extrabold">Shop this deal <ArrowRight className="size-4" /></span></div></button><ProductCard product={product} compact saved={saved.includes(product.id)} onSave={() => onSave(product.id, product.title)} onDetails={() => onDetails(product)} onAdd={() => void onAdd(product)} onBuyNow={() => void onBuyNow(product)} isAdding={isAdding} /><div className="relative overflow-hidden rounded-[1.5rem] border border-[#d5dfeb] bg-[#fff0ab] p-6"><div className="absolute -right-8 -top-8 size-32 rounded-full border-[18px] border-[#f2683a]/25" /><div className="relative flex h-full flex-col"><span className="grid size-10 place-items-center rounded-2xl bg-white/80 text-[#f2683a]"><Truck className="size-5" /></span><p className="mt-5 text-[10px] font-extrabold tracking-[.15em] text-[#a44a2b] uppercase">Kuwait delivery</p><h3 className="display-face mt-2 text-3xl leading-[.92] text-[#0a285a]">The useful things, closer.</h3><p className="mt-3 text-sm leading-6 text-[#536b8c]">Build a cart that fits your day, then review delivery in the native NetLet checkout.</p><button onClick={onViewAll} className="mt-auto inline-flex items-center gap-2 text-xs font-extrabold text-[#0a285a]">Browse catalog <ArrowRight className="size-4 text-[#f2683a]" /></button></div></div></div>}</section>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { compact: headerCompact, handlers: headerHandlers } = useCompactHeader();
  usePageMeta(homeMeta(SITE_URL));
  const openAuth = () => DEMO_MODE
    ? toast("Sign-in is disabled in this static preview.", { description: "Your cart and saved items still work — they are kept in this browser." })
    : setAuthOpen(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [catalogSort, setCatalogSort] = useState<CatalogSort>("catalog");
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { itemCount, openCart, addItem, loading: cartLoading } = useCart();
  const { savedIds: saved, toggleSaved: togglePersistentSaved, deliveryZone, isArabic, labels, toggleLocale } = useCustomer();
  const { data: catalog = [], isLoading: catalogLoading, error: catalogError, refetch } = trpc.commerce.products.list.useQuery({ first: 24 });

  const visibleProducts = useMemo(() => {
    const matchingProducts = catalog.filter((product) => {
    const searchTerm = search.trim().toLowerCase();
    const matchesSearch = !searchTerm || [product.title, product.description, product.productType, product.vendor, ...product.tags].join(" ").toLowerCase().includes(searchTerm);
    const matchesCategory = activeCategory === "All" || product.productType === activeCategory || product.tags.includes(activeCategory);
    return matchesSearch && matchesCategory;
    });
    return filterAndSortCatalog(matchingProducts, { availability: availabilityFilter, sort: catalogSort });
  }, [activeCategory, availabilityFilter, catalog, catalogSort, search]);
  const liveCategories = useMemo(() => Array.from(new Set(catalog.map((product) => product.productType).filter((productType): productType is string => Boolean(productType)))).sort((left, right) => left.localeCompare(right)), [catalog]);
  const rotateProducts = (offset: number) => visibleProducts.length ? [...visibleProducts.slice(offset), ...visibleProducts.slice(0, offset)] : [];
  const selectCategory = (category: string) => { setActiveCategory(category); window.setTimeout(() => document.getElementById("popular")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  const showAll = () => { setSearch(""); setActiveCategory("All"); setAvailabilityFilter("all"); setCatalogSort("catalog"); window.setTimeout(() => document.getElementById("popular")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  const toggleSaved = (id: string, title: string) => { const isSaved = saved.includes(id); togglePersistentSaved(id); toast(isSaved ? `${title} removed from saved` : `${title} saved for later`); };
  const addProduct = async (product: Product) => { const variant = product.variants[0]; if (!variant?.availableForSale) return toast.error("This item is currently unavailable."); try { await addItem(variant.id); toast.success(`${product.title} added to your cart`); } catch { toast.error("We couldn't add that item just now. Please try again."); } };
  // Buy now is add-to-cart plus the checkout step, not a separate path: the
  // cart is where quantity, delivery and payment are resolved.
  const buyProduct = async (product: Product) => {
    const variant = product.variants[0];
    if (!variant?.availableForSale) return toast.error("This item is currently unavailable.");
    try {
      await addItem(variant.id);
      window.location.assign(appPath("/checkout"));
    } catch {
      toast.error("We couldn't start that order just now. Please try again.");
    }
  };
  const accountAction = () => { if (authLoading) return; if (isAuthenticated) { void logout().then(() => toast.success("You’re signed out of NetLet.")); } else openAuth(); };
  const firstProduct = visibleProducts[0] ?? catalog[0];
  const openProduct = (product: Product) => window.location.assign(appPath(`/products/${encodeURIComponent(product.handle)}`));

  return <main id="top" className="min-h-screen bg-background text-[#0a285a]">
    <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    <header {...headerHandlers} data-compact={headerCompact} className="sticky top-0 z-40 border-b border-[#d5dfeb] bg-background/95 backdrop-blur-xl">
      {/* Primary bar: logo, a search field that takes all remaining width, then
          the account cluster — the layout marketplaces converge on. */}
      <div className={`container relative flex items-center gap-3 transition-[height] duration-300 ease-out lg:gap-5 ${headerCompact ? "h-[58px] lg:h-[62px]" : "h-[68px] lg:h-[76px]"}`}>
        <div className="absolute left-4 lg:static lg:hidden"><IconButton label="Open menu" onClick={() => setMenuOpen(true)}><Menu className="size-6" /></IconButton></div>
        <div className={`mx-auto origin-left transition-transform duration-300 ease-out lg:mx-0 ${headerCompact ? "scale-[.82]" : "scale-100"}`}><Logo /></div>
        <div className="hidden min-w-0 flex-1 lg:block"><LiveSearch catalog={catalog} value={search} onChange={setSearch} onSelectProduct={openProduct} /></div>
        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
          <AppDownloadAction />
          <HeaderAction label="Change language" onClick={toggleLocale} icon={<Globe2 className="size-[19px] text-[#f2683a]" />} caption={isArabic ? "AR /" : "EN /"} value="KWD" />
          <HeaderAction label={isAuthenticated ? "Sign out" : "Sign in"} onClick={accountAction} icon={isAuthenticated ? <LogOut className="size-[19px]" /> : <UserRound className="size-[19px]" />} caption="Welcome" value={isAuthenticated ? (user?.name ? `Hi, ${user.name}` : "Sign out") : "Sign in"} />
          <HeaderAction label="Open your cart" onClick={openCart} tone="primary" badge={itemCount} icon={<ShoppingBag className="size-[19px]" />} caption={labels.bag} value={itemCount === 1 ? "1 item" : `${itemCount} items`} />
        </div>
        <button onClick={openCart} aria-label="Open your cart" className="glass glass-navy pressable absolute right-4 grid size-10 place-items-center rounded-full lg:hidden"><ShoppingBag className="size-[18px]" /><span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#f2683a] text-[9px] font-extrabold text-white">{itemCount}</span></button>
      </div>
      <div className={`container overflow-hidden transition-all duration-300 ease-out lg:hidden ${headerCompact ? "max-h-0 pb-0 opacity-0" : "max-h-20 pb-3 opacity-100"}`} aria-hidden={headerCompact}><LiveSearch catalog={catalog} value={search} onChange={setSearch} onSelectProduct={openProduct} /></div>
      {/* Secondary bar: departments only, so the row reads as one rail. */}
      <nav className={`container hidden items-center gap-2 overflow-hidden transition-all duration-300 ease-out lg:flex ${headerCompact ? "h-0 -translate-y-1 opacity-0" : "h-12 translate-y-0 opacity-100"}`} aria-hidden={headerCompact} inert={headerCompact} aria-label="Primary navigation">{categoryRail.map((category, index) => <button key={category.query} onClick={() => selectCategory(category.query)} className={`pressable rounded-full px-3 py-2 text-xs font-semibold ${index === 0 ? "flex items-center gap-2 font-bold" : ""} ${activeCategory === category.query ? "glass glass-navy" : "glass !text-[#536b8c]"}`}>{index === 0 && <Menu className="size-4" />}{index === 0 ? "All departments" : category.label}</button>)}<div className="ml-auto flex shrink-0 items-center gap-1.5">
        <IconButton label="Notifications" onClick={() => toast("Notifications will appear here once your account is connected.")}><Bell className="size-[19px]" /></IconButton>
        <IconButton label="Saved items" onClick={() => toast(`${saved.length} item${saved.length === 1 ? "" : "s"} saved for later.`)}><Heart className="size-[19px]" /></IconButton>
      </div></nav>
    </header>

    {menuOpen && <div className="netlet-menu-scrim fixed inset-0 z-50 bg-[#061b3b]/30 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)}><aside className="netlet-menu-panel h-full w-[82%] max-w-sm bg-[#f3f2ed] px-5 py-7 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><Logo /><IconButton label="Close menu" onClick={() => setMenuOpen(false)}><X /></IconButton></div><div className="mt-10 space-y-1">{categoryRail.map((category) => <button key={category.query} onClick={() => { selectCategory(category.query); setMenuOpen(false); }} className="glass pressable mb-1 block w-full rounded-xl px-4 py-4 text-left text-sm font-bold">{category.label}</button>)}</div><button onClick={accountAction} className="glass glass-navy pressable mt-7 flex w-full items-center justify-center gap-2 rounded-2xl p-4 text-sm font-bold">{isAuthenticated ? <LogOut className="size-4" /> : <UserRound className="size-4" />}{isAuthenticated ? `Sign out${user?.name ? `, ${user.name}` : ""}` : "Sign in to NetLet"}</button></aside></div>}

    {/* Hero, at roughly half its previous height so the first row of products
        is on screen when the page opens. The panel carries the colour now that
        the page ground is a near-white neutral: a deep navy field lifted toward
        an electric blue, a brand-orange bloom on the warm side and a cool one
        opposite so the warmth reads as deliberate rather than as a cast. */}
    <section className="container pt-5 sm:pt-6"><div className="relative isolate min-h-[200px] overflow-hidden rounded-[1.5rem] bg-[#06162f] lg:min-h-[248px]"><div className="absolute inset-0 bg-[linear-gradient(105deg,#06162f_0%,#0a285a_44%,#14428f_78%,#1c58b8_100%)]" /><div className="absolute -right-16 -top-32 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(242,104,58,.52)_0%,rgba(242,104,58,0)_65%)]" /><div className="absolute -bottom-40 left-[36%] size-[380px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,.34)_0%,rgba(56,189,248,0)_68%)]" /><img src={heroImage} alt="" aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[46%] object-cover opacity-30 [mask-image:linear-gradient(to_right,transparent,#000_58%)] lg:block" /><div className="absolute inset-0 bg-[linear-gradient(90deg,#06162f_0%,rgba(6,22,47,.62)_44%,rgba(6,22,47,0)_74%)]" /><div className="relative z-10 flex min-h-[200px] max-w-[640px] flex-col justify-center px-6 py-7 sm:px-10 lg:min-h-[248px] lg:px-12"><div className="reveal-up flex items-center gap-2"><span className="h-px w-6 bg-[#ff8a5c]" /><span className="text-[10px] font-extrabold tracking-[0.17em] text-[#ffb495] uppercase">The NetLet edit</span></div><h1 className="reveal-up reveal-delay-1 display-face mt-2.5 text-[2rem] leading-[.98] text-white sm:text-[2.5rem] lg:text-[3rem]">Small upgrades. <em className="font-normal text-[#9fc6ff]">A brighter everyday.</em></h1><div className="reveal-up reveal-delay-2 mt-4 flex flex-wrap items-center gap-2.5"><button onClick={showAll} className="glass glass-accent pressable flex items-center gap-2 rounded-full px-5 py-3 text-xs font-extrabold">Shop the catalog <ArrowRight className="size-4" /></button><button onClick={() => document.getElementById("deals")?.scrollIntoView({ behavior: "smooth" })} className="glass glass-on-dark pressable rounded-full px-5 py-3 text-xs font-extrabold">Explore deals</button></div><div className="mt-4 hidden flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-bold text-[#a9c6ec] lg:flex"><span className="flex items-center gap-1.5"><Truck className="size-3.5 text-[#ff9a70]" /> {deliveryZone ? `${deliveryZone.label} selected` : "Choose your delivery area"}</span><span className="flex items-center gap-1.5"><Store className="size-3.5 text-[#ff9a70]" /> Live catalog</span><span className="flex items-center gap-1.5"><ShoppingBag className="size-3.5 text-[#ff9a70]" /> Persistent cart</span></div></div><div className="glass glass-on-dark absolute right-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-[.08em] uppercase">New season</div></div></section>

    <CatalogDiscoveryPanel categories={liveCategories} activeCategory={activeCategory} availability={availabilityFilter} sort={catalogSort} resultCount={visibleProducts.length} loading={catalogLoading} onCategory={selectCategory} onAvailability={setAvailabilityFilter} onSort={setCatalogSort} />
    <DealsSurface loading={catalogLoading} error={Boolean(catalogError)} product={firstProduct} saved={saved} onSave={toggleSaved} onDetails={openProduct} onAdd={addProduct} onBuyNow={buyProduct} isAdding={cartLoading} onRetry={() => void refetch()} onViewAll={showAll} />

    {homeRailDefinitions.slice(1).map((rail, index) => <ProductRail key={rail.id} id={rail.id} title={rail.title} description={rail.description} dark={rail.treatment === "navy"} products={rotateProducts(index)} catalogLoading={catalogLoading} catalogError={Boolean(catalogError)} saved={saved} onSave={toggleSaved} onDetails={openProduct} onAdd={addProduct} onBuyNow={buyProduct} isAdding={cartLoading} onViewAll={showAll} supportCard={railSupportCards[index]} onSelectSupport={selectCategory} />)}

    <section className="container py-10 sm:py-14"><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-extrabold tracking-[.16em] text-[#a44a2b] uppercase">Browse at your pace</p><h2 className="display-face mt-1 text-3xl text-[#0a285a] sm:text-4xl">Categories</h2></div><button onClick={showAll} className="hidden items-center gap-1 text-xs font-extrabold text-[#0a285a] underline decoration-[#f2683a] decoration-2 underline-offset-4 sm:flex">All departments <ArrowRight className="size-3.5" /></button></div><div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-6">{categoryRail.map((category, index) => <button key={category.query} onClick={() => selectCategory(category.query)} className={`pressable group min-w-[132px] rounded-2xl border p-3 text-left shadow-[0_5px_15px_rgba(10,40,90,.04)] sm:min-w-0 ${activeCategory === category.query ? "border-[#f2683a] bg-white" : "border-[#d5dfeb] bg-white hover:border-[#aac0da]"}`}><div className="grid aspect-[1.38] place-items-center rounded-xl" style={{ backgroundColor: category.color }}><span className="grid size-11 place-items-center rounded-2xl bg-white/80 text-[#0a285a] shadow-sm">{index === 0 ? <PackageCheck className="size-5" /> : index === 1 ? <Sparkles className="size-5" /> : index === 2 ? <Store className="size-5" /> : index === 3 ? <Heart className="size-5" /> : index === 4 ? <ArrowDownRight className="size-5" /> : <ShoppingBag className="size-5" />}</span></div><span className="mt-3 block text-xs font-extrabold text-[#0a285a]">{category.label}</span><span className="mt-1 flex items-center text-[10px] font-bold text-[#536b8c]">Browse <ArrowDownRight className="ml-1 size-3" /></span></button>)}</div></section>

    <section className="border-y border-[#d5dfeb] bg-white/45 py-10 sm:py-14"><div className="container"><div className="flex items-end justify-between gap-5"><div><p className="text-[10px] font-extrabold tracking-[.16em] text-[#a44a2b] uppercase">Notes from NetLet</p><h2 className="display-face mt-1 text-3xl text-[#0a285a] sm:text-4xl">Useful reading.</h2></div><button onClick={() => toast("More NetLet editorial updates are being prepared.")} className="hidden items-center gap-1 text-xs font-extrabold text-[#0a285a] underline decoration-[#f2683a] decoration-2 underline-offset-4 sm:flex">View all <ArrowRight className="size-3.5" /></button></div><div className="mt-6 grid gap-3 md:grid-cols-3">{editorialUpdates.map((entry) => <article key={entry.title} className="rounded-2xl border border-[#d5dfeb] bg-[#fffdf9] p-6"><p className="text-[9px] font-extrabold tracking-[.14em] text-[#f2683a] uppercase">{entry.date}</p><h3 className="type-heading mt-4 text-lg tracking-[-.025em] text-[#0a285a]">{entry.title}</h3><p className="type-body mt-3 text-sm leading-6 text-[#536b8c]">{entry.summary}</p><button onClick={() => toast("This NetLet guide is being prepared for a future catalog phase.")} className="mt-5 inline-flex items-center gap-1 text-[10px] font-extrabold tracking-[.1em] text-[#0a285a] uppercase">Read more <ArrowRight className="size-3.5 text-[#f2683a]" /></button></article>)}</div></div></section>

    <section className="container grid gap-4 py-10 sm:py-14 lg:grid-cols-2"><div className="relative overflow-hidden rounded-[1.5rem] bg-[#fffdf9] p-7 sm:min-h-[255px] sm:p-9"><div className="absolute -bottom-16 right-5 size-56 rounded-t-[3rem] bg-[#0a285a]" /><div className="absolute bottom-0 right-12 h-[215px] w-[116px] rounded-t-[1.5rem] border-[7px] border-[#0a285a] bg-white shadow-[0_18px_35px_rgba(10,40,90,.18)]"><img src={logoImage} alt="NetLet" className="absolute left-1/2 top-[45%] w-16 -translate-x-1/2" /></div><div className="relative z-10 max-w-[55%]"><p className="text-[10px] font-extrabold tracking-[.15em] text-[#a44a2b] uppercase">Application</p><h2 className="display-face mt-3 text-3xl leading-[.94] text-[#0a285a]">NetLet shopping, wherever you are.</h2><p className="mt-4 text-sm leading-6 text-[#536b8c]">Save discoveries and return to your cart whenever you are ready.</p><button onClick={() => toast("The NetLet app download is planned for a future storefront phase.")} className="glass glass-navy pressable mt-6 rounded-full px-4 py-3 text-[10px] font-extrabold tracking-[.08em] uppercase">Get app updates</button></div></div><div className="relative overflow-hidden rounded-[1.5rem] bg-[#e7edf5] p-7 sm:min-h-[255px] sm:p-9"><div className="absolute -right-14 -top-14 size-72 rounded-full border-[28px] border-[#d1e3d0]" /><div className="absolute bottom-7 right-9 grid size-16 place-items-center rounded-2xl bg-[#fff0ab] text-[#0a285a] shadow-lg"><MapPin className="size-7" /></div><div className="relative z-10 max-w-[60%]"><p className="text-[10px] font-extrabold tracking-[.15em] text-[#a44a2b] uppercase">Kuwait delivery</p><h2 className="display-face mt-3 text-3xl leading-[.94] text-[#0a285a]">NetLet, nearer to you.</h2><p className="mt-4 text-sm leading-6 text-[#536b8c]">Choose your governorate now; pricing and delivery timing will appear when NetLet’s delivery policy is configured.</p><button onClick={() => setDeliveryOpen(true)} className="glass glass-accent pressable mt-6 inline-flex items-center gap-2 rounded-full px-4 py-3 text-[10px] font-extrabold tracking-[.08em] uppercase">Choose delivery area <ArrowRight className="size-3.5" /></button></div></div></section>

    <section className="container pb-10"><div className="grid overflow-hidden rounded-[1.6rem] bg-[#0a285a] text-[#fffdf9] lg:grid-cols-[1.1fr_.9fr]"><div className="relative p-7 sm:p-10"><div className="pointer-events-none absolute -bottom-24 -left-12 size-64 rounded-full border border-[#f2683a]/55" /><p className="relative text-[10px] font-extrabold tracking-[.15em] text-[#ffcc64] uppercase">The NetLet promise</p><h2 className="relative display-face mt-3 text-4xl leading-[.94] sm:text-5xl">Less searching.<br /><em className="font-normal">More finding.</em></h2><p className="relative mt-4 max-w-md text-sm leading-6 text-[#d9e7f7]">Live catalog data, a persistent cart, and a Kuwait-first checkout experience, all connected by a simple marketplace rhythm.</p></div><div className="grid grid-cols-3 divide-x divide-[#49658d] border-t border-[#49658d] lg:border-l lg:border-t-0"><div className="grid place-items-center p-5 text-center"><Truck className="size-5 text-[#ffcc64]" /><p className="mt-2 text-lg font-extrabold">{deliveryZone ? "Saved" : "Choose"}</p><p className="mt-1 text-[9px] font-bold tracking-[.08em] text-[#b9cce5] uppercase">Delivery area</p></div><div className="grid place-items-center p-5 text-center"><PackageCheck className="size-5 text-[#ffcc64]" /><p className="mt-2 text-lg font-extrabold">{catalog.length}</p><p className="mt-1 text-[9px] font-bold tracking-[.08em] text-[#b9cce5] uppercase">Live items</p></div><div className="grid place-items-center p-5 text-center"><ShoppingBag className="size-5 text-[#ffcc64]" /><p className="mt-2 text-lg font-extrabold">Easy</p><p className="mt-1 text-[9px] font-bold tracking-[.08em] text-[#b9cce5] uppercase">Native cart</p></div></div></div></section>

    <footer className="bg-[#0a285a] pb-24 pt-12 text-white lg:pb-7"><div className="container grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]"><div><FooterLogo /><p className="mt-4 max-w-xs text-sm leading-6 text-[#b9cce5]">A considered marketplace for everyday Kuwaiti life and the things that make it feel more yours.</p><button onClick={() => toast("Arabic storefront is planned for the next catalog phase.")} className="glass glass-on-dark pressable mt-6 rounded-full px-3 py-2 text-[10px] font-extrabold tracking-[.08em] uppercase">العربية</button></div>{footerGroups.map((group) => <div key={group.title}><p className="text-xs font-extrabold text-white">{group.title}</p>{group.links.map((link) => <button key={link} onClick={() => link === "All products" ? showAll() : toast(`${link} is being prepared for the next storefront phase.`)} className="mt-3 block text-left text-xs font-medium text-[#b9cce5] hover:text-[#ffcc64]">{link}</button>)}</div>)}</div><div className="container mt-10 flex flex-col gap-3 border-t border-[#49658d] pt-5 text-[10px] font-semibold text-[#b9cce5] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 NetLet. Kuwait marketplace preview.</span><span>Privacy · Terms · Contact</span></div></footer>

    <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border border-[#ece7da] bg-[#fffdf7] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-6px_28px_rgba(10,40,90,.10)] lg:hidden" aria-label="Mobile navigation"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="pressable grid place-items-center gap-0.5 p-1.5 text-[10px] font-bold text-[#0a285a]"><Store className="size-5" />Home</button><button onClick={() => setMenuOpen(true)} className="pressable grid place-items-center gap-0.5 p-1.5 text-[10px] font-bold text-[#536b8c]"><Menu className="size-5" />Browse</button><button onClick={() => toast(`${saved.length} saved item${saved.length === 1 ? "" : "s"}.`)} className="pressable grid place-items-center gap-0.5 p-1.5 text-[10px] font-bold text-[#536b8c]"><Heart className="size-5" />Saved</button><button onClick={() => window.location.assign(appPath("/account"))} className="pressable grid place-items-center gap-0.5 p-1.5 text-[10px] font-bold text-[#536b8c]"><UserRound className="size-5" />Account</button><button onClick={openCart} className="pressable relative grid place-items-center gap-0.5 p-1.5 text-[10px] font-bold text-[#536b8c]"><ShoppingBag className="size-5" />Cart<span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#f2683a] text-[8px] text-white">{itemCount}</span></button></nav>
    <DeliveryZoneDialog open={deliveryOpen} onClose={() => setDeliveryOpen(false)} />
    <BagDrawer />
  </main>;
}
