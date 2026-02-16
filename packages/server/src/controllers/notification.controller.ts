import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { UnauthorizedError } from '../middlewares/errorHandler';

export const notificationController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError('No autenticado');
      const { isRead, limit, offset } = req.query;
      const result = await notificationService.findByUser(req.user.id, {
        isRead: isRead !== undefined ? isRead === 'true' : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError('No autenticado');
      const count = await notificationService.getUnreadCount(req.user.id);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError('No autenticado');
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError('No autenticado');
      await notificationService.markAllAsRead(req.user.id);
      res.json({ success: true, data: { message: 'Todas las notificaciones marcadas como leídas' } });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError('No autenticado');
      await notificationService.delete(req.params.id, req.user.id);
      res.json({ success: true, data: { message: 'Notificación eliminada' } });
    } catch (error) {
      next(error);
    }
  },
};
