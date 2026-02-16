import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshTokenFromCookie } from '../lib/cookies';
import { UnauthorizedError } from '../middlewares/errorHandler';

// Helper para obtener info del cliente
const getClientInfo = (req: Request) => ({
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip || req.socket.remoteAddress,
});

export const authController = {
  // POST /api/auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { userAgent, ipAddress } = getClientInfo(req);
      const result = await authService.register(req.body, userAgent, ipAddress);

      // Guardar refresh token en cookie httpOnly
      setRefreshTokenCookie(res, result.refreshToken);

      // Responder con access token y usuario (sin refresh token en body)
      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { userAgent, ipAddress } = getClientInfo(req);
      const result = await authService.login(req.body, userAgent, ipAddress);

      setRefreshTokenCookie(res, result.refreshToken);

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = getRefreshTokenFromCookie(req.cookies);

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      clearRefreshTokenCookie(res);

      res.json({
        success: true,
        data: { message: 'Sesión cerrada correctamente' },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/refresh
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = getRefreshTokenFromCookie(req.cookies);

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token no proporcionado');
      }

      const { userAgent, ipAddress } = getClientInfo(req);
      const result = await authService.refresh(refreshToken, userAgent, ipAddress);

      // Actualizar cookie con nuevo refresh token (rotación)
      setRefreshTokenCookie(res, result.refreshToken);

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      // Limpiar cookie si el refresh falla
      clearRefreshTokenCookie(res);
      next(error);
    }
  },

  // GET /api/auth/me
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      const user = await authService.me(req.user.id);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout-all (cerrar todas las sesiones)
  async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }

      await authService.logoutAll(req.user.id);
      clearRefreshTokenCookie(res);

      res.json({
        success: true,
        data: { message: 'Todas las sesiones han sido cerradas' },
      });
    } catch (error) {
      next(error);
    }
  },
};
