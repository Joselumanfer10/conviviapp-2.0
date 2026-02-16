import { prisma } from '../lib/prisma';
import { eventBus } from '../events';
import { NotFoundError } from '../middlewares/errorHandler';

export const notificationService = {
  async create(data: { userId: string; title: string; body: string; link?: string }) {
    return prisma.notification.create({ data });
  },

  async createForHomeMembers(
    homeId: string,
    excludeUserId: string,
    data: { title: string; body: string; link?: string }
  ) {
    const members = await prisma.homeMember.findMany({
      where: { homeId, isActive: true, userId: { not: excludeUserId } },
      select: { userId: true },
    });

    if (members.length === 0) return [];

    await prisma.notification.createMany({
      data: members.map((m: { userId: string }) => ({
        userId: m.userId,
        title: data.title,
        body: data.body,
        link: data.link,
      })),
    });

    // Emitir evento para cada usuario para notificación en tiempo real
    for (const member of members as { userId: string }[]) {
      eventBus.emit('notification:created', {
        homeId,
        userId: member.userId,
        actorId: excludeUserId,
        notification: { title: data.title, body: data.body, link: data.link },
      });
    }

    return members.map((m: { userId: string }) => m.userId);
  },

  async findByUser(userId: string, options: { isRead?: boolean; limit?: number; offset?: number } = {}) {
    const { isRead, limit = 50, offset = 0 } = options;
    const where = {
      userId,
      ...(isRead !== undefined && { isRead }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundError('Notificación no encontrada');

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async delete(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundError('Notificación no encontrada');

    return prisma.notification.delete({ where: { id: notificationId } });
  },
};
