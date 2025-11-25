import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { authService, authMiddleware } from "./auth";
import { insertUserSchema, loginUserSchema, insertMarketplaceItemSchema, updateMarketplaceItemSchema } from "@shared/schema"; 
import { registerAdminRoutes } from "./admin-routes";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {

  // ✅ AUTH ROUTES
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validation = loginUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Dados de login inválidos." });
      }

      const { username, password } = validation.data;
      const user = await storage.getUserByUsername(username);

      if (!user || !user.password) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      const isPasswordValid = await authService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      if (!user.emailVerified) {
        return res.status(403).json({ error: "E-mail não verificado. Por favor, verifique seu e-mail antes de fazer login." });
      }

      const token = authService.generateToken(user);
      const { password: _, ...userResponse } = user; // Exclude password from response

      res.status(200).json({ token, user: userResponse });

    } catch (error: any) {
      console.error("[LOGIN ERROR]", error);
      res.status(500).json({ error: "Erro interno no servidor ao tentar fazer login." });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      const { password, ...userResponse } = user;
      res.status(200).json(userResponse);

    } catch (error: any) {
      console.error("[ME ERROR]", error);
      res.status(500).json({ error: "Erro interno no servidor ao buscar dados do usuário." });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const { password, ...userData } = validation.data;
      if (!userData.condoId) {
          return res.status(400).json({ error: "CondoId é obrigatório" });
      }
      const hashedPassword = await authService.hashPassword(password);

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        status: "pending_verification",
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
        condoId: userData.condoId
      });
      
      const verificationBaseUrl = process.env.NODE_ENV === 'production' ? 'https://your-production-app.com' : 'http://localhost:5173';
      const verificationLink = `${verificationBaseUrl}/verify-email?token=${verificationToken}`;

      console.log(`[EMAIL VERIFICATION] Link para ${newUser.username}: ${verificationLink}`);

      res.status(201).json({ 
        message: "Registro bem-sucedido! Um link de verificação foi enviado para o seu e-mail (verifique o console do servidor).",
        user: { id: newUser.id, username: newUser.username }
      });

    } catch (error: any) {
      if (error.message.includes("users_username_unique")) {
        return res.status(409).json({ error: "Nome de usuário já existe." });
      }
      if (error.message.includes("users_email_unique")) {
        return res.status(409).json({ error: "E-mail já está em uso." });
      }
      console.error("[REGISTER ERROR]", error);
      res.status(500).json({ error: "Erro interno no servidor ao tentar registrar." });
    }
  });

  app.get("/api/auth/verify-email", async (req: Request, res: Response) => {
    const loginBaseUrl = process.env.NODE_ENV === 'production' ? 'https://your-production-app.com' : 'http://localhost:5173';
    const loginUrl = new URL("/login", loginBaseUrl);

    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        loginUrl.searchParams.set("error", "Token de verificação não fornecido.");
        return res.redirect(loginUrl.toString());
      }

      const user = await storage.getUserByVerificationToken(token);

      if (!user || !user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
        loginUrl.searchParams.set("error", "Token inválido ou expirado. Por favor, solicite um novo link de verificação.");
        return res.redirect(loginUrl.toString());
      }

      await storage.updateUser(user.id, {
        emailVerified: true,
        status: "active",
        verificationToken: undefined,
        verificationTokenExpiry: undefined,
      });

      loginUrl.searchParams.set("verified", "true");
      return res.redirect(loginUrl.toString());

    } catch (error) {
      console.error("[VERIFY EMAIL ERROR]", error);
      loginUrl.searchParams.set("error", "Erro ao verificar o e-mail.");
      return res.redirect(loginUrl.toString());
    }
  });

  // ✅ MARKETPLACE ROUTES
  app.get("/api/marketplace", authMiddleware, async (req: Request, res: Response) => {
      try {
          // @ts-ignore
          const user = req.user;
          if (!user || !user.condoId) {
              return res.status(403).json({ error: "Acesso negado." });
          }
          const items = await storage.getMarketplaceItemsByCondo(user.condoId);
          res.status(200).json(items);
      } catch (error) {
          console.error("[MARKETPLACE LIST ERROR]", error);
          res.status(500).json({ error: "Erro ao listar itens do marketplace." });
      }
  });

  app.post("/api/marketplace", authMiddleware, async (req: Request, res: Response) => {
      try {
          // @ts-ignore
          const user = req.user;
          const validation = insertMarketplaceItemSchema.safeParse(req.body);
          if (!validation.success) {
              return res.status(400).json({ error: validation.error.flatten() });
          }

          const newItem = await storage.createMarketplaceItem({
              ...validation.data,
              userId: user.id,
              condoId: user.condoId,
          });
          res.status(201).json(newItem);
      } catch (error) {
          console.error("[MARKETPLACE CREATE ERROR]", error);
          res.status(500).json({ error: "Erro ao criar item no marketplace." });
      }
  });

  app.patch("/api/marketplace/:id", authMiddleware, async (req: Request, res: Response) => {
      try {
          // @ts-ignore
          const user = req.user;
          const { id } = req.params;
          const validation = updateMarketplaceItemSchema.safeParse(req.body);
          if (!validation.success) {
              return res.status(400).json({ error: validation.error.flatten() });
          }
          const updatedItem = await storage.updateMarketplaceItem(id, validation.data, user.id);
          res.status(200).json(updatedItem);
      } catch (error) {
          console.error("[MARKETPLACE UPDATE ERROR]", error);
          res.status(500).json({ error: "Erro ao atualizar item no marketplace." });
      }
  });

  app.delete("/api/marketplace/:id", authMiddleware, async (req: Request, res: Response) => {
      try {
          // @ts-ignore
          const user = req.user;
          const { id } = req.params;

          const item = await storage.getMarketplaceItem(id);
          if (item?.userId !== user.id) {
              return res.status(403).json({ error: "Você não tem permissão para remover este item." });
          }

          await storage.deleteMarketplaceItem(id);
          res.status(204).send();
      } catch (error) {
          console.error("[MARKETPLACE DELETE ERROR]", error);
          res.status(500).json({ error: "Erro ao remover item do marketplace." });
      }
  });

  
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
