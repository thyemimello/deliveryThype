import { Link } from "wouter";
import { ArrowRight, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden" data-testid="section-hero">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80"
          alt="Cafeteria charmosa"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
        <div className="max-w-xl space-y-4 text-white sm:space-y-6">
          <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-white/80">
            <Coffee className="h-4 w-4" />
            Café & Sabores
          </span>
          <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-5xl md:text-6xl lg:text-7xl" data-testid="text-hero-title">
            O Melhor Café da Cidade
          </h1>
          <p className="text-base text-white/90 sm:text-lg md:text-xl">
            Descubra sabores únicos em cada xícara. Cafés especiais, doces artesanais e salgados deliciosos para o seu dia.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              size="lg"
              className="gap-2 bg-white text-black"
              asChild
            >
              <Link href="/produtos" data-testid="link-shop-now">
                Ver Cardápio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 bg-white/10 text-white backdrop-blur-sm"
              asChild
            >
              <Link href="/produtos?categoria=doces" data-testid="link-view-collection">
                Doces & Sobremesas
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
