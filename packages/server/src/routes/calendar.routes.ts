import { Router, type Router as RouterType } from 'express';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
} from '@conviviapp/shared';
import { calendarController } from '../controllers/calendar.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHomeMember } from '../middlewares/home.middleware';

const router: RouterType = Router({ mergeParams: true });

// Todas las rutas requieren autenticacion y ser miembro del hogar
router.use(authenticate);
router.use(requireHomeMember);

// POST /api/homes/:homeId/calendar - Crear evento
router.post('/', validateBody(createCalendarEventSchema), calendarController.create);

// GET /api/homes/:homeId/calendar - Listar eventos
router.get('/', calendarController.findAll);

// GET /api/homes/:homeId/calendar/aggregated - Vista agregada
router.get('/aggregated', calendarController.getAggregated);

// GET /api/homes/:homeId/calendar/:eventId - Detalle
router.get('/:eventId', calendarController.findOne);

// PATCH /api/homes/:homeId/calendar/:eventId - Actualizar
router.patch(
  '/:eventId',
  validateBody(updateCalendarEventSchema),
  calendarController.update
);

// DELETE /api/homes/:homeId/calendar/:eventId - Eliminar
router.delete('/:eventId', calendarController.delete);

export default router;
