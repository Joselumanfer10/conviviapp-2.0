import { Router, type Router as RouterType } from 'express';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  castVoteSchema,
} from '@conviviapp/shared';
import { announcementController } from '../controllers/announcement.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHomeMember } from '../middlewares/home.middleware';

const router: RouterType = Router({ mergeParams: true });

// Todas las rutas requieren autenticacion y ser miembro del hogar
router.use(authenticate);
router.use(requireHomeMember);

// POST /api/homes/:homeId/announcements - Crear anuncio
router.post('/', validateBody(createAnnouncementSchema), announcementController.create);

// GET /api/homes/:homeId/announcements - Listar anuncios
router.get('/', announcementController.findAll);

// GET /api/homes/:homeId/announcements/:announcementId - Detalle
router.get('/:announcementId', announcementController.findOne);

// PATCH /api/homes/:homeId/announcements/:announcementId - Actualizar
router.patch(
  '/:announcementId',
  validateBody(updateAnnouncementSchema),
  announcementController.update
);

// DELETE /api/homes/:homeId/announcements/:announcementId - Eliminar
router.delete('/:announcementId', announcementController.delete);

// POST /api/homes/:homeId/announcements/:announcementId/toggle-pin - Fijar/desfijar
router.post('/:announcementId/toggle-pin', announcementController.togglePin);

// POST /api/homes/:homeId/announcements/:announcementId/vote - Votar
router.post(
  '/:announcementId/vote',
  validateBody(castVoteSchema),
  announcementController.castVote
);

// DELETE /api/homes/:homeId/announcements/:announcementId/vote - Eliminar voto
router.delete('/:announcementId/vote', announcementController.removeVote);

// GET /api/homes/:homeId/announcements/:announcementId/results - Resultados
router.get('/:announcementId/results', announcementController.getResults);

export default router;
