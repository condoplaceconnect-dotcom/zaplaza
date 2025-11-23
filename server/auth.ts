import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { type User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const TOKEN_EXPIRY = '1h'; // Token expira em 1 hora

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'user' | 'vendor' | 'driver' | 'admin';
}

export const authService = {
  // Hash de password
  hashPassword: async (password: string): Promise<string> => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  },

  // Verificar password
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  // Gerar JWT token
  generateToken: (user: User, role: 'user' | 'vendor' | 'driver' | 'admin' = 'user'): string => {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      role
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
      issuer: 'condoapp',
      subject: user.id
    });
  },

  // Verificar e decodificar JWT token
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

  // Extrair token do header Authorization
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

  // Anexar payload ao request para uso posterior
  req.user = payload;
  next();
};

// Middleware para proteger rotas admin
export const adminMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authService.getTokenFromHeader(authHeader);

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const payload = authService.verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  if (payload.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar.' });
  }

  req.user = payload;
  next();
};
