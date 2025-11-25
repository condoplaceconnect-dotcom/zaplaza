
import { db } from "./db";
import { eq, and, desc, or, not, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { IStorage } from "./storage";
import type {
    User, InsertUser, Condominium, InsertCondominium, MarketplaceItem, InsertMarketplaceItem,
    Loan, LoanRequest, InsertLoanRequest, LoanOffer, Service, InsertService,
    Chat, Message, ChatParticipant, LostAndFoundItem, InsertLostAndFoundItem
} from "@shared/schema";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class PostgresStorage implements IStorage {

    async getUser(id: string): Promise<User | undefined> {
        return db.query.users.findFirst({ where: eq(schema.users.id, id), with: { condo: true } });
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        return db.query.users.findFirst({ where: eq(schema.users.email, email) });
    }

    async createUser(user: InsertUser, inviteCode: string): Promise<User> {
        const condo = await this.getCondominiumByInviteCode(inviteCode);
        if (!condo) {
        throw new Error("Código de convite inválido ou expirado.");
        }
        if (condo.status !== 'approved') {
            throw new Error("O condomínio associado a este convite ainda não foi aprovado.");
        }

        const existingUser = await this.getUserByEmail(user.email);
        if (existingUser) {
        throw new Error("Um usuário com este e-mail já existe.");
        }

        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        
        const [createdUser] = await db.insert(schema.users).values({
        ...user,
        password: hashedPassword,
        condoId: condo.id,
        role: 'resident',
        }).returning();

        return createdUser;
    }

    async listUsersByCondo(condoId: string): Promise<User[]> {
        return db.query.users.findMany({
            where: eq(schema.users.condoId, condoId),
        });
    }

    async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
        const [updated] = await db.update(schema.users).set(data).where(eq(schema.users.id, id)).returning();
        return updated;
    }

    async getUserByVerificationToken(token: string): Promise<User | undefined> {
        return db.query.users.findFirst({ where: eq(schema.users.verificationToken, token) });
    }

    async getCondominium(id: string): Promise<Condominium | undefined> {
        return db.query.condominiums.findFirst({ where: eq(schema.condominiums.id, id) });
    }
    
    async getCondominiumByInviteCode(inviteCode: string): Promise<Condominium | undefined> {
        return db.query.condominiums.findFirst({ where: eq(schema.condominiums.inviteCode, inviteCode) });
    }

    async listApprovedCondominiums(): Promise<Condominium[]> {
        return db.query.condominiums.findMany({ where: eq(schema.condominiums.status, 'approved') });
    }

    async listPendingCondominiums(): Promise<Condominium[]> {
        return db.query.condominiums.findMany({ where: eq(schema.condominiums.status, 'pending') });
    }

    async createCondominium(condo: InsertCondominium & { inviteCode: string }): Promise<Condominium> {
        const [created] = await db.insert(schema.condominiums).values(condo).returning();
        return created;
    }

    async updateCondominium(id: string, data: Partial<Condominium>): Promise<Condominium | undefined> {
        const [updated] = await db.update(schema.condominiums).set(data).where(eq(schema.condominiums.id, id)).returning();
        return updated;
    }

    async approveCondominium(id: string): Promise<Condominium | undefined> {
        const [approved] = await db.update(schema.condominiums).set({ status: 'approved' }).where(eq(schema.condominiums.id, id)).returning();
        return approved;
    }

    async listMarketplaceItems(condoId: string): Promise<MarketplaceItem[]> {
        return db.query.marketplaceItems.findMany({
            where: eq(schema.marketplaceItems.condoId, condoId),
            orderBy: desc(schema.marketplaceItems.createdAt),
            with: { seller: { columns: { name: true, block: true, unit: true } } }
        });
    }

    async createMarketplaceItem(item: Omit<InsertMarketplaceItem, 'id' | 'sellerId' | 'condoId'>, sellerId: string, condoId: string): Promise<MarketplaceItem> {
        const [created] = await db.insert(schema.marketplaceItems).values({ ...item, sellerId, condoId }).returning();
        return created;
    }

    async getMarketplaceItemDetails(itemId: string): Promise<MarketplaceItem | undefined> {
        return db.query.marketplaceItems.findFirst({
            where: eq(schema.marketplaceItems.id, itemId),
            with: { seller: { columns: { name: true } } }
        });
    }

    async updateMarketplaceItem(itemId: string, item: Partial<InsertMarketplaceItem>, sellerId: string): Promise<MarketplaceItem> {
        const [updated] = await db.update(schema.marketplaceItems).set(item).where(and(eq(schema.marketplaceItems.id, itemId), eq(schema.marketplaceItems.sellerId, sellerId))).returning();
        if (!updated) throw new Error("Item not found or permission denied");
        return updated;
    }

    async deleteMarketplaceItem(itemId: string, sellerId: string): Promise<{ id: string }> {
        const [deleted] = await db.delete(schema.marketplaceItems).where(and(eq(schema.marketplaceItems.id, itemId), eq(schema.marketplaceItems.sellerId, sellerId))).returning({ id: schema.marketplaceItems.id });
        if (!deleted) throw new Error("Item not found or permission denied");
        return deleted;
    }
    
    async listSellers(condoId: string): Promise<any[]> { return []; }
    
    async listServices(options: { condoId: string; userId?: string }): Promise<Service[]> {
        return db.query.services.findMany({
            where: eq(schema.services.condoId, options.condoId),
            orderBy: desc(schema.services.createdAt),
            with: {
                user: { columns: { name: true, block: true, unit: true } }
            }
        });
    }

    async createService(service: Omit<InsertService, "id" | "userId" | "condoId">, userId: string, condoId: string): Promise<Service> {
        const [created] = await db.insert(schema.services).values({ ...service, userId, condoId }).returning();
        return created;
    }
    async updateService(id: string, service: Partial<Omit<InsertService, "id" | "userId" | "condoId">>, userId: string): Promise<Service> {
        const [updated] = await db.update(schema.services).set(service).where(and(eq(schema.services.id, id), eq(schema.services.userId, userId))).returning();
        return updated;
    }
    async deleteService(id: string, userId: string): Promise<{ id: string; }> {
        const [deleted] = await db.delete(schema.services).where(and(eq(schema.services.id, id), eq(schema.services.userId, userId))).returning({ id: schema.services.id });
        return deleted;
    }

    // ===== LOST & FOUND IMPLEMENTATION =====
    async createLostAndFoundItem(item: Omit<InsertLostAndFoundItem, 'id' | 'userId' | 'condoId'>, userId: string, condoId: string): Promise<LostAndFoundItem> {
        const [created] = await db.insert(schema.lostAndFoundItems).values({ ...item, userId, condoId }).returning();
        return created;
    }

    async listLostAndFoundItems(condoId: string): Promise<LostAndFoundItem[]> {
        return db.query.lostAndFoundItems.findMany({
            where: eq(schema.lostAndFoundItems.condoId, condoId),
            orderBy: desc(schema.lostAndFoundItems.createdAt),
            with: {
                user: { columns: { name: true, block: true, unit: true } }
            }
        });
    }

    // ... (rest of the file is the same)
    // async createReport(report: schema.InsertReport): Promise<schema.Report> {
    //     const [created] = await db.insert(schema.reports).values(report).returning();
    //     return created;
    // }
    // async listReportsByCondo(condoId: string): Promise<schema.Report[]> {
    //     return db.query.reports.findMany({ where: eq(schema.reports.condoId, condoId) });
    // }
    // async getReport(id: string): Promise<schema.Report | undefined> {
    //     return db.query.reports.findFirst({ where: eq(schema.reports.id, id) });
    // }
    // async updateReport(id: string, report: Partial<schema.Report>): Promise<schema.Report | undefined> {
    //     const [updated] = await db.update(schema.reports).set(report).where(eq(schema.reports.id, id)).returning();
    //     return updated;
    // }

    async createLoanRequest(data: Omit<InsertLoanRequest, 'id' | 'requesterId' | 'condoId'>, requesterId: string, condoId: string): Promise<LoanRequest> {
        const [created] = await db.insert(schema.loanRequests).values({ ...data, requesterId, condoId }).returning();
        return created;
    }

    async listOpenLoanRequests(condoId: string, userId: string): Promise<any[]> {
        return db.query.loanRequests.findMany({
            where: and(eq(schema.loanRequests.condoId, condoId), eq(schema.loanRequests.status, 'open'), not(eq(schema.loanRequests.requesterId, userId))),
            with: { requester: { columns: { name: true } } }
        });
    }

    async getLoanRequestDetails(requestId: string): Promise<any | undefined> {
        return db.query.loanRequests.findFirst({
            where: eq(schema.loanRequests.id, requestId),
            with: { requester: { columns: { name: true } }, offers: { with: { offerer: { columns: { name: true } } } } }
        });
    }

    async createLoanOffer(requestId: string, offererId: string): Promise<LoanOffer> {
        const [created] = await db.insert(schema.loanOffers).values({ loanRequestId: requestId, offererId }).returning();
        return created;
    }

    async createLoanAgreement(data: { offerId: string; agreedReturnDate: Date; }, requesterId: string): Promise<Loan> {
        return db.transaction(async (tx) => {
            const offer = await tx.query.loanOffers.findFirst({
                where: eq(schema.loanOffers.id, data.offerId),
                with: { loanRequest: true }
            });

            if (!offer || !offer.loanRequest || offer.loanRequest.requesterId !== requesterId) {
                throw new Error("Offer not found or permission denied.");
            }
            if (offer.status !== 'pending') {
                throw new Error("This offer is no longer available.");
            }

            const [loan] = await tx.insert(schema.loans).values({
                loanRequestId: offer.loanRequestId,
                offerId: data.offerId,
                ownerId: offer.offererId,
                borrowerId: offer.loanRequest.requesterId,
                agreedReturnDate: data.agreedReturnDate,
                status: 'pending_handover',
                digitalTermUrl: '',
            }).returning();

            const [chat] = await tx.insert(schema.chats).values({ loanId: loan.id }).returning();
            
            await tx.insert(schema.chatParticipants).values([
                { chatId: chat.id, userId: loan.ownerId },
                { chatId: chat.id, userId: loan.borrowerId },
            ]);

            await tx.update(schema.loanRequests).set({ status: 'fulfilled' }).where(eq(schema.loanRequests.id, offer.loanRequestId));
            await tx.update(schema.loanOffers).set({ status: 'accepted' }).where(eq(schema.loanOffers.id, data.offerId));
            await tx.update(schema.loanOffers).set({ status: 'rejected' })
                .where(and(
                    eq(schema.loanOffers.loanRequestId, offer.loanRequestId),
                    not(eq(schema.loanOffers.id, data.offerId))
                ));

            return loan;
        });
    }
    
    async getLoanDetails(loanId: string): Promise<any | undefined> { 
        return db.query.loans.findFirst({ 
            where: eq(schema.loans.id, loanId),
            with: {
                loanRequest: true,
                borrower: { columns: { name: true } },
                owner: { columns: { name: true } }
            }
        });
     }
    async getUserLoans(userId: string): Promise<Loan[]> { 
        return db.query.loans.findMany({
            where: or(eq(schema.loans.borrowerId, userId), eq(schema.loans.ownerId, userId))
        });
    }
    async confirmHandover(loanId: string, ownerId: string, payload: any): Promise<Loan> { return {} as Loan; }
    async initiateReturn(loanId: string, borrowerId: string, payload: any): Promise<Loan> { return {} as Loan; }
    async confirmReturnByOwner(loanId: string, ownerId: string): Promise<Loan> { return {} as Loan; }

    async createChat(participantIds: string[], loanId?: string): Promise<Chat> {
        return db.transaction(async (tx) => {
            const [chat] = await tx.insert(schema.chats).values({ loanId }).returning();
            const participants = participantIds.map(userId => ({ chatId: chat.id, userId }));
            await tx.insert(schema.chatParticipants).values(participants);
            return chat;
        });
    }

    async getUserChats(userId: string): Promise<any[]> {
        const userChats = await db.query.chatParticipants.findMany({
            where: eq(schema.chatParticipants.userId, userId),
            with: {
                chat: {
                    with: {
                        participants: {
                            with: {
                                user: { columns: { id: true, name: true, block: true, unit: true } }
                            }
                        },
                        loan: {
                           with: { loanRequest: { columns: { title: true } } }
                        }
                    }
                }
            }
        });
        
        return userChats.map(pc => ({
            chatId: pc.chatId,
            loanId: pc.chat.loanId,
            loanTitle: pc.chat.loan?.loanRequest.title,
            createdAt: pc.chat.createdAt,
            otherParticipant: pc.chat.participants
                            .filter(p => p.userId !== userId)
                            .map(p => p.user)[0] 
        }));
    }

    async isUserParticipantInChat(chatId: string, userId: string): Promise<boolean> {
        const participant = await db.query.chatParticipants.findFirst({
            where: and(eq(schema.chatParticipants.chatId, chatId), eq(schema.chatParticipants.userId, userId))
        });
        return !!participant;
    }

    async getChatMessages(chatId: string): Promise<Message[]> {
        return db.query.messages.findMany({
            where: eq(schema.messages.chatId, chatId),
            orderBy: desc(schema.messages.createdAt),
            with: {
                sender: { columns: { id: true, name: true } }
            }
        });
    }
}
