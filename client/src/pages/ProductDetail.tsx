import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { appPath } from "@/lib/basePath";
import { logoImage } from "@/lib/brandAssets";
import { formatMoney } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { canUseGalleryKeyboard, galleryIndex } from "@shared/commerce/gallery";
import { relatedProducts } from "@shared/commerce/related";
import type { Product } from "@shared/commerce/types";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  LoaderCircle,
  Maximize2,
  PackageOpen,
  Share2,
  ShoppingBag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";


async function shareProduct(product: Product) {
  const url = `${window.location.origin}/products/${encodeURIComponent(product.handle)}`;
  const shareData = { title: product.title, text: `Take a look at ${product.title} on NetLet.`, url };
  try {
    const nativeBridge = (window as Window & { ReactNativeWebView?: { postMessage: (message: string) => void } }).ReactNativeWebView;
    if (nativeBridge) return nativeBridge.postMessage(JSON.stringify({ type: "share", ...shareData }));
    if (navigator.share) return await navigator.share(shareData);
    await navigator.clipboard.writeText(url);
    toast.success("Product link copied to your clipboard.");
  } catch (error) {
    if ((error as DOMException)?.name !== "AbortError") toast.error("We couldn’t share that product right now.");
  }
}

function RelatedCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <article className="group min-w-[190px] overflow-hidden rounded-2xl border border-[#d5dfeb] bg-[#fffdf9] p-3 sm:min-w-0">
      <button onClick={() => window.location.assign(appPath(`/products/${encodeURIComponent(product.handle)}`))} className="block w-full text-left">
        <div className="relative overflow-hidden rounded-xl bg-[#e7edf5]">
          {image ? <img src={image.url} alt={image.altText ?? product.title} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="aspect-square" />}
        </div>
        <p className="mt-3 text-[9px] font-extrabold tracking-[.12em] text-[#a44a2b] uppercase">{product.productType || "NetLet edit"}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-extrabold tracking-[-.025em] text-[#0a285a] group-hover:text-[#f2683a]">{product.title}</h3>
        <p className="mt-2 text-base font-extrabold tracking-[-.04em] text-[#0a285a]">{formatMoney(product.priceRange.min)}</p>
      </button>
    </article>
  );
}

function ImageZoomDialog({ product, selectedImageIndex, onClose, onChangeImage }: { product: Product; selectedImageIndex: number; onClose: () => void; onChangeImage: (direction: "previous" | "next") => void }) {
  const image = product.images[selectedImageIndex] ?? product.images[0];
  const hasMultipleImages = product.images.length > 1;
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#061b3b]/90 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Expanded image for ${product.title}`} onClick={onClose}><section className="relative flex h-full w-full max-w-5xl flex-col rounded-[1.5rem] bg-[#fffdf9] p-3 shadow-2xl sm:p-5" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between gap-4 px-2 pb-3"><p className="line-clamp-1 text-xs font-extrabold text-[#0a285a]">{product.title}</p><button autoFocus onClick={onClose} aria-label="Close expanded product image" className="glass pressable grid size-10 place-items-center rounded-full"><X className="size-4" /></button></div><div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1rem] bg-[#e7edf5]">{image ? <img src={image.url} alt={image.altText ?? product.title} className="max-h-full max-w-full object-contain" /> : null}{hasMultipleImages ? <><button onClick={() => onChangeImage("previous")} aria-label="Show previous product image" className="glass pressable absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full"><ChevronLeft className="size-7" /></button><button onClick={() => onChangeImage("next")} aria-label="Show next product image" className="glass pressable absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full"><ChevronRight className="size-7" /></button><span className="glass glass-navy absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-[10px] font-extrabold">{selectedImageIndex + 1} / {product.images.length}</span></> : null}</div></section></div>;
}

