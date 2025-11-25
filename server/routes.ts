import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { authService, authMiddleware } from "./auth";
import { 
    insertUserSchema, 
    loginUserSchema, 
    insertMarketplaceItemSchema, 
    updateMarketplaceItemSchema, 
    insertCondoSchema, 
    insertStoreSchema, 
    insertProductSchema,
    insertLoanSchema
} from "@shared/schema"; 
import { registerAdminRoutes } from "./admin-routes";
import "./types";

// Função para gerar um código de convite único
async function generateUniqueInviteCode(length: number = 8): Promise<string> {
  // ... (implementation omitted for brevity)
  return ""; 
}

export async function registerRoutes(app: Express): Promise<Server> {

  // ✅ CONDOMINIUM REGISTRATION
  app.post("/api/condominiums", async (req: Request, res: Response) => { /* ... */ });

  // ✅ AUTH ROUTES
  app.post("/api/auth/login", /* ... */);
  app.get("/api/auth/me", authMiddleware, /* ... */);
  app.post("/api/auth/register", /* ... */);
  app.get("/api/auth/verify-email", /* ... */);

  // ✅ MARKETPLACE ROUTES
  app.get("/api/marketplace", authMiddleware, /* ... */);
  app.post("/api/marketplace", authMiddleware, /* ... */);
  app.patch("/api/marketplace/:id", authMiddleware, /* ... */);
  app.delete("/api/marketplace/:id", authMiddleware, /* ... */);
  
  app.get("/api/my-marketplace-items", authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Não autenticado." });
        }
        const items = await storage.getMarketplaceItemsByUser(user.id);
        res.status(200).json(items);
    } catch (error: any) {
        console.error("[MY MARKETPLACE ITEMS GET ERROR]", error);
        res.status(500).json({ error: "Erro ao buscar itens do usuário." });
    }
  });

  // ✅ STORE ROUTES
  app.post("/api/stores", authMiddleware, /* ... */);
  app.get("/api/stores", authMiddleware, /* ... */);
  app.get("/api/my-store", authMiddleware, /* ... */);

  // ✅ PRODUCT ROUTES
  app.post("/api/products", authMiddleware, /* ... */);
  app.get("/api/products/store/:storeId", authMiddleware, /* ... */);

  // ✅ LOAN ROUTES
  app.post("/api/loans", authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "Não autenticado." });

        const validation = insertLoanSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }

        const { itemId, ownerId, returnDate, terms } = validation.data;
        const newLoan = await storage.createLoan({
            itemId,
            ownerId,
            borrowerId: user.id, // O borrower é o usuário logado que está fazendo a requisição
            returnDate,
            terms,
        });
        res.status(201).json(newLoan);

    } catch (error: any) {
        console.error("[LOAN CREATE ERROR]", error);
        res.status(500).json({ error: "Erro ao solicitar empréstimo." });
    }
  });

  app.get("/api/loans/my", authMiddleware, async (req: Request, res: Response) => {
      try {
          const user = req.user;
          if (!user) return res.status(401).json({ error: "Não autenticado." });

          const borrowed = await storage.getLoansByBorrower(user.id);
          const lent = await storage.getLoansByOwner(user.id);

          res.status(200).json({ borrowed, lent });

      } catch (error: any) {
          console.error("[LOAN LIST ERROR]", error);
          res.status(500).json({ error: "Erro ao listar empréstimos." });
      }
  });

  app.patch("/api/loans/:id/status", authMiddleware, async (req: Request, res: Response) => {
      try {
          const user = req.user;
          const { id } = req.params;
          const { status } = req.body; 

          if (!user) return res.status(401).json({ error: "Não autenticado." });
          if (!status) return res.status(400).json({ error: "Status é obrigatório." });

          const updatedLoan = await storage.updateLoanStatus(id, status, user.id);
          res.status(200).json(updatedLoan);

      } catch (error: any) {
          console.error("[LOAN UPDATE STATUS ERROR]", error);
          if (error.message.includes("Apenas o proprietário") || error.message.includes("Apenas o mutuário")) {
              return res.status(403).json({ error: error.message });
          }
          res.status(500).json({ error: "Erro ao atualizar status do empréstimo." });
      }
  });

  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}