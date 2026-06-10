import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ProductCard";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import type { Product, Category } from "@shared/schema";

type SortOption = "popular" | "newest" | "price-asc" | "price-desc" | "name";

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full rounded-md" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}

export default function Products({ forcePromo }: { forcePromo?: boolean }) {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const categoryFromUrl = params.get("categoria");
  const showPromos = params.get("promocoes") === "true" || !!forcePromo;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [promoOnly, setPromoOnly] = useState(showPromos);
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const chipScrollRef = useDragScroll<HTMLDivElement>();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: orderCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["/api/products/popular"],
  });

  const { data: settings } = useQuery<{ popularMode: string }>({
    queryKey: ["/api/settings"],
  });
  const popularMode = settings?.popularMode || "manual";

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    setPromoOnly(showPromos);
  }, [showPromos]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (promoOnly) {
      result = result.filter((p) => p.isSale);
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    const isMaisPedidos = !selectedCategory && !promoOnly;
    if (isMaisPedidos && sortBy === "popular" && popularMode === "manual") {
      result = result.filter((p) => p.featured);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        result.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "popular":
      default:
        result.sort((a, b) => {
          const countA = orderCounts[a.id] || 0;
          const countB = orderCounts[b.id] || 0;
          if (countB !== countA) return countB - countA;
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
    }

    return result;
  }, [products, selectedCategory, sortBy, promoOnly, orderCounts, popularMode]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setPromoOnly(false);
    setSortBy("popular");
  };

  const categoryTitle = promoOnly
    ? "Promoções"
    : selectedCategory
      ? categories.find((c) => c.slug === selectedCategory)?.name || "Cardápio"
      : "Mais Pedidos";

  return (
    <main className="min-h-screen pb-8" data-testid="page-products">
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div ref={chipScrollRef} className="no-scrollbar mx-auto flex max-w-7xl cursor-grab gap-2 overflow-x-auto px-4 py-3 select-none">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              setPromoOnly(false);
              setSortBy("popular");
            }}
            aria-pressed={!selectedCategory && !promoOnly}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors active:scale-95 ${
              !selectedCategory && !promoOnly
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground"
            }`}
            data-testid="chip-category-all"
          >
            Mais pedidos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug);
                setPromoOnly(false);
              }}
              aria-pressed={selectedCategory === cat.slug}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors active:scale-95 ${
                selectedCategory === cat.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground"
              }`}
              data-testid={`chip-category-${cat.slug}`}
            >
              {cat.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPromoOnly(true);
              setSelectedCategory(null);
            }}
            aria-pressed={promoOnly}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors active:scale-95 ${
              promoOnly
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground"
            }`}
            data-testid="chip-category-promo"
          >
            Ofertas
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl md:text-4xl" data-testid="text-page-title">
            {categoryTitle}
          </h1>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-1 lg:flex">
              <Button
                variant={gridCols === 3 ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setGridCols(3)}
                data-testid="button-grid-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={gridCols === 4 ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setGridCols(4)}
                data-testid="button-grid-4"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div
            className={`grid gap-4 sm:gap-6 ${
              gridCols === 3
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            }`}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground">
              Nenhum item encontrado
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters} data-testid="button-clear-filters-empty">
              Ver Mais Pedidos
            </Button>
          </div>
        ) : (
          <div
            className={`grid gap-4 sm:gap-6 ${
              gridCols === 3
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            }`}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
