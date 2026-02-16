import {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '@conviviapp/shared';
import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../middlewares/errorHandler';
import { eventBus } from '../events';
import type { AggregatedCalendarItem } from '@conviviapp/shared';

export const calendarService = {
  // Crear evento de calendario
  async create(homeId: string, createdById: string, data: CreateCalendarEventInput) {
    const event = await prisma.calendarEvent.create({
      data: {
        homeId,
        createdById,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        allDay: data.allDay ?? false,
        color: data.color,
        category: data.category,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    eventBus.emit('calendar:created', {
      homeId,
      calendarEvent: {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        createdById: event.createdById,
      },
      actorId: createdById,
    });

    return event;
  },

  // Listar eventos del hogar filtrando por mes/año
  async findAllByHome(
    homeId: string,
    options: { month?: number; year?: number } = {}
  ) {
    const { month, year } = options;

    let dateFilter = {};
    if (month !== undefined && year !== undefined) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = {
        startDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where: {
        homeId,
        ...dateFilter,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    return events;
  },

  // Obtener evento por ID
  async findById(eventId: string, homeId: string) {
    const event = await prisma.calendarEvent.findFirst({
      where: { id: eventId, homeId },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!event) {
      throw new NotFoundError('Evento de calendario no encontrado');
    }

    return event;
  },

  // Actualizar evento
  async update(
    eventId: string,
    homeId: string,
    userId: string,
    data: UpdateCalendarEventInput
  ) {
    const event = await this.findById(eventId, homeId);

    // Solo el creador o un admin pueden actualizar
    const membership = await prisma.homeMember.findFirst({
      where: { userId, homeId, isActive: true },
      select: { role: true },
    });

    if (event.createdById !== userId && membership?.role !== 'ADMIN') {
      throw new ForbiddenError('Solo el creador o un administrador puede actualizar este evento');
    }

    const updated = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.allDay !== undefined && { allDay: data.allDay }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.category !== undefined && { category: data.category }),
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    eventBus.emit('calendar:updated', {
      homeId,
      calendarEvent: {
        id: updated.id,
        title: updated.title,
        startDate: updated.startDate,
        createdById: updated.createdById,
      },
      actorId: userId,
    });

    return updated;
  },

  // Eliminar evento
  async delete(eventId: string, homeId: string, userId: string) {
    const event = await this.findById(eventId, homeId);

    // Solo el creador o un admin pueden eliminar
    const membership = await prisma.homeMember.findFirst({
      where: { userId, homeId, isActive: true },
      select: { role: true },
    });

    if (event.createdById !== userId && membership?.role !== 'ADMIN') {
      throw new ForbiddenError('Solo el creador o un administrador puede eliminar este evento');
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId },
    });

    eventBus.emit('calendar:deleted', {
      homeId,
      calendarEventId: eventId,
      actorId: userId,
    });
  },

  // Vista agregada: eventos + tareas + gastos del mes
  async getAggregated(
    homeId: string,
    month: number,
    year: number
  ): Promise<AggregatedCalendarItem[]> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const [calendarEvents, taskAssignments, expenses, reservations] = await Promise.all([
      // Eventos de calendario
      prisma.calendarEvent.findMany({
        where: {
          homeId,
          startDate: { gte: startOfMonth, lte: endOfMonth },
        },
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      }),
      // Asignaciones de tareas
      prisma.taskAssignment.findMany({
        where: {
          task: { homeId },
          dueDate: { gte: startOfMonth, lte: endOfMonth },
        },
        include: {
          task: { select: { name: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      // Gastos
      prisma.expense.findMany({
        where: {
          homeId,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
        include: {
          paidBy: { select: { id: true, name: true } },
        },
      }),
      // Reservas
      prisma.reservation.findMany({
        where: {
          homeId,
          startTime: { gte: startOfMonth, lte: endOfMonth },
        },
        include: {
          space: { select: { name: true } },
          reservedBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    const items: AggregatedCalendarItem[] = [];

    // Mapear eventos de calendario
    for (const ev of calendarEvents) {
      items.push({
        id: ev.id,
        title: ev.title,
        start: ev.startDate,
        end: ev.endDate ?? undefined,
        color: ev.color || '#3b82f6',
        type: 'event',
        meta: {
          description: ev.description,
          createdBy: ev.createdBy?.name,
          category: ev.category,
          allDay: ev.allDay,
        },
      });
    }

    // Mapear asignaciones de tareas
    for (const ta of taskAssignments) {
      items.push({
        id: ta.id,
        title: ta.task.name,
        start: ta.dueDate,
        color: '#f59e0b',
        type: 'task',
        meta: {
          status: ta.status,
          assignedTo: ta.assignedTo?.name,
          taskId: ta.taskId,
        },
      });
    }

    // Mapear gastos
    for (const exp of expenses) {
      items.push({
        id: exp.id,
        title: `${exp.description} (${exp.amount.toFixed(2)} €)`,
        start: exp.createdAt,
        color: '#10b981',
        type: 'expense',
        meta: {
          amount: exp.amount,
          paidBy: exp.paidBy?.name,
        },
      });
    }

    // Mapear reservas
    for (const res of reservations) {
      items.push({
        id: res.id,
        title: `${res.space?.name || 'Reserva'}`,
        start: res.startTime,
        end: res.endTime,
        color: '#8b5cf6',
        type: 'reservation',
        meta: {
          spaceName: res.space?.name,
          reservedBy: res.reservedBy?.name,
          note: res.note,
        },
      });
    }

    // Ordenar por fecha de inicio
    items.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return items;
  },
};
