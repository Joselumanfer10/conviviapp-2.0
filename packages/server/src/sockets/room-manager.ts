import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';

export class RoomManager {
  constructor(private io: Server) {}

  // Genera el nombre del room para un hogar
  private getRoomName(homeId: string): string {
    return `home:${homeId}`;
  }

  // Une un socket a todos los hogares del usuario
  async joinUserHomes(socket: Socket): Promise<void> {
    try {
      // Obtener todos los hogares del usuario
      const memberships = await prisma.homeMember.findMany({
        where: {
          userId: socket.userId,
          isActive: true,
        },
        select: { homeId: true },
      });

      // Unir a cada room
      for (const membership of memberships) {
        const roomName = this.getRoomName(membership.homeId);
        socket.join(roomName);
        console.log(`[Socket] Usuario ${socket.userId} unido a room ${roomName}`);
      }

      // Emitir confirmación
      socket.emit('homes:joined', {
        homeIds: memberships.map((m) => m.homeId),
      });
    } catch (error) {
      console.error('[RoomManager] Error al unir a hogares:', error);
    }
  }

  // Une un socket a un hogar específico (con validación)
  async joinHome(socket: Socket, homeId: string): Promise<boolean> {
    try {
      // Verificar que el usuario es miembro del hogar
      const membership = await prisma.homeMember.findFirst({
        where: {
          userId: socket.userId,
          homeId,
          isActive: true,
        },
      });

      if (!membership) {
        socket.emit('error', { message: 'No eres miembro de este hogar' });
        return false;
      }

      const roomName = this.getRoomName(homeId);
      socket.join(roomName);

      socket.emit('home:joined', { homeId });
      console.log(`[Socket] Usuario ${socket.userId} unido a room ${roomName}`);

      return true;
    } catch (error) {
      console.error('[RoomManager] Error al unir a hogar:', error);
      return false;
    }
  }

  // Saca un socket de un hogar
  leaveHome(socket: Socket, homeId: string): void {
    const roomName = this.getRoomName(homeId);
    socket.leave(roomName);
    socket.emit('home:left', { homeId });
    console.log(`[Socket] Usuario ${socket.userId} salió de room ${roomName}`);
  }

  // Emite un evento a todos los miembros de un hogar
  emitToHome(homeId: string, event: string, data: any): void {
    const roomName = this.getRoomName(homeId);
    this.io.to(roomName).emit(event, data);
  }

  // Emite un evento a todos los miembros excepto al que lo originó
  emitToHomeExcept(homeId: string, excludeUserId: string, event: string, data: any): void {
    const roomName = this.getRoomName(homeId);
    // Obtener todos los sockets en el room
    const socketsInRoom = this.io.sockets.adapter.rooms.get(roomName);

    if (socketsInRoom) {
      socketsInRoom.forEach((socketId) => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket && socket.userId !== excludeUserId) {
          socket.emit(event, data);
        }
      });
    }
  }

  // Obtiene los usuarios conectados en un hogar
  getConnectedUsers(homeId: string): string[] {
    const roomName = this.getRoomName(homeId);
    const socketsInRoom = this.io.sockets.adapter.rooms.get(roomName);
    const userIds: string[] = [];

    if (socketsInRoom) {
      socketsInRoom.forEach((socketId) => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          userIds.push(socket.userId);
        }
      });
    }

    return [...new Set(userIds)]; // Eliminar duplicados
  }
}
