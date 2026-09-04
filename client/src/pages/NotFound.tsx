/**
 * 404.
 *
 * This was a slate-and-red template card with a pulsing alert icon — a page
 * from a different product, shown at the moment a shopper is most likely to
 * leave. It now looks like NetLet and, more usefully, offers a way onward:
 * a mistyped or dead product link is a dead end otherwise.
 */
import { logoImage } from "@/lib/brandAssets";
import { trpc } from "@/lib/trpc";
import { usePageMeta } from "@/lib/usePageMeta";
import { formatMoney } from "@/lib/format";
import { appPath } from "@/lib/basePath";
import { privatePageMeta } from "@shared/seo";
import { ArrowRight, Compass, Search } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  usePageMeta(privatePageMeta("Page not found"));
  const [location, navigate] = useLocation();
  // A handful of real products beats a dead end, and the catalog is already
  // cached from wherever the shopper came in.
  const { data: catalog = [] } = trpc.commerce.products.list.useQuery({ first: 8 });
  const suggestions = catalog.slice(0, 4);

  return (
    <main className="min-h-screen bg-background text-[#0a285a]">
      <header className="border-b border-[#d5dfeb] bg-background/95">
        <div className="container flex h-[72px] items-center">
          <Link href="/" className="flex items-center" aria-label="NetLet home">
            <img src={logoImage} alt="NetLet" className="h-10 w-auto max-w-[130px] object-contain" />
          </Link>
        </div>
      </header>

      <div className="container py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-grid size-14 place-items-center rounded-2xl bg-[#e7edf5] text-[#f2683a]">
            <Compass className="size-7" />
          </span>
          <p className="mt-6 text-[10px] font-extrabold tracking-[.16em] text-[#a44a2b] uppercase">404</p>
          <h1 className="display-face mt-2 text-4xl leading-[.95] sm:text-5xl">
            That page has moved on.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#536b8c]">
            The link may be old, or the product may have sold out and left the catalog.
            Everything else is still where you left it.
          </p>
          {/* The path is shown so a mistyped URL is obvious, and escaped by
              React rather than interpolated into markup. */}
          <p className="mt-3 truncate font-mono text-[11px] text-[#9ea4b5]">{location}</p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => navigate("/")} className="glass glass-navy pressable inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-xs font-extrabold">
              Back to the storefront <ArrowRight className="size-4" />
            </button>
            <button onClick={() => navigate("/saved")} className="glass pressable inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-xs font-extrabold">
              <Search className="size-4" />Your saved items
            </button>
          </div>
        </div>

        {suggestions.length ? (
          <section className="mt-14 border-t border-[#d5dfeb] pt-10">
            <h2 className="text-center text-[10px] font-extrabold tracking-[.15em] text-[#a44a2b] uppercase">
              While you are here
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => window.location.assign(appPath(`/products/${encodeURIComponent(product.handle)}`))}
                  className="group overflow-hidden rounded-2xl border border-[#d5dfeb] bg-[#fffdf9] p-3 text-left"
                >
                  <div className="overflow-hidden rounded-xl bg-[#e7edf5]">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].altText ?? product.title}
                        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : <div className="aspect-square" />}
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-extrabold tracking-[-.025em] group-hover:text-[#f2683a]">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-sm font-extrabold tracking-[-.04em]">{formatMoney(product.priceRange.min)}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
