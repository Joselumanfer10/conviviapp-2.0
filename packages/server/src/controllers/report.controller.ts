import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';

export const reportController = {
  async getMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { homeId } = req.params;
      const month = parseInt(req.query.month as string, 10) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

      if (month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Mes invalido (1-12)' },
        });
      }

      const report = await reportService.getMonthlyReport(homeId, month, year);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },
};
