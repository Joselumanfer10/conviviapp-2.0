import { Router, type Router as RouterType } from 'express';
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  completeTaskSchema,
} from '@conviviapp/shared';
import { taskController } from '../controllers/task.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHomeMember } from '../middlewares/home.middleware';

const router: RouterType = Router({ mergeParams: true });

// Todas las rutas requieren autenticación y ser miembro del hogar
router.use(authenticate);
router.use(requireHomeMember);

// ============ Rutas especiales (antes de /:taskId) ============

// GET /api/homes/:homeId/tasks/karma - Ranking de karma
router.get('/karma', taskController.getKarmaRanking);

// GET /api/homes/:homeId/tasks/assignments - Listar asignaciones del hogar
router.get('/assignments', taskController.findAllAssignments);

// ============ Tareas (Plantillas) ============

// POST /api/homes/:homeId/tasks - Crear tarea
router.post('/', validateBody(createTaskSchema), taskController.create);

// GET /api/homes/:homeId/tasks - Listar tareas
router.get('/', taskController.findAll);

// GET /api/homes/:homeId/tasks/:taskId - Detalle (debe ir después de rutas fijas)
router.get('/:taskId', taskController.findOne);

// PATCH /api/homes/:homeId/tasks/:taskId - Actualizar
router.patch('/:taskId', validateBody(updateTaskSchema), taskController.update);

// DELETE /api/homes/:homeId/tasks/:taskId - Eliminar (soft delete)
router.delete('/:taskId', taskController.delete);

// POST /api/homes/:homeId/tasks/:taskId/assignments - Crear asignación
router.post('/:taskId/assignments', validateBody(assignTaskSchema), taskController.createAssignment);

// ============ Asignaciones (detalle y acciones) ============

// GET /api/homes/:homeId/tasks/assignments/:assignmentId - Detalle asignación
router.get('/assignments/:assignmentId', taskController.findOneAssignment);

// POST /api/homes/:homeId/assignments/:assignmentId/start - Iniciar
router.post('/assignments/:assignmentId/start', taskController.startAssignment);

// POST /api/homes/:homeId/assignments/:assignmentId/complete - Completar
router.post(
  '/assignments/:assignmentId/complete',
  validateBody(completeTaskSchema),
  taskController.completeAssignment
);

// POST /api/homes/:homeId/assignments/:assignmentId/skip - Saltar
router.post(
  '/assignments/:assignmentId/skip',
  validateBody(completeTaskSchema),
  taskController.skipAssignment
);

export default router;
