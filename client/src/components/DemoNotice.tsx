/**
 * Slim banner shown only in the static demo build, so nobody mistakes the
 * sample catalog for live NetLet inventory. Renders nothing in a normal build.
 */
import { DEMO_MODE } from "@/lib/demoMode";
import { Info } from "lucide-react";

export default function DemoNotice() {
  if (!DEMO_MODE) return null;

  return (
    <div className="bg-[#0a285a] text-[#fffdf9]">
      <div className="container flex items-center justify-center gap-2 px-4 py-2 text-center">
        <Info className="size-3.5 shrink-0 text-[#ffcc64]" aria-hidden="true" />
        <p className="text-[11px] font-semibold leading-4">
          Static design preview — sample products and prices, no live catalog,
          checkout, or sign-in.
        </p>
      </div>
    </div>
  );
}
