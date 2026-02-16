import { RegisterInput, LoginInput, AuthUser, AuthResponse } from '@conviviapp/shared';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from '../lib/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../middlewares/errorHandler';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Convertir usuario de Prisma a AuthUser (sin passwordHash)
const toAuthUser = (user: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  avatarUrl: user.avatarUrl ?? undefined,
});

// Generar par de tokens y guardar refresh token en DB
const createTokens = async (
  user: AuthUser,
  userAgent?: string,
  ipAddress?: string
): Promise<TokenPair> => {
  const tokenData = { sub: user.id, email: user.email };

  const accessToken = generateAccessToken(tokenData);
  const refreshToken = generateRefreshToken(tokenData);

  // Guardar hash del refresh token en DB
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
      userAgent,
      ipAddress,
    },
  });

  return { accessToken, refreshToken };
};

export const authService = {
  // Registrar nuevo usuario
  async register(
    data: RegisterInput,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthResponse & { refreshToken: string }> {
    // Verificar si el email ya existe
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('El email ya está registrado');
    }

    // Crear usuario con contraseña hasheada
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: await hashPassword(data.password),
        name: data.name,
      },
    });

    const authUser = toAuthUser(user);
    const tokens = await createTokens(authUser, userAgent, ipAddress);

    return {
      user: authUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },

  // Iniciar sesión
  async login(
    data: LoginInput,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthResponse & { refreshToken: string }> {
    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValid = await verifyPassword(data.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const authUser = toAuthUser(user);
    const tokens = await createTokens(authUser, userAgent, ipAddress);

    return {
      user: authUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },

  // Refrescar access token (con rotación de refresh token)
  async refresh(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthResponse & { refreshToken: string }> {
    // Verificar y decodificar el refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }

    const tokenHash = hashToken(refreshToken);

    // Buscar el token en la DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token no encontrado');
    }

    if (storedToken.isRevoked) {
      // Posible robo de token - revocar todos los tokens del usuario
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { isRevoked: true },
      });
      throw new UnauthorizedError('Token revocado - sesión comprometida');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expirado');
    }

    // Revocar el token actual (rotación)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generar nuevos tokens
    const authUser = toAuthUser(storedToken.user);
    const tokens = await createTokens(authUser, userAgent, ipAddress);

    return {
      user: authUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },

  // Cerrar sesión (revocar refresh token)
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);

    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  },

  // Cerrar todas las sesiones del usuario
  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  },

  // Obtener usuario actual por ID
  async me(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return toAuthUser(user);
  },

  // Limpiar tokens expirados (para cron job)
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });

    return result.count;
  },
};
