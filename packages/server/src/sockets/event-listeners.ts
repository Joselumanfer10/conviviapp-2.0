import { Server } from 'socket.io';
import { eventBus, DomainEventName } from '../events';

// Mapeo de eventos de dominio a eventos de Socket.io
// notification:created se maneja por separado (room personal, no de hogar)
const eventMapping: Partial<Record<DomainEventName, string>> = {
  // Gastos
  'expense:created': 'expense:created',
  'expense:updated': 'expense:updated',
  'expense:deleted': 'expense:deleted',

  // Balances
  'balance:updated': 'balance:updated',

  // Liquidaciones
  'settlement:created': 'settlement:created',
  'settlement:confirmed': 'settlement:confirmed',
  'settlement:rejected': 'settlement:rejected',

  // Tareas
  'task:created': 'task:created',
  'task:updated': 'task:updated',
  'task:deleted': 'task:deleted',

  // Asignaciones
  'assignment:created': 'assignment:created',
  'assignment:started': 'assignment:started',
  'assignment:completed': 'assignment:completed',
  'assignment:skipped': 'assignment:skipped',

  // Compras
  'shopping:item-added': 'shopping:item-added',
  'shopping:item-updated': 'shopping:item-updated',
  'shopping:item-deleted': 'shopping:item-deleted',
  'shopping:item-bought': 'shopping:item-bought',

  // Anuncios
  'announcement:created': 'announcement:created',
  'announcement:updated': 'announcement:updated',
  'announcement:deleted': 'announcement:deleted',

  // Votos
  'vote:cast': 'vote:cast',
  'vote:removed': 'vote:removed',

  // Calendario
  'calendar:created': 'calendar:created',
  'calendar:updated': 'calendar:updated',
  'calendar:deleted': 'calendar:deleted',

  // Espacios compartidos y reservas
  'space:created': 'space:created',
  'space:updated': 'space:updated',
  'space:deleted': 'space:deleted',
  'reservation:created': 'reservation:created',
  'reservation:deleted': 'reservation:deleted',

  // Reglas del hogar
  'rule:created': 'rule:created',
  'rule:updated': 'rule:updated',
  'rule:deleted': 'rule:deleted',
  'rule:accepted': 'rule:accepted',

  // Hogar
  'home:member-joined': 'home:member-joined',
  'home:member-left': 'home:member-left',
  'home:member-updated': 'home:member-updated',
};

export function setupEventListeners(io: Server): void {
  // Suscribirse a todos los eventos de dominio
  Object.entries(eventMapping).forEach(([domainEvent, socketEvent]) => {
    eventBus.on(domainEvent as DomainEventName, (payload: any) => {
      const { homeId, actorId, ...data } = payload;

      if (!homeId) {
        console.warn(`[Socket] Evento ${domainEvent} sin homeId`);
        return;
      }

      const roomName = `home:${homeId}`;

      // Emitir a todos en el room
      io.to(roomName).emit(socketEvent, {
        ...data,
        actorId,
        timestamp: new Date().toISOString(),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Socket] Emitido ${socketEvent} a room ${roomName}`);
      }
    });
  });

  // Notificaciones personales - emitir a room del usuario
  eventBus.on('notification:created', (payload: any) => {
    const { userId, notification } = payload;
    if (!userId) return;

    io.to(`user:${userId}`).emit('notification:created', {
      notification,
      timestamp: new Date().toISOString(),
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Socket] Notificación emitida a user:${userId}`);
    }
  });

  console.log('[Socket] Event listeners configurados');
}
