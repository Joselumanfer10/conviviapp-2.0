import { Router, type Router as RouterType } from 'express';
import { loginSchema, registerSchema } from '@conviviapp/shared';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router: RouterType = Router();

// Rutas públicas
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refresh);

// Rutas protegidas
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/logout-all', authenticate, authController.logoutAll);

export default router;
