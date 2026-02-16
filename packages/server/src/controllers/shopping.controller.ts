import { Request, Response, NextFunction } from 'express';
import { shoppingService } from '../services/shopping.service';
import { UnauthorizedError } from '../middlewares/errorHandler';

export const shoppingController = {
  // POST /api/homes/:homeId/shopping - Crear item
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const item = await shoppingService.create(
        req.homeContext.home.id,
        req.user.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/shopping - Listar items
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { status, category } = req.query;

      const items = await shoppingService.findAllByHome(req.homeContext.home.id, {
        status: status as any,
        category: category as string,
      });

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/shopping/:itemId - Detalle
  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const item = await shoppingService.findById(
        req.params.itemId,
        req.homeContext.home.id
      );

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/homes/:homeId/shopping/:itemId - Actualizar
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const item = await shoppingService.update(
        req.params.itemId,
        req.homeContext.home.id,
        req.body
      );

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/homes/:homeId/shopping/:itemId - Eliminar
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      await shoppingService.delete(req.params.itemId, req.homeContext.home.id);

      res.json({
        success: true,
        data: { message: 'Item eliminado correctamente' },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/shopping/:itemId/buy - Marcar como comprado
  async markAsBought(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const item = await shoppingService.markAsBought(
        req.params.itemId,
        req.homeContext.home.id,
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/shopping/:itemId/cancel - Cancelar
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const item = await shoppingService.cancel(
        req.params.itemId,
        req.homeContext.home.id
      );

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/shopping/:itemId/restore - Restaurar cancelado
  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const item = await shoppingService.restore(
        req.params.itemId,
        req.homeContext.home.id
      );

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/homes/:homeId/shopping/convert-to-expense - Convertir a gasto
  async convertToExpense(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const { itemIds, description } = req.body;

      const result = await shoppingService.convertToExpense(
        req.homeContext.home.id,
        req.user.id,
        itemIds,
        description
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/homes/:homeId/shopping/categories - Categorías únicas
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.homeContext) {
        throw new UnauthorizedError('No autenticado');
      }

      const categories = await shoppingService.getCategories(req.homeContext.home.id);

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },
};
