import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { authMiddleware, AuthenticatedRequest } from "./auth";
import { 
    insertLoanRequestSchema, 
    createLoanAgreementSchema,
    insertServiceSchema,
    insertMarketplaceItemSchema,
    insertLostAndFoundItemSchema
} from "@shared/schema";

// ===== LOAN ROUTES (EMPRESTA AÍ) =====
const loanRouter = Router();
loanRouter.use(authMiddleware);

loanRouter.post("/loan-requests", async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const validation = insertLoanRequestSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });
    const newRequest = await storage.createLoanRequest(validation.data, user.userId, user.condoId! );
    res.status(201).json(newRequest);
});

loanRouter.get("/loan-requests", async (req: AuthenticatedRequest, res: Response) => {
    const requests = await storage.listOpenLoanRequests(req.user!.condoId!, req.user!.userId);
    res.status(200).json(requests);
});

loanRouter.get("/loan-requests/:id", async (req: AuthenticatedRequest, res: Response) => {
    const details = await storage.getLoanRequestDetails(req.params.id);
    if (!details) return res.status(404).json({ error: "Pedido não encontrado." });
    res.status(200).json(details);
});

loanRouter.post("/loan-requests/:id/offers", async (req: AuthenticatedRequest, res: Response) => {
    const newOffer = await storage.createLoanOffer(req.params.id, req.user!.userId);
    res.status(201).json(newOffer);
});

loanRouter.post("/loans/agreements", async (req: AuthenticatedRequest, res: Response) => {
    const validation = createLoanAgreementSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });
    const finalLoan = await storage.createLoanAgreement(validation.data, req.user!.userId);
    res.status(201).json(finalLoan);
});

loanRouter.get("/my-loans", async (req: AuthenticatedRequest, res: Response) => {
    const loans = await storage.getUserLoans(req.user!.userId);
    res.status(200).json(loans);
});

loanRouter.get("/loans/:id", async (req: AuthenticatedRequest, res: Response) => {
    const loan = await storage.getLoanDetails(req.params.id, req.user!.userId);
    if (!loan) return res.status(404).json({ error: "Empréstimo não encontrado ou acesso negado." });
    res.status(200).json(loan);
});

// ===== SERVICE ROUTES (ZAP BICO) =====
const servicesRouter = Router();
servicesRouter.use(authMiddleware);

servicesRouter.get('/services', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.query.userId as string | undefined;
    const services = await storage.listServices({ condoId: req.user!.condoId!, userId });
    res.json(services);
});

servicesRouter.post('/services', async (req: AuthenticatedRequest, res: Response) => {
    const validation = insertServiceSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });
    const service = await storage.createService(validation.data, req.user!.userId, req.user!.condoId!);
    res.status(201).json(service);
});

servicesRouter.patch('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
    const service = await storage.updateService(req.params.id, req.body, req.user!.userId);
    res.json(service);
});

servicesRouter.delete('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
    await storage.deleteService(req.params.id, req.user!.userId);
    res.status(204).send();
});

// ===== MARKETPLACE ROUTES (ACHADINHOS) =====
const marketplaceRouter = Router();
marketplaceRouter.use(authMiddleware);

marketplaceRouter.get('/marketplace', async (req: AuthenticatedRequest, res: Response) => {
    const { category, sortBy, page } = req.query;
    const options = {
        condoId: req.user!.condoId!,
        category: category as string | undefined,
        sortBy: sortBy as 'recent' | 'price_asc' | undefined,
        page: page ? parseInt(page as string) : undefined,
    };
    const items = await storage.listMarketplaceItems(options);
    res.json(items);
});

marketplaceRouter.get('/marketplace/:id', async (req: AuthenticatedRequest, res: Response) => {
    const item = await storage.getMarketplaceItemDetails(req.params.id);
    if(!item) return res.status(404).json({error: "Item not found"});
    res.json(item);
});

marketplaceRouter.post('/marketplace', async (req: AuthenticatedRequest, res: Response) => {
    const validation = insertMarketplaceItemSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });
    const item = await storage.createMarketplaceItem(validation.data, req.user!.userId, req.user!.condoId!);
    res.status(201).json(item);
});

marketplaceRouter.patch('/marketplace/:id', async (req: AuthenticatedRequest, res: Response) => {
    const item = await storage.updateMarketplaceItem(req.params.id, req.body, req.user!.userId);
    res.json(item);
});

marketplaceRouter.delete('/marketplace/:id', async (req: AuthenticatedRequest, res: Response) => {
    await storage.deleteMarketplaceItem(req.params.id, req.user!.userId);
    res.status(204).send();
});

// ===== LOST & FOUND ROUTES (ACHADOS E PERDIDOS) =====
const lostAndFoundRouter = Router();
lostAndFoundRouter.use(authMiddleware);

lostAndFoundRouter.get('/lost-and-found', async (req: AuthenticatedRequest, res: Response) => {
    const items = await storage.listLostAndFoundItems(req.user!.condoId!);
    res.json(items);
});

lostAndFoundRouter.post('/lost-and-found', async (req: AuthenticatedRequest, res: Response) => {
    const validation = insertLostAndFoundItemSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: validation.error.flatten() });
    const item = await storage.createLostAndFoundItem(validation.data, req.user!.userId, req.user!.condoId!);
    res.status(201).json(item);
});

export {
    loanRouter,
    servicesRouter,
    marketplaceRouter,
    lostAndFoundRouter
};