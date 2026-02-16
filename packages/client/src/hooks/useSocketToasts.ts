import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { useSocketEvent } from './useSocketEvent';

interface EventPayload {
  actorId?: string;
  [key: string]: unknown;
}

export function useSocketToasts(homeId: string | undefined) {
  const { user } = useAuthStore();

  const isOtherUser = (payload: EventPayload) =>
    payload.actorId && payload.actorId !== user?.id;

  // Gastos
  useSocketEvent<EventPayload>('expense:created', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    const expense = data.expense as { description?: string; amount?: number };
    toast.info(`Nuevo gasto: ${expense?.description || ''} (${expense?.amount?.toFixed(2) || '?'} €)`);
  });

  useSocketEvent<EventPayload>('expense:updated', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    toast.info('Se actualizó un gasto');
  });

  useSocketEvent<EventPayload>('expense:deleted', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    toast.info('Se eliminó un gasto');
  });

  // Tareas
  useSocketEvent<EventPayload>('task:created', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    const task = data.task as { name?: string };
    toast.info(`Nueva tarea: ${task?.name || ''}`);
  });

  useSocketEvent<EventPayload>('assignment:completed', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    toast.success('Se completó una tarea');
  });

  // Compras
  useSocketEvent<EventPayload>('shopping:item-added', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    const item = data.item as { name?: string };
    toast.info(`Nuevo item: ${item?.name || ''}`);
  });

  useSocketEvent<EventPayload>('shopping:item-bought', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    const item = data.item as { name?: string };
    toast.success(`Comprado: ${item?.name || ''}`);
  });

  // Liquidaciones
  useSocketEvent<EventPayload>('settlement:created', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    toast.info('Nueva liquidación registrada');
  });

  useSocketEvent<EventPayload>('settlement:confirmed', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    toast.success('Pago confirmado');
  });

  // Anuncios
  useSocketEvent<EventPayload>('announcement:created', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    const announcement = data.announcement as { title?: string };
    toast.info(`Nuevo anuncio: ${announcement?.title || ''}`);
  });

  useSocketEvent<EventPayload>('vote:cast', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    const announcement = data.announcement as { title?: string };
    toast.info(`Nuevo voto en: ${announcement?.title || ''}`);
  });

  // Calendario
  useSocketEvent<EventPayload>('calendar:created', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    const calendarEvent = data.calendarEvent as { title?: string };
    toast.info(`Nuevo evento: ${calendarEvent?.title || ''}`);
  });

  // Reservas
  useSocketEvent<EventPayload>('reservation:created', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    const reservation = data.reservation as { spaceName?: string };
    toast.info(`Nueva reserva en: ${reservation?.spaceName || 'un espacio'}`);
  });

  // Reglas del hogar
  useSocketEvent<EventPayload>('rule:created', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    const rule = data.rule as { title?: string };
    toast.info(`Nueva regla: ${rule?.title || ''}`);
  });

  useSocketEvent<EventPayload>('rule:accepted', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    toast.info('Un miembro acepto una regla');
  });

  // Miembros
  useSocketEvent<EventPayload>('home:member-joined', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    const member = data.member as { name?: string };
    toast.info(`Nuevo miembro: ${member?.name || 'alguien'}`);
  });

  useSocketEvent<EventPayload>('home:member-left', (data) => {
    if (!homeId || !isOtherUser(data)) return;
    toast('Un miembro abandonó el hogar');
  });
}
