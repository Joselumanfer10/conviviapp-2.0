import { CreateHouseRuleInput, UpdateHouseRuleInput } from '@conviviapp/shared';
import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../middlewares/errorHandler';
import { eventBus } from '../events';

export const houseRuleService = {
  async create(homeId: string, createdById: string, data: CreateHouseRuleInput) {
    const rule = await prisma.houseRule.create({
      data: {
        homeId,
        createdById,
        title: data.title,
        description: data.description,
        category: data.category ?? 'general',
        priority: data.priority ?? 0,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    eventBus.emit('rule:created', {
      homeId,
      actorId: createdById,
      rule: { id: rule.id, title: rule.title, category: rule.category },
    });

    return rule;
  },

  async findAll(homeId: string) {
    return prisma.houseRule.findMany({
      where: { homeId },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async findById(homeId: string, ruleId: string) {
    const rule = await prisma.houseRule.findFirst({
      where: { id: ruleId, homeId },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!rule) throw new NotFoundError('Regla no encontrada');
    return rule;
  },

  async update(homeId: string, ruleId: string, userId: string, data: UpdateHouseRuleInput) {
    const existing = await prisma.houseRule.findFirst({
      where: { id: ruleId, homeId },
    });

    if (!existing) throw new NotFoundError('Regla no encontrada');
    if (existing.createdById !== userId) {
      throw new ForbiddenError('Solo el autor puede editar la regla');
    }

    const rule = await prisma.houseRule.update({
      where: { id: ruleId },
      data,
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    eventBus.emit('rule:updated', {
      homeId,
      actorId: userId,
      rule: { id: rule.id, title: rule.title, category: rule.category },
    });

    return rule;
  },

  async delete(homeId: string, ruleId: string, userId: string) {
    const existing = await prisma.houseRule.findFirst({
      where: { id: ruleId, homeId },
    });

    if (!existing) throw new NotFoundError('Regla no encontrada');
    if (existing.createdById !== userId) {
      throw new ForbiddenError('Solo el autor puede eliminar la regla');
    }

    await prisma.houseRule.delete({ where: { id: ruleId } });

    eventBus.emit('rule:deleted', {
      homeId,
      actorId: userId,
      ruleId,
    });
  },

  async accept(homeId: string, ruleId: string, userId: string) {
    const rule = await prisma.houseRule.findFirst({
      where: { id: ruleId, homeId },
    });

    if (!rule) throw new NotFoundError('Regla no encontrada');

    if (rule.acceptedBy.includes(userId)) {
      return rule;
    }

    const updated = await prisma.houseRule.update({
      where: { id: ruleId },
      data: {
        acceptedBy: { push: userId },
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    eventBus.emit('rule:accepted', {
      homeId,
      actorId: userId,
      rule: { id: updated.id, title: updated.title, category: updated.category },
    });

    return updated;
  },

  async getAcceptanceStatus(homeId: string, ruleId: string) {
    const rule = await prisma.houseRule.findFirst({
      where: { id: ruleId, homeId },
    });

    if (!rule) throw new NotFoundError('Regla no encontrada');

    const members = await prisma.homeMember.findMany({
      where: { homeId, isActive: true },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    return {
      total: members.length,
      accepted: rule.acceptedBy.length,
      members: members.map((m: any) => ({
        userId: m.userId,
        name: m.user.name,
        avatarUrl: m.user.avatarUrl,
        hasAccepted: rule.acceptedBy.includes(m.userId),
      })),
    };
  },
};
