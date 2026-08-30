/**
 * NetLet design reminder: public marketplace storefront in pearl white, luxury navy,
 * and NetLet Orange — with shopping state provided by Shopify’s normalized cart contract.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import Account from "@/pages/Account";
import Checkout from "@/pages/Checkout";
import NotFound from "@/pages/NotFound";
import ProductDetail from "@/pages/ProductDetail";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/account" component={Account} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/products/:handle" component={ProductDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
              <Router />
            </CartProvider>
          </CustomerProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
