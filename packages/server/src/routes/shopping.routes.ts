import { Router, type Router as RouterType } from 'express';
import {
  createShoppingItemSchema,
  updateShoppingItemSchema,
  buyShoppingItemSchema,
} from '@conviviapp/shared';
import { shoppingController } from '../controllers/shopping.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHomeMember } from '../middlewares/home.middleware';
import { z } from 'zod';

// Schema para conversión a gasto
const convertToExpenseSchema = z.object({
  itemIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un item'),
  description: z.string().optional(),
});

const router: RouterType = Router({ mergeParams: true });

// Todas las rutas requieren autenticación y ser miembro del hogar
router.use(authenticate);
router.use(requireHomeMember);

// GET /api/homes/:homeId/shopping/categories - Categorías (antes de /:itemId)
router.get('/categories', shoppingController.getCategories);

// POST /api/homes/:homeId/shopping/convert-to-expense - Convertir a gasto
router.post(
  '/convert-to-expense',
  validateBody(convertToExpenseSchema),
  shoppingController.convertToExpense
);

// POST /api/homes/:homeId/shopping - Crear item
router.post('/', validateBody(createShoppingItemSchema), shoppingController.create);

// GET /api/homes/:homeId/shopping - Listar items
router.get('/', shoppingController.findAll);

// GET /api/homes/:homeId/shopping/:itemId - Detalle
router.get('/:itemId', shoppingController.findOne);

// PATCH /api/homes/:homeId/shopping/:itemId - Actualizar
router.patch('/:itemId', validateBody(updateShoppingItemSchema), shoppingController.update);

// DELETE /api/homes/:homeId/shopping/:itemId - Eliminar
router.delete('/:itemId', shoppingController.delete);

// POST /api/homes/:homeId/shopping/:itemId/buy - Marcar como comprado
router.post('/:itemId/buy', validateBody(buyShoppingItemSchema), shoppingController.markAsBought);

// POST /api/homes/:homeId/shopping/:itemId/cancel - Cancelar
router.post('/:itemId/cancel', shoppingController.cancel);

// POST /api/homes/:homeId/shopping/:itemId/restore - Restaurar
router.post('/:itemId/restore', shoppingController.restore);

export default router;
