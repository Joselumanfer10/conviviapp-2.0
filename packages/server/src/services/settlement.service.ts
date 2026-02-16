import { CreateSettlementInput, SettlementStatus } from '@conviviapp/shared';
import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError, ValidationError } from '../middlewares/errorHandler';
import { eventBus } from '../events';

export const settlementService = {
  // Crear liquidación/pago
  async create(homeId: string, fromUserId: string, data: CreateSettlementInput) {
    // Verificar que el destinatario es miembro del hogar
    const toMember = await prisma.homeMember.findFirst({
      where: { userId: data.toUserId, homeId, isActive: true },
    });

    if (!toMember) {
      throw new ValidationError('El destinatario no es miembro del hogar');
    }

    if (fromUserId === data.toUserId) {
      throw new ValidationError('No puedes pagarte a ti mismo');
    }

    const settlement = await prisma.settlement.create({
      data: {
        homeId,
        fromUserId,
        toUserId: data.toUserId,
        amount: data.amount,
        note: data.note,
        status: SettlementStatus.PENDING,
      },
      include: {
        fromUser: { select: { id: true, name: true, email: true, avatarUrl: true } },
        toUser: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    eventBus.emit('settlement:created', {
      homeId,
      settlement: { id: settlement.id, fromUserId: settlement.fromUserId, toUserId: settlement.toUserId, amount: settlement.amount, status: settlement.status },
      actorId: fromUserId,
    });

    return settlement;
  },

  // Listar liquidaciones del hogar
  async findAllByHome(
    homeId: string,
    options: { status?: SettlementStatus; page?: number; limit?: number } = {}
  ) {
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = {
      homeId,
      ...(status && { status }),
    };

    const [settlements, total] = await Promise.all([
      prisma.settlement.findMany({
        where,
        include: {
          fromUser: { select: { id: true, name: true, avatarUrl: true } },
          toUser: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.settlement.count({ where }),
    ]);

    return {
      settlements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Obtener liquidación por ID
  async findById(settlementId: string, homeId: string) {
    const settlement = await prisma.settlement.findFirst({
      where: { id: settlementId, homeId },
      include: {
        fromUser: { select: { id: true, name: true, email: true, avatarUrl: true } },
        toUser: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    if (!settlement) {
      throw new NotFoundError('Liquidación no encontrada');
    }

    return settlement;
  },

  // Confirmar liquidación (solo el destinatario puede confirmar)
  async confirm(settlementId: string, homeId: string, userId: string) {
    const settlement = await prisma.settlement.findFirst({
      where: { id: settlementId, homeId },
    });

    if (!settlement) {
      throw new NotFoundError('Liquidación no encontrada');
    }

    if (settlement.toUserId !== userId) {
      throw new ForbiddenError('Solo el destinatario puede confirmar el pago');
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      throw new ValidationError('Esta liquidación ya fue procesada');
    }

    const updated = await prisma.settlement.update({
      where: { id: settlementId },
      data: {
        status: SettlementStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
      include: {
        fromUser: { select: { id: true, name: true, email: true, avatarUrl: true } },
        toUser: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    eventBus.emit('settlement:confirmed', {
      homeId,
      settlement: { id: updated.id, fromUserId: updated.fromUserId, toUserId: updated.toUserId, amount: updated.amount, status: updated.status },
      actorId: userId,
    });
    eventBus.emit('balance:updated', { homeId });

    return updated;
  },

  // Rechazar liquidación (solo el destinatario puede rechazar)
  async reject(settlementId: string, homeId: string, userId: string) {
    const settlement = await prisma.settlement.findFirst({
      where: { id: settlementId, homeId },
    });

    if (!settlement) {
      throw new NotFoundError('Liquidación no encontrada');
    }

    if (settlement.toUserId !== userId) {
      throw new ForbiddenError('Solo el destinatario puede rechazar el pago');
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      throw new ValidationError('Esta liquidación ya fue procesada');
    }

    const updated = await prisma.settlement.update({
      where: { id: settlementId },
      data: { status: SettlementStatus.REJECTED },
      include: {
        fromUser: { select: { id: true, name: true, email: true, avatarUrl: true } },
        toUser: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    eventBus.emit('settlement:rejected', {
      homeId,
      settlement: { id: updated.id, fromUserId: updated.fromUserId, toUserId: updated.toUserId, amount: updated.amount, status: updated.status },
      actorId: userId,
    });

    return updated;
  },

  // Cancelar liquidación (solo el que pagó puede cancelar si está pendiente)
  async cancel(settlementId: string, homeId: string, userId: string) {
    const settlement = await prisma.settlement.findFirst({
      where: { id: settlementId, homeId },
    });

    if (!settlement) {
      throw new NotFoundError('Liquidación no encontrada');
    }

    if (settlement.fromUserId !== userId) {
      throw new ForbiddenError('Solo quien registró el pago puede cancelarlo');
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      throw new ValidationError('Solo se pueden cancelar pagos pendientes');
    }

    await prisma.settlement.delete({
      where: { id: settlementId },
    });
  },
};
