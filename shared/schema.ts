import { pgTable, text, varchar, real, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  volume: text("volume"),
  region: text("region"),
  grape: text("grape"),
  country: text("country"),
  images: text("images").array().notNull(),
  inStock: boolean("in_stock").default(true),
  isNew: boolean("is_new").default(false),
  isSale: boolean("is_sale").default(false),
  featured: boolean("featured").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const categories = pgTable("categories", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  image: text("image"),
  description: text("description"),
});

export type Category = typeof categories.$inferSelect;

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Setting = typeof settings.$inferSelect;

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export interface WishlistState {
  productIds: string[];
}

export const users = pgTable("users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const whatsappContacts = pgTable("whatsapp_contacts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  phone: text("phone").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWhatsappContactSchema = createInsertSchema(whatsappContacts).omit({ id: true, createdAt: true });
export type InsertWhatsappContact = z.infer<typeof insertWhatsappContactSchema>;
export type WhatsappContact = typeof whatsappContacts.$inferSelect;

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export const tables = pgTable("tables", {
  id: varchar("id", { length: 50 }).primaryKey(),
  number: text("number").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTableSchema = createInsertSchema(tables).omit({ id: true, createdAt: true });
export type InsertTable = z.infer<typeof insertTableSchema>;
export type Table = typeof tables.$inferSelect;

export const orders = pgTable("orders", {
  id: varchar("id", { length: 50 }).primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address"),
  tableNumber: text("table_number"),
  orderType: text("order_type").notNull().default("delivery"),
  paymentMethod: text("payment_method"),
  items: jsonb("items").notNull(),
  total: real("total").notNull(),
  status: text("status").notNull().default("recebido"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
