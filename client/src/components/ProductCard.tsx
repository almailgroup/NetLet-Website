/**
 * The product card, and the share action that sits on it.
 *
 * Extracted from the home page so the saved-items page shows shoppers exactly
 * the card they saved from, rather than a second, subtly different one that
 * drifts every time the first is touched.
 */
import { formatMoney } from "@/lib/format";
import type { Product } from "@shared/commerce/types";
import { Heart, LoaderCircle, Share2, ShoppingBag, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export async function shareProduct(product: Product) {
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
export function CardGallery({ product, onDetails, compact }: { product: Product; onDetails: () => void; compact: boolean }) {
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

export function ProductCard({ product, saved, onSave, onShare = () => void shareProduct(product), onDetails, onAdd, onBuyNow, isAdding, compact = false }: { product: Product; saved: boolean; onSave: () => void; onShare?: () => void; onDetails: () => void; onAdd: () => void; onBuyNow: () => void; isAdding: boolean; compact?: boolean }) {
  const variant = product.variants[0];
  const compareAt = variant?.compareAtPrice;
  const canBuy = Boolean(variant?.availableForSale);

  return (
    <article className={`product-card group relative @container flex flex-col overflow-hidden rounded-2xl border border-[#d5dfeb] bg-[#fffdf9] ${compact ? "p-2.5" : "p-3"}`}>
      <CardGallery product={product} onDetails={onDetails} compact={compact} />
      <span className="type-label absolute left-4 top-4 rounded-full bg-[#fff0ab] px-2 py-1 text-[8px] font-extrabold text-[#0a285a] shadow-sm">{product.productType || "NetLet edit"}</span>
      <button onClick={onSave} aria-pressed={saved} aria-label={saved ? `Remove ${product.title} from saved` : `Save ${product.title}`} className={`glass pressable absolute right-4 top-4 grid size-7 place-items-center rounded-full ${saved ? "!text-[#f2683a]" : ""}`}><Heart className={`size-3.5 ${saved ? "fill-current" : ""}`} /></button><button onClick={onShare} aria-label={`Share ${product.title}`} className="glass pressable absolute right-12 top-4 grid size-7 place-items-center rounded-full"><Share2 className="size-3.5" /></button>
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
