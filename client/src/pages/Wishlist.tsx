import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@shared/schema";

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full rounded-md" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}

export default function Wishlist() {
  const { items } = useWishlist();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const wishlistProducts = products.filter((p) => items.includes(p.id));

  return (
    <main className="min-h-screen py-8" data-testid="page-wishlist">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl md:text-4xl" data-testid="text-wishlist-title">
            Meus Favoritos
          </h1>
          <p className="mt-2 text-muted-foreground" data-testid="text-wishlist-count">
            {wishlistProducts.length} item{wishlistProducts.length !== 1 ? "s" : ""} salvo{wishlistProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-6">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-semibold" data-testid="text-empty-wishlist">Sua lista está vazia</h2>
            <p className="mt-2 text-muted-foreground">
              Adicione produtos aos favoritos clicando no coração
            </p>
            <Button asChild className="mt-6">
              <Link href="/produtos" data-testid="link-explore-products">
                Explorar Produtos
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
