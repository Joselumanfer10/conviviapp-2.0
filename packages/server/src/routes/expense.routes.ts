import { Router, type Router as RouterType } from 'express';
import {
  createExpenseSchema,
  updateExpenseSchema,
  createSettlementSchema,
} from '@conviviapp/shared';
import { expenseController } from '../controllers/expense.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHomeMember } from '../middlewares/home.middleware';

const router: RouterType = Router({ mergeParams: true });

// Todas las rutas requieren autenticación y ser miembro del hogar
router.use(authenticate);
router.use(requireHomeMember);

// ============ Balances (debe ir ANTES de /:expenseId) ============

// GET /api/homes/:homeId/expenses/balances - Obtener balances
router.get('/balances', expenseController.getBalances);

// ============ Liquidaciones (debe ir ANTES de /:expenseId) ============

// GET /api/homes/:homeId/expenses/settlements/suggested - Transferencias sugeridas
router.get('/settlements/suggested', expenseController.getSuggestedTransfers);

// GET /api/homes/:homeId/expenses/settlements - Listar liquidaciones
router.get('/settlements', expenseController.findAllSettlements);

// POST /api/homes/:homeId/expenses/settlements - Crear liquidación
router.post('/settlements', validateBody(createSettlementSchema), expenseController.createSettlement);

// GET /api/homes/:homeId/expenses/settlements/:settlementId - Detalle
router.get('/settlements/:settlementId', expenseController.findOneSettlement);

// POST /api/homes/:homeId/expenses/settlements/:settlementId/confirm - Confirmar
router.post('/settlements/:settlementId/confirm', expenseController.confirmSettlement);

// POST /api/homes/:homeId/expenses/settlements/:settlementId/reject - Rechazar
router.post('/settlements/:settlementId/reject', expenseController.rejectSettlement);

// DELETE /api/homes/:homeId/expenses/settlements/:settlementId - Cancelar
router.delete('/settlements/:settlementId', expenseController.cancelSettlement);

// ============ Gastos ============

// POST /api/homes/:homeId/expenses - Crear gasto
router.post('/', validateBody(createExpenseSchema), expenseController.create);

// GET /api/homes/:homeId/expenses - Listar gastos
router.get('/', expenseController.findAll);

// GET /api/homes/:homeId/expenses/:expenseId - Detalle (debe ir AL FINAL)
router.get('/:expenseId', expenseController.findOne);

// PATCH /api/homes/:homeId/expenses/:expenseId - Actualizar
router.patch('/:expenseId', validateBody(updateExpenseSchema), expenseController.update);

// DELETE /api/homes/:homeId/expenses/:expenseId - Eliminar
router.delete('/:expenseId', expenseController.delete);

export default router;
