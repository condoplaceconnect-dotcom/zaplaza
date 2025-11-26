var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index-prod.ts
import fs from "node:fs";
import path from "node:path";
import express2 from "express";

// server/app.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

// server/auth-routes.ts
import { Router } from "express";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  condominiums: () => condominiums,
  condominiumsRelations: () => condominiumsRelations,
  confirmReturnSchema: () => confirmReturnSchema,
  createLoanAgreementSchema: () => createLoanAgreementSchema,
  deliveryPersons: () => deliveryPersons,
  insertCondominiumSchema: () => insertCondominiumSchema,
  insertDeliveryPersonSchema: () => insertDeliveryPersonSchema,
  insertLoanOfferSchema: () => insertLoanOfferSchema,
  insertLoanRequestSchema: () => insertLoanRequestSchema,
  insertMarketplaceItemSchema: () => insertMarketplaceItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductSchema: () => insertProductSchema,
  insertReportSchema: () => insertReportSchema,
  insertServiceSchema: () => insertServiceSchema,
  insertStoreSchema: () => insertStoreSchema,
  insertUserSchema: () => insertUserSchema,
  loanOffers: () => loanOffers,
  loanRequests: () => loanRequests,
  loans: () => loans,
  loginUserSchema: () => loginUserSchema,
  marketplaceItems: () => marketplaceItems,
  orders: () => orders,
  products: () => products,
  reports: () => reports,
  services: () => services,
  servicesRelations: () => servicesRelations,
  stores: () => stores,
  updateMarketplaceItemSchema: () => updateMarketplaceItemSchema,
  updateReportSchema: () => updateReportSchema,
  updateUserSchema: () => updateUserSchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  birthDate: varchar("birth_date", { length: 10 }),
  // YYYY-MM-DD format
  block: varchar("block", { length: 20 }),
  unit: varchar("unit", { length: 10 }),
  accountType: varchar("account_type", { length: 20 }).notNull().default("adult"),
  parentAccountId: varchar("parent_account_id"),
  relationship: varchar("relationship", { length: 50 }),
  role: varchar("role", { length: 20 }).notNull().default("resident"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  condoId: varchar("condo_id").references(() => condominiums.id),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: varchar("verification_token", { length: 100 }),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  createdAt: timestamp("created_at").defaultNow()
});
var condominiums = pgTable("condominiums", {
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
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  inviteCode: varchar("invite_code", { length: 8 }).unique(),
  createdAt: timestamp("created_at").defaultNow()
});
var services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  condoId: varchar("condo_id").notNull().references(() => condominiums.id),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  pricingType: varchar("pricing_type", { length: 20 }).notNull(),
  // e.g., 'fixed', 'hourly'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  // active, paused, unavailable
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users, ({ one, many }) => ({
  condo: one(condominiums, { fields: [users.condoId], references: [condominiums.id] }),
  services: many(services)
  // A user can have many services
}));
var condominiumsRelations = relations(condominiums, ({ many }) => ({
  users: many(users),
  services: many(services)
  // A condo can have many services
}));
var servicesRelations = relations(services, ({ one }) => ({
  user: one(users, { fields: [services.userId], references: [users.id] }),
  condo: one(condominiums, { fields: [services.condoId], references: [condominiums.id] })
}));
var stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  category: varchar("category", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: text("email"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  condoId: varchar("condo_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var products = pgTable("products", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var deliveryPersons = pgTable("delivery_persons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  image: text("image"),
  phone: varchar("phone", { length: 20 }),
  block: varchar("block", { length: 20 }),
  unit: varchar("unit", { length: 10 }),
  status: varchar("status", { length: 20 }).notNull().default("offline"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalDeliveries: integer("total_deliveries").default(0),
  condoId: varchar("condo_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull(),
  storeId: varchar("store_id").notNull(),
  residentId: varchar("resident_id").notNull(),
  deliveryPersonId: varchar("delivery_person_id"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(),
  deliveryAddress: text("delivery_address"),
  notes: text("notes"),
  tip: decimal("tip", { precision: 10, scale: 2 }).default("0"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var marketplaceItems = pgTable("marketplace_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  images: jsonb("images").default([]),
  category: varchar("category", { length: 50 }),
  type: varchar("type", { length: 20 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  block: varchar("block", { length: 20 }),
  unit: varchar("unit", { length: 10 }),
  status: varchar("status", { length: 20 }).notNull().default("available"),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull(),
  reporterId: varchar("reporter_id").notNull(),
  targetType: varchar("target_type", { length: 30 }).notNull(),
  targetId: varchar("target_id").notNull(),
  reason: varchar("reason", { length: 50 }).notNull(),
  description: text("description").notNull(),
  evidence: jsonb("evidence").default([]),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  adminNotes: text("admin_notes"),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var loanRequests = pgTable("loan_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  condoId: varchar("condo_id").notNull().references(() => condominiums.id),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow()
});
var loanOffers = pgTable("loan_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanRequestId: varchar("loan_request_id").notNull().references(() => loanRequests.id),
  offererId: varchar("offerer_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  chatId: varchar("chat_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanRequestId: varchar("loan_request_id").notNull().references(() => loanRequests.id),
  offerId: varchar("offer_id").notNull().references(() => loanOffers.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  borrowerId: varchar("borrower_id").notNull().references(() => users.id),
  agreedReturnDate: timestamp("agreed_return_date").notNull(),
  digitalTerm: text("digital_term").notNull(),
  photos: jsonb("photos").$type(),
  status: varchar("status", { length: 30 }).notNull().default("pending_handover"),
  handoverDate: timestamp("handover_date"),
  actualReturnDate: timestamp("actual_return_date"),
  returnConditionNotes: text("return_condition_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertServiceSchema = createInsertSchema(services, {
  title: z.string().min(3, "O t\xEDtulo deve ter pelo menos 3 caracteres."),
  category: z.string().min(1, "A categoria \xE9 obrigat\xF3ria."),
  pricingType: z.enum(["fixed", "hourly"]),
  price: z.string().refine((val) => !isNaN(parseFloat(val)), { message: "O pre\xE7o deve ser um n\xFAmero." })
}).omit({ id: true, createdAt: true, updatedAt: true, userId: true, condoId: true, status: true });
var loginUserSchema = z.object({ username: z.string().min(1, "Username \xE9 obrigat\xF3rio"), password: z.string().min(1, "Senha \xE9 obrigat\xF3ria") });
var insertUserSchema = createInsertSchema(users).pick({ username: true, password: true, name: true, email: true, phone: true, birthDate: true, block: true, unit: true, accountType: true, parentAccountId: true, relationship: true, role: true, status: true, emailVerified: true, verificationToken: true, verificationTokenExpiry: true }).extend({ inviteCode: z.string().length(8, "C\xF3digo de convite inv\xE1lido"), email: z.string().email({ message: "Formato de e-mail inv\xE1lido." }).min(1, { message: "E-mail \xE9 obrigat\xF3rio." }), phone: z.string().min(10, { message: "Telefone deve ter no m\xEDnimo 10 d\xEDgitos." }).max(20, { message: "Telefone muito longo." }), birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").refine((date) => !isNaN(new Date(date).getTime()), "Data de nascimento inv\xE1lida").refine((date) => new Date(date) <= /* @__PURE__ */ new Date(), "Data de nascimento n\xE3o pode ser no futuro").refine((date) => {
  const age = (/* @__PURE__ */ new Date()).getFullYear() - new Date(date).getFullYear();
  return age >= 0 && age <= 120;
}, "Idade deve estar entre 0 e 120 anos"), block: z.string().min(1, "Bloco \xE9 obrigat\xF3rio").max(20, "Bloco muito longo"), unit: z.string().min(1, "Unidade/Apartamento \xE9 obrigat\xF3rio").max(10, "Unidade muito longa") });
var updateUserSchema = z.object({ name: z.string().min(1, "Nome \xE9 obrigat\xF3rio").optional(), email: z.string().email("Formato de e-mail inv\xE1lido").optional(), phone: z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").optional(), status: z.enum(["active", "blocked_until_18"]).optional(), role: z.enum(["resident", "vendor", "service_provider", "delivery_person", "staff", "admin"]).optional() });
var updateReportSchema = z.object({ status: z.enum(["pending", "under_review", "resolved", "dismissed"]), adminNotes: z.string().optional().nullable() });
var baseInsertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({ id: true, createdAt: true, updatedAt: true });
var insertMarketplaceItemSchema = baseInsertMarketplaceItemSchema.extend({ title: z.string().min(1, "T\xEDtulo \xE9 obrigat\xF3rio").max(200, "T\xEDtulo muito longo"), type: z.enum(["sale", "donation", "exchange"], { required_error: "Tipo \xE9 obrigat\xF3rio" }), price: z.string().nullable().optional(), category: z.string().max(100, "Categoria muito longa").nullable().optional(), description: z.string().max(2e3, "Descri\xE7\xE3o muito longa").nullable().optional(), images: z.array(z.string()).nullable().optional() }).refine((data) => {
  if (data.type === "sale") {
    return !!data.price && parseFloat(data.price) > 0;
  }
  return true;
}, { message: "Pre\xE7o \xE9 obrigat\xF3rio para vendas", path: ["price"] });
var updateMarketplaceItemSchema = z.object({ title: z.string().min(1, "T\xEDtulo \xE9 obrigat\xF3rio").max(200, "T\xEDtulo muito longo").optional(), description: z.string().max(2e3, "Descri\xE7\xE3o muito longa").nullable().optional(), category: z.string().max(100, "Categoria muito longa").nullable().optional(), price: z.string().nullable().optional(), status: z.enum(["available", "sold", "reserved", "removed"]).optional(), images: z.array(z.string()).nullable().optional() }).refine((data) => {
  if (data.price !== void 0 && data.price !== null) {
    const numPrice = parseFloat(data.price);
    return !isNaN(numPrice) && numPrice >= 0;
  }
  return true;
}, { message: "Pre\xE7o inv\xE1lido", path: ["price"] });
var insertCondominiumSchema = createInsertSchema(condominiums).omit({ id: true, createdAt: true, inviteCode: true });
var insertStoreSchema = createInsertSchema(stores).omit({ id: true, createdAt: true, updatedAt: true });
var insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
var insertDeliveryPersonSchema = createInsertSchema(deliveryPersons).omit({ id: true, createdAt: true, updatedAt: true });
var insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
var insertReportSchema = createInsertSchema(reports).pick({ condoId: true, reporterId: true, targetType: true, targetId: true, reason: true, description: true, evidence: true });
var insertLoanRequestSchema = createInsertSchema(loanRequests, {
  title: z.string().min(3, "O t\xEDtulo deve ter pelo menos 3 caracteres.").max(100, "T\xEDtulo muito longo."),
  description: z.string().max(500, "Descri\xE7\xE3o muito longa.").optional()
}).omit({ id: true, createdAt: true, status: true, requesterId: true, condoId: true });
var insertLoanOfferSchema = createInsertSchema(loanOffers).omit({
  id: true,
  createdAt: true,
  status: true,
  offererId: true
});
var createLoanAgreementSchema = z.object({
  offerId: z.string(),
  agreedReturnDate: z.string().refine((d) => !isNaN(new Date(d).getTime()), "Data de devolu\xE7\xE3o inv\xE1lida."),
  digitalTerm: z.string().min(1, "O termo digital n\xE3o pode estar vazio."),
  handoverPhotoUrl: z.string().url("URL da foto de entrega inv\xE1lida.")
});
var confirmReturnSchema = z.object({
  condition: z.enum(["ok", "damaged"]),
  returnPhotoUrl: z.string().url("URL da foto de devolu\xE7\xE3o inv\xE1lida.").optional(),
  notes: z.string().max(500, "As notas s\xE3o muito longas.").optional()
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/postgres-storage.ts
import { eq, and, desc, or, not } from "drizzle-orm";
import bcrypt from "bcrypt";
var SALT_ROUNDS = 10;
var PostgresStorage = class {
  // ===== USER & AUTH IMPLEMENTATION =====
  async getUser(id) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }
  async getUserByEmail(email) {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  }
  async createUser(user, inviteCode) {
    const condo = await this.getCondominiumByInviteCode(inviteCode);
    if (!condo) {
      throw new Error("C\xF3digo de convite inv\xE1lido ou expirado.");
    }
    if (condo.status !== "approved") {
      throw new Error("O condom\xEDnio associado a este convite ainda n\xE3o foi aprovado.");
    }
    const existingUser = await this.getUserByEmail(user.email);
    if (existingUser) {
      throw new Error("Um usu\xE1rio com este e-mail j\xE1 existe.");
    }
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
    const [createdUser] = await db.insert(users).values({
      ...user,
      password: hashedPassword,
      condoId: condo.id,
      role: "resident"
      // Default role
    }).returning();
    return createdUser;
  }
  async listUsersByCondo(condoId) {
    return db.query.users.findMany({
      where: eq(users.condoId, condoId),
      columns: { id: true, name: true, email: true, block: true, unit: true, role: true }
    });
  }
  async updateUser(id, user) {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated;
  }
  async getUserByVerificationToken(token) {
    return void 0;
  }
  // ===== CONDOMINIUM IMPLEMENTATION =====
  async getCondominium(id) {
    return db.query.condominiums.findFirst({ where: eq(condominiums.id, id) });
  }
  async getCondominiumByInviteCode(inviteCode) {
    return db.query.condominiums.findFirst({ where: eq(condominiums.inviteCode, inviteCode) });
  }
  async listApprovedCondominiums() {
    return db.query.condominiums.findMany({
      where: eq(condominiums.status, "approved"),
      columns: { id: true, name: true, address: true }
    });
  }
  async listPendingCondominiums() {
    return db.query.condominiums.findMany({
      where: eq(condominiums.status, "pending")
    });
  }
  async createCondominium(condo) {
    const [created] = await db.insert(condominiums).values({
      ...condo,
      status: "pending"
      // Always pending on creation
    }).returning();
    return created;
  }
  async updateCondominium(id, condo) {
    const [updated] = await db.update(condominiums).set(condo).where(eq(condominiums.id, id)).returning();
    return updated;
  }
  async approveCondominium(id) {
    const [approved] = await db.update(condominiums).set({ status: "approved" }).where(eq(condominiums.id, id)).returning();
    return approved;
  }
  // ===== MARKETPLACE IMPLEMENTATION =====
  async listMarketplaceItems(condoId) {
    return db.query.marketplaceItems.findMany({
      where: eq(marketplaceItems.condoId, condoId),
      orderBy: desc(marketplaceItems.createdAt),
      with: { seller: { columns: { name: true, block: true, unit: true } } }
    });
  }
  async createMarketplaceItem(item, sellerId, condoId) {
    const [created] = await db.insert(marketplaceItems).values({ ...item, sellerId, condoId }).returning();
    return created;
  }
  async getMarketplaceItemDetails(itemId) {
    return db.query.marketplaceItems.findFirst({
      where: eq(marketplaceItems.id, itemId),
      with: { seller: { columns: { id: true, name: true, block: true, unit: true } } }
    });
  }
  async updateMarketplaceItem(itemId, item, sellerId) {
    const [updated] = await db.update(marketplaceItems).set({ ...item, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(marketplaceItems.id, itemId), eq(marketplaceItems.sellerId, sellerId))).returning();
    if (!updated) throw new Error("Item not found or permission denied");
    return updated;
  }
  async deleteMarketplaceItem(itemId, sellerId) {
    const [deleted] = await db.delete(marketplaceItems).where(and(eq(marketplaceItems.id, itemId), eq(marketplaceItems.sellerId, sellerId))).returning({ id: marketplaceItems.id });
    if (!deleted) throw new Error("Item not found or permission denied");
    return deleted;
  }
  async listSellers(condoId) {
    return [];
  }
  // ===== SERVICES IMPLEMENTATION =====
  async listServices(options) {
    const conditions = [eq(services.condoId, options.condoId)];
    if (options.userId) {
      conditions.push(eq(services.userId, options.userId));
    }
    return db.query.services.findMany({
      where: and(...conditions),
      orderBy: desc(services.createdAt),
      with: { user: { columns: { name: true, block: true, unit: true } } }
    });
  }
  async createService(service, userId, condoId) {
    const [created] = await db.insert(services).values({ ...service, userId, condoId }).returning();
    return created;
  }
  async updateService(id, service, userId) {
    const [updated] = await db.update(services).set({ ...service, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(services.id, id), eq(services.userId, userId))).returning();
    if (!updated) throw new Error("Service not found or permission denied");
    return updated;
  }
  async deleteService(id, userId) {
    const [deleted] = await db.delete(services).where(and(eq(services.id, id), eq(services.userId, userId))).returning({ id: services.id });
    if (!deleted) throw new Error("Service not found or permission denied");
    return deleted;
  }
  // ===== REPORTS IMPLEMENTATION =====
  async createReport(report) {
    const [created] = await db.insert(reports).values(report).returning();
    return created;
  }
  async listReportsByCondo(condoId) {
    return db.query.reports.findMany({
      where: eq(reports.condoId, condoId),
      orderBy: desc(reports.createdAt),
      with: {
        reporter: { columns: { name: true, id: true } },
        reportedUser: { columns: { name: true, id: true } }
      }
    });
  }
  async getReport(id) {
    return db.query.reports.findFirst({ where: eq(reports.id, id) });
  }
  async updateReport(id, report) {
    const [updated] = await db.update(reports).set(report).where(eq(reports.id, id)).returning();
    return updated;
  }
  // ===== LOAN SYSTEM IMPLEMENTATION =====
  async createLoanRequest(data, requesterId, condoId) {
    const [created] = await db.insert(loanRequests).values({ ...data, requesterId, condoId }).returning();
    return created;
  }
  async listOpenLoanRequests(condoId, userId) {
    return db.query.loanRequests.findMany({
      where: and(
        eq(loanRequests.condoId, condoId),
        eq(loanRequests.status, "open"),
        not(eq(loanRequests.requesterId, userId))
        // Hide user's own requests
      ),
      orderBy: desc(loanRequests.createdAt),
      with: {
        requester: { columns: { name: true, block: true, unit: true } }
      }
    });
  }
  async getLoanRequestDetails(requestId) {
    return db.query.loanRequests.findFirst({
      where: eq(loanRequests.id, requestId),
      with: {
        requester: { columns: { id: true, name: true, block: true, unit: true } },
        offers: {
          with: {
            offerer: { columns: { id: true, name: true, block: true, unit: true } }
          },
          orderBy: desc(loanOffers.createdAt)
        }
      }
    });
  }
  async createLoanOffer(requestId, offererId) {
    const request = await db.query.loanRequests.findFirst({ where: eq(loanRequests.id, requestId) });
    if (request?.requesterId === offererId) {
      throw new Error("You cannot make an offer on your own request.");
    }
    const [created] = await db.insert(loanOffers).values({ loanRequestId: requestId, offererId, status: "pending" }).returning();
    return created;
  }
  async createLoanAgreement(data, requesterId) {
    const { offerId, agreedReturnDate, digitalTerm } = data;
    return db.transaction(async (tx) => {
      const offer = await tx.query.loanOffers.findFirst({
        where: eq(loanOffers.id, offerId),
        with: { request: true }
      });
      if (!offer) throw new Error("Offer not found.");
      if (offer.request.requesterId !== requesterId) throw new Error("Only the original requester can accept an offer.");
      if (offer.status !== "pending") throw new Error("This offer is no longer available.");
      const [loan] = await tx.insert(loans).values({
        loanRequestId: offer.loanRequestId,
        offerId: offer.id,
        ownerId: offer.offererId,
        borrowerId: offer.request.requesterId,
        agreedReturnDate,
        digitalTerm,
        status: "active"
        // Agreement is made, pending handover
      }).returning();
      await tx.update(loanOffers).set({ status: "accepted" }).where(eq(loanOffers.id, offerId));
      await tx.update(loanOffers).set({ status: "rejected" }).where(and(eq(loanOffers.loanRequestId, offer.loanRequestId), not(eq(loanOffers.id, offerId))));
      await tx.update(loanRequests).set({ status: "fulfilled" }).where(eq(loanRequests.id, offer.loanRequestId));
      return loan;
    });
  }
  async getLoanDetails(loanId) {
    return db.query.loans.findFirst({
      where: eq(loans.id, loanId),
      with: {
        request: true,
        borrower: { columns: { id: true, name: true } },
        owner: { columns: { id: true, name: true } }
      }
    });
  }
  async getUserLoans(userId) {
    return db.query.loans.findMany({
      where: or(eq(loans.borrowerId, userId), eq(loans.ownerId, userId)),
      orderBy: desc(loans.createdAt),
      with: {
        request: { columns: { itemName: true } },
        borrower: { columns: { name: true } },
        owner: { columns: { name: true } }
      }
    });
  }
  async confirmHandover(loanId, ownerId, payload) {
    const [updated] = await db.update(loans).set({ status: "in_progress", handoverDate: /* @__PURE__ */ new Date(), handoverConditionNotes: payload.conditionNotes }).where(and(eq(loans.id, loanId), eq(loans.ownerId, ownerId), eq(loans.status, "active"))).returning();
    if (!updated) throw new Error("Loan not found, not in the correct status, or permission denied.");
    return updated;
  }
  async initiateReturn(loanId, borrowerId, payload) {
    const [updated] = await db.update(loans).set({ status: "return_initiated", returnConditionNotes: payload.conditionNotes }).where(and(eq(loans.id, loanId), eq(loans.borrowerId, borrowerId), eq(loans.status, "in_progress"))).returning();
    if (!updated) throw new Error("Loan not found, not in the correct status, or permission denied.");
    return updated;
  }
  async confirmReturnByOwner(loanId, ownerId) {
    const [updated] = await db.update(loans).set({ status: "completed", actualReturnDate: /* @__PURE__ */ new Date() }).where(and(eq(loans.id, loanId), eq(loans.ownerId, ownerId), eq(loans.status, "return_initiated"))).returning();
    if (!updated) throw new Error("Loan not found, not in the correct status, or permission denied.");
    return updated;
  }
};

// server/storage.ts
var storage = new PostgresStorage();

// server/auth-routes.ts
import bcrypt2 from "bcrypt";
import jwt2 from "jsonwebtoken";

// server/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
var authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: "No token provided" });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};
var adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
};

// server/auth-routes.ts
var authRouter = Router();
var JWT_SECRET2 = process.env.JWT_SECRET || "your-super-secret-key";
authRouter.post("/register-condo", async (req, res) => {
  const validation = insertCondominiumSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.flatten() });
  }
  try {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newCondo = await storage.createCondominium({ ...validation.data, inviteCode });
    res.status(201).json(newCondo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create condominium" });
  }
});
authRouter.post("/register", async (req, res) => {
  const { inviteCode, ...userData } = req.body;
  const validation = insertUserSchema.safeParse(userData);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.flatten() });
  }
  if (!inviteCode) {
    return res.status(400).json({ error: "Invite code is required" });
  }
  try {
    const newUser = await storage.createUser(validation.data, inviteCode);
    res.status(201).json({ id: newUser.id, name: newUser.name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const user = await storage.getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isValid = await bcrypt2.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt2.sign(
      { userId: user.id, condoId: user.condoId, role: user.role, isEmailVerified: user.isEmailVerified },
      JWT_SECRET2,
      { expiresIn: "7d" }
    );
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login" });
  }
});
authRouter.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const condo = user.condoId ? await storage.getCondominium(user.condoId) : null;
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      condoId: user.condoId,
      condoName: condo?.name,
      // Add condo name
      condoStatus: condo?.status,
      // Add condo status
      block: user.block,
      unit: user.unit,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// server/routes.ts
import { Router as Router2 } from "express";
var loanRouter = Router2();
loanRouter.use(authMiddleware);
loanRouter.post("/loan-requests", async (req, res) => {
  const user = req.user;
  const validation = insertLoanRequestSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });
  const newRequest = await storage.createLoanRequest(validation.data, user.userId, user.condoId);
  res.status(201).json(newRequest);
});
loanRouter.get("/loan-requests", async (req, res) => {
  const requests = await storage.listOpenLoanRequests(req.user.condoId, req.user.userId);
  res.status(200).json(requests);
});
loanRouter.get("/loan-requests/:id", async (req, res) => {
  const details = await storage.getLoanRequestDetails(req.params.id);
  if (!details) return res.status(404).json({ error: "Pedido n\xE3o encontrado." });
  res.status(200).json(details);
});
loanRouter.post("/loan-requests/:id/offers", async (req, res) => {
  const newOffer = await storage.createLoanOffer(req.params.id, req.user.userId);
  res.status(201).json(newOffer);
});
loanRouter.post("/loans/agreements", async (req, res) => {
  const validation = createLoanAgreementSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });
  const finalLoan = await storage.createLoanAgreement(validation.data, req.user.userId);
  res.status(201).json(finalLoan);
});
loanRouter.get("/my-loans", async (req, res) => {
  const loans2 = await storage.getUserLoans(req.user.userId);
  res.status(200).json(loans2);
});
loanRouter.get("/loans/:id", async (req, res) => {
  const loan = await storage.getLoanDetails(req.params.id);
  if (!loan) return res.status(404).json({ error: "Empr\xE9stimo n\xE3o encontrado." });
  if (loan.borrowerId !== req.user.userId && loan.ownerId !== req.user.userId) {
    return res.status(403).json({ error: "Acesso negado." });
  }
  res.status(200).json(loan);
});
var servicesRouter = Router2();
servicesRouter.use(authMiddleware);
servicesRouter.get("/services", async (req, res) => {
  const userId = req.query.userId;
  const services2 = await storage.listServices({ condoId: req.user.condoId, userId });
  res.json(services2);
});
servicesRouter.post("/services", async (req, res) => {
  const validation = insertServiceSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });
  const service = await storage.createService(validation.data, req.user.userId, req.user.condoId);
  res.status(201).json(service);
});
servicesRouter.patch("/services/:id", async (req, res) => {
  const service = await storage.updateService(req.params.id, req.body, req.user.userId);
  res.json(service);
});
servicesRouter.delete("/services/:id", async (req, res) => {
  await storage.deleteService(req.params.id, req.user.userId);
  res.status(204).send();
});
var marketplaceRouter = Router2();
marketplaceRouter.use(authMiddleware);
marketplaceRouter.get("/marketplace", async (req, res) => {
  const items = await storage.listMarketplaceItems(req.user.condoId);
  res.json(items);
});
marketplaceRouter.get("/marketplace/:id", async (req, res) => {
  const item = await storage.getMarketplaceItemDetails(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});
marketplaceRouter.post("/marketplace", async (req, res) => {
  const validation = insertMarketplaceItemSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });
  const item = await storage.createMarketplaceItem(validation.data, req.user.userId, req.user.condoId);
  res.status(201).json(item);
});
marketplaceRouter.patch("/marketplace/:id", async (req, res) => {
  const item = await storage.updateMarketplaceItem(req.params.id, req.body, req.user.userId);
  res.json(item);
});
marketplaceRouter.delete("/marketplace/:id", async (req, res) => {
  await storage.deleteMarketplaceItem(req.params.id, req.user.userId);
  res.status(204).send();
});

