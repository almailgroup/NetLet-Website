/**
 * Saved items.
 *
 * The heart on every product card wrote to a list nothing could read: the
 * header and the mobile tab both answered with a toast counting the items,
 * and there was no page to send anyone to. A save button that cannot be
 * reviewed is a promise the storefront does not keep, so this is that page.
 *
 * Saves live in the customer context — localStorage for a guest, the account
 * once signed in — so the list survives a reload either way.
 */
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useCustomer } from "@/contexts/CustomerContext";
import { appPath } from "@/lib/basePath";
import { logoImage } from "@/lib/brandAssets";
import { trpc } from "@/lib/trpc";
import { usePageMeta } from "@/lib/usePageMeta";
import { privatePageMeta } from "@shared/seo";
import type { Product } from "@shared/commerce/types";
import { ArrowLeft, ArrowRight, Heart, LoaderCircle } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Saved() {
  usePageMeta(privatePageMeta("Saved items"));
  const [, navigate] = useLocation();
  const { savedIds, toggleSaved } = useCustomer();
  const { addItem, loading: cartLoading } = useCart();
  const { data: catalog = [], isLoading } = trpc.commerce.products.list.useQuery({ first: 60 });

  // Ordered by the saved list rather than by catalog order, so the most
  // recently saved item is where the shopper left it.
  const savedProducts = useMemo(() => {
    const byId = new Map(catalog.map((product) => [product.id, product]));
    return savedIds.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  }, [catalog, savedIds]);

  // A saved id with no product behind it means the item left the catalog while
  // it was on the list. Counted rather than hidden: "two items are no longer
  // available" is information; silently showing fewer cards is a bug report.
  const missingCount = savedIds.length - savedProducts.length;

  const openProduct = (product: Product) =>
    window.location.assign(appPath(`/products/${encodeURIComponent(product.handle)}`));

  const addToCart = async (product: Product) => {
    const variant = product.variants[0];
    if (!variant?.availableForSale) return toast.error("This item is currently unavailable.");
    try {
      await addItem(variant.id);
      toast.success(`${product.title} added to your cart`);
    } catch {
      toast.error("We couldn't add that item just now. Please try again.");
    }
  };

  const buyNow = async (product: Product) => {
    const variant = product.variants[0];
    if (!variant?.availableForSale) return toast.error("This item is currently unavailable.");
    try {
      await addItem(variant.id);
      window.location.assign(appPath("/checkout"));
    } catch {
      toast.error("We couldn't start that order just now. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-background pb-16 text-[#0a285a]">
      <header className="sticky top-0 z-40 border-b border-[#d5dfeb] bg-background/95 backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="NetLet home">
            <img src={logoImage} alt="NetLet" className="h-10 w-auto max-w-[130px] object-contain" />
          </Link>
          <Link href="/" className="glass pressable inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-extrabold">
            <ArrowLeft className="size-4" />Continue shopping
          </Link>
        </div>
      </header>

      <div className="container py-8 sm:py-10">
        <p className="text-[10px] font-extrabold tracking-[.15em] text-[#a44a2b] uppercase">Your list</p>
        <h1 className="display-face mt-2 text-4xl text-[#0a285a] sm:text-5xl">Saved for later.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#536b8c]">
          {savedProducts.length
            ? `${savedProducts.length} item${savedProducts.length === 1 ? "" : "s"} kept aside. They stay here while you browse.`
            : "Tap the heart on any product and it will wait for you here."}
        </p>
        {missingCount > 0 ? (
          <p className="mt-3 rounded-xl border border-[#f2b69e] bg-white px-4 py-3 text-xs font-semibold text-[#a44a2b]">
            {missingCount} saved item{missingCount === 1 ? " is" : "s are"} no longer in the catalog.
          </p>
        ) : null}

        {isLoading ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-[420px] animate-pulse rounded-2xl border border-[#d5dfeb] bg-white/60" />
            ))}
          </div>
        ) : savedProducts.length ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {savedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                saved
                onSave={() => {
                  toggleSaved(product.id);
                  toast(`${product.title} removed from saved.`);
                }}
                onDetails={() => openProduct(product)}
                onAdd={() => void addToCart(product)}
                onBuyNow={() => void buyNow(product)}
                isAdding={cartLoading}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#b8c9dc] bg-white/60 px-6 py-14 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#e7edf5] text-[#f2683a]">
              <Heart className="size-6" />
            </div>
            <h2 className="mt-5 text-lg font-extrabold text-[#0a285a]">Nothing saved yet.</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#536b8c]">
              Browsing is easier when you can put things aside. Save anything that catches your eye and compare it here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="glass glass-navy pressable mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-extrabold"
            >
              Browse the catalog <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {cartLoading ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#778ba6]">
            <LoaderCircle className="size-3.5 animate-spin" />Updating your cart…
          </p>
        ) : null}
      </div>
    </main>
  );
}
