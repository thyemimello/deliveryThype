import { type User, type InsertUser, type Product, type InsertProduct, type Category, type WhatsappContact, type InsertWhatsappContact, type Order, type InsertOrder, type Table, type InsertTable, products, categories, users, whatsappContacts, orders, tables } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Reliable image URLs verified to exist and show correct content
const IMG = {
  // ── CAFÉS ──────────────────────────────────────────────────────────────────
  espresso:     "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&q=80",
  cappuccino:   "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&q=80",
  latte:        "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&q=80",
  mocha:        "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80",
  coldbrew:     "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
  cafeLeite:    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
  affogato:     "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600&q=80",
  flatWhite:    "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80",
  filtrado:     "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  cortado:      "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=600&q=80",
  // ── DOCES ──────────────────────────────────────────────────────────────────
  croissant:    "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=600&q=80",
  tortaLimao:   "https://media.istockphoto.com/id/1397852188/photo/lemon-tart-topped-with-citrus-slices-and-zest-on-white-table-background-top-view.jpg?s=612x612&w=0&k=20&c=Qjj5klmDD9-Hb9WKlO98XvKO9cMRueDAYhDnVciq_pY=",
  boloCenoura:  "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80",
  cheesecake:   "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80",
  brownie:      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80",
  cinnamonRoll: "https://images.unsplash.com/photo-1583338917451-face2751d8d5?w=600&q=80",
  tortaMaca:    "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=600&q=80",
  cookie:       "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
  // ── SALGADOS ───────────────────────────────────────────────────────────────
  paoQueijo:    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80",
  quiche:       "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",
  croissantHQ:  "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
  sanduiche:    "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80",
  wrap:         "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80",
  empada:       "https://www.savorysimple.net/wp-content/uploads/2014/04/web-Meat-and-Mushroom-Hand-Pies-008.jpg",
  tabua:        "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=600&q=80",
  // ── BEBIDAS ────────────────────────────────────────────────────────────────
  sucoLaranja:  "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80",
  limonada:     "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80",
  smoothie:     "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&q=80",
  chaGelado:    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
  vitamina:     "https://media.istockphoto.com/id/453010753/photo/three-fruit-juice-glasses-surrounded-by-colorful-fruits.jpg?s=612x612&w=0&k=20&c=Uv8afaSP3GFNB5qG3ZXgzZXBhLlGFFdR27hMOGHO_2k=",
  aguaCoco:     "https://mauritianfoodsonline.com/wp-content/uploads/2024/08/hty.jpg",
};

