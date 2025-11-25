import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =================================================================================================
// ✅ TABLES
// =================================================================================================

// Users & Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  birthDate: varchar("birth_date", { length: 10 }),
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

// Condominiums
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

// Services (Zap Bico)
export const services = pgTable("services", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    condoId: varchar("condo_id").notNull().references(() => condominiums.id),
    title: text("title").notNull(),
    description: text("description"),
    category: varchar("category", { length: 50 }).notNull(),
    pricingType: varchar("pricing_type", { length: 20 }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketplace (Achadinhos)
export const marketplaceItems = pgTable("marketplace_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull().references(() => condominiums.id),
  sellerId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  category: varchar("category", { length: 50 }),
  type: varchar("type", { length: 20 }).notNull(), // 'sale', 'donation'
  price: decimal("price", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan System (Empresta Aí)
export const loanRequests = pgTable("loan_requests", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    requesterId: varchar("requester_id").notNull().references(() => users.id),
    condoId: varchar("condo_id").notNull().references(() => condominiums.id),
    title: text("title").notNull(),
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default("open"), // open, fulfilled, cancelled
    createdAt: timestamp("created_at").defaultNow(),
});

export const loanOffers = pgTable("loan_offers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    loanRequestId: varchar("loan_request_id").notNull().references(() => loanRequests.id),
    offererId: varchar("offerer_id").notNull().references(() => users.id),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, rejected
    createdAt: timestamp("created_at").defaultNow(),
});

export const loans = pgTable("loans", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    loanRequestId: varchar("loan_request_id").notNull().references(() => loanRequests.id),
    offerId: varchar("offer_id").notNull().references(() => loanOffers.id),
    ownerId: varchar("owner_id").notNull().references(() => users.id),
    borrowerId: varchar("borrower_id").notNull().references(() => users.id),
    agreedReturnDate: timestamp("agreed_return_date").notNull(),
    digitalTermUrl: text("digital_term_url"),
    status: varchar("status", { length: 30 }).notNull().default("pending_handover"),
    handoverDate: timestamp("handover_date"),
    actualReturnDate: timestamp("actual_return_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat System
export const chats = pgTable("chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").references(() => loans.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatParticipants = pgTable("chat_participants", {
    chatId: varchar("chat_id").notNull().references(() => chats.id, { onDelete: 'cascade' }),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.userId] }),
}));

export const messages = pgTable("messages", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    chatId: varchar("chat_id").notNull().references(() => chats.id, { onDelete: 'cascade' }),
    senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lost & Found (Achados e Perdidos) - NEW
export const lostAndFoundItems = pgTable("lost_and_found_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condoId: varchar("condo_id").notNull().references(() => condominiums.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 10 }).notNull(), // 'lost' or 'found'
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  location: text("location"), // e.g., "Near the pool", "Block B garage"
  status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'resolved'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// =================================================================================================
// ✅ RELATIONS
// =================================================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
    condo: one(condominiums, { fields: [users.condoId], references: [condominiums.id] }),
    services: many(services),
    marketplaceItems: many(marketplaceItems),
    loanRequests: many(loanRequests),
    loanOffers: many(loanOffers),
    ownedLoans: many(loans, { relationName: 'LoanOwner' }),
    borrowedLoans: many(loans, { relationName: 'LoanBorrower' }),
    chatParticipants: many(chatParticipants),
    lostAndFoundItems: many(lostAndFoundItems), // User can have many lost/found items
}));

export const condominiumsRelations = relations(condominiums, ({ many }) => ({
	  users: many(users),
    services: many(services),
    marketplaceItems: many(marketplaceItems),
    loanRequests: many(loanRequests),
    lostAndFoundItems: many(lostAndFoundItems), // Condo can have many lost/found items
}));

export const servicesRelations = relations(services, ({ one }) => ({
    user: one(users, { fields: [services.userId], references: [users.id] }),
    condo: one(condominiums, { fields: [services.condoId], references: [condominiums.id] }),
}));

export const marketplaceRelations = relations(marketplaceItems, ({ one }) => ({
    seller: one(users, { fields: [marketplaceItems.sellerId], references: [users.id] }),
    condo: one(condominiums, { fields: [marketplaceItems.condoId], references: [condominiums.id] }),
}));

