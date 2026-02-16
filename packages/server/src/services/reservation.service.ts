import {
  CreateSharedSpaceInput,
  UpdateSharedSpaceInput,
  CreateReservationInput,
} from '@conviviapp/shared';
import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError, ForbiddenError } from '../middlewares/errorHandler';
import { eventBus } from '../events';

export const reservationService = {
  // ==================== SHARED SPACES ====================

  // Crear espacio compartido (solo admin)
  async createSpace(homeId: string, data: CreateSharedSpaceInput, actorId: string) {
    const space = await prisma.sharedSpace.create({
      data: {
        homeId,
        name: data.name,
        description: data.description,
        icon: data.icon,
        maxDuration: data.maxDuration,
        slotSize: data.slotSize || 30,
      },
      include: {
        reservations: {
          include: {
            reservedBy: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    eventBus.emit('space:created', {
      homeId,
      space: { id: space.id, name: space.name, icon: space.icon },
      actorId,
    });

    return space;
  },

  // Listar espacios del hogar
  async findAllSpaces(homeId: string) {
    const spaces = await prisma.sharedSpace.findMany({
      where: { homeId, isActive: true },
      include: {
        reservations: {
          where: {
            endTime: { gte: new Date() },
          },
          include: {
            reservedBy: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return spaces;
  },

  // Obtener espacio por ID
  async findSpaceById(spaceId: string, homeId: string) {
    const space = await prisma.sharedSpace.findFirst({
      where: { id: spaceId, homeId },
      include: {
        reservations: {
          include: {
            reservedBy: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!space) {
      throw new NotFoundError('Espacio no encontrado');
    }

    return space;
  },

  // Actualizar espacio (solo admin)
  async updateSpace(spaceId: string, homeId: string, data: UpdateSharedSpaceInput, actorId: string) {
    await this.findSpaceById(spaceId, homeId);

    const updated = await prisma.sharedSpace.update({
      where: { id: spaceId },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        maxDuration: data.maxDuration,
        slotSize: data.slotSize,
      },
      include: {
        reservations: {
          include: {
            reservedBy: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    eventBus.emit('space:updated', {
      homeId,
      space: { id: updated.id, name: updated.name, icon: updated.icon },
      actorId,
    });

    return updated;
  },

  // Eliminar espacio (solo admin) - soft delete
  async deleteSpace(spaceId: string, homeId: string, actorId: string) {
    await this.findSpaceById(spaceId, homeId);

    await prisma.sharedSpace.update({
      where: { id: spaceId },
      data: { isActive: false },
    });

    eventBus.emit('space:deleted', {
      homeId,
      spaceId,
      actorId,
    });
  },

  // ==================== RESERVATIONS ====================

  // Crear reserva con deteccion de solapamiento
  async createReservation(homeId: string, reservedById: string, spaceId: string, data: CreateReservationInput) {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    // Validar que la fecha de inicio sea anterior a la de fin
    if (startTime >= endTime) {
      throw new ValidationError('La hora de inicio debe ser anterior a la de fin');
    }

    // Validar que no sea en el pasado
    if (startTime < new Date()) {
      throw new ValidationError('No se puede reservar en el pasado');
    }

    // Verificar que el espacio existe y pertenece al hogar
    const space = await this.findSpaceById(spaceId, homeId);

    // Validar duracion maxima si esta configurada
    if (space.maxDuration) {
      const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      if (durationMinutes > space.maxDuration) {
        throw new ValidationError(
          `La duracion maxima permitida es de ${space.maxDuration} minutos`
        );
      }
    }

    // Detectar solapamiento
    const overlapping = await prisma.reservation.findFirst({
      where: {
        spaceId,
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
      include: {
        reservedBy: { select: { id: true, name: true } },
      },
    });

    if (overlapping) {
      throw new ValidationError(
        `Existe un solapamiento con la reserva de ${overlapping.reservedBy?.name || 'otro usuario'} ` +
        `(${overlapping.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ` +
        `${overlapping.endTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        spaceId,
        reservedById,
        homeId,
        startTime,
        endTime,
        note: data.note,
      },
      include: {
        space: true,
        reservedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    eventBus.emit('reservation:created', {
      homeId,
      reservation: {
        id: reservation.id,
        spaceId: reservation.spaceId,
        spaceName: reservation.space.name,
        reservedById: reservation.reservedById,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      },
      actorId: reservedById,
    });

    return reservation;
  },

  // Listar reservas de un espacio (por fecha opcional)
  async findBySpace(spaceId: string, homeId: string, date?: string) {
    // Verificar que el espacio existe
    await this.findSpaceById(spaceId, homeId);

    const where: { spaceId: string; startTime?: { gte: Date }; endTime?: { lte: Date } } = { spaceId };

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      where.startTime = { gte: dayStart };
      where.endTime = { lte: dayEnd };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        space: true,
        reservedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return reservations;
  },

  // Listar todas las reservas del hogar (por fecha opcional)
  async findByHome(homeId: string, date?: string) {
    const where: { homeId: string; startTime?: { gte: Date }; endTime?: { lte: Date } | { gte: Date } } = { homeId };

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      where.startTime = { gte: dayStart };
      where.endTime = { lte: dayEnd };
    } else {
      // Por defecto, reservas futuras
      where.endTime = { gte: new Date() };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        space: true,
        reservedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return reservations;
  },

  // Eliminar reserva (solo la propia)
  async deleteReservation(reservationId: string, homeId: string, userId: string, isAdmin: boolean) {
    const reservation = await prisma.reservation.findFirst({
      where: { id: reservationId, homeId },
      include: {
        space: true,
        reservedBy: { select: { id: true, name: true } },
      },
    });

    if (!reservation) {
      throw new NotFoundError('Reserva no encontrada');
    }

    // Solo el creador o un admin puede eliminar
    if (reservation.reservedById !== userId && !isAdmin) {
      throw new ForbiddenError('Solo puedes cancelar tus propias reservas');
    }

    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    eventBus.emit('reservation:deleted', {
      homeId,
      reservationId,
      spaceId: reservation.spaceId,
      actorId: userId,
    });
  },
};
