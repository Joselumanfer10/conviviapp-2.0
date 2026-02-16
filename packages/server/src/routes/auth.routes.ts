import { Router, type Router as RouterType } from 'express';
import rateLimit from 'express-rate-limit';
import { loginSchema, registerSchema } from '@conviviapp/shared';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router: RouterType = Router();

// Rate limiting estricto para autenticacion
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Demasiados intentos de autenticacion, intenta de nuevo en 15 minutos' } },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Demasiados registros, intenta de nuevo mas tarde' } },
});

// Rutas publicas (con rate limiting)
router.post('/register', registerLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refresh);

// Rutas protegidas
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/logout-all', authenticate, authController.logoutAll);

export default router;
