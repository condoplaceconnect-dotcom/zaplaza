import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { type User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const TOKEN_EXPIRY = '1h';

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'resident' | 'vendor' | 'service_provider' | 'admin';
}

export const authService = {
  hashPassword: async (password: string): Promise<string> => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  },

  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  generateToken: (user: User, role?: 'resident' | 'vendor' | 'service_provider' | 'admin'): string => {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      role: (role || user.role || 'resident') as any
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
      issuer: 'condoapp',
      subject: user.id
    });
  },

  verifyToken: (token: string): JWTPayload | null => {
    try {
      const payload = jwt.verify(token, JWT_SECRET, {
        issuer: 'condoapp'
      }) as JWTPayload;
      return payload;
    } catch (error) {
      console.error('[AUTH] Token verification failed:', error);
      return null;
    }
  },

  getTokenFromHeader: (authHeader: string | undefined): string | null => {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
};

// Middleware para proteger rotas
export const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authService.getTokenFromHeader(authHeader);

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const payload = authService.verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  req.user = payload;
  next();
};

// Middleware para admin
export const adminMiddleware = (req: any, res: any, next: any) => {
  authMiddleware(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    next();
  });
};

// Middleware para vendor
export const vendorMiddleware = (req: any, res: any, next: any) => {
  authMiddleware(req, res, () => {
    if (req.user?.role !== 'vendor') {
      return res.status(403).json({ error: 'Acesso restrito a vendedores' });
    }
    next();
  });
};

// Middleware para prestador de serviço
export const serviceProviderMiddleware = (req: any, res: any, next: any) => {
  authMiddleware(req, res, () => {
    if (req.user?.role !== 'service_provider') {
      return res.status(403).json({ error: 'Acesso restrito a prestadores de serviço' });
    }
    next();
  });
};
