import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { adminMiddleware } from "./auth";
import { queryClient } from "@/lib/queryClient";

export function registerAdminRoutes(app: Express) {
  // ✅ Admin Requests - Users Pending Approval
  app.get("/api/admin/solicitacoes/usuarios", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const residentUsers = await storage.listUsersByRole("resident");
      const vendorUsers = await storage.listUsersByRole("vendor");
      const serviceProviders = await storage.listUsersByRole("service_provider");
      const deliveryPersons = await storage.listUsersByRole("delivery_person");

      res.json({
        residents: residentUsers,
        vendors: vendorUsers,
        serviceProviders,
        deliveryPersons,
      });
    } catch (error) {
      console.error("[ADMIN REQUESTS ERROR]", error);
      res.status(500).json({ error: "Erro ao listar solicitações" });
    }
  });

  // ✅ Admin Approve/Reject User
  app.post("/api/admin/aprovar/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { action } = req.body; // "approve" or "reject"
      const user = await storage.getUser(req.params.id);

      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      const status = action === "approve" ? "approved" : "rejected";
      const updated = await storage.updateUser(req.params.id, { 
        condoId: action === "approve" ? user.condoId : null 
      });

      res.json({ success: true, user: updated });
    } catch (error) {
      console.error("[ADMIN APPROVE ERROR]", error);
      res.status(500).json({ error: "Erro ao processar solicitação" });
    }
  });

  // ✅ Admin Get Condominiums Data
  app.get("/api/admin/condominio/:condoId", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const condo = await storage.getCondominium(req.params.condoId);
      if (!condo) return res.status(404).json({ error: "Condomínio não encontrado" });

      res.json(condo);
    } catch (error) {
      console.error("[ADMIN CONDO GET ERROR]", error);
      res.status(500).json({ error: "Erro ao obter condomínio" });
    }
  });

  // ✅ Admin Update Condominium
  app.patch("/api/admin/condominio/:condoId", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateCondominium(req.params.condoId, req.body);
      if (!updated) return res.status(404).json({ error: "Condomínio não encontrado" });

      res.json(updated);
    } catch (error) {
      console.error("[ADMIN CONDO UPDATE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar condomínio" });
    }
  });

  // ✅ Admin Get Residents
  app.get("/api/admin/moradores/:condoId", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const residents = await storage.listUsersByRole("resident");
      const filtered = residents.filter((r) => r.condoId === req.params.condoId);

      res.json(filtered);
    } catch (error) {
      console.error("[ADMIN RESIDENTS ERROR]", error);
      res.status(500).json({ error: "Erro ao listar moradores" });
    }
  });

  // ✅ Admin Delete Resident
  app.delete("/api/admin/moradores/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      await storage.updateUser(req.params.id, { condoId: null });
      res.json({ success: true });
    } catch (error) {
      console.error("[ADMIN DELETE RESIDENT ERROR]", error);
      res.status(500).json({ error: "Erro ao remover morador" });
    }
  });

  // ✅ Admin Get Stores
  app.get("/api/admin/lojas/:condoId", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const stores = await storage.getStoresByCondo(req.params.condoId);
      res.json(stores);
    } catch (error) {
      console.error("[ADMIN STORES ERROR]", error);
      res.status(500).json({ error: "Erro ao listar lojas" });
    }
  });

  // ✅ Admin Update Store Status
  app.patch("/api/admin/lojas/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["active", "pending", "blocked"].includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }

      const updated = await storage.updateStore(req.params.id, { status });
      res.json(updated);
    } catch (error) {
      console.error("[ADMIN STORE UPDATE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar loja" });
    }
  });

  // ✅ Admin Delete Store
  app.delete("/api/admin/lojas/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      // TODO: Delete all products associated with store
      res.json({ success: true });
    } catch (error) {
      console.error("[ADMIN DELETE STORE ERROR]", error);
      res.status(500).json({ error: "Erro ao deletar loja" });
    }
  });

  // ✅ Admin Get Delivery Persons
  app.get("/api/admin/entregadores/:condoId", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const persons = await storage.getDeliveryPersonsByCondo(req.params.condoId);
      res.json(persons);
    } catch (error) {
      console.error("[ADMIN DELIVERY PERSONS ERROR]", error);
      res.status(500).json({ error: "Erro ao listar entregadores" });
    }
  });

  // ✅ Admin Get Service Providers
  app.get("/api/admin/prestadores/:condoId", adminMiddleware, async (req: Request, res: Response) => {
    try {
      // TODO: Get service providers by condo with junction table
      res.json([]);
    } catch (error) {
      console.error("[ADMIN SERVICE PROVIDERS ERROR]", error);
      res.status(500).json({ error: "Erro ao listar prestadores" });
    }
  });

  // ✅ Admin Get Communications
  app.get("/api/admin/comunicados/:condoId", adminMiddleware, async (req: Request, res: Response) => {
    try {
      // TODO: Get communications by condo
      res.json([]);
    } catch (error) {
      console.error("[ADMIN COMMUNICATIONS ERROR]", error);
      res.status(500).json({ error: "Erro ao listar comunicados" });
    }
  });

  // ✅ Admin Create Communication
  app.post("/api/admin/comunicados/:condoId", adminMiddleware, async (req: Request, res: Response) => {
    try {
      // TODO: Create communication
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("[ADMIN CREATE COMMUNICATION ERROR]", error);
      res.status(500).json({ error: "Erro ao criar comunicado" });
    }
  });
}