function ProductGallery({ product, selectedImageIndex, onSelectImage, onChangeImage, onZoom }: {
  product: Product;
  selectedImageIndex: number;
  onSelectImage: (index: number) => void;
  onChangeImage: (direction: "previous" | "next") => void;
  onZoom: () => void;
}) {
  const image = product.images[selectedImageIndex] ?? product.images[0];
  const hasMultipleImages = product.images.length > 1;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#d5dfeb] bg-white">
      <div className="relative bg-[#e7edf5]">
        {image ? <img src={image.url} alt={image.altText ?? product.title} className="aspect-square w-full object-cover" /> : <div className="aspect-square" />}
        {image ? <button onClick={onZoom} aria-label="Expand product image" className="glass pressable absolute right-3 top-3 grid size-10 place-items-center rounded-full"><Maximize2 className="size-4" /></button> : null}
        {hasMultipleImages ? <>
          <button
            onClick={() => onChangeImage("previous")}
            aria-label="Show previous product image"
            className="glass pressable absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full focus-visible:bg-white/90 focus-visible:text-[#f2683a] focus-visible:outline-none"
          >
            <ChevronLeft className="size-7" strokeWidth={2.35} />
          </button>
          <button
            onClick={() => onChangeImage("next")}
            aria-label="Show next product image"
            className="glass pressable absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full focus-visible:bg-white/90 focus-visible:text-[#f2683a] focus-visible:outline-none"
          >
            <ChevronRight className="size-7" strokeWidth={2.35} />
          </button>
          <span className="glass glass-navy absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-[10px] font-extrabold">{selectedImageIndex + 1} / {product.images.length}</span>
        </> : null}
      </div>
      {hasMultipleImages ? <div className="hide-scrollbar flex gap-2 overflow-x-auto p-3">
        {product.images.map((item, index) => <button
          key={`${item.url}-${index}`}
          onClick={() => onSelectImage(index)}
          aria-label={`Show image ${index + 1} of ${product.images.length}`}
          aria-current={selectedImageIndex === index}
          className={`pressable size-14 shrink-0 overflow-hidden rounded-xl border-2 ${selectedImageIndex === index ? "border-[#f2683a]" : "border-transparent hover:border-[#aac0da]"}`}
        >
          <img src={item.url} alt={item.altText ?? `${product.title} view ${index + 1}`} className="size-full object-cover" />
        </button>)}
      </div> : null}
      {hasMultipleImages ? <p className="px-4 pb-4 text-center text-[10px] font-semibold text-[#778ba6]">Use the arrows or left/right keyboard keys to browse product images.</p> : null}
    </div>
  );
}

