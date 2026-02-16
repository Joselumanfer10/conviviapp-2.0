import { Request, Response, NextFunction } from 'express';
import { houseRuleService } from '../services/house-rule.service';

export const houseRuleController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { homeId } = req.params;
      const userId = req.user!.id;
      const rule = await houseRuleService.create(homeId, userId, req.body);
      res.status(201).json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { homeId } = req.params;
      const rules = await houseRuleService.findAll(homeId);
      res.json({ success: true, data: rules });
    } catch (error) {
      next(error);
    }
  },

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { homeId, ruleId } = req.params;
      const rule = await houseRuleService.findById(homeId, ruleId);
      res.json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { homeId, ruleId } = req.params;
      const userId = req.user!.id;
      const rule = await houseRuleService.update(homeId, ruleId, userId, req.body);
      res.json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { homeId, ruleId } = req.params;
      const userId = req.user!.id;
      await houseRuleService.delete(homeId, ruleId, userId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const { homeId, ruleId } = req.params;
      const userId = req.user!.id;
      const rule = await houseRuleService.accept(homeId, ruleId, userId);
      res.json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  async getAcceptanceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { homeId, ruleId } = req.params;
      const status = await houseRuleService.getAcceptanceStatus(homeId, ruleId);
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  },
};
