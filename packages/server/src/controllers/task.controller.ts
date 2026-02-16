import { Request, Response, NextFunction } from 'express';
import { TaskStatus } from '@conviviapp/shared';
import { taskService } from '../services/task.service';
import { UnauthorizedError } from '../middlewares/errorHandler';

export const taskController = {
  // ============ CRUD de Tareas (Plantillas) ============

  // POST /api/homes/:homeId/tasks - Crear tarea
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const task = await taskService.create(req.homeContext.home.id, req.body);

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/tasks - Listar tareas
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { isActive } = req.query;

      const tasks = await taskService.findAllByHome(req.homeContext.home.id, {
        isActive: isActive === 'false' ? false : true,
      });

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/tasks/:taskId - Detalle de tarea
  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const task = await taskService.findById(req.params.taskId, req.homeContext.home.id);

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/homes/:homeId/tasks/:taskId - Actualizar tarea
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const task = await taskService.update(
        req.params.taskId,
        req.homeContext.home.id,
        req.body
      );

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId/tasks/:taskId - Eliminar tarea (soft delete)
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      await taskService.delete(req.params.taskId, req.homeContext.home.id);

      res.json({
        success: true,
        data: { message: 'Tarea desactivada correctamente' },
      });
    } catch (error) {
      next(error);
    }
  },

  // ============ Asignaciones ============

  // POST /api/homes/:homeId/tasks/:taskId/assignments - Crear asignación
  async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const assignment = await taskService.createAssignment(req.homeContext.home.id, {
        taskId: req.params.taskId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/assignments - Listar asignaciones del hogar
  async findAllAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { status, assignedToId, page, limit } = req.query;

      const result = await taskService.findAssignmentsByHome(req.homeContext.home.id, {
        status: status as TaskStatus | undefined,
        assignedToId: assignedToId as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.json({
        success: true,
        data: result.assignments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/me/assignments - Mis asignaciones (todas las casas)
  async findMyAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const { status, homeId } = req.query;

      const assignments = await taskService.findMyAssignments(req.user.id, {
        status: status as TaskStatus | undefined,
        homeId: homeId as string,
      });

      res.json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/assignments/:assignmentId - Detalle de asignación
  async findOneAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const assignment = await taskService.findAssignmentById(
        req.params.assignmentId,
        req.homeContext.home.id
      );

      res.json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/assignments/:assignmentId/start - Iniciar tarea
  async startAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const assignment = await taskService.startAssignment(
        req.params.assignmentId,
        req.homeContext.home.id,
        req.user.id
      );

      res.json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/assignments/:assignmentId/complete - Completar tarea
  async completeAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { notes } = req.body;

      const assignment = await taskService.completeAssignment(
        req.params.assignmentId,
        req.homeContext.home.id,
        req.user.id,
        notes
      );

      res.json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/assignments/:assignmentId/skip - Saltar tarea
  async skipAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { notes } = req.body;

      const assignment = await taskService.skipAssignment(
        req.params.assignmentId,
        req.homeContext.home.id,
        req.user.id,
        notes
      );

      res.json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/karma - Ranking de karma del hogar
  async getKarmaRanking(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const ranking = await taskService.getKarmaRanking(req.homeContext.home.id);

      res.json({
        success: true,
        data: ranking,
      });
    } catch (error) {
      next(error);
    }
  },
};
