import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Minus, Plus, Truck, Wine, Shield, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

function ProductDetailSkeleton() {
  return (
    <main className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4">
        <Skeleton className="mb-6 h-10 w-24" />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-[4/5] w-full rounded-md" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/produto/:id");
  const productId = params?.id || "";

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { toast } = useToast();

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Produto nao encontrado</h1>
          <Link href="/produtos">
            <Button variant="ghost" className="mt-4" data-testid="link-back-to-products">
              Voltar ao cardápio
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="min-h-screen py-8 pb-28 lg:pb-8" data-testid="page-product-detail">
      <div className="mx-auto max-w-7xl px-4">
        <Link href="/produtos">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
                data-testid="img-product-main"
              />
              {product.isSale && (
                <div className="absolute -right-[40px] top-[30px] z-10 rotate-45 bg-[hsl(345,70%,28%)] px-12 py-1.5 shadow-md">
                  <span className="text-xs font-bold uppercase tracking-widest text-white">
                    Promocao
                  </span>
                </div>
              )}
              {product.isNew && (
                <Badge className="absolute left-4 top-4 bg-primary text-primary-foreground">
                  Novo
                </Badge>
              )}
              {product.isSale && product.originalPrice && (
                <Badge variant="destructive" className="absolute left-4 top-12">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </Badge>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <div key={index} className="h-20 w-16 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`block h-full w-full overflow-hidden rounded-md transition-opacity ${
                        selectedImage === index
                          ? "ring-2 ring-primary ring-offset-2"
                          : "opacity-70 hover:opacity-100 focus:opacity-100"
                      }`}
                      data-testid={`button-thumbnail-${index}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - Imagem ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-semibold sm:text-3xl md:text-4xl" data-testid="text-product-name">
                {product.name}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-2xl font-bold" data-testid="text-product-price">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through" data-testid="text-product-original-price">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              {product.grape && (
                <div className="flex items-center gap-2 text-sm">
                  <Wine className="h-4 w-4 text-primary" />
                  <span className="font-medium">Uva:</span>
                  <span className="text-muted-foreground">{product.grape}</span>
                </div>
              )}
              {product.region && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Regiao:</span>
                  <span className="text-muted-foreground">{product.region}</span>
                </div>
              )}
              {product.country && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Pais:</span>
                  <span className="text-muted-foreground">{product.country}</span>
                </div>
              )}
              {product.volume && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Volume:</span>
                  <span className="text-muted-foreground">{product.volume}</span>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 font-medium">Quantidade</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-quantity-decrease"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium" data-testid="text-quantity">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-quantity-increase"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="hidden gap-3 lg:flex">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                data-testid="button-add-to-cart"
              >
                Adicionar ao Carrinho
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span>Entrega rapida para sua regiao</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>Compra 100% segura</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 font-medium">Descricao</h3>
              <p className="text-muted-foreground" data-testid="text-product-description">{product.description}</p>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-8 font-serif text-2xl font-semibold">Voce Tambem Pode Gostar</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold" data-testid="text-sticky-price">
              {formatPrice(product.price * quantity)}
            </span>
            <span className="text-xs text-muted-foreground">
              {quantity} {quantity > 1 ? "itens" : "item"}
            </span>
          </div>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            data-testid="button-add-to-cart-mobile"
          >
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </main>
  );
}
