import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { TokenPayload } from '@conviviapp/shared';
import { config } from '../config';

type TokenData = Omit<TokenPayload, 'type' | 'iat' | 'exp'>;

export const generateAccessToken = (data: TokenData): string => {
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    ...data,
    type: 'access',
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions);
};

export const generateRefreshToken = (data: TokenData): string => {
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    ...data,
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;

  if (decoded.type !== 'access') {
    throw new Error('Token de tipo inválido');
  }

  return decoded;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;

  if (decoded.type !== 'refresh') {
    throw new Error('Token de tipo inválido');
  }

  return decoded;
};

// Hash del refresh token para almacenar en DB (nunca guardar el token en texto plano)
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Calcular fecha de expiración del refresh token
export const getRefreshTokenExpiry = (): Date => {
  const expiresIn = config.jwt.refreshExpiresIn;
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    // Por defecto 7 días
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * multipliers[unit]);
};