const cafeProducts: (InsertProduct & { id: string })[] = [
  // ─────────────────── CAFÉS ESPECIAIS ───────────────────────────────────────
  { id:"c01", name:"Espresso Tradicional",
    description:"Café espresso clássico, encorpado e aromático. Grãos selecionados, extração perfeita, crema dourada. O começo ideal para qualquer dia.",
    price:8, originalPrice:null, category:"cafes", subcategory:"espresso", volume:"50ml", region:null, grape:null, country:null,
    images:[IMG.espresso], inStock:true, isNew:false, isSale:false },
  { id:"c02", name:"Cappuccino Cremoso",
    description:"Espresso encorpado com leite vaporizado e espuma fina e aveludada. Equilíbrio perfeito entre café e cremosidade. Servido quentinho.",
    price:14, originalPrice:null, category:"cafes", subcategory:"cappuccino", volume:"180ml", region:null, grape:null, country:null,
    images:[IMG.cappuccino], inStock:true, isNew:false, isSale:false, featured:true },
  { id:"c03", name:"Latte Macchiato",
    description:"Leite vaporizado com espuma suave e espresso. Sabor delicado, textura cremosa. Perfeito para a tarde.",
    price:16, originalPrice:null, category:"cafes", subcategory:"latte", volume:"300ml", region:null, grape:null, country:null,
    images:[IMG.latte], inStock:true, isNew:false, isSale:false },
  { id:"c04", name:"Mocha Especial",
    description:"Espresso com chocolate belga, leite vaporizado e chantilly artesanal. Uma experiência indulgente de café e chocolate em cada gole.",
    price:18, originalPrice:22, category:"cafes", subcategory:"mocha", volume:"300ml", region:null, grape:null, country:null,
    images:[IMG.mocha], inStock:true, isNew:false, isSale:true, featured:true },
  { id:"c05", name:"Cold Brew",
    description:"Café extraído a frio por 12 horas. Sabor suave, levemente adocicado e com baixa acidez. Servido com gelo.",
    price:16, originalPrice:null, category:"cafes", subcategory:"cold-brew", volume:"300ml", region:null, grape:null, country:null,
    images:[IMG.coldbrew], inStock:true, isNew:true, isSale:false },
  { id:"c06", name:"Café com Leite",
    description:"O clássico brasileiro. Café coado fresquinho com leite integral quentinho. Simples, gostoso e reconfortante.",
    price:10, originalPrice:null, category:"cafes", subcategory:"cafe-leite", volume:"250ml", region:null, grape:null, country:null,
    images:[IMG.cafeLeite], inStock:true, isNew:false, isSale:false },
  { id:"c07", name:"Affogato",
    description:"Uma bola de sorvete de creme artesanal com um shot de espresso quente. Quente e frio em perfeita harmonia.",
    price:22, originalPrice:null, category:"cafes", subcategory:"affogato", volume:"200ml", region:null, grape:null, country:null,
    images:[IMG.affogato], inStock:true, isNew:true, isSale:false },
  { id:"c08", name:"Flat White",
    description:"Espresso duplo com leite vaporizado texturizado. Sabor intenso de café com cremosidade. Favorito dos apreciadores.",
    price:15, originalPrice:null, category:"cafes", subcategory:"flat-white", volume:"200ml", region:null, grape:null, country:null,
    images:[IMG.flatWhite], inStock:true, isNew:false, isSale:false },
  { id:"c09", name:"Café Filtrado",
    description:"Café especial no método pour over, realçando notas frutadas e florais. Limpo, delicado e aromático.",
    price:9, originalPrice:null, category:"cafes", subcategory:"filtrado", volume:"200ml", region:null, grape:null, country:null,
    images:[IMG.filtrado], inStock:true, isNew:false, isSale:false },
  { id:"c10", name:"Cortado",
    description:"Espresso duplo com uma pequena quantidade de leite vaporizado para suavizar a acidez. Equilibrado e saboroso.",
    price:12, originalPrice:null, category:"cafes", subcategory:"cortado", volume:"120ml", region:null, grape:null, country:null,
    images:[IMG.cortado], inStock:true, isNew:false, isSale:false },

  // ─────────────────── DOCES & SOBREMESAS ────────────────────────────────────
  { id:"d01", name:"Croissant de Manteiga",
    description:"Croissant folhado artesanal com manteiga francesa. Crocante por fora, macio por dentro. Assado diariamente.",
    price:12, originalPrice:null, category:"doces", subcategory:"croissant", volume:"100g", region:null, grape:null, country:null,
    images:[IMG.croissant], inStock:true, isNew:false, isSale:false },
  { id:"d02", name:"Torta de Limão",
    description:"Massa amanteigada crocante com creme de limão siciliano e merengue tostado na hora. Irresistível.",
    price:18, originalPrice:22, category:"doces", subcategory:"torta", volume:"150g", region:null, grape:null, country:null,
    images:[IMG.tortaLimao], inStock:true, isNew:false, isSale:true, featured:true },
  { id:"d03", name:"Bolo de Cenoura",
    description:"Clássico bolo de cenoura fofo com cobertura de chocolate brigadeiro. Feito com cenouras frescas todo dia.",
    price:14, originalPrice:null, category:"doces", subcategory:"bolo", volume:"120g", region:null, grape:null, country:null,
    images:[IMG.boloCenoura], inStock:true, isNew:false, isSale:false },
  { id:"d04", name:"Cheesecake de Morango",
    description:"Base de biscoito amanteigado, recheio cremoso de cream cheese e calda fresca de morango. Sofisticado.",
    price:22, originalPrice:null, category:"doces", subcategory:"cheesecake", volume:"160g", region:null, grape:null, country:null,
    images:[IMG.cheesecake], inStock:true, isNew:true, isSale:false, featured:true },
  { id:"d05", name:"Brownie de Chocolate",
    description:"Brownie intenso de chocolate belga com nozes tostadas. Denso, úmido e fudgy. Servido morno.",
    price:14, originalPrice:null, category:"doces", subcategory:"brownie", volume:"100g", region:null, grape:null, country:null,
    images:[IMG.brownie], inStock:true, isNew:false, isSale:false },
  { id:"d06", name:"Cinnamon Roll",
    description:"Pão doce artesanal enrolado com canela e açúcar mascavo, coberto com glacê de baunilha. Perfumado e viciante.",
    price:16, originalPrice:20, category:"doces", subcategory:"roll", volume:"150g", region:null, grape:null, country:null,
    images:[IMG.cinnamonRoll], inStock:true, isNew:true, isSale:true },
  { id:"d07", name:"Torta de Maçã",
    description:"Torta americana com maçãs caramelizadas, canela e massa folhada crocante. Servida quentinha.",
    price:18, originalPrice:null, category:"doces", subcategory:"torta", volume:"150g", region:null, grape:null, country:null,
    images:[IMG.tortaMaca], inStock:true, isNew:false, isSale:false },
  { id:"d08", name:"Cookie de Chocolate",
    description:"Cookie americano crocante por fora e macio por dentro com gotas de chocolate meio amargo. Assado na hora.",
    price:8, originalPrice:null, category:"doces", subcategory:"cookie", volume:"80g", region:null, grape:null, country:null,
    images:[IMG.cookie], inStock:true, isNew:false, isSale:false },

  // ─────────────────── SALGADOS & LANCHES ────────────────────────────────────
  { id:"s01", name:"Pão de Queijo",
    description:"Pão de queijo mineiro tradicional com polvilho azedo e queijo meia-cura. Crocante por fora e puxento por dentro.",
    price:8, originalPrice:null, category:"salgados", subcategory:"pao-queijo", volume:"80g", region:null, grape:null, country:null,
    images:[IMG.paoQueijo], inStock:true, isNew:false, isSale:false, featured:true },
  { id:"s02", name:"Quiche de Alho-Poró",
    description:"Quiche francesa com massa amanteigada, recheio de alho-poró e queijo gruyère. Elegante e sofisticada.",
    price:18, originalPrice:null, category:"salgados", subcategory:"quiche", volume:"200g", region:null, grape:null, country:null,
    images:[IMG.quiche], inStock:true, isNew:false, isSale:false },
  { id:"s03", name:"Croissant de Presunto e Queijo",
    description:"Croissant folhado recheado com presunto cozido e queijo prato derretido. Gratinado na hora.",
    price:18, originalPrice:22, category:"salgados", subcategory:"croissant", volume:"150g", region:null, grape:null, country:null,
    images:[IMG.croissantHQ], inStock:true, isNew:false, isSale:true },
  { id:"s04", name:"Sanduíche Natural de Frango",
    description:"Pão integral com frango desfiado temperado, cream cheese, tomate e alface frescos. Leve e saboroso.",
    price:22, originalPrice:null, category:"salgados", subcategory:"sanduiche", volume:"250g", region:null, grape:null, country:null,
    images:[IMG.sanduiche], inStock:true, isNew:false, isSale:false },
  { id:"s05", name:"Wrap de Frango Grelhado",
    description:"Tortilla integral com frango grelhado, mix de folhas, tomate cereja, cream cheese de ervas e molho especial.",
    price:24, originalPrice:null, category:"salgados", subcategory:"wrap", volume:"280g", region:null, grape:null, country:null,
    images:[IMG.wrap], inStock:true, isNew:true, isSale:false },
  { id:"s06", name:"Empada de Frango",
    description:"Empada artesanal com massa crocante e recheio de frango com catupiry e azeitonas. Assada fresquinha.",
    price:12, originalPrice:null, category:"salgados", subcategory:"empada", volume:"120g", region:null, grape:null, country:null,
    images:[IMG.empada], inStock:true, isNew:false, isSale:false, featured:true },
  { id:"s07", name:"Tábua de Frios",
    description:"Queijos artesanais, frios especiais, frutas frescas, geleias e torradinhas. Perfeita para compartilhar.",
    price:48, originalPrice:null, category:"salgados", subcategory:"tabua", volume:"400g", region:null, grape:null, country:null,
    images:[IMG.tabua], inStock:true, isNew:true, isSale:false },

  // ─────────────────── BEBIDAS FRIAS ─────────────────────────────────────────
  { id:"b01", name:"Suco de Laranja Natural",
    description:"Suco feito na hora com laranjas frescas. Puro, vitamínico e refrescante. Sem açúcar ou conservantes.",
    price:12, originalPrice:null, category:"bebidas", subcategory:"suco", volume:"350ml", region:null, grape:null, country:null,
    images:[IMG.sucoLaranja], inStock:true, isNew:false, isSale:false },
  { id:"b02", name:"Limonada Suíça",
    description:"Limão siciliano batido com leite condensado e gelo. Cremosa, cítrica e refrescante. Clássico que nunca decepciona.",
    price:14, originalPrice:null, category:"bebidas", subcategory:"limonada", volume:"400ml", region:null, grape:null, country:null,
    images:[IMG.limonada], inStock:true, isNew:false, isSale:false, featured:true },
  { id:"b03", name:"Smoothie de Morango",
    description:"Morango, iogurte grego e mel. Batido cremoso, nutritivo e delicioso. Perfeito para um café da manhã completo.",
    price:18, originalPrice:22, category:"bebidas", subcategory:"smoothie", volume:"400ml", region:null, grape:null, country:null,
    images:[IMG.smoothie], inStock:true, isNew:false, isSale:true, featured:true },
  { id:"b04", name:"Chá Gelado de Pêssego",
    description:"Chá preto com pêssego fresco, servido gelado com hortelã. Refrescante e levemente adocicado.",
    price:12, originalPrice:null, category:"bebidas", subcategory:"cha", volume:"400ml", region:null, grape:null, country:null,
    images:[IMG.chaGelado], inStock:true, isNew:true, isSale:false },
  { id:"b05", name:"Vitamina de Frutas",
    description:"Banana, morango, manga e leite batidos fresquinhos. Cremosa, nutritiva e cheia de vitaminas.",
    price:16, originalPrice:null, category:"bebidas", subcategory:"vitamina", volume:"400ml", region:null, grape:null, country:null,
    images:[IMG.vitamina], inStock:true, isNew:false, isSale:false },
  { id:"b06", name:"Água de Coco",
    description:"Água de coco natural geladinha. Hidratante, leve e refrescante. Direto do coco verde para você.",
    price:10, originalPrice:null, category:"bebidas", subcategory:"agua-coco", volume:"300ml", region:null, grape:null, country:null,
    images:[IMG.aguaCoco], inStock:true, isNew:false, isSale:false },
];

