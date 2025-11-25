import { type User, type InsertUser, type Condominium, type InsertCondominium, type Store, type InsertStore, type Product, type InsertProduct, type DeliveryPerson, type InsertDeliveryPerson, type Order, type InsertOrder, type MarketplaceItem, type InsertMarketplaceItem, type Report, type InsertReport } from "@shared/schema";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";
import { PostgresStorage } from "./postgres-storage";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  listUsersByRole(role: string): Promise<User[]>;
  listUsersByCondo(condoId: string): Promise<User[]>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getDependentsByParentId(parentId: string): Promise<User[]>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;

  // Condominiums
  getCondominium(id: string): Promise<Condominium | undefined>;
  listCondominiums(): Promise<Condominium[]>;
  listPendingCondominiums(): Promise<Condominium[]>;
  createCondominium(condo: InsertCondominium): Promise<Condominium>;
  updateCondominium(id: string, condo: Partial<Condominium>): Promise<Condominium | undefined>;

  // Stores
  getStore(id: string): Promise<Store | undefined>;
  getStoresByUser(userId: string): Promise<Store[]>;
  getStoresByCondo(condoId: string): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, store: Partial<Store>): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByStore(storeId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Delivery Persons
  getDeliveryPerson(id: string): Promise<DeliveryPerson | undefined>;
  getDeliveryPersonsByUser(userId: string): Promise<DeliveryPerson[]>;
  getDeliveryPersonsByCondo(condoId: string): Promise<DeliveryPerson[]>;
  createDeliveryPerson(person: InsertDeliveryPerson): Promise<DeliveryPerson>;
  updateDeliveryPerson(id: string, person: Partial<DeliveryPerson>): Promise<DeliveryPerson | undefined>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByResident(residentId: string): Promise<Order[]>;
  getOrdersByStore(storeId: string): Promise<Order[]>;
  getOrdersByCondo(condoId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined>;

  // Marketplace Items
  getMarketplaceItem(id: string): Promise<MarketplaceItem | undefined>;
  getMarketplaceItemsByCondo(condoId: string): Promise<MarketplaceItem[]>;
  getMarketplaceItemsByUser(userId: string): Promise<MarketplaceItem[]>;
  createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem>;
  updateMarketplaceItem(id: string, item: Partial<MarketplaceItem>): Promise<MarketplaceItem | undefined>;
  deleteMarketplaceItem(id: string): Promise<boolean>;

  // Reports
  createReport(report: InsertReport): Promise<Report>;
  listReportsByCondo(condoId: string): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  updateReport(id: string, report: Partial<Report>): Promise<Report | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private condominiums: Map<string, Condominium> = new Map();
  private stores: Map<string, Store> = new Map();
  private products: Map<string, Product> = new Map();
  private deliveryPersons: Map<string, DeliveryPerson> = new Map();
  private orders: Map<string, Order> = new Map();
  private reports: Map<string, Report> = new Map();

  constructor() {
    this.initializeTestData();
  }

  private async initializeTestData() {/** ... */}

  // ===== USERS =====
  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  async getUser(id: string): Promise<User | undefined> { return this.users.get(id); }
  async getUserByUsername(username: string): Promise<User | undefined> { 
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  async createUser(user: InsertUser): Promise<User> {
    const newUser = { ...user, id: randomUUID(), createdAt: new Date() } as User;
    this.users.set(newUser.id, newUser);
    return newUser;
  }
  async listUsersByRole(role: string): Promise<User[]> { 
    return Array.from(this.users.values()).filter(u => u.role === role);
  }
  async listUsersByCondo(condoId: string): Promise<User[]> { 
    return Array.from(this.users.values()).filter(u => u.condoId === condoId);
  }
  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...user };
    this.users.set(id, updated);
    return updated;
  }
  async deleteUser(id: string): Promise<boolean> { return this.users.delete(id); }
  async getDependentsByParentId(parentId: string): Promise<User[]> { 
    return Array.from(this.users.values()).filter(u => u.parentAccountId === parentId);
  }
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.verificationToken === token);
  }

  // ===== REPORTS =====
  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async updateReport(id: string, report: Partial<Report>): Promise<Report | undefined> {
    const existing = this.reports.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...report, updatedAt: new Date() };
    this.reports.set(id, updated);
    return updated;
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const newReport = { ...report, id: randomUUID(), createdAt: new Date() } as Report;
    this.reports.set(newReport.id, newReport);
    return newReport;
  }

  async listReportsByCondo(condoId: string): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(r => r.condoId === condoId);
  }
  // ... other MemStorage methods
}

// Using PostgresStorage instead of MemStorage for persistent data
export const storage = new PostgresStorage();
