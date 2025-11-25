import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Condominium,
  InsertCondominium,
  Store,
  InsertStore,
  Product,
  InsertProduct,
  DeliveryPerson,
  InsertDeliveryPerson,
  Order,
  InsertOrder,
  MarketplaceItem,
  InsertMarketplaceItem,
  Report,
  InsertReport,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class PostgresStorage implements IStorage {

  // ===== USERS =====
  async listUsers(): Promise<User[]> {
    return await db.query.users.findMany({
      orderBy: desc(schema.users.createdAt),
    });
  }
  
  async getUser(id: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.verificationToken, token),
    });
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(schema.users).values(user).returning();
    return created;
  }

  async listUsersByRole(role: string): Promise<User[]> {
    return await db.query.users.findMany({
      where: eq(schema.users.role, role),
    });
  }

  async listUsersByCondo(condoId: string): Promise<User[]> {
    return await db.query.users.findMany({
      where: eq(schema.users.condoId, condoId),
    });
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
      .update(schema.users)
      .set(user)
      .where(eq(schema.users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getDependentsByParentId(parentId: string): Promise<User[]> {
    return await db.query.users.findMany({
      where: eq(schema.users.parentAccountId, parentId),
    });
  }

  // ===== CONDOMINIUMS =====
  async getCondominium(id: string): Promise<Condominium | undefined> {
    return await db.query.condominiums.findFirst({
      where: eq(schema.condominiums.id, id),
    });
  }

  async listCondominiums(): Promise<Condominium[]> {
    return await db.query.condominiums.findMany();
  }

  async listPendingCondominiums(): Promise<Condominium[]> {
    return await db.query.condominiums.findMany({
      where: eq(schema.condominiums.status, "pending"),
    });
  }

  async createCondominium(condo: InsertCondominium): Promise<Condominium> {
    const [created] = await db
      .insert(schema.condominiums)
      .values(condo)
      .returning();
    return created;
  }

  async updateCondominium(
    id: string,
    condo: Partial<Condominium>
  ): Promise<Condominium | undefined> {
    const [updated] = await db
      .update(schema.condominiums)
      .set(condo)
      .where(eq(schema.condominiums.id, id))
      .returning();
    return updated;
  }

  // ===== STORES =====
  async getStore(id: string): Promise<Store | undefined> {
    return await db.query.stores.findFirst({
      where: eq(schema.stores.id, id),
    });
  }

  async getStoresByUser(userId: string): Promise<Store[]> {
    return await db.query.stores.findMany({
      where: eq(schema.stores.userId, userId),
    });
  }

  async getStoresByCondo(condoId: string): Promise<Store[]> {
    return await db.query.stores.findMany({
      where: eq(schema.stores.condoId, condoId),
    });
  }

  async createStore(store: InsertStore): Promise<Store> {
    const [created] = await db.insert(schema.stores).values(store).returning();
    return created;
  }

  async updateStore(
    id: string,
    store: Partial<Store>
  ): Promise<Store | undefined> {
    const [updated] = await db
      .update(schema.stores)
      .set(store)
      .where(eq(schema.stores.id, id))
      .returning();
    return updated;
  }

  async deleteStore(id: string): Promise<boolean> {
    const result = await db.delete(schema.stores).where(eq(schema.stores.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ===== PRODUCTS =====
  async getProduct(id: string): Promise<Product | undefined> {
    return await db.query.products.findFirst({
      where: eq(schema.products.id, id),
    });
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    return await db.query.products.findMany({
      where: eq(schema.products.storeId, storeId),
    });
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db
      .insert(schema.products)
      .values(product)
      .returning();
    return created;
  }

  async updateProduct(
    id: string,
    product: Partial<Product>
  ): Promise<Product | undefined> {
    const [updated] = await db
      .update(schema.products)
      .set(product)
      .where(eq(schema.products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.products)
      .where(eq(schema.products.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ===== DELIVERY PERSONS =====
  async getDeliveryPerson(id: string): Promise<DeliveryPerson | undefined> {
    return await db.query.deliveryPersons.findFirst({
      where: eq(schema.deliveryPersons.id, id),
    });
  }

  async getDeliveryPersonsByUser(userId: string): Promise<DeliveryPerson[]> {
    return await db.query.deliveryPersons.findMany({
      where: eq(schema.deliveryPersons.userId, userId),
    });
  }

  async getDeliveryPersonsByCondo(condoId: string): Promise<DeliveryPerson[]> {
    return await db.query.deliveryPersons.findMany({
        where: eq(schema.deliveryPersons.condoId, condoId)
    });
  }

  async createDeliveryPerson(
    person: InsertDeliveryPerson
  ): Promise<DeliveryPerson> {
    const [created] = await db
      .insert(schema.deliveryPersons)
      .values(person)
      .returning();
    return created;
  }

  async updateDeliveryPerson(
    id: string,
    person: Partial<DeliveryPerson>
  ): Promise<DeliveryPerson | undefined> {
    const [updated] = await db
      .update(schema.deliveryPersons)
      .set(person)
      .where(eq(schema.deliveryPersons.id, id))
      .returning();
    return updated;
  }

  // ===== ORDERS =====
  async getOrder(id: string): Promise<Order | undefined> {
    return await db.query.orders.findFirst({
      where: eq(schema.orders.id, id),
    });
  }

  async getOrdersByResident(residentId: string): Promise<Order[]> {
    return await db.query.orders.findMany({
      where: eq(schema.orders.residentId, residentId),
    });
  }

  async getOrdersByStore(storeId: string): Promise<Order[]> {
    return await db.query.orders.findMany({
      where: eq(schema.orders.storeId, storeId),
    });
  }

  async getOrdersByCondo(condoId: string): Promise<Order[]> {
    return await db.query.orders.findMany({
      where: eq(schema.orders.condoId, condoId),
    });
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(schema.orders).values(order).returning();
    return created;
  }

  async updateOrder(
    id: string,
    order: Partial<Order>
  ): Promise<Order | undefined> {
    const [updated] = await db
      .update(schema.orders)
      .set(order)
      .where(eq(schema.orders.id, id))
      .returning();
    return updated;
  }

  // ===== MARKETPLACE ITEMS =====
  async getMarketplaceItem(id: string): Promise<MarketplaceItem | undefined> {
    return await db.query.marketplaceItems.findFirst({
      where: eq(schema.marketplaceItems.id, id),
    });
  }

  async getMarketplaceItemsByCondo(condoId: string): Promise<MarketplaceItem[]> {
    return await db.query.marketplaceItems.findMany({
      where: eq(schema.marketplaceItems.condoId, condoId),
    });
  }

  async getMarketplaceItemsByUser(userId: string): Promise<MarketplaceItem[]> {
    return await db.query.marketplaceItems.findMany({
      where: eq(schema.marketplaceItems.userId, userId),
    });
  }

  async createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem> {
    const [created] = await db
      .insert(schema.marketplaceItems)
      .values(item)
      .returning();
    return created;
  }

  async updateMarketplaceItem(
    id: string,
    item: Partial<MarketplaceItem>,
    userId: string
  ): Promise<MarketplaceItem | undefined> {
    const [updated] = await db
      .update(schema.marketplaceItems)
      .set(item)
      .where(and(eq(schema.marketplaceItems.id, id), eq(schema.marketplaceItems.userId, userId)))
      .returning();
    return updated;
  }

  async deleteMarketplaceItem(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.marketplaceItems)
      .where(eq(schema.marketplaceItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ===== REPORTS =====
  async getReport(id: string): Promise<Report | undefined> {
    return await db.query.reports.findFirst({
      where: eq(schema.reports.id, id),
    });
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [created] = await db.insert(schema.reports).values(report).returning();
    return created;
  }

  async listReportsByCondo(condoId: string): Promise<Report[]> {
    return await db.query.reports.findMany({
      where: eq(schema.reports.condoId, condoId),
      orderBy: (reports, { desc }) => [desc(reports.createdAt)],
    });
  }

  async updateReport(
    id: string,
    report: Partial<Report>
  ): Promise<Report | undefined> {
    const [updated] = await db
      .update(schema.reports)
      .set(report)
      .where(eq(schema.reports.id, id))
      .returning();
    return updated;
  }
}
