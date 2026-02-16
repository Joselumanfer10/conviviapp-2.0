import { Router, type Router as RouterType } from 'express';
import {
  createHomeSchema,
  updateHomeSchema,
  joinHomeSchema,
  updateMemberRoleSchema,
  transferOwnershipSchema,
} from '@conviviapp/shared';
import { homeController } from '../controllers/home.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHomeMember, requireHomeAdminWithContext } from '../middlewares/home.middleware';

const router: RouterType = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// ============ Rutas de Hogares ============

// POST /api/homes - Crear hogar
router.post('/', validateBody(createHomeSchema), homeController.create);

// GET /api/homes - Listar mis hogares
router.get('/', homeController.findAll);

// POST /api/homes/join - Unirse con código
router.post('/join', validateBody(joinHomeSchema), homeController.join);

// GET /api/homes/:homeId - Detalle de hogar (requiere ser miembro)
router.get('/:homeId', requireHomeMember, homeController.findOne);

// PATCH /api/homes/:homeId - Actualizar hogar (requiere admin)
router.patch(
  '/:homeId',
  ...requireHomeAdminWithContext,
  validateBody(updateHomeSchema),
  homeController.update
);

// DELETE /api/homes/:homeId - Eliminar hogar (requiere admin)
router.delete('/:homeId', ...requireHomeAdminWithContext, homeController.delete);

// POST /api/homes/:homeId/leave - Salir del hogar
router.post('/:homeId/leave', requireHomeMember, homeController.leave);

// ============ Rutas de Invitación ============

// POST /api/homes/:homeId/invite/regenerate - Regenerar código (requiere admin)
router.post(
  '/:homeId/invite/regenerate',
  ...requireHomeAdminWithContext,
  homeController.regenerateInviteCode
);

// ============ Rutas de Miembros ============

// GET /api/homes/:homeId/members - Listar miembros
router.get('/:homeId/members', requireHomeMember, homeController.getMembers);

// PATCH /api/homes/:homeId/members/:memberId - Cambiar rol (requiere admin)
router.patch(
  '/:homeId/members/:memberId',
  ...requireHomeAdminWithContext,
  validateBody(updateMemberRoleSchema),
  homeController.updateMember
);

// DELETE /api/homes/:homeId/members/:memberId - Expulsar miembro (requiere admin)
router.delete(
  '/:homeId/members/:memberId',
  ...requireHomeAdminWithContext,
  homeController.removeMember
);

// POST /api/homes/:homeId/transfer - Transferir administración (requiere admin)
router.post(
  '/:homeId/transfer',
  ...requireHomeAdminWithContext,
  validateBody(transferOwnershipSchema),
  homeController.transferOwnership
);

export default router;
