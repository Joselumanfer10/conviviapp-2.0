import { Router, type Router as RouterType } from 'express';
import authRoutes from './auth.routes';
import homeRoutes from './home.routes';
import expenseRoutes from './expense.routes';
import taskRoutes from './task.routes';
import shoppingRoutes from './shopping.routes';
import announcementRoutes from './announcement.routes';
import calendarRoutes from './calendar.routes';
import reservationRoutes from './reservation.routes';
import houseRuleRoutes from './house-rule.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import { authenticate } from '../middlewares/auth.middleware';
import { taskController } from '../controllers/task.controller';

const router: RouterType = Router();

// Montar rutas
router.use('/auth', authRoutes);
router.use('/homes', homeRoutes);

// Rutas anidadas bajo homes - Expenses (incluye balances y settlements)
router.use('/homes/:homeId/expenses', expenseRoutes);

// Rutas anidadas bajo homes - Tasks
router.use('/homes/:homeId/tasks', taskRoutes);

// Rutas anidadas bajo homes - Shopping
router.use('/homes/:homeId/shopping', shoppingRoutes);

// Rutas anidadas bajo homes - Announcements
router.use('/homes/:homeId/announcements', announcementRoutes);

// Rutas anidadas bajo homes - Calendar
router.use('/homes/:homeId/calendar', calendarRoutes);

// Rutas anidadas bajo homes - Reservations
router.use('/homes/:homeId/reservations', reservationRoutes);

// Rutas anidadas bajo homes - House Rules
router.use('/homes/:homeId/rules', houseRuleRoutes);

// Rutas anidadas bajo homes - Reports
router.use('/homes/:homeId/reports', reportRoutes);

// Rutas de notificaciones (personales, no anidadas bajo homes)
router.use('/notifications', notificationRoutes);

// Ruta de mis asignaciones (fuera del contexto de hogar)
router.get('/me/assignments', authenticate, taskController.findMyAssignments);

export default router;
