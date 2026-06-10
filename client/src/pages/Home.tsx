import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { FeaturedCollections } from "@/components/FeaturedCollections";
import { ProductGrid } from "@/components/ProductGrid";
import { PromoSection } from "@/components/PromoSection";
import { LifestyleGallery } from "@/components/LifestyleGallery";
import { Newsletter } from "@/components/Newsletter";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";

function ProductGridSkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <Skeleton className="mx-auto h-10 w-48" />
          <Skeleton className="mx-auto mt-3 h-5 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/5] w-full rounded-md" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const newArrivals = products?.filter((p) => p.isNew) || [];
  const promoProducts = products?.filter((p) => p.isSale) || [];

  return (
    <main>
      <Hero />
      <FeaturedCollections />
      {isLoading ? (
        <ProductGridSkeleton />
      ) : (
        <>
          <PromoSection products={promoProducts} />
          <ProductGrid
            products={newArrivals}
            title="Novidades do Cardápio"
            subtitle="Novas delícias preparadas com muito carinho para você"
          />
        </>
      )}
      <LifestyleGallery />
      <Newsletter />
    </main>
  );
}
