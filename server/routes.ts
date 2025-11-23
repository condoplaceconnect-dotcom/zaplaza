import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authService, authMiddleware, adminMiddleware, vendorMiddleware, serviceProviderMiddleware, deliveryPersonMiddleware } from "./auth";
import { insertUserSchema, insertCondoSchema, insertStoreSchema, insertProductSchema, insertServiceProviderSchema, insertServiceSchema, insertDeliveryPersonSchema, insertOrderSchema } from "@shared/schema";
import "./types";

interface PaymentIntentRequest {
  amount: number;
  currency: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}

interface PixQrRequest {
  amount: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ✅ AUTH ROUTES
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: "Username e password são obrigatórios" });

      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

      const isPasswordValid = await authService.verifyPassword(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ error: "Credenciais inválidas" });

      const token = authService.generateToken(user, user.role as any);
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error("[LOGIN ERROR]", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, role, condoId } = req.body;

      const validation = insertUserSchema.safeParse({ username, password, role, condoId });
      if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) return res.status(400).json({ error: "Username já está em uso" });

      const hashedPassword = await authService.hashPassword(password);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        role: role || "resident",
        condoId: condoId || null,
      });

      const token = authService.generateToken(newUser, newUser.role as any);
      res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, role: newUser.role } });
    } catch (error) {
      console.error("[REGISTER ERROR]", error);
      res.status(500).json({ error: "Erro ao registrar" });
    }
  });

  app.get("/api/auth/me", authMiddleware, (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  // ✅ CONDOMINIUM ROUTES
  app.get("/api/condominiums", async (req: Request, res: Response) => {
    try {
      const condos = await storage.listCondominiums();
      res.json(condos);
    } catch (error) {
      console.error("[CONDOS LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar condomínios" });
    }
  });

  app.get("/api/condominiums/:id", async (req: Request, res: Response) => {
    try {
      const condo = await storage.getCondominium(req.params.id);
      if (!condo) return res.status(404).json({ error: "Condomínio não encontrado" });
      res.json(condo);
    } catch (error) {
      console.error("[CONDO GET ERROR]", error);
      res.status(500).json({ error: "Erro ao obter condomínio" });
    }
  });

  app.post("/api/condominiums", async (req: Request, res: Response) => {
    try {
      const validation = insertCondoSchema.safeParse(req.body);
      if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });

      const newCondo = await storage.createCondominium(req.body);
      res.status(201).json(newCondo);
    } catch (error) {
      console.error("[CONDO CREATE ERROR]", error);
      res.status(500).json({ error: "Erro ao criar condomínio" });
    }
  });

  // ✅ STORE ROUTES
  app.get("/api/condominiums/:condoId/stores", async (req: Request, res: Response) => {
    try {
      const stores = await storage.getStoresByCondo(req.params.condoId);
      res.json(stores);
    } catch (error) {
      console.error("[STORES LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar lojas" });
    }
  });

  app.post("/api/stores", vendorMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });

      const validation = insertStoreSchema.safeParse(req.body);
      if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });

      const newStore = await storage.createStore({
        ...req.body,
        userId: req.user.userId,
      });

      res.status(201).json(newStore);
    } catch (error) {
      console.error("[STORE CREATE ERROR]", error);
      res.status(500).json({ error: "Erro ao criar loja" });
    }
  });

  app.get("/api/stores/:id", async (req: Request, res: Response) => {
    try {
      const store = await storage.getStore(req.params.id);
      if (!store) return res.status(404).json({ error: "Loja não encontrada" });
      res.json(store);
    } catch (error) {
      console.error("[STORE GET ERROR]", error);
      res.status(500).json({ error: "Erro ao obter loja" });
    }
  });

  app.patch("/api/stores/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });

      const store = await storage.getStore(req.params.id);
      if (!store) return res.status(404).json({ error: "Loja não encontrada" });

      if (store.userId !== req.user.userId) return res.status(403).json({ error: "Sem permissão" });

      const updated = await storage.updateStore(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("[STORE UPDATE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar loja" });
    }
  });

  // ✅ PRODUCT ROUTES
  app.get("/api/stores/:storeId/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProductsByStore(req.params.storeId);
      res.json(products);
    } catch (error) {
      console.error("[PRODUCTS LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar produtos" });
    }
  });

  app.post("/api/products", vendorMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });

      const validation = insertProductSchema.safeParse(req.body);
      if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });

      const store = await storage.getStore(req.body.storeId);
      if (!store || store.userId !== req.user.userId) return res.status(403).json({ error: "Sem permissão" });

      const newProduct = await storage.createProduct(req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("[PRODUCT CREATE ERROR]", error);
      res.status(500).json({ error: "Erro ao criar produto" });
    }
  });

  app.patch("/api/products/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });

      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ error: "Produto não encontrado" });

      const store = await storage.getStore(product.storeId);
      if (!store || store.userId !== req.user.userId) return res.status(403).json({ error: "Sem permissão" });

      const updated = await storage.updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("[PRODUCT UPDATE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  });

  app.delete("/api/products/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });

      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ error: "Produto não encontrado" });

      const store = await storage.getStore(product.storeId);
      if (!store || store.userId !== req.user.userId) return res.status(403).json({ error: "Sem permissão" });

      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("[PRODUCT DELETE ERROR]", error);
      res.status(500).json({ error: "Erro ao deletar produto" });
    }
  });

  // ✅ DELIVERY PERSON ROUTES
  app.get("/api/delivery-persons/:id", async (req: Request, res: Response) => {
    try {
      const person = await storage.getDeliveryPerson(req.params.id);
      if (!person) return res.status(404).json({ error: "Entregador não encontrado" });
      res.json(person);
    } catch (error) {
      console.error("[DELIVERY PERSON GET ERROR]", error);
      res.status(500).json({ error: "Erro ao obter entregador" });
    }
  });

  app.get("/api/condominiums/:condoId/delivery-persons", async (req: Request, res: Response) => {
    try {
      const persons = await storage.getDeliveryPersonsByCondo(req.params.condoId);
      res.json(persons);
    } catch (error) {
      console.error("[DELIVERY PERSONS LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar entregadores" });
    }
  });

  app.post("/api/delivery-persons", deliveryPersonMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });

      const validation = insertDeliveryPersonSchema.safeParse(req.body);
      if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });

      const newPerson = await storage.createDeliveryPerson({
        ...req.body,
        userId: req.user.userId,
      });

      res.status(201).json(newPerson);
    } catch (error) {
      console.error("[DELIVERY PERSON CREATE ERROR]", error);
      res.status(500).json({ error: "Erro ao criar perfil de entregador" });
    }
  });

  app.patch("/api/delivery-persons/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });

      const person = await storage.getDeliveryPerson(req.params.id);
      if (!person) return res.status(404).json({ error: "Entregador não encontrado" });

      if (person.userId !== req.user.userId) return res.status(403).json({ error: "Sem permissão" });

      const updated = await storage.updateDeliveryPerson(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("[DELIVERY PERSON UPDATE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar entregador" });
    }
  });

  // ✅ ORDER ROUTES
  app.get("/api/orders/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
      res.json(order);
    } catch (error) {
      console.error("[ORDER GET ERROR]", error);
      res.status(500).json({ error: "Erro ao obter pedido" });
    }
  });

  app.get("/api/orders/resident/:residentId", authMiddleware, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrdersByResident(req.params.residentId);
      res.json(orders);
    } catch (error) {
      console.error("[ORDERS LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar pedidos" });
    }
  });

  app.post("/api/orders", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });

      const validation = insertOrderSchema.safeParse(req.body);
      if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });

      const newOrder = await storage.createOrder({
        ...req.body,
        residentId: req.user.userId,
      });

      res.status(201).json(newOrder);
    } catch (error) {
      console.error("[ORDER CREATE ERROR]", error);
      res.status(500).json({ error: "Erro ao criar pedido" });
    }
  });

  app.patch("/api/orders/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });

      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

      const store = await storage.getStore(order.storeId);
      if (!store || (store.userId !== req.user.userId && order.residentId !== req.user.userId && order.deliveryPersonId !== req.user.userId)) {
        return res.status(403).json({ error: "Sem permissão" });
      }

      const updated = await storage.updateOrder(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("[ORDER UPDATE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar pedido" });
    }
  });

  // ✅ PAYMENT ROUTES
  app.post("/api/payments/create-payment-intent", authMiddleware, async (req: Request, res: Response) => {
    try {
      const body: PaymentIntentRequest = req.body;

      if (!body.amount || body.amount < 100) return res.status(400).json({ error: "Valor inválido" });
      if (!body.currency || body.currency !== "brl") return res.status(400).json({ error: "Moeda inválida" });
      if (!Array.isArray(body.items) || body.items.length === 0) return res.status(400).json({ error: "Items inválidos" });

      console.log(`[PAYMENT] Intent criado: R$ ${(body.amount / 100).toFixed(2)}`);

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

  app.post("/api/payments/create-pix-qr", authMiddleware, async (req: Request, res: Response) => {
    try {
      const body: PixQrRequest = req.body;

      if (!body.amount || body.amount <= 0) return res.status(400).json({ error: "Valor inválido" });
      if (!Array.isArray(body.items) || body.items.length === 0) return res.status(400).json({ error: "Items inválidos" });

      console.log(`[PIX] QR Code solicitado: R$ ${body.amount.toFixed(2)}`);

      res.json({
        qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        pixKey: "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000",
        amount: body.amount,
        expiresAt: new Date(Date.now() + 600000).toISOString()
      });
    } catch (error) {
      console.error("[PIX ERROR]", error);
      res.status(500).json({ error: "Erro ao gerar QR Code Pix" });
    }
  });

  app.post("/api/upload", authMiddleware, async (req: Request, res: Response) => {
    try {
      res.json({
        url: "https://example-cdn.com/image-" + Date.now() + ".jpg",
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
