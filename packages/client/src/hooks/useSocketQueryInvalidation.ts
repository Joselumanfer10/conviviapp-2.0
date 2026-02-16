import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { useSocketEvent } from './useSocketEvent';

export function useSocketQueryInvalidation(homeId: string | undefined) {
  const queryClient = useQueryClient();

  // Unirse/salir del room del hogar
  useEffect(() => {
    if (!homeId) return;
    const socket = getSocket();
    if (!socket?.connected) return;

    socket.emit('home:join', homeId);
    return () => {
      socket.emit('home:leave', homeId);
    };
  }, [homeId]);

  const invalidate = useCallback(
    (...keys: string[][]) => {
      if (!homeId) return;
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
    [homeId, queryClient]
  );

  // Gastos
  useSocketEvent('expense:created', () =>
    invalidate(['expenses', homeId!], ['balances', homeId!], ['suggestedTransfers', homeId!])
  );
  useSocketEvent('expense:updated', () =>
    invalidate(['expenses', homeId!], ['balances', homeId!], ['suggestedTransfers', homeId!])
  );
  useSocketEvent('expense:deleted', () =>
    invalidate(['expenses', homeId!], ['balances', homeId!], ['suggestedTransfers', homeId!])
  );
  useSocketEvent('balance:updated', () =>
    invalidate(['balances', homeId!], ['suggestedTransfers', homeId!])
  );

  // Tareas y asignaciones
  useSocketEvent('task:created', () =>
    invalidate(['tasks', homeId!], ['assignments', homeId!])
  );
  useSocketEvent('task:updated', () =>
    invalidate(['tasks', homeId!], ['assignments', homeId!])
  );
  useSocketEvent('task:deleted', () =>
    invalidate(['tasks', homeId!], ['assignments', homeId!])
  );
  useSocketEvent('assignment:created', () =>
    invalidate(['assignments', homeId!], ['karma', homeId!])
  );
  useSocketEvent('assignment:started', () =>
    invalidate(['assignments', homeId!])
  );
  useSocketEvent('assignment:completed', () =>
    invalidate(['assignments', homeId!], ['karma', homeId!])
  );
  useSocketEvent('assignment:skipped', () =>
    invalidate(['assignments', homeId!], ['karma', homeId!])
  );

  // Compras
  useSocketEvent('shopping:item-added', () =>
    invalidate(['shopping', homeId!])
  );
  useSocketEvent('shopping:item-updated', () =>
    invalidate(['shopping', homeId!])
  );
  useSocketEvent('shopping:item-deleted', () =>
    invalidate(['shopping', homeId!])
  );
  useSocketEvent('shopping:item-bought', () =>
    invalidate(['shopping', homeId!], ['expenses', homeId!], ['balances', homeId!])
  );

  // Liquidaciones
  useSocketEvent('settlement:created', () =>
    invalidate(['settlements', homeId!])
  );
  useSocketEvent('settlement:confirmed', () =>
    invalidate(['settlements', homeId!], ['balances', homeId!], ['suggestedTransfers', homeId!])
  );
  useSocketEvent('settlement:rejected', () =>
    invalidate(['settlements', homeId!])
  );

  // Anuncios y votaciones
  useSocketEvent('announcement:created', () =>
    invalidate(['announcements', homeId!])
  );
  useSocketEvent('announcement:updated', () =>
    invalidate(['announcements', homeId!])
  );
  useSocketEvent('announcement:deleted', () =>
    invalidate(['announcements', homeId!])
  );
  useSocketEvent('vote:cast', () =>
    invalidate(['announcements', homeId!])
  );
  useSocketEvent('vote:removed', () =>
    invalidate(['announcements', homeId!])
  );

  // Calendario
  useSocketEvent('calendar:created', () =>
    invalidate(['calendar', homeId!], ['calendar-aggregated', homeId!])
  );
  useSocketEvent('calendar:updated', () =>
    invalidate(['calendar', homeId!], ['calendar-aggregated', homeId!])
  );
  useSocketEvent('calendar:deleted', () =>
    invalidate(['calendar', homeId!], ['calendar-aggregated', homeId!])
  );

  // Espacios compartidos y reservas
  useSocketEvent('space:created', () =>
    invalidate(['spaces', homeId!])
  );
  useSocketEvent('space:updated', () =>
    invalidate(['spaces', homeId!])
  );
  useSocketEvent('space:deleted', () =>
    invalidate(['spaces', homeId!], ['reservations', homeId!])
  );
  useSocketEvent('reservation:created', () =>
    invalidate(['reservations', homeId!], ['spaces', homeId!])
  );
  useSocketEvent('reservation:deleted', () =>
    invalidate(['reservations', homeId!], ['spaces', homeId!])
  );

  // Reglas del hogar
  useSocketEvent('rule:created', () =>
    invalidate(['rules', homeId!])
  );
  useSocketEvent('rule:updated', () =>
    invalidate(['rules', homeId!])
  );
  useSocketEvent('rule:deleted', () =>
    invalidate(['rules', homeId!])
  );
  useSocketEvent('rule:accepted', () =>
    invalidate(['rules', homeId!])
  );

  // Notificaciones personales (no dependen de homeId)
  useSocketEvent('notification:created', () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  });

  // Miembros
  useSocketEvent('home:member-joined', () =>
    invalidate(['homeMembers', homeId!], ['home', homeId!])
  );
  useSocketEvent('home:member-left', () =>
    invalidate(['homeMembers', homeId!], ['home', homeId!])
  );
}
