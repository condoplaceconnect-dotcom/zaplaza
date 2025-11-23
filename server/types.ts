// Extend Express Request com suporte a user autenticado
import { type Request } from 'express';
import { type JWTPayload } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export {};
