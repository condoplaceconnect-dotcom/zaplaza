import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ... (Users and Condominiums tables remain the same) ...

// ✅ USERS TABLE
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  birthDate: varchar("birth_date", { length: 10 }), // YYYY-MM-DD format
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
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  inviteCode: varchar("invite_code", { length: 8 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
    condo: one(condominiums, {
        fields: [users.condoId],
        references: [condominiums.id],
    }),
}));
export const condominiumsRelations = relations(condominiums, ({ many }) => ({
	users: many(users),
}));


// ... (Stores, Products, Delivery, Orders, Marketplace, Reports tables remain the same) ...
export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), name: text("name").notNull(), description: text("description"), image: text("image"), category: varchar("category", { length: 50 }).notNull(), phone: varchar("phone", { length: 20 }), email: text("email"), status: varchar("status", { length: 20 }).notNull().default("active"), condoId: varchar("condo_id").notNull(), createdAt: timestamp("created_at").defaultNow(), updatedAt: timestamp("updated_at").defaultNow(),
});
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").notNull(), name: text("name").notNull(), description: text("description"), image: text("image"), category: varchar("category", { length: 50 }), price: decimal("price", { precision: 10, scale: 2 }).notNull(), ingredients: text("ingredients"), available: boolean("available").notNull().default(true), createdAt: timestamp("created_at").defaultNow(), updatedAt: timestamp("updated_at").defaultNow(),
});
export const deliveryPersons = pgTable("delivery_persons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), name: text("name").notNull(), image: text("image"), phone: varchar("phone", { length: 20 }), block: varchar("block", { length: 20 }), unit: varchar("unit", { length: 10 }), status: varchar("status", { length: 20 }).notNull().default("offline"), rating: decimal("rating", { precision: 3, scale: 2 }).default("0"), totalDeliveries: integer("total_deliveries").default(0), condoId: varchar("condo_id").notNull(), createdAt: timestamp("created_at").defaultNow(), updatedAt: timestamp("updated_at").defaultNow(),
});
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull(), storeId: varchar("store_id").notNull(), residentId: varchar("resident_id").notNull(), deliveryPersonId: varchar("delivery_person_id"), status: varchar("status", { length: 20 }).notNull().default("pending"), totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(), items: jsonb("items").notNull(), deliveryAddress: text("delivery_address"), notes: text("notes"), tip: decimal("tip", { precision: 10, scale: 2 }).default("0"), rating: integer("rating"), createdAt: timestamp("created_at").defaultNow(), updatedAt: timestamp("updated_at").defaultNow(),
});
export const marketplaceItems = pgTable("marketplace_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull(), userId: varchar("user_id").notNull(), title: text("title").notNull(), description: text("description"), images: jsonb("images").default([]), category: varchar("category", { length: 50 }), type: varchar("type", { length: 20 }).notNull(), price: decimal("price", { precision: 10, scale: 2 }), block: varchar("block", { length: 20 }), unit: varchar("unit", { length: 10 }), status: varchar("status", { length: 20 }).notNull().default("available"), views: integer("views").default(0), createdAt: timestamp("created_at").defaultNow(), updatedAt: timestamp("updated_at").defaultNow(),
});
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull(), reporterId: varchar("reporter_id").notNull(), targetType: varchar("target_type", { length: 30 }).notNull(), targetId: varchar("target_id").notNull(), reason: varchar("reason", { length: 50 }).notNull(), description: text("description").notNull(), evidence: jsonb("evidence").default([]), status: varchar("status", { length: 20 }).notNull().default("pending"), adminNotes: text("admin_notes"), resolvedBy: varchar("resolved_by"), resolvedAt: timestamp("resolved_at"), createdAt: timestamp("created_at").defaultNow(),
});


//--- "EMPRESTA AÍ" MODULE ---

// ✅ LOAN REQUESTS TABLE (NEW) - Step 1: User requests an item
export const loanRequests = pgTable("loan_requests", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    requesterId: varchar("requester_id").notNull().references(() => users.id),
    condoId: varchar("condo_id").notNull().references(() => condominiums.id),
    title: text("title").notNull(), // "Preciso de uma furadeira"
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default("open"), // open, fulfilled, cancelled
    createdAt: timestamp("created_at").defaultNow(),
});

// ✅ LOAN OFFERS TABLE (NEW) - Step 2: Other users offer their item
export const loanOffers = pgTable("loan_offers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    loanRequestId: varchar("loan_request_id").notNull().references(() => loanRequests.id),
    offererId: varchar("offerer_id").notNull().references(() => users.id),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, rejected, cancelled
    chatId: varchar("chat_id"), // Optional: to link to a direct chat
    createdAt: timestamp("created_at").defaultNow(),
});

// ✅ LOANS TABLE (MODIFIED) - Step 3: The final loan agreement
export const loans = pgTable("loans", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    loanRequestId: varchar("loan_request_id").notNull().references(() => loanRequests.id),
    offerId: varchar("offer_id").notNull().references(() => loanOffers.id),
    ownerId: varchar("owner_id").notNull().references(() => users.id),
    borrowerId: varchar("borrower_id").notNull().references(() => users.id), // Same as requesterId
    
    // Agreement Details
    agreedReturnDate: timestamp("agreed_return_date").notNull(),
    digitalTerm: text("digital_term").notNull(),
    photos: jsonb("photos").$type<{ handover: string; return?: string; }>(), // Handover photo is required

    // Tracking
    status: varchar("status", { length: 30 }).notNull().default("pending_handover"), // pending_handover, active, pending_return_confirmation, returned, disputed, cancelled
    handoverDate: timestamp("handover_date"),
    actualReturnDate: timestamp("actual_return_date"),
    returnConditionNotes: text("return_condition_notes"), // For disputes

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});


