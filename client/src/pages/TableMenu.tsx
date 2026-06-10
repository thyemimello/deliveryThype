import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Coffee, ShoppingBag, Plus, Minus, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import type { Product, Category, Table } from "@shared/schema";
import { useState, useEffect } from "react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}

export default function TableMenu() {
  const { numero } = useParams<{ numero: string }>();
  const { items, addItem, updateQuantity, getItemCount, openCart, setTableSession, clearTableSession } = useCart();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const chipScrollRef = useDragScroll<HTMLDivElement>();

  const { data: table, isLoading: tableLoading, isError: tableError } = useQuery<Table>({
    queryKey: ["/api/tables", numero],
    enabled: !!numero,
    retry: false,
  });

  useEffect(() => {
    if (table?.number) {
      setTableSession(table.number);
    }
  }, [table?.number, setTableSession]);

  useEffect(() => {
    if (tableError) {
      clearTableSession();
    }
  }, [tableError, clearTableSession]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!table,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: !!table,
  });

  const filteredProducts = activeCategory === "todos"
    ? products.filter((p) => p.inStock)
    : products.filter((p) => p.category === activeCategory && p.inStock);

  const getQuantity = (productId: string) => {
    return items.find((i) => i.productId === productId)?.quantity || 0;
  };

  const handleAdd = (product: Product) => {
    addItem(product);
    toast({ title: `${product.name} adicionado!`, description: "Veja seu pedido no ícone acima." });
  };

  const itemCount = getItemCount();

  if (tableLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <Coffee className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">Abrindo sua comanda...</p>
        </div>
      </div>
    );
  }

  if (tableError || !table) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center" data-testid="table-not-found">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <QrCode className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold">Mesa não encontrada</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Este QR Code não corresponde a nenhuma mesa ativa. Chame um atendente ou faça seu pedido por delivery.
            </p>
          </div>
          <Button asChild variant="outline" data-testid="link-delivery">
            <a href="/">Ir para o site</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-serif text-lg font-semibold leading-none">Café Encanto</h1>
                <p className="text-xs text-muted-foreground">
                  {table.name ? `${table.name} · Mesa ${table.number}` : `Mesa ${table.number}`}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="relative gap-2"
              onClick={openCart}
              data-testid="button-cart-mesa"
            >
              <ShoppingBag className="h-4 w-4" />
              Pedido
              {itemCount > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div ref={chipScrollRef} className="mb-6 flex cursor-grab gap-2 overflow-x-auto pb-2 scrollbar-hide select-none">
          <Button
            variant={activeCategory === "todos" ? "default" : "outline"}
            size="sm"
            className="shrink-0"
            onClick={() => setActiveCategory("todos")}
            data-testid="filter-todos"
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.slug ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setActiveCategory(cat.slug)}
              data-testid={`filter-${cat.slug}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product, index) => {
              const qty = getQuantity(product.id);
              const isLastInCategory = index === filteredProducts.length - 1 ||
                filteredProducts[index + 1]?.category !== product.category;

              return (
                <div key={product.id}>
                  <div className="flex gap-4 py-3" data-testid={`menu-item-${product.id}`}>
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium leading-tight">{product.name}</h3>
                          {product.isSale && (
                            <Badge variant="secondary" className="shrink-0 text-xs">Oferta</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
                          {product.originalPrice && (
                            <span className="ml-2 text-xs text-muted-foreground line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        {qty === 0 ? (
                          <Button size="sm" onClick={() => handleAdd(product)} data-testid={`button-add-${product.id}`}>
                            <Plus className="h-4 w-4 mr-1" /> Adicionar
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, qty - 1)} data-testid={`button-decrease-${product.id}`}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">{qty}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, qty + 1)} data-testid={`button-increase-${product.id}`}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isLastInCategory && <Separator />}
                </div>
              );
            })}
          </div>
        )}

        {itemCount > 0 && (
          <div className="fixed bottom-6 left-4 right-4 mx-auto max-w-2xl">
            <Button className="w-full gap-2 shadow-lg" size="lg" onClick={openCart} data-testid="button-view-order">
              <ShoppingBag className="h-5 w-5" />
              Ver Pedido ({itemCount} {itemCount === 1 ? "item" : "itens"})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
