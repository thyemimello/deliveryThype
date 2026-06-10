import type { Product, Category } from "@shared/schema";

export const categories: Category[] = [
  {
    id: "vestidos",
    name: "Vestidos",
    slug: "vestidos",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    description: "Vestidos elegantes para todas as ocasiões",
  },
  {
    id: "blusas",
    name: "Blusas & Tops",
    slug: "blusas",
    image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80",
    description: "Blusas e tops para o dia a dia",
  },
  {
    id: "calcas",
    name: "Calças",
    slug: "calcas",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
    description: "Calças confortáveis e estilosas",
  },
  {
    id: "saias",
    name: "Saias",
    slug: "saias",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0uj06?w=600&q=80",
    description: "Saias para todos os estilos",
  },
  {
    id: "acessorios",
    name: "Acessórios",
    slug: "acessorios",
    image: "https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=600&q=80",
    description: "Acessórios que complementam seu look",
  },
  {
    id: "promocoes",
    name: "Promoções",
    slug: "promocoes",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    description: "Ofertas imperdíveis",
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Vestido Midi Floral",
    description: "Vestido midi com estampa floral delicada, perfeito para ocasiões especiais. Tecido leve e fluido que valoriza a silhueta feminina.",
    price: 289.90,
    originalPrice: 359.90,
    category: "vestidos",
    subcategory: "midi",
    sizes: ["PP", "P", "M", "G", "GG"],
    colors: ["Rosa", "Azul", "Bege"],
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
    ],
    inStock: true,
    isNew: true,
    isSale: true,
  },
  {
    id: "2",
    name: "Blusa Cropped Elegante",
    description: "Blusa cropped com acabamento premium. Ideal para compor looks sofisticados e modernos.",
    price: 149.90,
    category: "blusas",
    subcategory: "cropped",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Branco", "Preto", "Rosa"],
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
    ],
    inStock: true,
    isNew: true,
    isSale: false,
  },
  {
    id: "3",
    name: "Calça Wide Leg Premium",
    description: "Calça pantalona de cintura alta com caimento impecável. Conforto e elegância em uma peça.",
    price: 219.90,
    category: "calcas",
    subcategory: "pantalona",
    sizes: ["36", "38", "40", "42", "44"],
    colors: ["Preto", "Bege", "Marinho"],
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    ],
    inStock: true,
    isNew: false,
    isSale: false,
  },
  {
    id: "4",
    name: "Vestido Longo Cetim",
    description: "Vestido longo em cetim com decote elegante. Perfeito para festas e eventos especiais.",
    price: 459.90,
    originalPrice: 599.90,
    category: "vestidos",
    subcategory: "longo",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Champagne", "Vinho", "Preto"],
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    ],
    inStock: true,
    isNew: false,
    isSale: true,
  },
  {
    id: "5",
    name: "Saia Midi Plissada",
    description: "Saia midi plissada com cintura marcada. Versátil para looks casuais e formais.",
    price: 179.90,
    category: "saias",
    subcategory: "midi",
    sizes: ["PP", "P", "M", "G", "GG"],
    colors: ["Rosa Blush", "Verde Menta", "Caramelo"],
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaed?w=600&q=80",
      "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=600&q=80",
    ],
    inStock: true,
    isNew: true,
    isSale: false,
  },
  {
    id: "6",
    name: "Blazer Alfaiataria",
    description: "Blazer estruturado com corte alfaiataria. Peça-chave para um guarda-roupa versátil.",
    price: 349.90,
    category: "blusas",
    subcategory: "blazer",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Preto", "Branco", "Caramelo"],
    images: [
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&q=80",
      "https://images.unsplash.com/photo-1548624149-f9b9a7e1c3c3?w=600&q=80",
    ],
    inStock: true,
    isNew: false,
    isSale: false,
  },
  {
    id: "7",
    name: "Bolsa Estruturada",
    description: "Bolsa de couro sintético premium com alça removível. Design atemporal e funcional.",
    price: 259.90,
    originalPrice: 319.90,
    category: "acessorios",
    subcategory: "bolsas",
    sizes: ["Único"],
    colors: ["Preto", "Nude", "Caramelo"],
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    ],
    inStock: true,
    isNew: true,
    isSale: true,
  },
  {
    id: "8",
    name: "Vestido Tricot",
    description: "Vestido em tricot macio e confortável. Ideal para dias mais frescos com muito estilo.",
    price: 199.90,
    category: "vestidos",
    subcategory: "casual",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Off White", "Rosa", "Cinza"],
    images: [
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
    ],
    inStock: true,
    isNew: false,
    isSale: false,
  },
  {
    id: "9",
    name: "Conjunto Alfaiataria",
    description: "Conjunto de blazer e calça em alfaiataria. Look completo e sofisticado.",
    price: 489.90,
    originalPrice: 649.90,
    category: "calcas",
    subcategory: "conjunto",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Preto", "Bege", "Marsala"],
    images: [
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    ],
    inStock: true,
    isNew: false,
    isSale: true,
  },
  {
    id: "10",
    name: "Brincos Dourados",
    description: "Brincos de argola dourados com acabamento premium. Elegância para qualquer ocasião.",
    price: 89.90,
    category: "acessorios",
    subcategory: "bijuterias",
    sizes: ["Único"],
    colors: ["Dourado", "Prata"],
    images: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80",
    ],
    inStock: true,
    isNew: true,
    isSale: false,
  },
  {
    id: "11",
    name: "Top Cropped Renda",
    description: "Top cropped em renda delicada com forro. Sensualidade e sofisticação.",
    price: 129.90,
    category: "blusas",
    subcategory: "cropped",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Preto", "Branco", "Nude"],
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80",
    ],
    inStock: true,
    isNew: false,
    isSale: false,
  },
  {
    id: "12",
    name: "Vestido Slip Dress",
    description: "Vestido slip dress em cetim com alças finas. Elegância minimalista.",
    price: 229.90,
    category: "vestidos",
    subcategory: "curto",
    sizes: ["PP", "P", "M", "G"],
    colors: ["Champagne", "Preto", "Verde Oliva"],
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
    ],
    inStock: true,
    isNew: true,
    isSale: false,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === "promocoes") {
    return products.filter((p) => p.isSale);
  }
  return products.filter((p) => p.category === category);
};

export const getNewArrivals = (): Product[] => {
  return products.filter((p) => p.isNew);
};

export const getSaleProducts = (): Product[] => {
  return products.filter((p) => p.isSale);
};
