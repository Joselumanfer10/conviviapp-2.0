import { Request, Response, NextFunction } from 'express';
import { HomeRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ForbiddenError, NotFoundError, UnauthorizedError } from './errorHandler';

// Contexto del hogar adjunto al request
export interface HomeContext {
  home: {
    id: string;
    name: string;
    maxMembers: number;
  };
  membership: {
    id: string;
    role: HomeRole;
  };
  isAdmin: boolean;
}

// Extender Request para incluir homeContext
declare global {
  namespace Express {
    interface Request {
      homeContext?: HomeContext;
    }
  }
}

// Middleware que verifica membresía en el hogar
export const requireHomeMember = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('No autenticado');
    }

    const homeId = req.params.homeId || req.params.id;

    if (!homeId) {
      throw new NotFoundError('ID de hogar no proporcionado');
    }

    // Buscar hogar y membresía en una sola query
    const home = await prisma.home.findUnique({
      where: { id: homeId },
      include: {
        members: {
          where: { userId: req.user.id, isActive: true },
          select: { id: true, role: true },
        },
      },
    });

    if (!home) {
      throw new NotFoundError('Hogar no encontrado');
    }

    const membership = home.members[0];

    if (!membership) {
      throw new ForbiddenError('No eres miembro de este hogar');
    }

    // Adjuntar contexto al request
    req.homeContext = {
      home: {
        id: home.id,
        name: home.name,
        maxMembers: 10, // Por defecto, se puede añadir al modelo
      },
      membership: {
        id: membership.id,
        role: membership.role,
      },
      isAdmin: membership.role === HomeRole.ADMIN,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware que requiere rol de administrador
export const requireHomeAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Primero verificar membresía
    if (!req.homeContext) {
      // Si no hay contexto, ejecutar requireHomeMember primero
      throw new ForbiddenError('Contexto de hogar no disponible');
    }

    if (!req.homeContext.isAdmin) {
      throw new ForbiddenError('Se requiere rol de administrador');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Combina ambos middlewares: membresía + admin
export const requireHomeAdminWithContext = [requireHomeMember, requireHomeAdmin];
