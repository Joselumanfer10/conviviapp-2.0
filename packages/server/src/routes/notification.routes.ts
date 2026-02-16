import { Router, type Router as RouterType } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router: RouterType = Router();

// Todas las rutas requieren autenticación (son personales, no de hogar)
router.use(authenticate);

// GET /api/notifications - Listar notificaciones del usuario
router.get('/', notificationController.findAll);

// GET /api/notifications/unread-count - Contar no leídas
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/notifications/mark-all-read - Marcar todas como leídas
router.patch('/mark-all-read', notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read - Marcar como leída
router.patch('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications/:id - Eliminar
router.delete('/:id', notificationController.delete);

export default router;
