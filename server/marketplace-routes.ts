import { Router } from 'express';
import { storage } from './storage';
import { authenticateToken, AuthenticatedRequest } from './auth';
import { z } from 'zod';

const router = Router();

// ===== Zod Schemas for Validation =====

const itemSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
    description: z.string().optional(),
    category: z.string().min(1, "A categoria é obrigatória."),
    price: z.number().positive("O preço deve ser um número positivo."),
    status: z.enum(["available", "sold"]).optional().default("available"),
    imageUrl: z.string().url("URL da imagem inválida").optional(),
});

const serviceSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
    description: z.string().optional(),
    category: z.string().min(1, "A categoria é obrigatória."),
    pricingType: z.enum(["fixed", "hourly"]),
    price: z.number().positive("O preço deve ser um número positivo."),
    status: z.enum(["active", "paused"]).optional().default("active"),
});


// ===== MARKETPLACE ITEMS ("Achadinhos") =====

// GET /api/marketplace/items - List all available items in the user's condo
router.get('/marketplace/items', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const items = await storage.listMarketplaceItems(req.user!.condoId);
        res.json(items);
    } catch (error) {
        next(error);
    }
});

// POST /api/marketplace/items - Create a new item listing
router.post('/marketplace/items', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const validation = itemSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        const item = await storage.createMarketplaceItem(validation.data, req.user!.userId, req.user!.condoId);
        res.status(201).json(item);
    } catch (error) {
        next(error);
    }
});

// GET /api/marketplace/items/:id - Get details for a specific item
router.get('/marketplace/items/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const item = await storage.getMarketplaceItemDetails(req.params.id);
        if (!item || item.condoId !== req.user!.condoId) {
            return res.status(404).json({ message: 'Item não encontrado.' });
        }
        res.json(item);
    } catch (error) {
        next(error);
    }
});

// PATCH /api/marketplace/items/:id - Update an item listing
router.patch('/marketplace/items/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        const updatedItem = await storage.updateMarketplaceItem(req.params.id, req.body, req.user!.userId);
        res.json(updatedItem);
    } catch (error: any) {
        if (error.message === "Acesso negado") {
            return res.status(403).json({ error: error.message });
        }
        next(error);
    }
});

// DELETE /api/marketplace/items/:id - Delete an item listing
router.delete('/marketplace/items/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
    try {
        await storage.deleteMarketplaceItem(req.params.id, req.user!.userId);
        res.status(204).send(); // No Content
    } catch (error: any) {
        if (error.message === "Acesso negado") {
            return res.status(403).json({ error: error.message });
        }
        next(error);
    }
});

// ===== SERVICES (Existing routes can be migrated here if needed) =====
// Example for services to keep the file structure consistent


export const marketplaceRoutes = router;
