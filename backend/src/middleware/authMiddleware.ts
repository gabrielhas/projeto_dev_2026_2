import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  id: number;
  email: string;
  name: string;
}

// Extende a tipagem do Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    // 1. Tentar ler do cookie seguro HttpOnly
    if (req.cookies && (req.cookies.token || req.cookies.jwt)) {
      token = req.cookies.token || req.cookies.jwt;
    }

    // 2. Fallback: Ler do Header Authorization: Bearer <token>
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Faça login para continuar.'
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_games_mupi_2026_change_in_production';
    const decoded = jwt.verify(token, secret) as AuthPayload;

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Sua sessão expirou. Por favor, faça login novamente.'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Token de autenticação inválido ou corrompido.'
    });
  }
};
