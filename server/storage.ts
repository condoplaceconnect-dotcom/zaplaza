// Re-export schema values for other modules to use
export { 
    users, condominiums, stores, products, deliveryPersons, orders, marketplaceItems, reports, 
    loanRequests, loanOffers, loans, services, chats, messages, lostAndFoundItems 
} from "@shared/schema";

// Import types for the IStorage interface definition
import type { 
    User, InsertUser, Condominium, InsertCondominium, Store, InsertStore, 
    Product, InsertProduct, DeliveryPerson, InsertDeliveryPerson, Order, InsertOrder, 
    MarketplaceItem, InsertMarketplaceItem, Report, InsertReport, 
    Loan, LoanRequest, InsertLoanRequest, LoanOffer, 
    Service, InsertService,
    Chat, InsertChat, Message, InsertMessage, LostAndFoundItem, InsertLostAndFoundItem
} from "@shared/schema";
    
import { and, eq, desc, not } from "drizzle-orm";
import { PostgresStorage } from "./postgres-storage";

// The IStorage interface defines all data access methods for the application.
// This ensures a consistent data layer, whether using in-memory or a persistent database.
export interface IStorage {
  // Users & Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  // createUser(user: InsertUser, inviteCode: string): Promise<User>; // Old signature
  createUser(user: InsertUser): Promise<User>; // New signature
  listUsersByCondo(condoId: string): Promise<User[]>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  verifyUserEmail(token: string): Promise<User>; // New method for email verification

  // Condominiums
  getCondominium(id: string): Promise<Condominium | undefined>;
  getCondominiumByInviteCode(inviteCode: string): Promise<Condominium | undefined>;
  listApprovedCondominiums(): Promise<Condominium[]>;
  listPendingCondominiums(): Promise<Condominium[]>;
  createCondominium(condo: InsertCondominium & { inviteCode: string }): Promise<Condominium>;
  updateCondominium(id: string, condo: Partial<Condominium>): Promise<Condominium | undefined>;
  approveCondominium(id: string): Promise<Condominium | undefined>;

  // Marketplace
  listMarketplaceItems(options: { condoId: string, category?: string, sortBy?: 'recent' | 'price_asc', page?: number }): Promise<MarketplaceItem[]>;
  createMarketplaceItem(item: Omit<InsertMarketplaceItem, 'id' | 'sellerId' | 'condoId'>, sellerId: string, condoId: string): Promise<MarketplaceItem>;
  getMarketplaceItemDetails(itemId: string): Promise<MarketplaceItem | undefined>;
  updateMarketplaceItem(itemId: string, item: Partial<InsertMarketplaceItem>, sellerId: string): Promise<MarketplaceItem>;
  deleteMarketplaceItem(itemId: string, sellerId: string): Promise<{ id: string }>;
  listSellers(condoId: string): Promise<any[]>;

  // Services
  listServices(options: { condoId: string; userId?: string }): Promise<Service[]>;
  createService(service: Omit<InsertService, 'id' | 'userId' | 'condoId'>, userId: string, condoId: string): Promise<Service>;
  updateService(id: string, service: Partial<Omit<InsertService, 'id' | 'userId' | 'condoId'>>, userId: string): Promise<Service>;
  deleteService(id: string, userId: string): Promise<{ id: string }>;

  // Lost & Found
  createLostAndFoundItem(item: Omit<InsertLostAndFoundItem, 'id' | 'userId' | 'condoId'>, userId: string, condoId: string): Promise<LostAndFoundItem>;
  listLostAndFoundItems(condoId: string): Promise<LostAndFoundItem[]>;
  
  // Reports
  createReport(report: InsertReport): Promise<Report>;
  listReportsByCondo(condoId: string): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  updateReport(id: string, report: Partial<Report>): Promise<Report | undefined>;

  // Loan System
  createLoanRequest(data: Omit<InsertLoanRequest, 'id' | 'requesterId' | 'condoId'>, requesterId: string, condoId: string): Promise<LoanRequest>;
  listOpenLoanRequests(condoId: string, userId: string): Promise<any[]>;
  getLoanRequestDetails(requestId: string): Promise<any | undefined>;
  createLoanOffer(requestId: string, offererId: string): Promise<LoanOffer>;
  createLoanAgreement(data: { offerId: string; agreedReturnDate: Date; digitalTerm: string; }, requesterId: string): Promise<Loan>;
  getLoanDetails(loanId: string, userId: string): Promise<any | undefined>;
  getUserLoans(userId: string): Promise<Loan[]>;
  confirmHandover(loanId: string, ownerId: string, payload: { handoverPhotos?: string[]; conditionNotes?: string; }): Promise<Loan>;
  initiateReturn(loanId: string, borrowerId: string, payload: { returnPhotos?: string[]; conditionNotes?: string; }): Promise<Loan>;
  confirmReturnByOwner(loanId: string, ownerId: string): Promise<Loan>;

  // Chat System
  createChat(participantIds: string[], loanId?: string): Promise<Chat>;
  getUserChats(userId: string): Promise<any[]>;
isUserParticipantInChat(chatId: string, userId: string): Promise<boolean>;
  getChatMessages(chatId: string): Promise<Message[]>;
}

// Using PostgresStorage for persistent data.
export const storage = new PostgresStorage();
