import { CookieOptions, Response } from 'express';
import { config } from '../config';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

// Configuración segura para cookies de refresh token
const getCookieOptions = (): CookieOptions => ({
  httpOnly: true, // Inaccesible desde JavaScript
  secure: config.isProd, // Solo HTTPS en producción
  sameSite: config.isProd ? 'strict' : 'lax', // Protección CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  path: '/api/auth', // Solo se envía a rutas de auth
});

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_TOKEN_COOKIE, token, getCookieOptions());
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'strict' : 'lax',
    path: '/api/auth',
  });
};

export const getRefreshTokenFromCookie = (cookies: Record<string, string>): string | undefined => {
  return cookies[REFRESH_TOKEN_COOKIE];
};
