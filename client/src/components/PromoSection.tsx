import { Link } from "wouter";
import { ArrowRight, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@shared/schema";

interface PromoSectionProps {
  products: Product[];
}

export function PromoSection({ products }: PromoSectionProps) {
  if (products.length === 0) return null;

  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-12 md:py-16" data-testid="section-promos">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 rounded-md bg-[hsl(25,65%,25%)] dark:bg-[hsl(25,50%,20%)] p-6 md:p-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <Percent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl" data-testid="text-promo-title">
                  Ofertas do Dia
                </h2>
                <p className="mt-1 text-white/80">
                  Itens selecionados com preços imperdíveis
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-white/50 bg-white/10 text-white backdrop-blur-sm"
              asChild
            >
              <Link href="/produtos?promocoes=true" data-testid="link-view-all-promos">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
