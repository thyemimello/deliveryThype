import { Link } from "wouter";

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80",
    alt: "Barista preparando café",
    span: "col-span-1 row-span-1",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
    alt: "Interior aconchegante da cafeteria",
    span: "col-span-1 row-span-2",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80",
    alt: "Doces artesanais",
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80",
    alt: "Café latte art",
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
    alt: "Pães frescos",
    span: "col-span-1 row-span-1",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80",
    alt: "Mesa de café da manhã",
    span: "col-span-1 row-span-1",
  },
];

export function LifestyleGallery() {
  return (
    <section className="py-16 md:py-24" data-testid="section-lifestyle-gallery">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            Nosso Ambiente
          </h2>
          <p className="mt-3 text-muted-foreground">
            Um cantinho especial para momentos únicos
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {galleryImages.map((image) => (
            <Link key={image.id} href="/produtos">
              <div
                className={`group relative overflow-hidden rounded-md cursor-pointer ${image.span}`}
                data-testid={`gallery-image-${image.id}`}
              >
                <div className="aspect-[3/4] h-full w-full">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
