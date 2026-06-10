import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart, Menu, X, Coffee, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { useCart } from "@/lib/cart";
import type { Category } from "@shared/schema";

export function Header() {
  const [location] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCart, getItemCount } = useCart();
  const itemCount = getItemCount();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = () => setIsAdmin(!!localStorage.getItem("admin-token"));
    check();
    window.addEventListener("storage", check);
    window.addEventListener("focus", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("focus", check);
    };
  }, [location]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const navLinks = [
    { href: "/inicio", label: "Início" },
    { href: "/", label: "Cardápio" },
    ...categories.slice(0, 4).map((cat) => ({
      href: `/produtos?categoria=${cat.slug}`,
      label: cat.name,
    })),
    { href: "/promocoes", label: "Ofertas" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-2">
          {searchOpen ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                type="search"
                placeholder="Buscar no cardápio..."
                className="flex-1"
                autoFocus
                data-testid="input-search"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(false)}
                data-testid="button-close-search"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/inicio" data-testid="link-logo-home">
                <span className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight sm:text-2xl" data-testid="text-logo">
                  <Coffee className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  Café Encanto
                </span>
              </Link>

              <div className="flex items-center gap-1">
              <div className="lg:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] p-0">
                    <div className="flex flex-col">
                      <div className="border-b p-4">
                        <Link href="/inicio" onClick={() => setMobileMenuOpen(false)}>
                          <span className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight" data-testid="text-logo-mobile">
                            <Coffee className="h-6 w-6 text-primary" />
                            Café Encanto
                          </span>
                        </Link>
                      </div>
                      <nav className="flex flex-col p-4">
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span
                              className={`block py-3 text-lg transition-colors ${
                                location === link.href
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground"
                              }`}
                              data-testid={`link-nav-mobile-${link.label.toLowerCase()}`}
                            >
                              {link.label}
                            </span>
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  data-testid="button-search"
                >
                  <Search className="h-5 w-5" />
                </Button>
                {isAdmin && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Voltar ao painel"
                      data-testid="button-go-admin"
                    >
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                    </Button>
                  </Link>
                )}
                <div className="hidden sm:block">
                  <ThemeToggle />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={openCart}
                  data-testid="button-cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground" data-testid="badge-cart-count">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