const cafeCategories = [
  { id:"cafes",    name:"Cafés Especiais",     slug:"cafes",    image:IMG.cappuccino,   description:"Grãos selecionados, preparo artesanal e muito sabor em cada xícara" },
  { id:"doces",    name:"Doces & Sobremesas",  slug:"doces",    image:IMG.cinnamonRoll, description:"Tortas, bolos e delícias artesanais feitas com amor todo dia" },
  { id:"salgados", name:"Salgados & Lanches",  slug:"salgados", image:IMG.croissantHQ,  description:"Pães frescos, quiches e lanches para qualquer hora do dia" },
  { id:"bebidas",  name:"Bebidas Frias",        slug:"bebidas",  image:IMG.limonada,     description:"Sucos, smoothies e bebidas geladas para se refrescar" },
];

export interface IStorage {
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
  createProduct(product: InsertProduct & { id?: string }): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  createWhatsappContact(contact: InsertWhatsappContact): Promise<WhatsappContact>;
  getWhatsappContacts(): Promise<WhatsappContact[]>;
  deleteWhatsappContact(id: number): Promise<boolean>;
  upsertWhatsappContactByPhone(phone: string, name: string | null): Promise<void>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: string): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  getLatestOrderByPhone(phone: string): Promise<Order | undefined>;
  getProductOrderCounts(): Promise<Record<string, number>>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  getTables(): Promise<Table[]>;
  getTableByNumber(number: string): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  deleteTable(id: string): Promise<boolean>;
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<void>;
}

