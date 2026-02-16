import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { socketAuthMiddleware } from './socket-auth.middleware';
import { setupEventListeners } from './event-listeners';
import { RoomManager } from './room-manager';
import { config } from '../config';

// Extender tipos de Socket.io
declare module 'socket.io' {
  interface Socket {
    userId: string;
    user: { id: string; email: string; name: string };
  }
}

let io: Server | null = null;
let roomManager: RoomManager | null = null;

export function initializeSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  roomManager = new RoomManager(io);

  // Middleware de autenticación
  io.use(socketAuthMiddleware);

  // Conexión de clientes
  io.on('connection', async (socket: Socket) => {
    console.log(`[Socket] Usuario conectado: ${socket.userId}`);

    // Unir a rooms de sus hogares
    await roomManager!.joinUserHomes(socket);

    // Unir a room personal para notificaciones
    socket.join(`user:${socket.userId}`);

    // Manejar solicitud de unirse a hogar específico
    socket.on('home:join', async (homeId: string) => {
      await roomManager!.joinHome(socket, homeId);
    });

    // Manejar salida de hogar
    socket.on('home:leave', (homeId: string) => {
      roomManager!.leaveHome(socket, homeId);
    });

    // Desconexión
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Usuario desconectado: ${socket.userId}, razón: ${reason}`);
    });

    // Confirmar conexión exitosa
    socket.emit('connected', {
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
  });

  // Configurar listeners del Event Bus → Socket.io
  setupEventListeners(io);

  console.log('[Socket] Servidor Socket.io inicializado');

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado');
  }
  return io;
}

export function getRoomManager(): RoomManager {
  if (!roomManager) {
    throw new Error('RoomManager no ha sido inicializado');
  }
  return roomManager;
}