function ProductInformation({ product }: { product: Product }) {
  const facts = [
    product.productType ? { label: "Category", value: product.productType } : null,
    product.vendor ? { label: "Brand", value: product.vendor } : null,
    product.options.length ? { label: "Available options", value: product.options.map((option) => `${option.name}: ${option.values.join(" · ")}`).join(" | ") } : null,
    product.tags.length ? { label: "Product tags", value: product.tags.slice(0, 5).join(" · ") } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);
  if (!facts.length && !product.attributes.length) return null;
  return <section className="mt-10 rounded-[1.5rem] border border-[#d5dfeb] bg-white p-6 sm:p-8"><p className="text-[10px] font-extrabold tracking-[.14em] text-[#a44a2b] uppercase">Product information</p><h2 className="display-face mt-2 text-3xl text-[#0a285a]">The details that are live now.</h2>{facts.length ? <dl className="mt-6 grid gap-4 sm:grid-cols-2">{facts.map((fact) => <div key={fact.label} className="rounded-xl bg-[#f3f2ed] p-4"><dt className="text-[10px] font-extrabold tracking-[.1em] text-[#778ba6] uppercase">{fact.label}</dt><dd className="mt-2 text-sm font-bold leading-6 text-[#0a285a]">{fact.value}</dd></div>)}</dl> : null}<div className="mt-6 border-t border-[#d5dfeb] pt-6"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold tracking-[.14em] text-[#a44a2b] uppercase">Structured attributes</p><h3 className="mt-1 text-lg font-extrabold text-[#0a285a]">Shopify specifications</h3></div><span className="rounded-full bg-[#e7edf5] px-3 py-1 text-[10px] font-extrabold text-[#536b8c]">{product.attributes.length ? `${product.attributes.length} live` : "Not configured"}</span></div>{product.attributes.length ? <div className="mt-4 overflow-hidden rounded-2xl border border-[#d5dfeb]"><table className="w-full border-collapse text-left"><caption className="sr-only">Shopify specifications for {product.title}</caption><thead className="bg-[#0a285a] text-white"><tr><th scope="col" className="w-2/5 px-4 py-3 text-[10px] font-extrabold tracking-[.1em] uppercase sm:px-5">Attribute</th><th scope="col" className="px-4 py-3 text-[10px] font-extrabold tracking-[.1em] uppercase sm:px-5">Value</th></tr></thead><tbody>{product.attributes.map((attribute, index) => <tr key={`${attribute.namespace}.${attribute.key}`} className={index % 2 === 0 ? "bg-[#f3f2ed]" : "bg-[#fffdf9]"}><th scope="row" className="border-t border-[#d5dfeb] px-4 py-4 text-xs font-extrabold text-[#0a285a] sm:px-5">{attribute.label}</th><td className="border-t border-[#d5dfeb] px-4 py-4 text-sm font-semibold leading-6 text-[#536b8c] sm:px-5">{attribute.value}</td></tr>)}</tbody></table></div> : <p className="mt-4 rounded-xl bg-[#f3f2ed] p-4 text-sm leading-6 text-[#536b8c]">No structured attributes have been configured for this product in Shopify yet. Product details shown above come from the live title, description, options, category, and brand fields.</p>}</div></section>;
}

export default function ProductDetail() {
  const [, params] = useRoute("/products/:handle");
  const handle = params?.handle ?? "";
  const { data: product, isLoading, error } = trpc.commerce.products.byHandle.useQuery({ handle }, { enabled: Boolean(handle) });
  const { data: catalog = [] } = trpc.commerce.products.list.useQuery({ first: 24 });
  const { addItem, loading: cartLoading } = useCart();
  const { savedIds, toggleSaved } = useCustomer();
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    setSelectedVariantId(product?.variants[0]?.id ?? "");
    setSelectedImageIndex(0);
    setZoomOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [product?.id]);

  useEffect(() => {
    const imageCount = product?.images.length ?? 0;
    if (imageCount <= 1) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || !canUseGalleryKeyboard(event.target)) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      setSelectedImageIndex(current => galleryIndex(current, imageCount, event.key === "ArrowRight" ? "next" : "previous"));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product?.id, product?.images.length]);

  useEffect(() => {
    if (!zoomOpen) return;
    const closeZoom = (event: KeyboardEvent) => { if (event.key === "Escape") setZoomOpen(false); };
    window.addEventListener("keydown", closeZoom);
    return () => window.removeEventListener("keydown", closeZoom);
  }, [zoomOpen]);

  const selectedVariant = product?.variants.find(variant => variant.id === selectedVariantId) ?? product?.variants[0];
  const related = useMemo(() => product ? relatedProducts(product, catalog) : [], [catalog, product]);
  const isSaved = product ? savedIds.includes(product.id) : false;
  const galleryImageCount = product?.images.length ?? 0;

  const changeImage = (direction: "previous" | "next") => setSelectedImageIndex(current => galleryIndex(current, galleryImageCount, direction));
  const addToBag = async () => {
    if (!product || !selectedVariant?.availableForSale) return;
    try {
      await addItem(selectedVariant.id);
      toast.success(`${product.title} added to your bag`);
    } catch {
      toast.error("We couldn't add that item just now. Please try again.");
    }
  };

  if (isLoading) return <main className="min-h-screen bg-[#f3f2ed] px-4 py-8"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-10 w-32 rounded-full bg-[#e7edf5]" /><div className="mt-8 grid gap-8 lg:grid-cols-2"><div className="aspect-square rounded-[2rem] bg-[#e7edf5]" /><div className="space-y-5 pt-7"><div className="h-5 w-24 rounded bg-[#dce5e9]" /><div className="h-16 w-4/5 rounded bg-[#dce5e9]" /><div className="h-20 rounded bg-[#e7edf5]" /></div></div></div></main>;

  if (!product || error) return <main className="min-h-screen bg-[#f3f2ed] px-4 py-16"><div className="mx-auto max-w-lg rounded-[2rem] border border-[#d5dfeb] bg-[#fffdf9] p-9 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e7edf5] text-[#0a285a]"><PackageOpen className="size-7" /></div><h1 className="display-face mt-5 text-4xl text-[#0a285a]">Product not found.</h1><p className="mt-3 text-sm leading-6 text-[#536b8c]">This product may be unavailable or no longer published in the live NetLet catalog.</p><Link href="/" className="glass glass-navy pressable mt-7 inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-extrabold"><ArrowLeft className="size-4" />Back to NetLet</Link></div></main>;

  return (
    <main className="min-h-screen bg-[#f3f2ed] pb-14 text-[#0a285a]">
      <header className="border-b border-[#d5dfeb] bg-[#f3f2ed]/95 backdrop-blur-xl"><div className="container flex h-[72px] items-center justify-between"><Link href="/" className="flex items-center"><img src={logoImage} alt="NetLet" className="h-10 w-auto max-w-[130px] object-contain" /></Link><Link href="/" className="glass pressable inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-extrabold"><ArrowLeft className="size-4" />Continue shopping</Link></div></header>
      <div className="container py-6 sm:py-9">
        <p className="text-[10px] font-extrabold tracking-[.14em] text-[#a44a2b] uppercase"><Link href="/" className="hover:text-[#f2683a]">NetLet</Link> <span className="mx-1 text-[#b5c2d1]">/</span> {product.productType || "Product"}</p>
        <section className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.06fr)_minmax(350px,.94fr)] lg:gap-12">
          <ProductGallery product={product} selectedImageIndex={selectedImageIndex} onSelectImage={setSelectedImageIndex} onChangeImage={changeImage} onZoom={() => setZoomOpen(true)} />
          <div className="flex flex-col rounded-[2rem] border border-[#d5dfeb] bg-[#fffdf9] p-6 sm:p-9">
            <div className="flex items-start justify-between gap-4"><span className="rounded-full bg-[#fff0ab] px-3 py-1.5 text-[10px] font-extrabold tracking-[.13em] text-[#0a285a] uppercase">{product.productType || "NetLet edit"}</span><div className="flex gap-2"><button onClick={() => toggleSaved(product.id)} aria-label={isSaved ? `Remove ${product.title} from saved` : `Save ${product.title}`} className={`pressable grid size-10 place-items-center rounded-full border border-[#d5dfeb] bg-white ${isSaved ? "text-[#f2683a]" : "text-[#0a285a]"}`}><Heart className={`size-4 ${isSaved ? "fill-current" : ""}`} /></button><button onClick={() => void shareProduct(product)} aria-label={`Share ${product.title}`} className="glass pressable grid size-10 place-items-center rounded-full"><Share2 className="size-4" /></button></div></div>
            <h1 className="display-face mt-5 text-4xl leading-[.95] text-[#0a285a] sm:text-5xl">{product.title}</h1>
            {product.vendor ? <p className="mt-3 text-xs font-bold text-[#536b8c]">Sold by {product.vendor}</p> : null}
            <p className="mt-5 text-sm leading-7 text-[#536b8c]">{product.description || "A considered NetLet find for everyday Kuwait life."}</p>
            <div className="mt-7 border-y border-[#d5dfeb] py-5"><p className="text-2xl font-extrabold tracking-[-.05em] text-[#0a285a]">{formatMoney(selectedVariant?.price ?? product.priceRange.min)}</p>{selectedVariant?.compareAtPrice ? <p className="mt-1 text-xs font-bold text-[#778ba6] line-through">{formatMoney(selectedVariant.compareAtPrice)}</p> : null}</div>
            {product.variants.length > 1 ? <label className="mt-6 block text-xs font-extrabold text-[#0a285a]">Choose an option<select value={selectedVariantId} onChange={event => setSelectedVariantId(event.target.value)} className="mt-2 block w-full rounded-xl border border-[#d5dfeb] bg-white px-3 py-3 text-sm font-semibold text-[#0a285a] outline-none focus:border-[#f2683a]">{product.variants.map(variant => <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>{variant.title} — {formatMoney(variant.price)}{variant.availableForSale ? "" : " (Unavailable)"}</option>)}</select></label> : null}
            <button onClick={() => void addToBag()} disabled={!selectedVariant?.availableForSale || cartLoading} className="glass glass-navy pressable mt-7 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">{cartLoading ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}{selectedVariant?.availableForSale ? "Add to bag" : "Unavailable"}</button>
            <p className="mt-4 text-center text-[11px] leading-5 text-[#778ba6]">Delivery pricing and estimated times will appear when NetLet’s Kuwait delivery policy is configured.</p>
          </div>
        </section>
        <ProductInformation product={product} />
        <section className="mt-14 border-t border-[#d5dfeb] pt-10"><div className="flex items-end justify-between gap-5"><div><p className="text-[10px] font-extrabold tracking-[.15em] text-[#a44a2b] uppercase">Keep discovering</p><h2 className="display-face mt-2 text-3xl text-[#0a285a] sm:text-4xl">Related products</h2><p className="mt-2 text-sm text-[#536b8c]">Live items selected from the same type, tags, or maker when available.</p></div><Link href="/" className="hidden items-center gap-1 text-xs font-extrabold text-[#0a285a] underline decoration-[#f2683a] decoration-2 underline-offset-4 sm:flex">View all <ArrowRight className="size-3.5" /></Link></div>{related.length ? <div className="hide-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">{related.map(item => <RelatedCard key={item.id} product={item} />)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-[#b8c9dc] bg-white/60 px-6 py-10 text-center"><p className="text-sm font-bold text-[#0a285a]">More related finds will appear as the live catalog grows.</p><Link href="/" className="mt-3 inline-block text-xs font-extrabold text-[#f2683a] underline underline-offset-4">Browse the catalog</Link></div>}</section>
      </div>
      {zoomOpen ? <ImageZoomDialog product={product} selectedImageIndex={selectedImageIndex} onClose={() => setZoomOpen(false)} onChangeImage={changeImage} /> : null}
    </main>
  );
}
