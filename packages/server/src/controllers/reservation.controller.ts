import { Request, Response, NextFunction } from 'express';
import { reservationService } from '../services/reservation.service';
import { UnauthorizedError, ForbiddenError } from '../middlewares/errorHandler';

export const reservationController = {
  // ==================== SPACES ====================

  // POST /api/homes/:homeId/reservations/spaces - Crear espacio
  async createSpace(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      if (!req.homeContext.isAdmin) {
        throw new ForbiddenError('Solo los administradores pueden crear espacios');
      }

      const space = await reservationService.createSpace(
        req.homeContext.home.id,
        req.body,
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: space,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/reservations/spaces - Listar espacios
  async findAllSpaces(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const spaces = await reservationService.findAllSpaces(req.homeContext.home.id);

      res.json({
        success: true,
        data: spaces,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/reservations/spaces/:spaceId - Detalle espacio
  async findSpaceById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const space = await reservationService.findSpaceById(
        req.params.spaceId,
        req.homeContext.home.id
      );

      res.json({
        success: true,
        data: space,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/homes/:homeId/reservations/spaces/:spaceId - Actualizar espacio
  async updateSpace(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      if (!req.homeContext.isAdmin) {
        throw new ForbiddenError('Solo los administradores pueden actualizar espacios');
      }

      const space = await reservationService.updateSpace(
        req.params.spaceId,
        req.homeContext.home.id,
        req.body,
        req.user.id
      );

      res.json({
        success: true,
        data: space,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId/reservations/spaces/:spaceId - Eliminar espacio
  async deleteSpace(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      if (!req.homeContext.isAdmin) {
        throw new ForbiddenError('Solo los administradores pueden eliminar espacios');
      }

      await reservationService.deleteSpace(
        req.params.spaceId,
        req.homeContext.home.id,
        req.user.id
      );

      res.json({
        success: true,
        data: { message: 'Espacio eliminado correctamente' },
      });
    } catch (error) {
      next(error);
    }
  },

  // ==================== RESERVATIONS ====================

  // POST /api/homes/:homeId/reservations/spaces/:spaceId/reservations - Crear reserva
  async createReservation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const reservation = await reservationService.createReservation(
        req.homeContext.home.id,
        req.user.id,
        req.params.spaceId,
        req.body
      );

      res.status(201).json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/reservations/spaces/:spaceId/reservations - Reservas de un espacio
  async findBySpace(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { date } = req.query;

      const reservations = await reservationService.findBySpace(
        req.params.spaceId,
        req.homeContext.home.id,
        date as string | undefined
      );

      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/reservations - Todas las reservas del hogar
  async findByHome(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { date } = req.query;

      const reservations = await reservationService.findByHome(
        req.homeContext.home.id,
        date as string | undefined
      );

      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId/reservations/:reservationId - Eliminar reserva
  async deleteReservation(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      await reservationService.deleteReservation(
        req.params.reservationId,
        req.homeContext.home.id,
        req.user.id,
        req.homeContext.isAdmin
      );

      res.json({
        success: true,
        data: { message: 'Reserva cancelada correctamente' },
      });
    } catch (error) {
      next(error);
    }
  },
};
