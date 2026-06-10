import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const uploadsDir = path.resolve(process.cwd(), "uploads");

const adminSessions = new Map<string, string>();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  app.post("/api/admin/upload", requireAdmin, express.json({ limit: "12mb" }), async (req, res) => {
    try {
      const { image } = req.body as { image?: string };
      const match = typeof image === "string" ? image.match(/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/) : null;
      if (!match) {
        return res.status(400).json({ error: "Imagem inválida" });
      }
      const ext = match[1] === "jpeg" ? "jpg" : match[1];
      const buffer = Buffer.from(match[2], "base64");
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "Imagem muito grande (máx. 10MB)" });
      }
      const fileName = `${randomUUID()}.${ext}`;
      fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
      res.json({ url: `/uploads/${fileName}` });
    } catch (error) {
      res.status(500).json({ error: "Falha ao enviar imagem" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      let products;
      if (category && typeof category === "string") {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/popular", async (req, res) => {
    try {
      const counts = await storage.getProductOrderCounts();
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popularity" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const popularMode = (await storage.getSetting("popular_mode")) || "manual";
      res.json({ popularMode });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const { popularMode } = req.body;
      if (popularMode !== "manual" && popularMode !== "auto") {
        return res.status(400).json({ error: "Invalid popularMode" });
      }
      await storage.setSetting("popular_mode", popularMode);
      res.json({ popularMode });
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/whatsapp-contacts", async (req, res) => {
    try {
      const { phone, name } = req.body;
      if (!phone || typeof phone !== "string") {
        return res.status(400).json({ error: "Phone is required" });
      }
      const contact = await storage.createWhatsappContact({ phone, name: name || null });
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to save contact" });
    }
  });

  // Public order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const { customerName, customerPhone, customerAddress, tableNumber, orderType, items, total, notes, paymentMethod } = req.body;
      if (!customerName || !items || !total) {
        return res.status(400).json({ error: "Dados obrigatórios ausentes" });
      }

      const type = orderType === "mesa" ? "mesa" : "delivery";

      const allowedPayments = ["pix", "cartao", "entrega"];
      const normalizedPayment =
        type === "delivery" && allowedPayments.includes(paymentMethod) ? paymentMethod : null;

      if (type === "mesa") {
        if (!tableNumber) {
          return res.status(400).json({ error: "Número da mesa ausente" });
        }
        const table = await storage.getTableByNumber(String(tableNumber));
        if (!table) {
          return res.status(404).json({ error: "Mesa não encontrada" });
        }
      } else {
        if (!customerPhone) {
          return res.status(400).json({ error: "Telefone obrigatório para delivery" });
        }
        if (!customerAddress) {
          return res.status(400).json({ error: "Endereço obrigatório para delivery" });
        }
      }

      const order = await storage.createOrder({
        customerName,
        customerPhone: customerPhone || "Mesa",
        customerAddress: type === "delivery" ? customerAddress : null,
        tableNumber: type === "mesa" ? String(tableNumber) : null,
        orderType: type,
        paymentMethod: normalizedPayment,
        items,
        total,
        status: "recebido",
        notes: notes || null,
      });
      if (type === "delivery" && customerPhone) {
        try {
          await storage.upsertWhatsappContactByPhone(customerPhone, customerName || null);
        } catch (e) {
          console.error("Falha ao salvar contato do pedido:", e);
        }
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  const lookupHits = new Map<string, number[]>();
  const LOOKUP_LIMIT = 15;
  const LOOKUP_WINDOW_MS = 60_000;

  app.get("/api/orders/lookup", async (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      const recent = (lookupHits.get(ip) || []).filter((t) => now - t < LOOKUP_WINDOW_MS);
      if (recent.length >= LOOKUP_LIMIT) {
        return res.status(429).json({ error: "Muitas tentativas. Tente novamente em instantes." });
      }
      recent.push(now);
      lookupHits.set(ip, recent);

      const phone = String(req.query.phone || "").trim();
      if (!phone) {
        return res.json(null);
      }
      const order = await storage.getLatestOrderByPhone(phone);
      if (!order) {
        return res.json(null);
      }
      res.json({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to lookup customer" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Public table lookup (used when a QR code is scanned)
  app.get("/api/tables/:number", async (req, res) => {
    try {
      const table = await storage.getTableByNumber(req.params.number);
      if (!table) {
        return res.status(404).json({ error: "Mesa não encontrada" });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch table" });
    }
  });

  // Admin routes
  app.get("/api/admin/tables", requireAdmin, async (req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });

  app.post("/api/admin/tables", requireAdmin, async (req, res) => {
    try {
      const { number, name } = req.body;
      if (!number || typeof number !== "string" || !number.trim()) {
        return res.status(400).json({ error: "Número da mesa é obrigatório" });
      }
      const existing = await storage.getTableByNumber(number.trim());
      if (existing) {
        return res.status(409).json({ error: "Já existe uma mesa com esse número" });
      }
      const table = await storage.createTable({ number: number.trim(), name: name?.trim() || null });
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: "Failed to create table" });
    }
  });

  app.delete("/api/admin/tables/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteTable(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Table not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete table" });
    }
  });

  // Admin routes
  app.get("/api/admin/whatsapp-contacts", requireAdmin, async (req, res) => {
    try {
      const contacts = await storage.getWhatsappContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/admin/whatsapp-contacts", requireAdmin, async (req, res) => {
    try {
      const { phone, name } = req.body;
      if (!phone || typeof phone !== "string") {
        return res.status(400).json({ error: "Phone is required" });
      }
      const contact = await storage.createWhatsappContact({ phone, name: name || null });
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to save contact" });
    }
  });

  app.delete("/api/admin/whatsapp-contacts/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteWhatsappContact(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Admin order routes
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["recebido", "preparando", "a_caminho", "pronto", "entregue", "cancelado"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.isAdmin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = randomUUID();
      adminSessions.set(token, user.id);
      res.json({ token, username: user.username });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/logout", requireAdmin, (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) adminSessions.delete(token);
    res.json({ success: true });
  });

  app.get("/api/admin/verify", requireAdmin, (req, res) => {
    res.json({ valid: true });
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { name, description, price, originalPrice, category, subcategory, volume, region, grape, country, images, inStock, isNew, isSale, featured } = req.body;
      const updates: Record<string, any> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = Number(price);
      if (originalPrice !== undefined) updates.originalPrice = originalPrice === null ? null : Number(originalPrice);
      if (category !== undefined) updates.category = category;
      if (subcategory !== undefined) updates.subcategory = subcategory;
      if (volume !== undefined) updates.volume = volume;
      if (region !== undefined) updates.region = region;
      if (grape !== undefined) updates.grape = grape;
      if (country !== undefined) updates.country = country;
      if (images !== undefined) updates.images = Array.isArray(images) ? images : [images];
      if (inStock !== undefined) updates.inStock = inStock;
      if (isNew !== undefined) updates.isNew = isNew;
      if (isSale !== undefined) updates.isSale = isSale;
      if (featured !== undefined) updates.featured = featured;

      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      console.error("Failed to update product:", error);
      res.status(500).json({ error: "Failed to update product", details: error?.message });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  return httpServer;
}
