import { trpc } from "@/lib/trpc";
import type { Product } from "@shared/commerce/types";
import { CornerDownLeft, LoaderCircle, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const idleExamples = ["espresso maker", "wireless headphones", "home upgrades", "gifts under 25 KD"];

type LiveSearchProps = {
  catalog: Product[];
  value: string;
  onChange: (query: string) => void;
  onSelectProduct: (product: Product) => void;
};

export function LiveSearch({ catalog, value, onChange, onSelectProduct }: LiveSearchProps) {
  const mobilePreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("searchTest") === "mobile";
  const [focused, setFocused] = useState(false);
  const [idleIndex, setIdleIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [refineMessage, setRefineMessage] = useState("");
  const refine = trpc.search.refine.useMutation();
  const searchTerm = value.trim().toLowerCase();

  useEffect(() => {
    if (value || focused) return;
    const timer = window.setInterval(() => setIdleIndex(current => (current + 1) % idleExamples.length), 2600);
    return () => window.clearInterval(timer);
  }, [focused, value]);

  useEffect(() => {
    if (mobilePreview && !value) {
      onChange("espresso");
      setFocused(true);
    }
  }, [mobilePreview, onChange, value]);

  const suggestions = useMemo(() => {
    const base = searchTerm
      ? catalog.filter(product => [product.title, product.description, product.productType, product.vendor, ...product.tags].join(" ").toLowerCase().includes(searchTerm))
      : catalog;
    return base.slice(0, 4);
  }, [catalog, searchTerm]);

  const applySearch = (query: string) => {
    onChange(query);
    setActiveIndex(-1);
    setRefineMessage("");
  };

  const selectSuggestion = (product: Product) => {
    applySearch(product.title);
    onSelectProduct(product);
    setFocused(false);
  };

  const refineQuery = async () => {
    if (value.trim().length < 2 || refine.isPending) return;
    try {
      if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("searchTest") === "offline") {
        throw new Error("Development-only AI search outage simulation");
      }
      const result = await refine.mutateAsync({ query: value.trim(), catalogTitles: catalog.map(product => product.title).slice(0, 24) });
      applySearch(result.query);
    } catch {
      setRefineMessage("AI search is temporarily unavailable. You can still browse the live catalog suggestions below.");
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && suggestions.length) { event.preventDefault(); setActiveIndex(current => Math.min(current + 1, suggestions.length - 1)); }
    if (event.key === "ArrowUp" && suggestions.length) { event.preventDefault(); setActiveIndex(current => Math.max(current - 1, 0)); }
    if (event.key === "Escape") { setFocused(false); event.currentTarget.blur(); }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) selectSuggestion(suggestions[activeIndex]);
      else void refineQuery();
    }
  };

  const showPanel = focused && (value.length > 0 || catalog.length > 0);
  return (
    <div className="relative ml-auto w-full min-w-0 flex-1 lg:ml-0 lg:w-[min(100%,570px)] lg:flex-none">
      <label className="group flex h-11 items-center rounded-full border border-[#d5dfeb] bg-white px-4 transition-shadow focus-within:shadow-[0_0_0_4px_rgba(242,104,58,.12)]"><Search className="size-[18px] shrink-0 text-[#778ba6]" /><input value={value} onChange={(event) => applySearch(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 140)} onKeyDown={onKeyDown} aria-label="Search NetLet" aria-expanded={showPanel} aria-controls="netlet-search-suggestions" className="type-body w-full bg-transparent px-3 outline-none placeholder:text-[#778ba6]" placeholder={`Search for ${idleExamples[idleIndex]}`} />{value ? <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applySearch("")} aria-label="Clear search" className="type-control grid size-7 place-items-center rounded-full text-[#778ba6] hover:bg-[#e7edf5]"><X className="size-4" /></button> : null}</label>
      {showPanel && <div id="netlet-search-suggestions" role="listbox" className="absolute inset-x-0 top-[calc(100%+.5rem)] z-50 w-full overflow-hidden rounded-2xl border border-[#d5dfeb] bg-[#fffdf9] p-2 shadow-[0_18px_45px_rgba(10,40,90,.18)]"><div className="type-label flex items-center justify-between px-3 pb-2 pt-1 text-[#536b8c]"><span>{value ? "Matching catalog" : "Popular searches"}</span><span className="flex items-center gap-1 text-[#f2683a]"><Sparkles className="size-3" /> NetLet search</span></div>{refineMessage && <div className="type-label mx-1 mb-2 rounded-xl bg-[#fff7e3] px-3 py-2 text-[#705523]">{refineMessage}</div>}{suggestions.length ? <div>{suggestions.map((product, index) => <button key={product.id} role="option" aria-selected={activeIndex === index} onMouseDown={(event) => event.preventDefault()} onClick={() => selectSuggestion(product)} className={`type-control flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[#0a285a] ${activeIndex === index ? "bg-[#e7edf5]" : "hover:bg-[#f3f2ed]"}`}>{product.images[0] ? <img src={product.images[0].url} alt="" className="size-9 rounded-lg object-cover" /> : <span className="grid size-9 place-items-center rounded-lg bg-[#e7edf5]"><Search className="size-4" /></span>}<span className="min-w-0 flex-1"><span className="type-product block truncate text-sm">{product.title}</span><span className="type-label block truncate text-[#536b8c]">{product.productType || "NetLet find"}</span></span><CornerDownLeft className="size-4 text-[#778ba6]" /></button>)}</div> : <div className="type-body px-3 py-4 text-center text-[#536b8c]">{refineMessage ? "Keep browsing or try another search." : "No exact catalog match yet. Let AI refine your request."}</div>}{value.trim().length >= 2 && <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => void refineQuery()} disabled={refine.isPending} className="type-control mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a285a] px-3 py-2.5 text-white hover:bg-[#f2683a] disabled:opacity-60">{refine.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{refine.isPending ? "Refining your search…" : "Refine with NetLet AI"}</button>}</div>}
    </div>
  );
}
