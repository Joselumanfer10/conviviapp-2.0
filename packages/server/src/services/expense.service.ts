import { CreateExpenseInput, UpdateExpenseInput, SplitMode } from '@conviviapp/shared';
import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError, ForbiddenError } from '../middlewares/errorHandler';
import { eventBus } from '../events';
import { simplifyDebts } from '../utils/simplifyDebts';

interface ParticipantInput {
  userId: string;
  share?: number;
}

// Calcular shares según el modo de división
const calculateShares = (
  amount: number,
  splitMode: SplitMode,
  participants: ParticipantInput[]
): { userId: string; share: number }[] => {
  switch (splitMode) {
    case SplitMode.EQUAL: {
      const count = participants.length;
      const baseShare = Math.floor((amount * 100) / count) / 100;
      const remainder = Math.round((amount - baseShare * count) * 100) / 100;

      return participants.map((p, index) => ({
        userId: p.userId,
        share: index === 0 ? baseShare + remainder : baseShare,
      }));
    }

    case SplitMode.PERCENTAGE: {
      let totalAssigned = 0;
      const shares = participants.map((p) => {
        const share = Math.round(amount * ((p.share ?? 0) / 100) * 100) / 100;
        totalAssigned += share;
        return { userId: p.userId, share };
      });

      // Ajustar diferencia por redondeo
      const diff = Math.round((amount - totalAssigned) * 100) / 100;
      if (diff !== 0 && shares.length > 0) {
        shares[0].share = Math.round((shares[0].share + diff) * 100) / 100;
      }

      return shares;
    }

    case SplitMode.FIXED_AMOUNTS: {
      return participants.map((p) => ({
        userId: p.userId,
        share: p.share ?? 0,
      }));
    }

    default:
      throw new ValidationError(`Modo de división no soportado: ${splitMode}`);
  }
};

// Validar participantes según splitMode
const validateParticipants = (
  amount: number,
  splitMode: SplitMode,
  participants: ParticipantInput[]
) => {
  if (participants.length === 0) {
    throw new ValidationError('Debe haber al menos un participante');
  }

  if (splitMode === SplitMode.PERCENTAGE) {
    const total = participants.reduce((sum, p) => sum + (p.share ?? 0), 0);
    if (Math.abs(total - 100) >= 0.01) {
      throw new ValidationError('Los porcentajes deben sumar 100%');
    }
  }

  if (splitMode === SplitMode.FIXED_AMOUNTS) {
    const total = participants.reduce((sum, p) => sum + (p.share ?? 0), 0);
    if (Math.abs(total - amount) >= 0.01) {
      throw new ValidationError('Las cantidades fijas deben sumar el monto total');
    }
  }
};

