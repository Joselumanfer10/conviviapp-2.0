import { Router, type Router as RouterType } from 'express';
import { createHouseRuleSchema, updateHouseRuleSchema } from '@conviviapp/shared';
import { houseRuleController } from '../controllers/house-rule.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHomeMember } from '../middlewares/home.middleware';

const router: RouterType = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireHomeMember);

// POST /api/homes/:homeId/rules - Crear regla
router.post('/', validateBody(createHouseRuleSchema), houseRuleController.create);

// GET /api/homes/:homeId/rules - Listar reglas
router.get('/', houseRuleController.findAll);

// GET /api/homes/:homeId/rules/:ruleId - Detalle
router.get('/:ruleId', houseRuleController.findOne);

// PATCH /api/homes/:homeId/rules/:ruleId - Actualizar
router.patch('/:ruleId', validateBody(updateHouseRuleSchema), houseRuleController.update);

// DELETE /api/homes/:homeId/rules/:ruleId - Eliminar
router.delete('/:ruleId', houseRuleController.delete);

// POST /api/homes/:homeId/rules/:ruleId/accept - Aceptar regla
router.post('/:ruleId/accept', houseRuleController.accept);

// GET /api/homes/:homeId/rules/:ruleId/acceptance - Estado de aceptacion
router.get('/:ruleId/acceptance', houseRuleController.getAcceptanceStatus);

export default router;
