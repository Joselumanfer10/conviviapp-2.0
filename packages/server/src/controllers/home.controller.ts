import { Request, Response, NextFunction } from 'express';
import { homeService } from '../services/home.service';
import { UnauthorizedError } from '../middlewares/errorHandler';

export const homeController = {
  // POST /api/homes - Crear hogar
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const home = await homeService.create(req.user.id, req.body);

      res.status(201).json({
        success: true,
        data: home,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes - Listar mis hogares
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const homes = await homeService.findAllByUser(req.user.id);

      res.json({
        success: true,
        data: homes,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId - Detalle de hogar
  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const home = await homeService.findById(req.params.homeId, req.user.id);

      res.json({
        success: true,
        data: home,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/homes/:homeId - Actualizar hogar
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const home = await homeService.update(req.params.homeId, req.body);

      res.json({
        success: true,
        data: home,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId - Eliminar hogar
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await homeService.delete(req.params.homeId);

      res.json({
        success: true,
        data: { message: 'Hogar eliminado correctamente' },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/invite/regenerate - Regenerar código
  async regenerateInviteCode(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await homeService.regenerateInviteCode(req.params.homeId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/join - Unirse con código
  async join(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const result = await homeService.join(req.user.id, req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/leave - Salir del hogar
  async leave(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const result = await homeService.leave(req.params.homeId, req.user.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/members - Listar miembros
  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const members = await homeService.getMembers(req.params.homeId, req.user.id);

      res.json({
        success: true,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/homes/:homeId/members/:memberId - Cambiar rol
  async updateMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const member = await homeService.updateMemberRole(
        req.params.homeId,
        req.params.memberId,
        req.body.role,
        req.user.id
      );

      res.json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId/members/:memberId - Expulsar miembro
  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const result = await homeService.removeMember(
        req.params.homeId,
        req.params.memberId,
        req.user.id
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/transfer - Transferir administración
  async transferOwnership(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const result = await homeService.transferOwnership(
        req.params.homeId,
        req.body.newAdminId,
        req.user.id
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
