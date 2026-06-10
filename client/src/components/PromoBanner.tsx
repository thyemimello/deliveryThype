import { Percent, Coffee } from "lucide-react";
import { Link } from "wouter";

export function PromoBanner() {
  return (
    <div
      className="w-full bg-[hsl(25,65%,25%)] dark:bg-[hsl(25,60%,30%)] text-white"
      data-testid="section-promo-banner"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-center gap-3 py-2 text-center text-sm">
          <Percent className="h-4 w-4 shrink-0" />
          <Link href="/produtos?promocoes=true">
            <span className="font-medium tracking-wide cursor-pointer hover:underline" data-testid="link-promo-banner">
              OFERTA DO DIA
            </span>
          </Link>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline text-white/90">
            Combo café + doce com desconto especial hoje!
          </span>
          <Coffee className="h-4 w-4 shrink-0 hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
