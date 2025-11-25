import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { authMiddleware, adminMiddleware, globalAdminMiddleware, condoAdminMiddleware } from "./auth";
import { updateUserSchema, updateReportSchema } from "@shared/schema";
import type { JWTPayload } from "./auth";

export function registerAdminRoutes(app: Express) {
  app.use("/api/admin", authMiddleware);

  // ROTAS DE SUPER ADMIN (ADMINS GLOBAIS)
  app.get("/api/admin/condominiums/pending", globalAdminMiddleware, async (req: Request, res: Response) => {
    try {
      const pendingCondos = await storage.listPendingCondominiums();
      res.json(pendingCondos);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar condomínios pendentes" });
    }
  });

  app.patch("/api/admin/condominiums/:id/status", globalAdminMiddleware, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const updated = await storage.updateCondominium(req.params.id, { status });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar status do condomínio" });
    }
  });

  // ROTAS DE GERENCIAMENTO DE USUÁRIOS (TODOS OS ADMINS)
  app.get("/api/admin/users", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar usuários" });
    }
  });

  app.get("/api/admin/users/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erro ao obter detalhes do usuário" });
    }
  });

  app.patch("/api/admin/users/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const validation = updateUserSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }
      const updatedUser = await storage.updateUser(req.params.id, validation.data);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/api/admin/users/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir usuário" });
    }
  });

  // ROTAS DE ADMIN DE CONDOMÍNIO
  app.get("/api/admin/my-condo/reports", condoAdminMiddleware, async (req: Request, res: Response) => {
    try {
      const user = req.user as JWTPayload;
      const reports = await storage.listReportsByCondo(user.condoId as string);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar denúncias" });
    }
  });

  app.get("/api/admin/reports/:id", condoAdminMiddleware, async (req: Request, res: Response) => {
    try {
      const user = req.user as JWTPayload;
      const report = await storage.getReport(req.params.id);
      if (!report || report.condoId !== user.condoId) {
        return res.status(404).json({ error: "Denúncia não encontrada ou não pertence a este condomínio" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Erro ao obter denúncia" });
    }
  });

  app.patch("/api/admin/reports/:id", condoAdminMiddleware, async (req: Request, res: Response) => {
    try {
      const user = req.user as JWTPayload;
      const report = await storage.getReport(req.params.id);
      if (!report || report.condoId !== user.condoId) {
        return res.status(404).json({ error: "Denúncia não encontrada ou não pertence a este condomínio" });
      }
      const validation = updateReportSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }
      const updatedData = { ...validation.data, resolvedBy: user.userId, resolvedAt: new Date() };
      const updatedReport = await storage.updateReport(req.params.id, updatedData);
      res.json(updatedReport);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar denúncia" });
    }
  });

  app.get("/api/admin/my-condo/residents", condoAdminMiddleware, async (req: Request, res: Response) => {
    try {
      const user = req.user as JWTPayload;
      const residents = await storage.listUsersByCondo(user.condoId as string);
      res.json(residents);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar moradores" });
    }
  });

  app.delete("/api/admin/my-condo/residents/:residentId", condoAdminMiddleware, async (req: Request, res: Response) => {
    try {
      await storage.deleteUser(req.params.residentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao remover morador" });
    }
  });

  app.get("/api/admin/my-condo/stores", condoAdminMiddleware, async (req: Request, res: Response) => {
    try {
      const user = req.user as JWTPayload;
      const stores = await storage.getStoresByCondo(user.condoId as string);
      res.json(stores);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar lojas" });
    }
  });

  app.delete("/api/admin/my-condo/stores/:storeId", condoAdminMiddleware, async (req: Request, res: Response) => {
    try {
      // Futuramente, pode ser necessário deletar produtos associados
      await storage.deleteStore(req.params.storeId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao remover loja" });
    }
  });

    app.get("/api/admin/my-condo/products", condoAdminMiddleware, async (req: Request, res: Response) => {
    try {
      const user = req.user as JWTPayload;
      const products = await storage.getProductsByCondo(user.condoId as string);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar produtos" });
    }
  });

  app.delete("/api/admin/my-condo/products/:productId", condoAdminMiddleware, async (req: Request, res: Response) => {
    try {
      await storage.deleteProduct(req.params.productId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao remover produto" });
    }
  });
}
