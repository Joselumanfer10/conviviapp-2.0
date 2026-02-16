import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { UserFactory, DEFAULT_PASSWORD } from '../factories';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Generar un access token válido para un usuario
export function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

// Generar un access token expirado
export function generateExpiredToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn: '-1s' }
  );
}

// Crear un usuario autenticado con su token
export async function createAuthenticatedUser(): Promise<{
  user: User;
  accessToken: string;
  password: string;
}> {
  const user = await UserFactory.create();
  const accessToken = generateAccessToken(user);

  return {
    user,
    accessToken,
    password: DEFAULT_PASSWORD,
  };
}

// Obtener headers de autorización
export function authHeader(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`,
  };
}