export const loanRequestsRelations = relations(loanRequests, ({ one, many }) => ({
    requester: one(users, { fields: [loanRequests.requesterId], references: [users.id] }),
    condo: one(condominiums, { fields: [loanRequests.condoId], references: [condominiums.id] }),
    offers: many(loanOffers),
}));

export const loanOffersRelations = relations(loanOffers, ({ one }) => ({
    loanRequest: one(loanRequests, { fields: [loanOffers.loanRequestId], references: [loanRequests.id] }),
    offerer: one(users, { fields: [loanOffers.offererId], references: [users.id] }),
}));

export const loansRelations = relations(loans, ({ one }) => ({
    loanRequest: one(loanRequests, { fields: [loans.loanRequestId], references: [loanRequests.id] }),
    offer: one(loanOffers, { fields: [loans.offerId], references: [loanOffers.id] }),
    owner: one(users, { fields: [loans.ownerId], references: [users.id], relationName: 'LoanOwner' }),
    borrower: one(users, { fields: [loans.borrowerId], references: [users.id], relationName: 'LoanBorrower' }),
    chat: one(chats, { fields: [loans.id], references: [chats.loanId] }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
    loan: one(loans, { fields: [chats.loanId], references: [loans.id] }),
    participants: many(chatParticipants),
    messages: many(messages),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
    chat: one(chats, { fields: [chatParticipants.chatId], references: [chats.id] }),
    user: one(users, { fields: [chatParticipants.userId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    chat: one(chats, { fields: [messages.chatId], references: [chats.id] }),
    sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

// Lost & Found Relations - NEW
export const lostAndFoundRelations = relations(lostAndFoundItems, ({ one }) => ({
    user: one(users, { fields: [lostAndFoundItems.userId], references: [users.id] }),
    condo: one(condominiums, { fields: [lostAndFoundItems.condoId], references: [condominiums.id] }),
}));


// =================================================================================================
// ✅ ZOD SCHEMAS & TYPES
// =================================================================================================

// Users & Auth
export const insertUserSchema = createInsertSchema(users).pick({ /*...*/ });
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Condominiums
export const insertCondominiumSchema = createInsertSchema(condominiums);
export type Condominium = typeof condominiums.$inferSelect;
export type InsertCondominium = typeof condominiums.$inferInsert;

// Services
export const insertServiceSchema = createInsertSchema(services, {
  price: z.string().or(z.number()),
}).omit({ id: true, createdAt: true, updatedAt: true, userId: true, condoId: true, status: true });
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// Marketplace
export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems, {
    price: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
}).omit({ id: true, createdAt: true, updatedAt: true, sellerId: true, condoId: true, status: true });
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = typeof marketplaceItems.$inferInsert;

// Loan System
export const insertLoanRequestSchema = createInsertSchema(loanRequests).omit({ id: true, createdAt: true, requesterId: true, condoId: true, status: true });
export const createLoanAgreementSchema = z.object({ offerId: z.string(), agreedReturnDate: z.string().transform((str) => new Date(str)) });
export const confirmReturnSchema = z.object({ rating: z.number().min(1).max(5), comment: z.string().optional() });
export type LoanRequest = typeof loanRequests.$inferSelect;
export type InsertLoanRequest = typeof loanRequests.$inferInsert;
export type LoanOffer = typeof loanOffers.$inferSelect;
export type InsertLoanOffer = typeof loanOffers.$inferInsert;
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;

// Chat System
export const insertChatSchema = createInsertSchema(chats);
export const insertMessageSchema = createInsertSchema(messages);
export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = typeof chatParticipants.$inferInsert;

// Lost & Found - NEW
export const insertLostAndFoundItemSchema = createInsertSchema(lostAndFoundItems, {
    imageUrl: z.string().url().optional().nullable(),
}).omit({ id: true, createdAt: true, updatedAt: true, userId: true, condoId: true, status: true });
export type LostAndFoundItem = typeof lostAndFoundItems.$inferSelect;
export type InsertLostAndFoundItem = typeof lostAndFoundItems.$inferInsert;
