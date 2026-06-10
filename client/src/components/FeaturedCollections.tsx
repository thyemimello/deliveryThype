import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    id: "cafes",
    name: "Cafés Especiais",
    description: "Grãos selecionados, preparo artesanal e muito sabor em cada xícara",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
    href: "/produtos?categoria=cafes",
  },
  {
    id: "doces",
    name: "Doces & Sobremesas",
    description: "Tortas, bolos e delícias artesanais feitas com amor todo dia",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
    href: "/produtos?categoria=doces",
  },
  {
    id: "salgados",
    name: "Salgados & Lanches",
    description: "Pães frescos, quiches e lanches para qualquer hora do dia",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
    href: "/produtos?categoria=salgados",
  },
];

export function FeaturedCollections() {
  return (
    <section className="py-16 md:py-24" data-testid="section-featured-collections">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl md:text-4xl" data-testid="text-collections-title">
            Explore Nosso Cardápio
          </h2>
          <p className="mt-3 text-muted-foreground">
            Feito com carinho para tornar o seu dia mais especial
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.id} href={collection.href}>
              <div
                className="group relative h-[400px] overflow-hidden rounded-md cursor-pointer"
                data-testid={`card-collection-${collection.id}`}
              >
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-serif text-2xl font-semibold">{collection.name}</h3>
                  <p className="mt-1 text-white/80">{collection.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100">
                    Ver mais <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