async function initializeData() {
  try {
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`);
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_contacts_phone_digits_uidx ON whatsapp_contacts ((regexp_replace(phone, '\\D', '', 'g')))`);
    await pool.query(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
    await pool.query(`INSERT INTO settings (key, value) VALUES ('popular_mode', 'manual') ON CONFLICT (key) DO NOTHING`);

    await db.delete(categories);
    await db.insert(categories).values(cafeCategories);

    await db.delete(products);
    for (const product of cafeProducts) {
      await db.insert(products).values(product);
    }
    console.log(`✓ ${cafeProducts.length} café products loaded`);

    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      const hashedPassword = await bcrypt.hash("Senha123@Xavier", 10);
      await db.insert(users).values({ id: randomUUID(), username: "admin", password: hashedPassword, isAdmin: true });
      console.log("✓ Admin user created");
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT,
        table_number TEXT,
        order_type TEXT NOT NULL DEFAULT 'delivery',
        payment_method TEXT,
        items JSONB NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'recebido',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id VARCHAR(50) PRIMARY KEY,
        number TEXT NOT NULL UNIQUE,
        name TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } catch (error) {
    console.error("Error initializing data:", error);
  }
}

initializeData();

class DatabaseStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({ ...insertUser, password: hashedPassword, id }).returning();
    return result[0];
  }
  async getProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.updatedAt));
  }
  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }
  async getProductsByCategory(category: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.category, category)).orderBy(desc(products.updatedAt));
  }
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  async createProduct(product: InsertProduct & { id?: string }): Promise<Product> {
    const id = product.id || randomUUID();
    const result = await db.insert(products).values({ ...product, id }).returning();
    return result[0];
  }
  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set({ ...updates, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return result[0];
  }
  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }
  async createWhatsappContact(contact: InsertWhatsappContact): Promise<WhatsappContact> {
    const result = await db.insert(whatsappContacts).values(contact).returning();
    return result[0];
  }
  async getWhatsappContacts(): Promise<WhatsappContact[]> {
    return db.select().from(whatsappContacts).orderBy(desc(whatsappContacts.createdAt));
  }
  async deleteWhatsappContact(id: number): Promise<boolean> {
    const result = await db.delete(whatsappContacts).where(eq(whatsappContacts.id, id)).returning();
    return result.length > 0;
  }
  async upsertWhatsappContactByPhone(phone: string, name: string | null): Promise<void> {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return;
    const existing = await pool.query(
      `SELECT id, name FROM whatsapp_contacts WHERE regexp_replace(phone, '\\D', '', 'g') = $1 LIMIT 1`,
      [digits]
    );
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (!row.name && name) {
        await pool.query(`UPDATE whatsapp_contacts SET name = $1 WHERE id = $2`, [name, row.id]);
      }
      return;
    }
    await pool.query(
      `INSERT INTO whatsapp_contacts (phone, name) VALUES ($1, $2) ON CONFLICT ((regexp_replace(phone, '\\D', '', 'g'))) DO NOTHING`,
      [phone, name]
    );
  }
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO orders (id, customer_name, customer_phone, customer_address, table_number, order_type, payment_method, items, total, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, orderData.customerName, orderData.customerPhone,
       orderData.customerAddress || null, orderData.tableNumber || null,
       orderData.orderType || "delivery", orderData.paymentMethod || null,
       JSON.stringify(orderData.items),
       orderData.total, orderData.status || "recebido", orderData.notes || null]
    );
    return this.mapOrder(result.rows[0]);
  }
  async getOrderById(id: string): Promise<Order | undefined> {
    const result = await pool.query(`SELECT * FROM orders WHERE id = $1`, [id]);
    if (result.rows.length === 0) return undefined;
    return this.mapOrder(result.rows[0]);
  }
  async getOrders(): Promise<Order[]> {
    const result = await pool.query(`SELECT * FROM orders ORDER BY created_at DESC`);
    return result.rows.map(this.mapOrder);
  }
  async getLatestOrderByPhone(phone: string): Promise<Order | undefined> {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return undefined;
    const result = await pool.query(
      `SELECT * FROM orders WHERE regexp_replace(customer_phone, '\\D', '', 'g') = $1 ORDER BY created_at DESC LIMIT 1`,
      [digits]
    );
    if (result.rows.length === 0) return undefined;
    return this.mapOrder(result.rows[0]);
  }
  async getProductOrderCounts(): Promise<Record<string, number>> {
    const result = await pool.query(`SELECT items FROM orders`);
    const counts: Record<string, number> = {};
    for (const row of result.rows) {
      const items = typeof row.items === "string" ? JSON.parse(row.items) : row.items;
      if (Array.isArray(items)) {
        for (const it of items) {
          if (it && it.productId) {
            counts[it.productId] = (counts[it.productId] || 0) + (Number(it.quantity) || 0);
          }
        }
      }
    }
    return counts;
  }
  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await pool.query(
      `UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`, [status, id]
    );
    if (result.rows.length === 0) return undefined;
    return this.mapOrder(result.rows[0]);
  }
  async getTables(): Promise<Table[]> {
    return db.select().from(tables).orderBy(desc(tables.createdAt));
  }
  async getTableByNumber(number: string): Promise<Table | undefined> {
    const result = await db.select().from(tables).where(eq(tables.number, number));
    return result[0];
  }
  async createTable(table: InsertTable): Promise<Table> {
    const id = randomUUID();
    const result = await db.insert(tables).values({ ...table, id }).returning();
    return result[0];
  }
  async deleteTable(id: string): Promise<boolean> {
    const result = await db.delete(tables).where(eq(tables.id, id)).returning();
    return result.length > 0;
  }
  async getSetting(key: string): Promise<string | undefined> {
    const result = await pool.query(`SELECT value FROM settings WHERE key = $1`, [key]);
    return result.rows[0]?.value;
  }
  async setSetting(key: string, value: string): Promise<void> {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, value]
    );
  }
  private mapOrder(row: any): Order {
    return {
      id: row.id, customerName: row.customer_name, customerPhone: row.customer_phone,
      customerAddress: row.customer_address, tableNumber: row.table_number,
      orderType: row.order_type, paymentMethod: row.payment_method ?? null,
      items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
      total: row.total, status: row.status, notes: row.notes,
      createdAt: row.created_at, updatedAt: row.updated_at,
    };
  }
}

export const storage = new DatabaseStorage();
