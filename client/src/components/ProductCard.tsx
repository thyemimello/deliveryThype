import { Link } from "wouter";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <Link href={`/produto/${product.id}`}>
      <div
        className="group relative cursor-pointer"
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted sm:aspect-[4/5]">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            data-testid={`img-product-${product.id}`}
          />

          {product.isSale && (
            <div
              className="absolute -right-[35px] top-[20px] z-10 rotate-45 bg-[hsl(345,70%,28%)] px-10 py-1 shadow-md"
              data-testid={`ribbon-promo-${product.id}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                Promocao
              </span>
            </div>
          )}

          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 sm:left-3 sm:top-3">
            {product.isNew && (
              <Badge className="bg-primary text-primary-foreground" data-testid={`badge-new-${product.id}`}>
                Novo
              </Badge>
            )}
            {product.isSale && product.originalPrice && (
              <Badge variant="destructive" data-testid={`badge-sale-${product.id}`}>
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-1.5 bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 active:scale-[0.98] [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100"
            data-testid={`button-quick-add-${product.id}`}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Adicionar
          </button>
        </div>

        <div className="mt-2.5 space-y-1 sm:mt-3">
          <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2 sm:text-base sm:line-clamp-1" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-semibold text-foreground" data-testid={`text-product-price-${product.id}`}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through sm:text-sm" data-testid={`text-product-original-price-${product.id}`}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {product.volume && (
            <p className="text-xs text-muted-foreground">{product.volume}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
