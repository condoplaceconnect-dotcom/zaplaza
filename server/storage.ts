import { type User, type InsertUser, type Condominium, type InsertCondominium, type Store, type InsertStore, type Product, type InsertProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCondominium(id: string): Promise<Condominium | undefined>;
  listCondominiums(): Promise<Condominium[]>;
  createCondominium(condo: InsertCondominium): Promise<Condominium>;
  getStore(id: string): Promise<Store | undefined>;
  getStoresByUser(userId: string): Promise<Store[]>;
  getStoresByCondo(condoId: string): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, store: Partial<Store>): Promise<Store | undefined>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByStore(storeId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private condominiums: Map<string, Condominium>;
  private stores: Map<string, Store>;
  private products: Map<string, Product>;

  constructor() {
    this.users = new Map();
    this.condominiums = new Map();
    this.stores = new Map();
    this.products = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "resident",
      condoId: insertUser.condoId || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getCondominium(id: string): Promise<Condominium | undefined> {
    return this.condominiums.get(id);
  }

  async listCondominiums(): Promise<Condominium[]> {
    return Array.from(this.condominiums.values()).filter((c) => c.status === "approved");
  }

  async createCondominium(insertCondo: InsertCondominium): Promise<Condominium> {
    const id = randomUUID();
    const condo: Condominium = {
      ...insertCondo,
      id,
      image: insertCondo.image || null,
      phone: insertCondo.phone || null,
      email: insertCondo.email || null,
      description: insertCondo.description || null,
      status: insertCondo.status || "pending",
      createdAt: new Date(),
    };
    this.condominiums.set(id, condo);
    return condo;
  }

  async getStore(id: string): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoresByUser(userId: string): Promise<Store[]> {
    return Array.from(this.stores.values()).filter((s) => s.userId === userId);
  }

  async getStoresByCondo(condoId: string): Promise<Store[]> {
    return Array.from(this.stores.values()).filter((s) => s.condoId === condoId);
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = randomUUID();
    const store: Store = {
      ...insertStore,
      id,
      image: insertStore.image || null,
      phone: insertStore.phone || null,
      email: insertStore.email || null,
      description: insertStore.description || null,
      status: insertStore.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.stores.set(id, store);
    return store;
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<Store | undefined> {
    const store = this.stores.get(id);
    if (!store) return undefined;
    const updated = { ...store, ...updates, updatedAt: new Date() };
    this.stores.set(id, updated);
    return updated;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.storeId === storeId);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      image: insertProduct.image || null,
      description: insertProduct.description || null,
      category: insertProduct.category || null,
      ingredients: insertProduct.ingredients || null,
      available: insertProduct.available !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }
}

export const storage = new MemStorage();
