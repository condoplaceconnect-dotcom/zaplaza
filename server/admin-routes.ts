import { Router, Express } from 'express';
import { storage } from './storage';
import { authMiddleware, adminOnly, AuthenticatedRequest } from './auth';

const router = Router();

// ===== ADMIN ROUTES =====

// GET /api/admin/condominiums/pending - List all condominiums awaiting approval
router.get('/condominiums/pending', async (req, res, next) => {
    try {
        const pendingCondos = await storage.listPendingCondominiums();
        res.json(pendingCondos);
    } catch (error) {
        next(error);
    }
});

// POST /api/admin/condominiums/:id/approve - Approve a condominium
router.post('/condominiums/:id/approve', async (req, res, next) => {
    try {
        const { id } = req.params;
        const approvedCondo = await storage.approveCondominium(id);
        if (!approvedCondo) {
            return res.status(404).json({ message: 'Condomínio não encontrado ou já aprovado.' });
        }
        res.json(approvedCondo);
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/reports - List all reports
router.get('/reports', async (req: AuthenticatedRequest, res, next) => {
    try {
        // Super-admin route, should list reports across ALL condos.
        // Assuming a method `listAllReports` exists in storage.
        // const reports = await storage.listAllReports();
        res.json([]); // Placeholder
    } catch (error) {
        next(error);
    }
});

/**
 * Registers all admin-specific routes.
 * @param app The Express application instance.
 */
export const registerAdminRoutes = (app: Express) => {
    // Prefix all routes in this router with /api/admin
    // and apply authentication and admin-only middlewares.
    app.use('/api/admin', authMiddleware, adminOnly, router);
};
