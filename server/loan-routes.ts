import { Router } from 'express';
import { storage } from './storage';
import { authenticateToken, AuthenticatedRequest } from './auth';
import { z } from 'zod';

const router = Router();

// ===== Zod Schemas for Loan System Validation =====

const loanRequestSchema = z.object({
    itemName: z.string().min(2, "O nome do item é muito curto."),
    description: z.string().min(10, "A descrição precisa ter pelo menos 10 caracteres."),
    duration: z.string().min(3, "A duração deve ser especificada (ex: 2 dias)."),
});

const loanAgreementSchema = z.object({
    offerId: z.string(),
    agreedReturnDate: z.coerce.date(), // Coerces string to Date
    digitalTerm: z.string().min(20, "O termo digital deve ter pelo menos 20 caracteres."),
});

const handoverPayloadSchema = z.object({
    handoverPhotos: z.array(z.string().url()).optional(),
    conditionNotes: z.string().optional(),
});

const returnPayloadSchema = z.object({
    returnPhotos: z.array(z.string().url()).optional(),
    conditionNotes: z.string().optional(),
});


// ===== LOAN REQUESTS (Seeking an item) =====

// POST /api/loans/requests - Create a new loan request
router.post('/loans/requests', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const validation = loanRequestSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        const request = await storage.createLoanRequest(validation.data, req.user!.userId, req.user!.condoId);
        res.status(201).json(request);
    } catch (error) {
        next(error);
    }
});

// GET /api/loans/requests - List all open loan requests in the condo
router.get('/loans/requests', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const requests = await storage.listOpenLoanRequests(req.user!.condoId, req.user!.userId);
        res.json(requests);
    } catch (error) {
        next(error);
    }
});

// GET /api/loans/requests/:id - Get details of a specific loan request
router.get('/loans/requests/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const request = await storage.getLoanRequestDetails(req.params.id);
        if (!request || request.condoId !== req.user!.condoId) {
            return res.status(404).json({ message: 'Pedido de empréstimo não encontrado.' });
        }
        res.json(request);
    } catch (error) {
        next(error);
    }
});

// ===== LOAN OFFERS (Offering to lend an item) =====

// POST /api/loans/requests/:id/offers - Make an offer on a loan request
router.post('/loans/requests/:id/offers', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const offer = await storage.createLoanOffer(req.params.id, req.user!.userId);
        res.status(201).json(offer);
    } catch (error) {
        next(error);
    }
});


// ===== LOANS (Formalized agreements) =====

// POST /api/loans - Create a new loan agreement from an accepted offer
router.post('/loans', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const validation = loanAgreementSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        const loan = await storage.createLoanAgreement(validation.data, req.user!.userId);
        res.status(201).json(loan);
    } catch (error) {
        next(error);
    }
});

// GET /api/loans/:id - Get details for a specific loan
router.get('/loans/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const loan = await storage.getLoanDetails(req.params.id);
        // Add logic to ensure user is part of this loan (owner or borrower)
        res.json(loan);
    } catch (error) {
        next(error);
    }
});

// POST /api/loans/:id/handover - Owner confirms they handed over the item
router.post('/loans/:id/handover', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const validation = handoverPayloadSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        const loan = await storage.confirmHandover(req.params.id, req.user!.userId, validation.data);
        res.json(loan);
    } catch (error) {
        next(error);
    }
});

// POST /api/loans/:id/return - Borrower initiates the return process
router.post('/loans/:id/return', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const validation = returnPayloadSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        const loan = await storage.initiateReturn(req.params.id, req.user!.userId, validation.data);
        res.json(loan);
    } catch (error) {
        next(error);
    }
});

// POST /api/loans/:id/return-confirm - Owner confirms they received the returned item
router.post('/loans/:id/return-confirm', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const loan = await storage.confirmReturnByOwner(req.params.id, req.user!.userId);
        res.json(loan);
    } catch (error) {
        next(error);
    }
});


export const loanRoutes = router;
