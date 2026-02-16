import { Request, Response, NextFunction } from 'express';
import { calendarService } from '../services/calendar.service';
import { UnauthorizedError, ValidationError } from '../middlewares/errorHandler';

export const calendarController = {
  // POST /api/homes/:homeId/calendar - Crear evento
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const event = await calendarService.create(
        req.homeContext.home.id,
        req.user.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/calendar - Listar eventos
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { month, year } = req.query;

      const events = await calendarService.findAllByHome(
        req.homeContext.home.id,
        {
          month: month ? Number(month) : undefined,
          year: year ? Number(year) : undefined,
        }
      );

      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/calendar/aggregated - Vista agregada
  async getAggregated(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { month, year } = req.query;

      if (!month || !year) {
        throw new ValidationError('Los parametros month y year son requeridos');
      }

      const items = await calendarService.getAggregated(
        req.homeContext.home.id,
        Number(month),
        Number(year)
      );

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/calendar/:eventId - Detalle
  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const event = await calendarService.findById(
        req.params.eventId,
        req.homeContext.home.id
      );

      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/homes/:homeId/calendar/:eventId - Actualizar
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const event = await calendarService.update(
        req.params.eventId,
        req.homeContext.home.id,
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId/calendar/:eventId - Eliminar
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      await calendarService.delete(
        req.params.eventId,
        req.homeContext.home.id,
        req.user.id
      );

      res.json({
        success: true,
        data: { message: 'Evento eliminado correctamente' },
      });
    } catch (error) {
      next(error);
    }
  },
};
