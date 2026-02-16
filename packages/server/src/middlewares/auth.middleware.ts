import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '@conviviapp/shared';
import { verifyAccessToken } from '../lib/jwt';
import { UnauthorizedError } from './errorHandler';

// Extender Request para incluir usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Extraer token del header Authorization
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
};

// Middleware que requiere autenticación
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Token de acceso no proporcionado');
    }

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: '', // Se puede obtener de la DB si es necesario
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Token de acceso inválido o expirado'));
    }
  }
};

// Middleware opcional de autenticación (no falla si no hay token)
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = {
        id: payload.sub,
        email: payload.email,
        name: '',
      };
    }

    next();
  } catch {
    // Si el token es inválido, simplemente continuamos sin usuario
    next();
  }
};