// server/admin-routes.ts
import { Router as Router3 } from "express";
var router = Router3();
router.get("/condominiums/pending", async (req, res, next) => {
  try {
    const pendingCondos = await storage.listPendingCondominiums();
    res.json(pendingCondos);
  } catch (error) {
    next(error);
  }
});
router.post("/condominiums/:id/approve", async (req, res, next) => {
  try {
    const { id } = req.params;
    const approvedCondo = await storage.approveCondominium(id);
    if (!approvedCondo) {
      return res.status(404).json({ message: "Condom\xEDnio n\xE3o encontrado ou j\xE1 aprovado." });
    }
    res.json(approvedCondo);
  } catch (error) {
    next(error);
  }
});
router.get("/reports", async (req, res, next) => {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
});
var registerAdminRoutes = (app2) => {
  app2.use("/api/admin", authMiddleware, adminOnly, router);
};

// server/app.ts
var app = express();
var httpServer = createServer(app);
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api", loanRouter);
app.use("/api", servicesRouter);
app.use("/api", marketplaceRouter);
registerAdminRoutes(app);
app.use(express.static("dist/public"));
app.get("*", (req, res) => {
  res.sendFile("index.html", { root: "dist/public" });
});
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
var io = new Server(httpServer, {
  cors: {
    origin: "*",
    // Allow all origins for simplicity
    methods: ["GET", "POST"]
  }
});
io.on("connection", (socket) => {
  console.log("A user connected with socket ID:", socket.id);
  socket.on("join_condo_chat", (condoId) => {
    console.log(`Socket ${socket.id} joining room for condo ${condoId}`);
    socket.join(condoId);
  });
  socket.on("send_message", (data) => {
    socket.to(data.condoId).emit("receive_message", data);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
var app_default = httpServer;

// server/index-prod.ts
async function serveStatic(app2, _server) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
(async () => {
  await app_default(serveStatic);
})();
export {
  serveStatic
};