export const expenseService = {
  // Crear gasto
  async create(homeId: string, paidById: string, data: CreateExpenseInput) {
    // Obtener miembros del hogar para validar participantes
    const homeMembers = await prisma.homeMember.findMany({
      where: { homeId, isActive: true },
      select: { userId: true },
    });

    const memberIds = new Set(homeMembers.map((m: { userId: string }) => m.userId));

    // Si no se especifican participantes, incluir a todos los miembros
    const participants = data.participants?.length
      ? data.participants
      : homeMembers.map((m: { userId: string }) => ({ userId: m.userId }));

    // Validar que todos los participantes son miembros
    for (const p of participants) {
      if (!memberIds.has(p.userId)) {
        throw new ValidationError(`Usuario ${p.userId} no es miembro del hogar`);
      }
    }

    const splitMode = data.splitMode || SplitMode.EQUAL;
    validateParticipants(data.amount, splitMode, participants);

    const shares = calculateShares(data.amount, splitMode, participants);

    // Transacción: crear gasto y participantes
    const expense = await prisma.$transaction(async (tx: any) => {
      const created = await tx.expense.create({
        data: {
          homeId,
          paidById,
          amount: data.amount,
          description: data.description,
          splitMode,
          categoryId: data.categoryId,
          receiptUrl: data.receiptUrl,
          isRecurring: data.isRecurring || false,
          recurringDay: data.recurringDay,
          participants: {
            create: shares.map((s) => ({
              userId: s.userId,
              share: s.share,
            })),
          },
        },
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
          },
          paidBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
          category: true,
        },
      });

      return created;
    });

    // Emitir evento de dominio
    eventBus.emit('expense:created', {
      homeId,
      expense: {
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        paidById: expense.paidById,
        splitMode: expense.splitMode,
      },
      actorId: paidById,
    });
    eventBus.emit('balance:updated', { homeId });

    return expense;
  },

  // Listar gastos del hogar
  async findAllByHome(
    homeId: string,
    options: { page?: number; limit?: number; categoryId?: string } = {}
  ) {
    const { page = 1, limit = 20, categoryId } = options;
    const skip = (page - 1) * limit;

    const where = {
      homeId,
      ...(categoryId && { categoryId }),
    };

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
          paidBy: { select: { id: true, name: true, avatarUrl: true } },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Obtener gasto por ID
  async findById(expenseId: string, homeId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, homeId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        paidBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        category: true,
      },
    });

    if (!expense) {
      throw new NotFoundError('Gasto no encontrado');
    }

    return expense;
  },

  // Actualizar gasto
  async update(expenseId: string, homeId: string, userId: string, data: UpdateExpenseInput) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, homeId },
    });

    if (!expense) {
      throw new NotFoundError('Gasto no encontrado');
    }

    // Solo el que pagó o un admin puede editar
    const membership = await prisma.homeMember.findFirst({
      where: { userId, homeId, isActive: true },
    });

    if (expense.paidById !== userId && membership?.role !== 'ADMIN') {
      throw new ForbiddenError('No tienes permiso para editar este gasto');
    }

    // Si se actualizan participantes o monto, recalcular shares
    if (data.participants || data.amount) {
      const amount = data.amount ?? expense.amount;
      const splitMode = (data.splitMode ?? expense.splitMode) as SplitMode;

      const homeMembers = await prisma.homeMember.findMany({
        where: { homeId, isActive: true },
        select: { userId: true },
      });

      const participants = data.participants?.length
        ? data.participants
        : homeMembers.map((m: { userId: string }) => ({ userId: m.userId }));

      validateParticipants(amount, splitMode, participants);
      const shares = calculateShares(amount, splitMode, participants);

      // Transacción: actualizar gasto y participantes
      return prisma.$transaction(async (tx: any) => {
        // Eliminar participantes anteriores
        await tx.expenseParticipant.deleteMany({
          where: { expenseId },
        });

        // Actualizar gasto y crear nuevos participantes
        const updated = await tx.expense.update({
          where: { id: expenseId },
          data: {
            amount: data.amount,
            description: data.description,
            splitMode: data.splitMode,
            categoryId: data.categoryId,
            receiptUrl: data.receiptUrl,
            participants: {
              create: shares.map((s) => ({
                userId: s.userId,
                share: s.share,
              })),
            },
          },
          include: {
            participants: {
              include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
              },
            },
            paidBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
            category: true,
          },
        });

        eventBus.emit('expense:updated', {
          homeId,
          expense: { id: updated.id, amount: updated.amount, description: updated.description, paidById: updated.paidById, splitMode: updated.splitMode },
          actorId: userId,
        });
        eventBus.emit('balance:updated', { homeId });

        return updated;
      });
    }

    // Actualización simple sin recalcular
    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        description: data.description,
        categoryId: data.categoryId,
        receiptUrl: data.receiptUrl,
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        paidBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
        category: true,
      },
    });

    eventBus.emit('expense:updated', {
      homeId,
      expense: { id: updated.id, amount: updated.amount, description: updated.description, paidById: updated.paidById, splitMode: updated.splitMode },
      actorId: userId,
    });

    return updated;
  },

  // Eliminar gasto
  async delete(expenseId: string, homeId: string, userId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, homeId },
    });

    if (!expense) {
      throw new NotFoundError('Gasto no encontrado');
    }

    // Solo el que pagó o un admin puede eliminar
    const membership = await prisma.homeMember.findFirst({
      where: { userId, homeId, isActive: true },
    });

    if (expense.paidById !== userId && membership?.role !== 'ADMIN') {
      throw new ForbiddenError('No tienes permiso para eliminar este gasto');
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    eventBus.emit('expense:deleted', { homeId, expenseId, actorId: userId });
    eventBus.emit('balance:updated', { homeId });
  },

  // Calcular balances del hogar
  async getBalances(homeId: string) {
    // Obtener todos los gastos del hogar
    const expenses = await prisma.expense.findMany({
      where: { homeId },
      include: {
        participants: true,
        paidBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Obtener liquidaciones confirmadas
    const settlements = await prisma.settlement.findMany({
      where: { homeId, status: 'CONFIRMED' },
    });

    // Obtener miembros activos
    const members = await prisma.homeMember.findMany({
      where: { homeId, isActive: true },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Calcular balances
    const balances: Record<string, { totalPaid: number; totalOwed: number }> = {};

    // Inicializar balances para todos los miembros
    for (const member of members) {
      balances[member.userId] = { totalPaid: 0, totalOwed: 0 };
    }

    // Sumar gastos pagados y deudas
    for (const expense of expenses) {
      const paidById = expense.paidById;
      if (balances[paidById]) {
        balances[paidById].totalPaid += expense.amount;
      }

      for (const participant of expense.participants) {
        if (balances[participant.userId]) {
          balances[participant.userId].totalOwed += participant.share;
        }
      }
    }

    // Ajustar por liquidaciones
    for (const settlement of settlements) {
      if (balances[settlement.fromUserId]) {
        balances[settlement.fromUserId].totalPaid += settlement.amount;
      }
      if (balances[settlement.toUserId]) {
        balances[settlement.toUserId].totalOwed += settlement.amount;
      }
    }

    // Formatear respuesta
    return members.map((member: any) => {
      const { totalPaid, totalOwed } = balances[member.userId] || { totalPaid: 0, totalOwed: 0 };
      return {
        user: member.user,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalOwed: Math.round(totalOwed * 100) / 100,
        balance: Math.round((totalPaid - totalOwed) * 100) / 100,
      };
    });
  },

  // Obtener transferencias sugeridas (simplificación de deudas)
  async getSuggestedTransfers(homeId: string) {
    const balances = await this.getBalances(homeId);

    // Convertir a formato del algoritmo
    type BalanceEntry = { user: { id: string; name: string; avatarUrl: string | null }; totalPaid: number; totalOwed: number; balance: number };
    const balanceInputs = balances.map((b: BalanceEntry) => ({
      userId: b.user.id,
      amount: b.balance,
    }));

    const transfers = simplifyDebts(balanceInputs);

    // Enriquecer con datos de usuario
    const userMap = new Map(balances.map((b: BalanceEntry) => [b.user.id, b.user]));

    return transfers.map((t) => ({
      from: userMap.get(t.from),
      to: userMap.get(t.to),
      amount: t.amount,
    }));
  },
};
