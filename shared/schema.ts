import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ✅ USERS TABLE
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("resident"), // resident, vendor, service_provider, delivery_person, admin
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
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  category: varchar("category", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: text("email"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ STORE CONDOMINIUM JUNCTION TABLE (lojas em múltiplos condomínios)
export const storeCondominiums = pgTable("store_condominiums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").notNull(),
  condoId: varchar("condo_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, active
  createdAt: timestamp("created_at").defaultNow(),
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
  ingredients: text("ingredients"),
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ SERVICE PROVIDERS TABLE (Prestadores de Serviço)
export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  serviceType: varchar("service_type", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: text("email"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ SERVICE PROVIDER CONDOMINIUM JUNCTION TABLE
export const serviceProviderCondominiums = pgTable("service_provider_condominiums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull(),
  condoId: varchar("condo_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ✅ SERVICES TABLE (Serviços Oferecidos)
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration"),
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ DELIVERY PERSONS TABLE (Entregadores)
export const deliveryPersons = pgTable("delivery_persons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  image: text("image"),
  phone: varchar("phone", { length: 20 }),
  block: varchar("block", { length: 20 }),
  unit: varchar("unit", { length: 10 }),
  status: varchar("status", { length: 20 }).notNull().default("offline"), // online, offline
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalDeliveries: integer("total_deliveries").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ DELIVERY PERSON CONDOMINIUM JUNCTION TABLE
export const deliveryPersonCondominiums = pgTable("delivery_person_condominiums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deliveryPersonId: varchar("delivery_person_id").notNull(),
  condoId: varchar("condo_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ✅ ORDERS TABLE (Pedidos)
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull(),
  storeId: varchar("store_id").notNull(),
  residentId: varchar("resident_id").notNull(),
  deliveryPersonId: varchar("delivery_person_id"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, confirmed, preparing, ready, on_way, delivered, cancelled
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(), // array of {productId, name, price, quantity}
  deliveryAddress: text("delivery_address"),
  notes: text("notes"),
  tip: decimal("tip", { precision: 10, scale: 2 }).default("0"),
  rating: integer("rating"), // 1-5
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ APPOINTMENTS TABLE (Agendamentos)
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull(),
  serviceId: varchar("service_id").notNull(),
  providerId: varchar("provider_id").notNull(),
  residentId: varchar("resident_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, confirmed, completed, cancelled
  scheduledAt: timestamp("scheduled_at").notNull(),
  notes: text("notes"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ COMMUNICATIONS TABLE (Comunicados)
export const communications = pgTable("communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  status: varchar("status", { length: 20 }).notNull().default("published"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ✅ RATINGS TABLE (Avaliações)
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull(),
  targetType: varchar("target_type", { length: 20 }).notNull(), // product, store, service, delivery_person
  targetId: varchar("target_id").notNull(),
  residentId: varchar("resident_id").notNull(),
  score: integer("score").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ✅ ZOD SCHEMAS
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

export const insertDeliveryPersonSchema = createInsertSchema(deliveryPersons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
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

export type DeliveryPerson = typeof deliveryPersons.$inferSelect;
export type InsertDeliveryPerson = z.infer<typeof insertDeliveryPersonSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
