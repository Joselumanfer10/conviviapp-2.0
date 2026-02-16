import { Socket } from 'socket.io';
import { verifyAccessToken } from '../lib/jwt';

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    // Obtener token del handshake
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Token de autenticación no proporcionado'));
    }

    // Verificar token
    const payload = verifyAccessToken(token);

    if (!payload) {
      return next(new Error('Token inválido o expirado'));
    }

    // Adjuntar datos del usuario al socket
    socket.userId = payload.sub;
    socket.user = {
      id: payload.sub,
      email: payload.email,
      name: '', // Se podría obtener de la DB si es necesario
    };

    next();
  } catch (error) {
    console.error('[Socket Auth] Error:', error);
    next(new Error('Error de autenticación'));
  }
}
