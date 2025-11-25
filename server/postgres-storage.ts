import { db } from "./db";
import { eq, and, desc, or } from "drizzle-orm";
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
  Loan,
  InsertLoan
} from "@shared/schema";
import type { IStorage } from "./storage";

export class PostgresStorage implements IStorage {

  // ... (previous implementations for users, condos, stores, etc.)

  // ===== LOANS =====

  async createLoan(loan: InsertLoan): Promise<Loan> {
    const [created] = await db.insert(schema.loans).values(loan).returning();
    return created;
  }

  async getLoan(id: string): Promise<Loan | undefined> {
    return await db.query.loans.findFirst({
      where: eq(schema.loans.id, id),
      with: {
        item: true,
        borrower: { columns: { name: true, block: true, unit: true } },
        owner: { columns: { name: true, block: true, unit: true } },
      }
    });
  }

  async getLoansByBorrower(borrowerId: string): Promise<Loan[]> {
    return await db.query.loans.findMany({
      where: eq(schema.loans.borrowerId, borrowerId),
      orderBy: desc(schema.loans.createdAt),
      with: {
        item: true,
        owner: { columns: { name: true, block: true, unit: true } },
      }
    });
  }

  async getLoansByOwner(ownerId: string): Promise<Loan[]> {
    return await db.query.loans.findMany({
      where: eq(schema.loans.ownerId, ownerId),
      orderBy: desc(schema.loans.createdAt),
      with: {
        item: true,
        borrower: { columns: { name: true, block: true, unit: true } },
      }
    });
  }

  async updateLoanStatus(id: string, status: string, userId: string): Promise<Loan | undefined> {
    const loan = await this.getLoan(id);
    if (!loan) throw new Error("Empréstimo não encontrado.");

    // Permission check
    if (status === 'active' || status === 'cancelled' || status === 'rejected') {
        if (loan.ownerId !== userId) throw new Error("Apenas o proprietário pode atualizar para este status.");
    } else if (status === 'returned') {
        if (loan.borrowerId !== userId) throw new Error("Apenas o mutuário pode marcar como devolvido.");
    } else {
        throw new Error(`Status de atualização inválido: ${status}`);
    }

    const updateData: Partial<Loan> = { status };
    if (status === 'returned') {
        updateData.actualReturnDate = new Date();
    }

    const [updated] = await db.update(schema.loans)
        .set(updateData)
        .where(eq(schema.loans.id, id))
        .returning();

    return updated;
  }

  // ===== EXISTING METHODS =====
  async listUsers(): Promise<User[]> { /*...*/ return []; }
  async getUser(id: string): Promise<User | undefined> { /*...*/ return undefined; }
  async getUserByUsername(username: string): Promise<User | undefined> { /*...*/ return undefined; }
  async getUserByVerificationToken(token: string): Promise<User | undefined> { /*...*/ return undefined; }
  async createUser(user: InsertUser): Promise<User> { throw new Error("Not implemented"); }
  async listUsersByRole(role: string): Promise<User[]> {return []}
  async listUsersByCondo(condoId: string): Promise<User[]> {return []}
  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {return undefined}
  async deleteUser(id: string): Promise<boolean> {return false}
  async getDependentsByParentId(parentId: string): Promise<User[]> {return []}
  async getCondominium(id: string): Promise<Condominium | undefined> {return undefined}
  async getCondominiumByInviteCode(inviteCode: string): Promise<Condominium | undefined> {return undefined}
  async listCondominiums(): Promise<Condominium[]> {return []}
  async listPendingCondominiums(): Promise<Condominium[]> {return []}
  async createCondominium(condo: InsertCondominium & { inviteCode: string }): Promise<Condominium> { throw new Error("not implemented") }
  async updateCondominium(id: string, condo: Partial<Condominium>): Promise<Condominium | undefined> { return undefined; }
  async getStore(id: string): Promise<Store | undefined> {return undefined}
  async getStoreByUserId(userId: string): Promise<Store | undefined> {return undefined}
  async getStoresByUser(userId: string): Promise<Store[]> {return []}
  async getStoresByCondo(condoId: string): Promise<Store[]> {return []}
  async createStore(store: InsertStore): Promise<Store> {throw new Error("not implemented")}
  async updateStore(id: string, store: Partial<Store>): Promise<Store | undefined> {return undefined}
  async deleteStore(id: string): Promise<boolean> {return false}
  async getProduct(id: string): Promise<Product | undefined> {return undefined}
  async getProductsByStore(storeId: string): Promise<Product[]> {return []}
  async createProduct(product: InsertProduct): Promise<Product> {throw new Error("not implemented")}
  async updateProduct(id: string, product: Partial<Product>): Promise<Product | undefined> {return undefined}
  async deleteProduct(id: string): Promise<boolean> {return false}
  async getDeliveryPerson(id: string): Promise<DeliveryPerson | undefined> {return undefined}
  async getDeliveryPersonsByUser(userId: string): Promise<DeliveryPerson[]> {return []}
  async getDeliveryPersonsByCondo(condoId: string): Promise<DeliveryPerson[]> {return []}
  async createDeliveryPerson(person: InsertDeliveryPerson): Promise<DeliveryPerson> {throw new Error("not implemented")}
  async updateDeliveryPerson(id: string, person: Partial<DeliveryPerson>): Promise<DeliveryPerson | undefined> {return undefined}
  async getOrder(id: string): Promise<Order | undefined> {return undefined}
  async getOrdersByResident(residentId: string): Promise<Order[]> {return []}
  async getOrdersByStore(storeId: string): Promise<Order[]> {return []}
  async getOrdersByCondo(condoId: string): Promise<Order[]> {return []}
  async createOrder(order: InsertOrder): Promise<Order> {throw new Error("not implemented")}
  async updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined> {return undefined}
  async getMarketplaceItem(id: string): Promise<MarketplaceItem | undefined> {return undefined}
  async getMarketplaceItemsByCondo(condoId: string): Promise<MarketplaceItem[]> {return []}
  async getMarketplaceItemsByUser(userId: string): Promise<MarketplaceItem[]> {return []}
  async createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem> {throw new Error("not implemented")}
  async updateMarketplaceItem(id: string, item: Partial<MarketplaceItem>): Promise<MarketplaceItem | undefined> {return undefined}
  async deleteMarketplaceItem(id: string): Promise<boolean> {return false}
  async getReport(id: string): Promise<Report | undefined> {return undefined}
  async createReport(report: InsertReport): Promise<Report> {throw new Error("not implemented")}
  async listReportsByCondo(condoId: string): Promise<Report[]> {return []}
  async updateReport(id: string, report: Partial<Report>): Promise<Report | undefined> {return undefined}
}