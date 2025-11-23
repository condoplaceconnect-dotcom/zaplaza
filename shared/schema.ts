import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ✅ USERS TABLE
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("resident"), // resident, vendor, service_provider, admin
  condoId: varchar("condo_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ✅ CONDOMINIUMS TABLE
export const condominiums = pgTable("condominiums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  units: integer("units").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: text("email"),
  description: text("description"),
  image: text("image"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// ✅ STORES TABLE (Lojas de Vendedores)
export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  condoId: varchar("condo_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  category: varchar("category", { length: 50 }).notNull(), // Sobremesas, Lanches, etc
  phone: varchar("phone", { length: 20 }),
  email: text("email"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ PRODUCTS TABLE (Produtos das Lojas)
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  category: varchar("category", { length: 50 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  ingredients: text("ingredients"), // Pode ser JSON array
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ SERVICE PROVIDERS TABLE (Prestadores de Serviço)
export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  condoId: varchar("condo_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  serviceType: varchar("service_type", { length: 50 }).notNull(), // Beleza, Reparos, etc
  phone: varchar("phone", { length: 20 }),
  email: text("email"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ SERVICES TABLE (Serviços Oferecidos)
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration"), // em minutos
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ ZROD SCHEMAS
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  condoId: true,
});

export const insertCondoSchema = createInsertSchema(condominiums).omit({
  id: true,
  createdAt: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ✅ TYPES
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Condominium = typeof condominiums.$inferSelect;
export type InsertCondominium = z.infer<typeof insertCondoSchema>;

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
