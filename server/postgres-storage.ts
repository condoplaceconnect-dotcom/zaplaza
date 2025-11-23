import { db } from "./db";
import { eq, and } from "drizzle-orm";
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
  LostAndFoundItem,
  InsertLostAndFoundItem,
  Report,
  InsertReport,
} from "@shared/schema";
import type { IStorage } from "./storage";
import * as bcrypt from "bcrypt";

export class PostgresStorage implements IStorage {
  constructor() {
    this.initializeTestData();
  }

  private async initializeTestData() {
    try {
      // Verificar se já existe o admin
      const existingAdmin = await db.query.users.findFirst({
        where: eq(schema.users.username, "admin"),
      });

      if (existingAdmin) {
        console.log("✅ Dados de teste já existem");
        return;
      }

      console.log("🌱 Criando dados de teste...");

      // ✅ Criar condomínio oficial: Acqua Sena
      const [acquaSena] = await db
        .insert(schema.condominiums)
        .values({
          id: "condo-acqua-sena",
          name: "Acqua Sena",
          address: "Rua Cairu 1755, Bairro Fatima",
          city: "Canoas",
          state: "RS",
          zipCode: "92200664",
          units: 460,
          description: "Condomínio residencial Acqua Sena",
          status: "approved",
        })
        .returning();

      // ✅ Criar usuário ADMIN
      const adminPassword = await bcrypt.hash("admin123", 10);
      await db.insert(schema.users).values({
        id: "admin-001",
        username: "admin",
        password: adminPassword,
        name: "Administrador",
        email: "admin@condoplace.com",
        phone: "+55 51 99999-9999",
        birthDate: "1990-01-01",
        block: "A",
        unit: "101",
        accountType: "adult",
        role: "admin",
        status: "active",
        condoId: acquaSena.id,
      });

      // ✅ Criar usuário VENDEDOR
      const vendorPassword = await bcrypt.hash("vendor123", 10);
      const [vendorUser] = await db
        .insert(schema.users)
        .values({
          username: "vendedor",
          password: vendorPassword,
          name: "João Silva",
          email: "vendedor@condoplace.com",
          phone: "+55 51 98888-8888",
          birthDate: "1985-05-15",
          block: "B",
          unit: "205",
          accountType: "adult",
          role: "vendor",
          status: "active",
          condoId: acquaSena.id,
        })
        .returning();

      // ✅ Criar LOJA do vendedor
      const [store] = await db
        .insert(schema.stores)
        .values({
          name: "Loja do João - Lanches & Bebidas",
          category: "Alimentação",
          userId: vendorUser.id,
          phone: "+55 51 98888-8888",
          email: "lojadojoao@condoplace.com",
          description: "Lanches, bebidas e petiscos para entrega no condomínio",
          status: "active",
        })
        .returning();

      // ✅ Criar PRODUTOS da loja
      await db.insert(schema.products).values([
        {
          name: "X-Burger Completo",
          price: "25.90",
          storeId: store.id,
          description:
            "Hambúrguer artesanal com queijo, alface, tomate, bacon e molho especial",
          category: "Lanches",
          ingredients:
            "Pão, carne 180g, queijo, alface, tomate, bacon, molho especial",
          available: true,
        },
        {
          name: "Coca-Cola 2L",
          price: "10.00",
          storeId: store.id,
          description: "Refrigerante Coca-Cola 2 litros gelada",
          category: "Bebidas",
          available: true,
        },
        {
          name: "Pizza Margherita",
          price: "45.00",
          storeId: store.id,
          description:
            "Pizza tradicional com molho de tomate, mussarela e manjericão",
          category: "Pizzas",
          ingredients: "Massa artesanal, molho de tomate, mussarela, manjericão",
          available: true,
        },
      ]);

      // ✅ Criar usuário CLIENTE/MORADOR
      const clientPassword = await bcrypt.hash("cliente123", 10);
      await db.insert(schema.users).values({
        username: "cliente",
        password: clientPassword,
        name: "Maria Santos",
        email: "maria@condoplace.com",
        phone: "+55 51 97777-7777",
        birthDate: "1995-08-20",
        block: "C",
        unit: "303",
        accountType: "adult",
        role: "resident",
        status: "active",
        condoId: acquaSena.id,
      });

      // ✅ Criar usuário PRESTADOR DE SERVIÇO
      const servicePassword = await bcrypt.hash("servico123", 10);
      await db.insert(schema.users).values({
        username: "prestador",
        password: servicePassword,
        name: "Carlos Pereira",
        email: "carlos@condoplace.com",
        phone: "+55 51 96666-6666",
        birthDate: "1988-03-10",
        block: "D",
        unit: "404",
        accountType: "adult",
        role: "service_provider",
        status: "active",
        condoId: acquaSena.id,
      });

      console.log("✅ Dados de teste criados com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao criar dados de teste:", error);
    }
  }

  // ===== USERS =====
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
    // Stores are linked to users, and users are linked to condos
    const users = await this.listUsersByCondo(condoId);
    const userIds = users.map((u) => u.id);
    
    const stores: Store[] = [];
    for (const userId of userIds) {
      const userStores = await this.getStoresByUser(userId);
      stores.push(...userStores);
    }
    return stores;
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
    // Similar to stores - delivery persons are linked via users
    const users = await this.listUsersByCondo(condoId);
    const userIds = users.map((u) => u.id);
    
    const deliveryPersons: DeliveryPerson[] = [];
    for (const userId of userIds) {
      const userDeliveryPersons = await this.getDeliveryPersonsByUser(userId);
      deliveryPersons.push(...userDeliveryPersons);
    }
    return deliveryPersons;
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
    item: Partial<MarketplaceItem>
  ): Promise<MarketplaceItem | undefined> {
    const [updated] = await db
      .update(schema.marketplaceItems)
      .set(item)
      .where(eq(schema.marketplaceItems.id, id))
      .returning();
    return updated;
  }

  async deleteMarketplaceItem(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.marketplaceItems)
      .where(eq(schema.marketplaceItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
