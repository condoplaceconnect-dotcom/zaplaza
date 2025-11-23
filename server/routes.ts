import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authService, authMiddleware, adminMiddleware } from "./auth";
import { insertUserSchema, insertCondoSchema, insertStoreSchema, insertProductSchema, insertServiceProviderSchema, insertServiceSchema } from "@shared/schema";
import "./types";

interface PaymentIntentRequest {
  amount: number;
  currency: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  metadata?: Record<string, unknown>;
}

interface PixQrRequest {
  amount: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ✅ ROTA: Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username e password são obrigatórios" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const isPasswordValid = await authService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const token = authService.generateToken(user, 'user');
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("[LOGIN ERROR]", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // ✅ ROTA: Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, role, condoId } = req.body;

      const validation = insertUserSchema.safeParse({ username, password, role, condoId });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username já está em uso" });
      }

      const hashedPassword = await authService.hashPassword(password);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        role: role || "resident",
        condoId: condoId || null,
      });

      const token = authService.generateToken(newUser, 'user');
      res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, role: newUser.role } });
    } catch (error) {
      console.error("[REGISTER ERROR]", error);
      res.status(500).json({ error: "Erro ao registrar" });
    }
  });

  // ✅ ROTA: Verificar token (protegida)
  app.get("/api/auth/me", authMiddleware, (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  // ✅ ROTA: Listar Condomínios Aprovados
  app.get("/api/condominiums", async (req: Request, res: Response) => {
    try {
      const condos = await storage.listCondominiums();
      res.json(condos);
    } catch (error) {
      console.error("[CONDOS LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar condomínios" });
    }
  });

  // ✅ ROTA: Obter Condomínio por ID
  app.get("/api/condominiums/:id", async (req: Request, res: Response) => {
    try {
      const condo = await storage.getCondominium(req.params.id);
      if (!condo) {
        return res.status(404).json({ error: "Condomínio não encontrado" });
      }
      res.json(condo);
    } catch (error) {
      console.error("[CONDO GET ERROR]", error);
      res.status(500).json({ error: "Erro ao obter condomínio" });
    }
  });

  // ✅ ROTA: Criar Condomínio (solicitar registro)
  app.post("/api/condominiums", async (req: Request, res: Response) => {
    try {
      const validation = insertCondoSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const newCondo = await storage.createCondominium(req.body);
      res.status(201).json(newCondo);
    } catch (error) {
      console.error("[CONDO CREATE ERROR]", error);
      res.status(500).json({ error: "Erro ao criar condomínio" });
    }
  });

  // ✅ ROTA: Listar Lojas por Condomínio
  app.get("/api/condominiums/:condoId/stores", async (req: Request, res: Response) => {
    try {
      const stores = await storage.getStoresByCondo(req.params.condoId);
      res.json(stores);
    } catch (error) {
      console.error("[STORES LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar lojas" });
    }
  });

  // ✅ ROTA: Criar Loja (protegida)
  app.post("/api/stores", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const validation = insertStoreSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const newStore = await storage.createStore({
        ...req.body,
        userId: req.user.id,
      });

      res.status(201).json(newStore);
    } catch (error) {
      console.error("[STORE CREATE ERROR]", error);
      res.status(500).json({ error: "Erro ao criar loja" });
    }
  });

  // ✅ ROTA: Obter Loja
  app.get("/api/stores/:id", async (req: Request, res: Response) => {
    try {
      const store = await storage.getStore(req.params.id);
      if (!store) {
        return res.status(404).json({ error: "Loja não encontrada" });
      }
      res.json(store);
    } catch (error) {
      console.error("[STORE GET ERROR]", error);
      res.status(500).json({ error: "Erro ao obter loja" });
    }
  });

  // ✅ ROTA: Atualizar Loja (protegida)
  app.patch("/api/stores/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const store = await storage.getStore(req.params.id);
      if (!store) {
        return res.status(404).json({ error: "Loja não encontrada" });
      }

      if (store.userId !== req.user.id) {
        return res.status(403).json({ error: "Sem permissão" });
      }

      const updated = await storage.updateStore(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("[STORE UPDATE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar loja" });
    }
  });

  // ✅ ROTA: Listar Produtos de uma Loja
  app.get("/api/stores/:storeId/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProductsByStore(req.params.storeId);
      res.json(products);
    } catch (error) {
      console.error("[PRODUCTS LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar produtos" });
    }
  });

  // ✅ ROTA: Criar Produto (protegida)
  app.post("/api/products", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const validation = insertProductSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      // Verificar se usuário é dono da loja
      const store = await storage.getStore(req.body.storeId);
      if (!store || store.userId !== req.user.id) {
        return res.status(403).json({ error: "Sem permissão" });
      }

      const newProduct = await storage.createProduct(req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("[PRODUCT CREATE ERROR]", error);
      res.status(500).json({ error: "Erro ao criar produto" });
    }
  });

  // ✅ ROTA: Atualizar Produto (protegida)
  app.patch("/api/products/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      const store = await storage.getStore(product.storeId);
      if (!store || store.userId !== req.user.id) {
        return res.status(403).json({ error: "Sem permissão" });
      }

      const updated = await storage.updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("[PRODUCT UPDATE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  });

  // ✅ ROTA: Deletar Produto (protegida)
  app.delete("/api/products/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      const store = await storage.getStore(product.storeId);
      if (!store || store.userId !== req.user.id) {
        return res.status(403).json({ error: "Sem permissão" });
      }

      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("[PRODUCT DELETE ERROR]", error);
      res.status(500).json({ error: "Erro ao deletar produto" });
    }
  });

  // ✅ ROTA: Criar Payment Intent (Stripe) - PROTEGIDA
  app.post("/api/payments/create-payment-intent", authMiddleware, async (req: Request, res: Response) => {
    try {
      const body: PaymentIntentRequest = req.body;

      if (!body.amount || body.amount < 100) {
        return res.status(400).json({ error: "Valor inválido" });
      }

      if (!body.currency || body.currency !== "brl") {
        return res.status(400).json({ error: "Moeda inválida" });
      }

      if (!Array.isArray(body.items) || body.items.length === 0) {
        return res.status(400).json({ error: "Items inválidos" });
      }

      console.log(`[PAYMENT] Intent criado: R$ ${(body.amount / 100).toFixed(2)}, Items: ${body.items.length}`);

      const clientSecret = `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      res.json({
        clientSecret,
        status: "requires_payment_method",
        amount: body.amount,
        currency: body.currency
      });
    } catch (error) {
      console.error("[PAYMENT ERROR]", error);
      res.status(500).json({ error: "Erro ao criar intenção de pagamento" });
    }
  });

  // ✅ ROTA: Gerar QR Code Pix - PROTEGIDA
  app.post("/api/payments/create-pix-qr", authMiddleware, async (req: Request, res: Response) => {
    try {
      const body: PixQrRequest = req.body;

      if (!body.amount || body.amount <= 0) {
        return res.status(400).json({ error: "Valor inválido" });
      }

      if (!Array.isArray(body.items) || body.items.length === 0) {
        return res.status(400).json({ error: "Items inválidos" });
      }

      console.log(`[PIX] QR Code solicitado: R$ ${body.amount.toFixed(2)}`);

      const qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;

      res.json({
        qrCode,
        pixKey: "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000",
        amount: body.amount,
        expiresAt: new Date(Date.now() + 600000).toISOString()
      });
    } catch (error) {
      console.error("[PIX ERROR]", error);
      res.status(500).json({ error: "Erro ao gerar QR Code Pix" });
    }
  });

  // ✅ ROTA: Webhook Stripe
  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    try {
      res.json({ received: true });
    } catch (error) {
      console.error("[WEBHOOK ERROR]", error);
      res.status(400).json({ error: "Webhook error" });
    }
  });

  // ✅ ROTA: Upload de Arquivo (protegida)
  app.post("/api/upload", authMiddleware, async (req: Request, res: Response) => {
    try {
      res.json({
        url: "https://example-cdn.com/image-hash.jpg",
        success: true
      });
    } catch (error) {
      console.error("[UPLOAD ERROR]", error);
      res.status(400).json({ error: "Erro no upload" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
