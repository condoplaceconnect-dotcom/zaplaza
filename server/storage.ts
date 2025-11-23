import { type User, type InsertUser, type Condominium, type InsertCondominium, type Store, type InsertStore, type Product, type InsertProduct, type DeliveryPerson, type InsertDeliveryPerson, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsersByRole(role: string): Promise<User[]>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private condominiums: Map<string, Condominium>;
  private stores: Map<string, Store>;
  private products: Map<string, Product>;
  private deliveryPersons: Map<string, DeliveryPerson>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.condominiums = new Map();
    this.stores = new Map();
    this.products = new Map();
    this.deliveryPersons = new Map();
    this.orders = new Map();

    // Criar usuário admin de teste
    this.initializeTestData();
  }

  private async initializeTestData() {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser: User = {
      id: "admin-001",
      username: "admin",
      password: adminPassword,
      role: "admin",
      condoId: null,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // ✅ Criar condomínio oficial: Acqua Sena
    const acquaSena: Condominium = {
      id: "condo-acqua-sena",
      name: "Condominio Acqua Sena",
      address: "Rua Itamar de Mattos Maia, 476",
      city: "Canoas",
      state: "RS",
      zipCode: "92320-260",
      units: 0, // será preenchido depois
      phone: null,
      email: null,
      description: "Condomínio residencial Acqua Sena - Servidor Primário CondoPlace",
      image: null,
      status: "approved",
      createdAt: new Date(),
    };
    this.condominiums.set(acquaSena.id, acquaSena);
  }

  // ===== USERS =====
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

  async listUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter((u) => u.role === role);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // ===== CONDOMINIUMS =====
  async getCondominium(id: string): Promise<Condominium | undefined> {
    return this.condominiums.get(id);
  }

  async listCondominiums(): Promise<Condominium[]> {
    return Array.from(this.condominiums.values()).filter((c) => c.status === "approved");
  }

  async listPendingCondominiums(): Promise<Condominium[]> {
    return Array.from(this.condominiums.values()).filter((c) => c.status === "pending");
  }

  async updateCondominium(id: string, updates: Partial<Condominium>): Promise<Condominium | undefined> {
    const condo = this.condominiums.get(id);
    if (!condo) return undefined;
    const updated = { ...condo, ...updates };
    this.condominiums.set(id, updated);
    return updated;
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

  // ===== STORES =====
  async getStore(id: string): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoresByUser(userId: string): Promise<Store[]> {
    return Array.from(this.stores.values()).filter((s) => s.userId === userId);
  }

  async getStoresByCondo(condoId: string): Promise<Store[]> {
    return Array.from(this.stores.values());
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

  // ===== PRODUCTS =====
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

  // ===== DELIVERY PERSONS =====
  async getDeliveryPerson(id: string): Promise<DeliveryPerson | undefined> {
    return this.deliveryPersons.get(id);
  }

  async getDeliveryPersonsByUser(userId: string): Promise<DeliveryPerson[]> {
    return Array.from(this.deliveryPersons.values()).filter((dp) => dp.userId === userId);
  }

  async getDeliveryPersonsByCondo(condoId: string): Promise<DeliveryPerson[]> {
    return Array.from(this.deliveryPersons.values());
  }

  async createDeliveryPerson(insertPerson: InsertDeliveryPerson): Promise<DeliveryPerson> {
    const id = randomUUID();
    const person: DeliveryPerson = {
      ...insertPerson,
      id,
      image: insertPerson.image || null,
      phone: insertPerson.phone || null,
      block: insertPerson.block || null,
      unit: insertPerson.unit || null,
      status: insertPerson.status || "offline",
      rating: insertPerson.rating || null,
      totalDeliveries: insertPerson.totalDeliveries || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deliveryPersons.set(id, person);
    return person;
  }

  async updateDeliveryPerson(id: string, updates: Partial<DeliveryPerson>): Promise<DeliveryPerson | undefined> {
    const person = this.deliveryPersons.get(id);
    if (!person) return undefined;
    const updated = { ...person, ...updates, updatedAt: new Date() };
    this.deliveryPersons.set(id, updated);
    return updated;
  }

  // ===== ORDERS =====
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByResident(residentId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((o) => o.residentId === residentId);
  }

  async getOrdersByStore(storeId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((o) => o.storeId === storeId);
  }

  async getOrdersByCondo(condoId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((o) => o.condoId === condoId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: insertOrder.status || "pending",
      deliveryPersonId: insertOrder.deliveryPersonId || null,
      notes: insertOrder.notes || null,
      deliveryAddress: insertOrder.deliveryAddress || null,
      tip: insertOrder.tip || null,
      rating: insertOrder.rating || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updated = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
