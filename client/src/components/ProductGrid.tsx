import { ProductCard } from "./ProductCard";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function ProductGrid({ products, title, subtitle }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <p className="text-lg text-muted-foreground">
          Nenhum produto encontrado
        </p>
      </div>
    );
  }

  return (
    <section className="py-12 md:py-16" data-testid="section-product-grid">
      <div className="mx-auto max-w-7xl px-4">
        {(title || subtitle) && (
          <div className="mb-10 text-center">
            {title && (
              <h2 className="font-serif text-3xl font-semibold md:text-4xl" data-testid="text-grid-title">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
