import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { insertUserSchema, insertCondominiumSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware, AuthenticatedRequest, JWT_SECRET } from "./auth";

const authRouter = Router();

// POST /api/auth/register-condo
authRouter.post("/register-condo", async (req: Request, res: Response) => {
    const validation = insertCondominiumSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
    }
    try {
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newCondo = await storage.createCondominium({ ...validation.data, inviteCode });
        res.status(201).json(newCondo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create condominium" });
    }
});

// POST /api/auth/register
authRouter.post("/register", async (req: Request, res: Response) => {
    const { inviteCode, ...userData } = req.body;
    const validation = insertUserSchema.safeParse(userData);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
    }
    if (!inviteCode) {
        return res.status(400).json({ error: "Invite code is required" });
    }
    try {
        const newUser = await storage.createUser(validation.data, inviteCode);
        res.status(201).json({ id: newUser.id, name: newUser.name });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    try {
        const user = await storage.getUserByEmail(email);
        if (!user || !user.password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign(
            { userId: user.id, condoId: user.condoId, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: "7d" }
        );
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during login" });
    }
});

// GET /api/auth/me - Get current user profile
authRouter.get("/me", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await storage.getUser(req.user!.userId);
        if (!user) return res.status(404).json({ error: "User not found"});
        
        const condo = user.condoId ? await storage.getCondominium(user.condoId) : null;

        res.json({ 
            id: user.id, 
            name: user.name, 
            email: user.email,
            condoId: user.condoId,
            condoName: condo?.name, // Add condo name
            condoStatus: condo?.status, // Add condo status
            block: user.block,
            unit: user.unit,
            role: user.role, 
            isEmailVerified: user.isEmailVerified
        });
    } catch(e) {
        res.status(500).json({ error: "Internal server error" });
    }
});

export { authRouter };
