import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
}

// Extend the Express Request interface to include our custom user property
export interface AuthenticatedRequest extends Request {
  user?: { userId: string; condoId: string; role: string };
}

// Middleware to authenticate JWT tokens
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ error: "No token provided" }); // No token, unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" }); // Invalid token
    }
    req.user = user as { userId: string; condoId: string; role: string };
    next();
  });
};

// Optional: Middleware to check for admin role
export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Access denied: Admins only" });
    }
    next();
};
