import { Request, Response, NextFunction } from 'express';
import { announcementService } from '../services/announcement.service';
import { UnauthorizedError } from '../middlewares/errorHandler';

export const announcementController = {
  // POST /api/homes/:homeId/announcements - Crear anuncio
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const announcement = await announcementService.create(
        req.homeContext.home.id,
        req.user.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: announcement,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/announcements - Listar anuncios
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { type } = req.query;

      const announcements = await announcementService.findAllByHome(
        req.homeContext.home.id,
        {
          type: type as any,
        }
      );

      res.json({
        success: true,
        data: announcements,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/announcements/:announcementId - Detalle
  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const announcement = await announcementService.findById(
        req.params.announcementId,
        req.homeContext.home.id
      );

      res.json({
        success: true,
        data: announcement,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/homes/:homeId/announcements/:announcementId - Actualizar
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const announcement = await announcementService.update(
        req.params.announcementId,
        req.homeContext.home.id,
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        data: announcement,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId/announcements/:announcementId - Eliminar
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      await announcementService.delete(
        req.params.announcementId,
        req.homeContext.home.id,
        req.user.id
      );

      res.json({
        success: true,
        data: { message: 'Anuncio eliminado correctamente' },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/announcements/:announcementId/toggle-pin - Fijar/desfijar
  async togglePin(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const announcement = await announcementService.togglePin(
        req.params.announcementId,
        req.homeContext.home.id,
        req.user.id
      );

      res.json({
        success: true,
        data: announcement,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/announcements/:announcementId/vote - Votar
  async castVote(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const vote = await announcementService.castVote(
        req.params.announcementId,
        req.homeContext.home.id,
        req.user.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: vote,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId/announcements/:announcementId/vote - Eliminar voto
  async removeVote(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      await announcementService.removeVote(
        req.params.announcementId,
        req.homeContext.home.id,
        req.user.id
      );

      res.json({
        success: true,
        data: { message: 'Voto eliminado correctamente' },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/announcements/:announcementId/results - Resultados
  async getResults(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const results = await announcementService.getResults(
        req.params.announcementId,
        req.homeContext.home.id
      );

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },
};
