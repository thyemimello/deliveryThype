import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { CartProvider, useCart } from "@/lib/cart";
import { Header } from "@/components/Header";
import { PromoBanner } from "@/components/PromoBanner";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Admin from "@/pages/Admin";
import OrderTracking from "@/pages/OrderTracking";
import TableMenu from "@/pages/TableMenu";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Products} />
      <Route path="/inicio" component={Home} />
      <Route path="/produtos">{() => <Products />}</Route>
      <Route path="/promocoes">{() => <Products forcePromo />}</Route>
      <Route path="/produto/:id" component={ProductDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function MainSite() {
  const { clearTableSession } = useCart();
  useEffect(() => {
    clearTableSession();
  }, [clearTableSession]);
  return (
    <div className="flex min-h-screen flex-col">
      <PromoBanner />
      <Header />
      <div className="flex-1">
        <Router />
      </div>
      <Footer />
    </div>
  );
}

function AppContent() {
  return (
    <Switch>
      <Route path="/admin">
        <Admin />
      </Route>
      <Route path="/mesa/:numero">
        {(params) => <TableMenu />}
      </Route>
      <Route path="/pedido/:id">
        {(params) => <OrderTracking />}
      </Route>
      <Route>
        <MainSite />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <TooltipProvider>
            <AppContent />
            <CartDrawer />
            <WhatsAppButton />
            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
