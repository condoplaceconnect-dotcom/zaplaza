import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { authService, authMiddleware, adminMiddleware, vendorMiddleware, serviceProviderMiddleware, deliveryPersonMiddleware } from "./auth";
import { insertUserSchema, insertCondoSchema, insertStoreSchema, insertProductSchema, insertServiceProviderSchema, insertServiceSchema, insertDeliveryPersonSchema, insertOrderSchema, insertMarketplaceItemSchema, updateMarketplaceItemSchema } from "@shared/schema";
import { registerAdminRoutes } from "./admin-routes";
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

      // Bloquear login de menores de 18 anos usando função helper
      if (authService.isUserBlocked(user)) {
        return res.status(403).json(authService.getBlockedMinorMessage());
      }

      const token = authService.generateToken(user, user.role as any);
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          status: user.status, // Incluir status para gatekeeping
          condoId: user.condoId // Incluir condoId se já selecionado
        } 
      });
    } catch (error) {
      console.error("[LOGIN ERROR]", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, phone, username, password, birthDate, block, unit, role, condoId } = req.body;

      // Validação dos campos obrigatórios
      if (!name || !email || !phone || !username || !password || !birthDate || !block || !unit) {
        return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos" });
      }

      // Validação com Zod Schema
      const validation = insertUserSchema.safeParse({ 
        name, 
        email, 
        phone, 
        username, 
        password, 
        birthDate, 
        block, 
        unit, 
        role, 
        condoId 
      });
      
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }

      // Verificar se username já existe
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) return res.status(400).json({ error: "Username já está em uso" });

      // Calcular idade a partir da data de nascimento (já validada pelo Zod)
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }

      // Determinar status e accountType baseado na idade
      let status = "active";
      let accountType = "adult";
      
      if (age < 18) {
        status = "blocked_until_18";
        accountType = "minor";
      }

      // Gerar token de verificação de email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      const hashedPassword = await authService.hashPassword(password);
      const newUser = await storage.createUser({
        name,
        email,
        phone,
        username,
        password: hashedPassword,
        birthDate,
        block,
        unit,
        accountType,
        role: role || "resident",
        status,
        condoId: condoId || null,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
      });

      // Se for menor de 18, não fazer login automático
      if (age < 18) {
        return res.status(403).json(authService.getBlockedMinorMessage());
      }

      // Enviar email de verificação (não bloquear se falhar)
      try {
        const { sendVerificationEmail } = await import("./email-service");
        await sendVerificationEmail(email, username, verificationToken);
      } catch (emailError) {
        console.error("[EMAIL SEND ERROR]", emailError);
        // Continuar mesmo se email falhar
      }

      // Fazer login automático para maiores de 18
      const token = authService.generateToken(newUser, newUser.role as any);
      res.status(201).json({ 
        token, 
        user: { 
          id: newUser.id, 
          username: newUser.username, 
          role: newUser.role,
          status: newUser.status,
          emailVerified: newUser.emailVerified
        } 
      });
    } catch (error) {
      console.error("[REGISTER ERROR]", error);
      res.status(500).json({ error: "Erro ao registrar" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      // Buscar usuário completo do storage (com status e condoId)
      const fullUser = await storage.getUser(req.user!.userId);
      
      if (!fullUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Retornar dados completos do usuário (sem password)
      const { password, ...userWithoutPassword } = fullUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("[AUTH ME ERROR]", error);
      res.status(500).json({ error: "Erro ao buscar dados do usuário" });
    }
  });

  // ✅ Verificar email via token
  app.get("/api/auth/verify-email/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ error: "Token não fornecido" });
      }

      // Buscar usuário pelo token
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(404).json({ error: "Token inválido ou expirado" });
      }

      // Verificar se token expirou
      if (user.verificationTokenExpiry && new Date() > new Date(user.verificationTokenExpiry)) {
        return res.status(400).json({ error: "Token expirado. Solicite um novo email de verificação." });
      }

      // Marcar email como verificado
      await storage.updateUser(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      });

      // Enviar email de boas-vindas
      try {
        const { sendWelcomeEmail } = await import("./email-service");
        await sendWelcomeEmail(user.email, user.username);
      } catch (emailError) {
        console.error("[WELCOME EMAIL ERROR]", emailError);
      }

      res.json({ 
        success: true, 
        message: "Email verificado com sucesso!",
        emailVerified: true 
      });
    } catch (error) {
      console.error("[VERIFY EMAIL ERROR]", error);
      res.status(500).json({ error: "Erro ao verificar email" });
    }
  });

  // ✅ Reenviar email de verificação
  app.post("/api/auth/resend-verification", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "Email já verificado" });
      }

      // Gerar novo token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await storage.updateUser(user.id, {
        verificationToken,
        verificationTokenExpiry,
      });

      // Enviar email
      try {
        const { sendVerificationEmail } = await import("./email-service");
        await sendVerificationEmail(user.email, user.username, verificationToken);
      } catch (emailError) {
        console.error("[EMAIL SEND ERROR]", emailError);
        return res.status(500).json({ error: "Erro ao enviar email" });
      }

      res.json({ 
        success: true, 
        message: "Email de verificação reenviado" 
      });
    } catch (error) {
      console.error("[RESEND VERIFICATION ERROR]", error);
      res.status(500).json({ error: "Erro ao reenviar email" });
    }
  });

  // ✅ ADMIN STATS & MANAGEMENT ROUTES
  app.get("/api/admin/stats", adminMiddleware, async (req: Request, res: Response) => {
    try {
      // Buscar admin completo para pegar condoId
      const admin = await storage.getUser(req.user!.userId);
      if (!admin) return res.status(404).json({ error: "Admin não encontrado" });
      
      const condoId = admin.condoId || "condo-acqua-sena"; // Fallback para o único condo
      const users = await storage.listUsersByCondo(condoId);
      const stores = await storage.getStoresByCondo(condoId);
      const orders = await storage.getOrdersByCondo(condoId);
      
      const residents = users.filter(u => u.role === "resident").length;
      const services = users.filter(u => u.role === "service_provider").length;
      const todayOrders = orders.filter(o => {
        const today = new Date().toDateString();
        return new Date(o.createdAt!).toDateString() === today;
      }).length;

      res.json({
        residents,
        stores: stores.length,
        services,
        todayOrders
      });
    } catch (error) {
      console.error("[ADMIN STATS ERROR]", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  app.get("/api/admin/users", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const admin = await storage.getUser(req.user!.userId);
      if (!admin) return res.status(404).json({ error: "Admin não encontrado" });
      
      const condoId = admin.condoId || "condo-acqua-sena";
      const users = await storage.listUsersByCondo(condoId);
      // Remover passwords
      const sanitizedUsers = users.map(({ password, ...rest }) => rest);
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("[ADMIN USERS LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar usuários" });
    }
  });

  app.delete("/api/admin/users/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[ADMIN DELETE USER ERROR]", error);
      res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  });

  app.get("/api/admin/stores", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const admin = await storage.getUser(req.user!.userId);
      if (!admin) return res.status(404).json({ error: "Admin não encontrado" });
      
      const condoId = admin.condoId || "condo-acqua-sena";
      const stores = await storage.getStoresByCondo(condoId);
      res.json(stores);
    } catch (error) {
      console.error("[ADMIN STORES LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar lojas" });
    }
  });

  app.delete("/api/admin/stores/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteStore(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Loja não encontrada" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[ADMIN DELETE STORE ERROR]", error);
      res.status(500).json({ error: "Erro ao deletar loja" });
    }
  });

  app.patch("/api/admin/users/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateUser(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      const { password, ...rest } = updated;
      res.json(rest);
    } catch (error) {
      console.error("[ADMIN UPDATE USER ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  });

  // ✅ USER PROFILE UPDATE (próprio usuário)
  app.patch("/api/users/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Não autenticado" });
      
      // Verificar se está tentando atualizar seu próprio perfil
      if (req.user.userId !== req.params.id) {
        return res.status(403).json({ error: "Você só pode atualizar seu próprio perfil" });
      }

      // Permitir atualizar apenas alguns campos
      const { name, email, phone } = req.body;
      const updated = await storage.updateUser(req.params.id, { name, email, phone });
      
      if (!updated) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      
      const { password, ...rest } = updated;
      res.json(rest);
    } catch (error) {
      console.error("[USER UPDATE PROFILE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
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

  app.get("/api/condominiums/pending/list", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const pendingCondos = await storage.listPendingCondominiums();
      res.json(pendingCondos);
    } catch (error) {
      console.error("[PENDING CONDOS LIST ERROR]", error);
      res.status(500).json({ error: "Erro ao listar condomínios pendentes" });
    }
  });

  app.patch("/api/condominiums/:id", adminMiddleware, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }

      const updated = await storage.updateCondominium(req.params.id, { status });
      if (!updated) return res.status(404).json({ error: "Condomínio não encontrado" });
      
      res.json(updated);
    } catch (error) {
      console.error("[CONDO UPDATE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar condomínio" });
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

  // ✅ FAMILY ACCOUNT ROUTES
  app.get("/api/family/dependents", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const dependents = await storage.getDependentsByParentId(userId);
      res.json(dependents.map(dep => ({
        id: dep.id,
        name: dep.name,
        birthDate: dep.birthDate,
        accountType: dep.accountType,
        relationship: dep.relationship,
        status: dep.status
      })));
    } catch (error) {
      console.error("[FAMILY DEPENDENTS ERROR]", error);
      res.status(500).json({ error: "Erro ao buscar dependentes" });
    }
  });

  app.post("/api/family/dependents", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { name, birthDate, relationship } = req.body;

      if (!name || !birthDate || !relationship) {
        return res.status(400).json({ error: "Nome, data de nascimento e parentesco são obrigatórios" });
      }

      // Validar data de nascimento
      const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!birthDateRegex.test(birthDate)) {
        return res.status(400).json({ error: "Data de nascimento inválida. Use formato YYYY-MM-DD" });
      }

      const birthDateObj = new Date(birthDate);
      if (isNaN(birthDateObj.getTime())) {
        return res.status(400).json({ error: "Data de nascimento inválida" });
      }

      // Calcular idade
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }

      // Verificar se é menor de 18
      if (age >= 18) {
        return res.status(400).json({ error: "Dependentes devem ter menos de 18 anos" });
      }

      // Buscar dados do responsável (adulto)
      const parent = await storage.getUser(userId);
      if (!parent) {
        return res.status(404).json({ error: "Usuário responsável não encontrado" });
      }

      // Criar dependente
      const dependent = await storage.createUser({
        name,
        birthDate,
        relationship,
        parentAccountId: userId,
        accountType: "minor",
        username: `${parent.username}_${name.toLowerCase().replace(/\s+/g, '_')}`,
        password: await authService.hashPassword("temp_password_" + Date.now()),
        email: `${parent.email.split('@')[0]}_${name.toLowerCase().replace(/\s+/g, '_')}@temp.condoplace.com`,
        phone: parent.phone,
        block: parent.block || "",
        unit: parent.unit || "",
        role: "resident",
        status: "blocked_until_18",
        condoId: parent.condoId || undefined,
      });

      res.json({
        id: dependent.id,
        name: dependent.name,
        birthDate: dependent.birthDate,
        accountType: dependent.accountType,
        relationship: dependent.relationship,
        status: dependent.status
      });
    } catch (error) {
      console.error("[ADD DEPENDENT ERROR]", error);
      res.status(500).json({ error: "Erro ao adicionar dependente" });
    }
  });

  app.patch("/api/family/dependents/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const dependentId = req.params.id;
      const { name, relationship } = req.body;

      // Verificar se o dependente pertence ao usuário
      const dependent = await storage.getUser(dependentId);
      if (!dependent || dependent.parentAccountId !== userId) {
        return res.status(404).json({ error: "Dependente não encontrado" });
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (relationship) updates.relationship = relationship;

      const updated = await storage.updateUser(dependentId, updates);
      res.json({
        id: updated!.id,
        name: updated!.name,
        birthDate: updated!.birthDate,
        accountType: updated!.accountType,
        relationship: updated!.relationship,
        status: updated!.status
      });
    } catch (error) {
      console.error("[UPDATE DEPENDENT ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar dependente" });
    }
  });

  app.delete("/api/family/dependents/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const dependentId = req.params.id;

      // Verificar se o dependente pertence ao usuário
      const dependent = await storage.getUser(dependentId);
      if (!dependent || dependent.parentAccountId !== userId) {
        return res.status(404).json({ error: "Dependente não encontrado" });
      }

      await storage.deleteUser(dependentId);
      res.json({ success: true });
    } catch (error) {
      console.error("[DELETE DEPENDENT ERROR]", error);
      res.status(500).json({ error: "Erro ao remover dependente" });
    }
  });

  // ✅ MARKETPLACE ROUTES
  app.get("/api/marketplace", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user || !user.condoId) {
        return res.status(400).json({ error: "Usuário não vinculado a um condomínio" });
      }

      const items = await storage.getMarketplaceItemsByCondo(user.condoId);
      res.json(items);
    } catch (error) {
      console.error("[MARKETPLACE GET ERROR]", error);
      res.status(500).json({ error: "Erro ao buscar itens do marketplace" });
    }
  });

  app.post("/api/marketplace", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.condoId) {
        return res.status(400).json({ error: "Usuário não vinculado a um condomínio" });
      }

      // Validar com Zod schema
      const validation = insertMarketplaceItemSchema.safeParse({
        ...req.body,
        condoId: user.condoId,
        userId,
        block: user.block || null,
        unit: user.unit || null,
        status: "available",
        views: 0,
      });

      if (!validation.success) {
        const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
        return res.status(400).json({ error: errors });
      }

      const data = validation.data;
      
      // Converter price de string para numeric se for venda
      const item = await storage.createMarketplaceItem({
        ...data,
        price: data.type === 'sale' && data.price ? data.price : null,
      });

      res.json(item);
    } catch (error) {
      console.error("[MARKETPLACE CREATE ERROR]", error);
      res.status(500).json({ error: "Erro ao criar item no marketplace" });
    }
  });

  app.patch("/api/marketplace/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const itemId = req.params.id;

      // Verificar se o item pertence ao usuário
      const item = await storage.getMarketplaceItem(itemId);
      if (!item || item.userId !== userId) {
        return res.status(404).json({ error: "Item não encontrado ou você não tem permissão" });
      }

      // Validar com Zod schema (apenas campos permitidos)
      const validation = updateMarketplaceItemSchema.safeParse(req.body);

      if (!validation.success) {
        const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
        return res.status(400).json({ error: errors });
      }

      const data = validation.data;

      // Whitelist explícita - NUNCA permitir alterar condoId, userId, views, createdAt
      const safeUpdates: any = {};
      if (data.title !== undefined) safeUpdates.title = data.title;
      if (data.description !== undefined) safeUpdates.description = data.description;
      if (data.category !== undefined) safeUpdates.category = data.category;
      if (data.price !== undefined) safeUpdates.price = data.price;
      if (data.status !== undefined) safeUpdates.status = data.status;
      if (data.images !== undefined) safeUpdates.images = data.images;

      const updated = await storage.updateMarketplaceItem(itemId, safeUpdates);
      res.json(updated);
    } catch (error) {
      console.error("[MARKETPLACE UPDATE ERROR]", error);
      res.status(500).json({ error: "Erro ao atualizar item" });
    }
  });

  app.delete("/api/marketplace/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const itemId = req.params.id;

      // Verificar se o item pertence ao usuário
      const item = await storage.getMarketplaceItem(itemId);
      if (!item || item.userId !== userId) {
        return res.status(404).json({ error: "Item não encontrado ou você não tem permissão" });
      }

      await storage.deleteMarketplaceItem(itemId);
      res.json({ success: true });
    } catch (error) {
      console.error("[MARKETPLACE DELETE ERROR]", error);
      res.status(500).json({ error: "Erro ao remover item" });
    }
  });

  // ✅ Register admin routes
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
