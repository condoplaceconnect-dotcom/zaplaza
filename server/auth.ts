import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import type { User } from '@shared/schema';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h'; // Extend token life for development

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'resident' | 'vendor' | 'service_provider' | 'delivery_person' | 'admin';
  condoId: string | null; // Added condoId to payload
}

export const authService = {
  hashPassword: async (password: string): Promise<string> => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  },

  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  generateToken: (user: User): string => {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      role: user.role as any,
      condoId: user.condoId || null, // Include condoId in the token
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
      issuer: 'condoplace',
      subject: user.id
    });
  },

  verifyToken: (token: string): JWTPayload | null => {
    try {
      return jwt.verify(token, JWT_SECRET, { issuer: 'condoplace' }) as JWTPayload;
    } catch (error) {
      console.error('[AUTH] Token verification failed:', error);
      return null;
    }
  },

  getTokenFromHeader: (authHeader: string | undefined): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1];
  },
};

// ATTACH USER TO REQUEST
// This middleware decodes the token and attaches the payload to req.user
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = authService.getTokenFromHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  const payload = authService.verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  // @ts-ignore - Attach user payload to the Express request object
  req.user = payload;
  next();
};

// ROLE-BASED ACCESS CONTROL

// For any admin (condo-specific or global)
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }
  next();
};

// For GLOBAL admins only (not tied to a condo)
export const globalAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const user = req.user as JWTPayload;
  if (user?.role !== 'admin' || user?.condoId) {
    return res.status(403).json({ error: 'Acesso restrito a administradores globais.' });
  }
  next();
};

// For condo-specific admins only
export const condoAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const user = req.user as JWTPayload;
  if (user?.role !== 'admin' || !user?.condoId) {
    return res.status(403).json({ error: 'Acesso restrito a administradores de condomínio.' });
  }
  next();
};
