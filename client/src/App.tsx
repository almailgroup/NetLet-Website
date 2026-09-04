/**
 * NetLet design reminder: public marketplace storefront in pearl white, luxury navy,
 * and NetLet Orange — with shopping state provided by Shopify’s normalized cart contract.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { BASE_PATH } from "@/lib/basePath";
import { lazy, Suspense } from "react";
import { Route, Router as WouterRouter, Switch } from "wouter";
import LiquidGlassFilters from "./components/LiquidGlassFilters";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

/**
 * Home loads with the document; everything else is fetched when first visited.
 *
 * A shopper landing on the storefront was downloading the checkout form, the
 * account page and the product gallery before seeing a single product. Home
 * stays eager because it is the page nearly every visit starts on, and making
 * it lazy would only add a round trip to the critical path.
 */
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Account = lazy(() => import("@/pages/Account"));
const Saved = lazy(() => import("@/pages/Saved"));
const NotFound = lazy(() => import("@/pages/NotFound"));

/**
 * Shown while a route chunk is in flight. Deliberately the page's own ground
 * colour with a single centred mark rather than a spinner on white: on a fast
 * connection this is on screen for a few frames, and a white flash between two
 * off-white pages reads as a fault.
 */
function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-background" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <span className="size-8 animate-spin rounded-full border-2 border-[#d5dfeb] border-t-[#f2683a]" aria-hidden />
    </div>
  );
}

function Router() {
  return (
    // `base` keeps <Link> and useLocation correct when the app is served from a
    // sub-directory (GitHub Pages). It is "" for a root deployment.
    <WouterRouter base={BASE_PATH}>
      <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/account" component={Account} />
        <Route path="/saved" component={Saved} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/products/:handle" component={ProductDetail} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <CustomerProvider>
            <CartProvider>
              <Toaster richColors position="bottom-right" />
              <LiquidGlassFilters />
              <Router />
            </CartProvider>
          </CustomerProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