//--- ZOD SCHEMAS ---

// ... (Other Zod schemas remain the same) ...
export const loginUserSchema = z.object({ username: z.string().min(1, "Username é obrigatório"), password: z.string().min(1, "Senha é obrigatória"), });
export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true, name: true, email: true, phone: true, birthDate: true, block: true, unit: true, accountType: true, parentAccountId: true, relationship: true, role: true, status: true, emailVerified: true, verificationToken: true, verificationTokenExpiry: true, }).extend({ inviteCode: z.string().length(8, "Código de convite inválido"), email: z.string().email({ message: "Formato de e-mail inválido." }).min(1, { message: "E-mail é obrigatório." }), phone: z.string().min(10, { message: "Telefone deve ter no mínimo 10 dígitos." }).max(20, { message: "Telefone muito longo." }), birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").refine((date) => !isNaN(new Date(date).getTime()), "Data de nascimento inválida").refine((date) => new Date(date) <= new Date(), "Data de nascimento não pode ser no futuro").refine((date) => { const age = new Date().getFullYear() - new Date(date).getFullYear(); return age >= 0 && age <= 120; }, "Idade deve estar entre 0 e 120 anos"), block: z.string().min(1, "Bloco é obrigatório").max(20, "Bloco muito longo"), unit: z.string().min(1, "Unidade/Apartamento é obrigatório").max(10, "Unidade muito longa"), });
export const updateUserSchema = z.object({ name: z.string().min(1, "Nome é obrigatório").optional(), email: z.string().email("Formato de e-mail inválido").optional(), phone: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos").optional(), status: z.enum(["active", "blocked_until_18"]).optional(), role: z.enum(["resident", "vendor", "service_provider", "delivery_person", "staff", "admin"]).optional(), });
export const updateReportSchema = z.object({ status: z.enum(["pending", "under_review", "resolved", "dismissed"]), adminNotes: z.string().optional().nullable(), });
const baseInsertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({ id: true, createdAt: true, updatedAt: true, });
export const insertMarketplaceItemSchema = baseInsertMarketplaceItemSchema.extend({ title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"), type: z.enum(["sale", "donation", "exchange"], { required_error: "Tipo é obrigatório" }), price: z.string().nullable().optional(), category: z.string().max(100, "Categoria muito longa").nullable().optional(), description: z.string().max(2000, "Descrição muito longa").nullable().optional(), images: z.array(z.string()).nullable().optional(), }).refine( (data) => { if (data.type === "sale") { return !!data.price && parseFloat(data.price) > 0; } return true; }, { message: "Preço é obrigatório para vendas", path: ["price"], } );
export const updateMarketplaceItemSchema = z.object({ title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo").optional(), description: z.string().max(2000, "Descrição muito longa").nullable().optional(), category: z.string().max(100, "Categoria muito longa").nullable().optional(), price: z.string().nullable().optional(), status: z.enum(["available", "sold", "reserved", "removed"]).optional(), images: z.array(z.string()).nullable().optional(), }).refine( (data) => { if (data.price !== undefined && data.price !== null) { const numPrice = parseFloat(data.price); return !isNaN(numPrice) && numPrice >= 0; } return true; }, { message: "Preço inválido", path: ["price"], } );
export const insertCondoSchema = createInsertSchema(condominiums).omit({ id: true, createdAt: true, inviteCode: true, });
export const insertStoreSchema = createInsertSchema(stores).omit({ id: true, createdAt: true, updatedAt: true, });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true, });
export const insertDeliveryPersonSchema = createInsertSchema(deliveryPersons).omit({ id: true, createdAt: true, updatedAt: true, });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true, });
export const insertReportSchema = createInsertSchema(reports).pick({ condoId: true, reporterId: true, targetType: true, targetId: true, reason: true, description: true, evidence: true, });


// Zod Schemas for the new Loan flow
export const insertLoanRequestSchema = createInsertSchema(loanRequests, {
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres.").max(100, "Título muito longo."),
    description: z.string().max(500, "Descrição muito longa.").optional(),
}).omit({ id: true, createdAt: true, status: true, requesterId: true, condoId: true });

export const insertLoanOfferSchema = createInsertSchema(loanOffers).omit({ 
    id: true, createdAt: true, status: true, offererId: true 
});

export const createLoanAgreementSchema = z.object({
    offerId: z.string(),
    agreedReturnDate: z.string().refine((d) => !isNaN(new Date(d).getTime()), "Data de devolução inválida."),
    digitalTerm: z.string().min(1, "O termo digital não pode estar vazio."),
    handoverPhotoUrl: z.string().url("URL da foto de entrega inválida."),
});

export const confirmReturnSchema = z.object({
    condition: z.enum(["ok", "damaged"]),
    returnPhotoUrl: z.string().url("URL da foto de devolução inválida.").optional(),
    notes: z.string().max(500, "As notas são muito longas.").optional(),
});


// ✅ TYPES
export type User = typeof users.$inferSelect & { condo?: Condominium | null };
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Condominium = typeof condominiums.$inferSelect;
export type InsertCondominium = z.infer<typeof insertCondoSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type DeliveryPerson = typeof deliveryPersons.$inferSelect;
export type InsertDeliveryPerson = z.infer<typeof insertDeliveryPersonSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// New Loan Types
export type LoanRequest = typeof loanRequests.$inferSelect;
export type InsertLoanRequest = z.infer<typeof insertLoanRequestSchema>;
export type LoanOffer = typeof loanOffers.$inferSelect;
export type InsertLoanOffer = z.infer<typeof insertLoanOfferSchema>;
export type Loan = typeof loans.$inferSelect;
export type CreateLoanAgreement = z.infer<typeof createLoanAgreementSchema>;
export type ConfirmReturn = z.infer<typeof confirmReturnSchema>;
