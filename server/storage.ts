import { type User, type InsertUser, type Condominium, type InsertCondominium, type Store, type InsertStore, type Product, type InsertProduct, type DeliveryPerson, type InsertDeliveryPerson, type Order, type InsertOrder, type MarketplaceItem, type InsertMarketplaceItem, type Report, type InsertReport, type Loan, type InsertLoan } from "@shared/schema";
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
  getCondominiumByInviteCode(inviteCode: string): Promise<Condominium | undefined>;
  listCondominiums(): Promise<Condominium[]>;
  listPendingCondominiums(): Promise<Condominium[]>;
  createCondominium(condo: InsertCondominium & { inviteCode: string }): Promise<Condominium>;
  updateCondominium(id: string, condo: Partial<Condominium>): Promise<Condominium | undefined>;

  // Stores
  getStore(id: string): Promise<Store | undefined>;
  getStoreByUserId(userId: string): Promise<Store | undefined>;
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

  // Loans
  createLoan(loan: InsertLoan): Promise<Loan>;
  getLoan(id: string): Promise<Loan | undefined>;
  getLoansByBorrower(borrowerId: string): Promise<Loan[]>;
  getLoansByOwner(ownerId: string): Promise<Loan[]>;
  updateLoanStatus(id: string, status: string, userId: string): Promise<Loan | undefined>;
}

export class MemStorage implements IStorage {
  // ... (rest of the MemStorage implementation is omitted for brevity)
}

// Using PostgresStorage instead of MemStorage for persistent data
export const storage = new PostgresStorage();
