import { Router, type Router as RouterType } from 'express';
import {
  createSharedSpaceSchema,
  updateSharedSpaceSchema,
  createReservationSchema,
} from '@conviviapp/shared';
import { reservationController } from '../controllers/reservation.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHomeMember } from '../middlewares/home.middleware';

const router: RouterType = Router({ mergeParams: true });

// Todas las rutas requieren autenticacion y ser miembro del hogar
router.use(authenticate);
router.use(requireHomeMember);

// ==================== SPACES ====================

// POST /api/homes/:homeId/reservations/spaces - Crear espacio
router.post(
  '/spaces',
  validateBody(createSharedSpaceSchema),
  reservationController.createSpace
);

// GET /api/homes/:homeId/reservations/spaces - Listar espacios
router.get('/spaces', reservationController.findAllSpaces);

// GET /api/homes/:homeId/reservations/spaces/:spaceId - Detalle espacio
router.get('/spaces/:spaceId', reservationController.findSpaceById);

// PATCH /api/homes/:homeId/reservations/spaces/:spaceId - Actualizar espacio
router.patch(
  '/spaces/:spaceId',
  validateBody(updateSharedSpaceSchema),
  reservationController.updateSpace
);

// DELETE /api/homes/:homeId/reservations/spaces/:spaceId - Eliminar espacio
router.delete('/spaces/:spaceId', reservationController.deleteSpace);

// ==================== RESERVATIONS ====================

// POST /api/homes/:homeId/reservations/spaces/:spaceId/reservations - Crear reserva
router.post(
  '/spaces/:spaceId/reservations',
  validateBody(createReservationSchema),
  reservationController.createReservation
);

// GET /api/homes/:homeId/reservations/spaces/:spaceId/reservations - Reservas de un espacio
router.get('/spaces/:spaceId/reservations', reservationController.findBySpace);

// GET /api/homes/:homeId/reservations - Todas las reservas del hogar
router.get('/', reservationController.findByHome);

// DELETE /api/homes/:homeId/reservations/:reservationId - Cancelar reserva
router.delete('/:reservationId', reservationController.deleteReservation);

export default router;
