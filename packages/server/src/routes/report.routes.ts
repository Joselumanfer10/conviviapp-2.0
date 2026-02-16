import { Router, type Router as RouterType } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireHomeMember } from '../middlewares/home.middleware';

const router: RouterType = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireHomeMember);

// GET /api/homes/:homeId/reports/monthly?month=2&year=2026
router.get('/monthly', reportController.getMonthlyReport);

export default router;
