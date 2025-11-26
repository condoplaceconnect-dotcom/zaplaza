import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { insertUserSchema, insertCondominiumSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { authMiddleware, AuthenticatedRequest, JWT_SECRET } from "./auth";
// Assuming an email service exists and is configured
import { emailService } from "./email-service"; 

const authRouter = Router();

// POST /api/auth/register-condo (This remains unchanged for now)
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

// POST /api/auth/register - REWRITTEN for public registration with email verification
authRouter.post("/register", async (req: Request, res: Response) => {
    const validation = insertUserSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
    }

    const { email, condoId } = validation.data;

    if (!condoId) {
        return res.status(400).json({ error: { formErrors: ["Condo ID is required."] } });
    }

    try {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: { formErrors: ["An account with this email already exists."] } });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const newUser = await storage.createUser({
            ...validation.data,
            role: 'resident', // Default role for new users
            status: 'active', // User is active, but unverified
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
        });

        await emailService.sendVerificationEmail(newUser.email, verificationToken);

        res.status(201).json({
            message: "Registration successful. Please check your email to verify your account.",
            userId: newUser.id,
        });

    } catch (error: any) {
        console.error("Registration error:", error);
        res.status(500).json({ error: { formErrors: [error.message || "Registration failed due to a server error."] } });
    }
});

// POST /api/auth/login - REWRITTEN to check for email verification
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
        
        // Deny login if email is not verified
        if (!user.isEmailVerified) {
            return res.status(403).json({ 
                error: "Email not verified. Please check your inbox for the verification link.",
                needsVerification: true 
            });
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

// POST /api/auth/verify-email - NEW endpoint
authRouter.post('/verify-email', async (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Verification token is required.' });
    }

    try {
        const user = await storage.verifyUserEmail(token as string);

        const jwtToken = jwt.sign(
            { userId: user.id, condoId: user.condoId, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({ 
            message: 'Email verified successfully. You are now logged in.',
            token: jwtToken,
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Invalid or expired verification token.' });
    }
});

// GET /api/auth/me - Get current user profile (Unchanged)
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