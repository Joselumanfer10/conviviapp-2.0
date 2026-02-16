import { Request, Response, NextFunction } from 'express';
import { expenseService } from '../services/expense.service';
import { settlementService } from '../services/settlement.service';
import { UnauthorizedError } from '../middlewares/errorHandler';

export const expenseController = {
  // POST /api/homes/:homeId/expenses - Crear gasto
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const expense = await expenseService.create(
        req.homeContext.home.id,
        req.user.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/expenses - Listar gastos
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { page, limit, categoryId } = req.query;

      const result = await expenseService.findAllByHome(req.homeContext.home.id, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        categoryId: categoryId as string,
      });

      res.json({
        success: true,
        data: result.expenses,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/expenses/:expenseId - Detalle de gasto
  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const expense = await expenseService.findById(
        req.params.expenseId,
        req.homeContext.home.id
      );

      res.json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/homes/:homeId/expenses/:expenseId - Actualizar gasto
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const expense = await expenseService.update(
        req.params.expenseId,
        req.homeContext.home.id,
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId/expenses/:expenseId - Eliminar gasto
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      await expenseService.delete(
        req.params.expenseId,
        req.homeContext.home.id,
        req.user.id
      );

      res.json({
        success: true,
        data: { message: 'Gasto eliminado correctamente' },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/balances - Obtener balances
  async getBalances(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const balances = await expenseService.getBalances(req.homeContext.home.id);

      res.json({
        success: true,
        data: balances,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/settlements/suggested - Transferencias sugeridas
  async getSuggestedTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const transfers = await expenseService.getSuggestedTransfers(req.homeContext.home.id);

      res.json({
        success: true,
        data: transfers,
      });
    } catch (error) {
      next(error);
    }
  },

  // ============ Settlements ============

  // POST /api/homes/:homeId/settlements - Crear liquidación
  async createSettlement(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const settlement = await settlementService.create(
        req.homeContext.home.id,
        req.user.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: settlement,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/settlements - Listar liquidaciones
  async findAllSettlements(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { status, page, limit } = req.query;

      const result = await settlementService.findAllByHome(req.homeContext.home.id, {
        status: status as any,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.json({
        success: true,
        data: result.settlements,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/settlements/:settlementId - Detalle de liquidación
  async findOneSettlement(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const settlement = await settlementService.findById(
        req.params.settlementId,
        req.homeContext.home.id
      );

      res.json({
        success: true,
        data: settlement,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/settlements/:settlementId/confirm - Confirmar
  async confirmSettlement(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const settlement = await settlementService.confirm(
        req.params.settlementId,
        req.homeContext.home.id,
        req.user.id
      );

      res.json({
        success: true,
        data: settlement,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/settlements/:settlementId/reject - Rechazar
  async rejectSettlement(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const settlement = await settlementService.reject(
        req.params.settlementId,
        req.homeContext.home.id,
        req.user.id
      );

      res.json({
        success: true,
        data: settlement,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId/settlements/:settlementId - Cancelar
  async cancelSettlement(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      await settlementService.cancel(
        req.params.settlementId,
        req.homeContext.home.id,
        req.user.id
      );

      res.json({
        success: true,
        data: { message: 'Liquidación cancelada' },
      });
    } catch (error) {
      next(error);
    }
  },
};
