import {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  CastVoteInput,
  AnnouncementType,
} from '@conviviapp/shared';
import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError, ForbiddenError } from '../middlewares/errorHandler';
import { eventBus } from '../events';

export const announcementService = {
  // Crear anuncio
  async create(homeId: string, authorId: string, data: CreateAnnouncementInput) {
    // Validar que POLL/VOTE tengan opciones
    if (
      (data.type === AnnouncementType.POLL || data.type === AnnouncementType.VOTE) &&
      (!data.options || data.options.length < 2)
    ) {
      throw new ValidationError('Las encuestas y votaciones requieren al menos 2 opciones');
    }

    const announcement = await prisma.announcement.create({
      data: {
        homeId,
        authorId,
        title: data.title,
        content: data.content,
        type: data.type,
        isPinned: data.isPinned ?? false,
        expiresAt: data.expiresAt,
        options: data.options ?? [],
        quorum: data.quorum,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { votes: true } },
      },
    });

    eventBus.emit('announcement:created', {
      homeId,
      announcement: {
        id: announcement.id,
        title: announcement.title,
        type: announcement.type,
        authorId: announcement.authorId,
      },
      actorId: authorId,
    });

    return announcement;
  },

  // Listar anuncios del hogar
  async findAllByHome(
    homeId: string,
    options: { type?: AnnouncementType } = {}
  ) {
    const { type } = options;

    const announcements = await prisma.announcement.findMany({
      where: {
        homeId,
        ...(type && { type }),
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { votes: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    return announcements;
  },

  // Obtener anuncio por ID
  async findById(announcementId: string, homeId: string) {
    const announcement = await prisma.announcement.findFirst({
      where: { id: announcementId, homeId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        votes: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!announcement) {
      throw new NotFoundError('Anuncio no encontrado');
    }

    return announcement;
  },

  // Actualizar anuncio
  async update(
    announcementId: string,
    homeId: string,
    userId: string,
    data: UpdateAnnouncementInput
  ) {
    const announcement = await this.findById(announcementId, homeId);

    // Verificar permisos: solo autor o admin
    const membership = await prisma.homeMember.findFirst({
      where: { userId, homeId, isActive: true },
      select: { role: true },
    });

    if (announcement.authorId !== userId && membership?.role !== 'ADMIN') {
      throw new ForbiddenError('Solo el autor o un administrador puede actualizar este anuncio');
    }

    // Validar opciones si se cambia a POLL/VOTE
    if (
      (data.type === AnnouncementType.POLL || data.type === AnnouncementType.VOTE) &&
      data.options !== undefined &&
      data.options.length < 2
    ) {
      throw new ValidationError('Las encuestas y votaciones requieren al menos 2 opciones');
    }

    const updated = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),
        ...(data.options !== undefined && { options: data.options }),
        ...(data.quorum !== undefined && { quorum: data.quorum }),
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { votes: true } },
      },
    });

    eventBus.emit('announcement:updated', {
      homeId,
      announcement: {
        id: updated.id,
        title: updated.title,
        type: updated.type,
        authorId: updated.authorId,
      },
      actorId: userId,
    });

    return updated;
  },

  // Eliminar anuncio
  async delete(announcementId: string, homeId: string, userId: string) {
    const announcement = await this.findById(announcementId, homeId);

    // Verificar permisos: solo autor o admin
    const membership = await prisma.homeMember.findFirst({
      where: { userId, homeId, isActive: true },
      select: { role: true },
    });

    if (announcement.authorId !== userId && membership?.role !== 'ADMIN') {
      throw new ForbiddenError('Solo el autor o un administrador puede eliminar este anuncio');
    }

    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    eventBus.emit('announcement:deleted', {
      homeId,
      announcementId,
      actorId: userId,
    });
  },

  // Fijar/desfijar anuncio (solo admin)
  async togglePin(announcementId: string, homeId: string, userId: string) {
    const announcement = await this.findById(announcementId, homeId);

    // Verificar permisos: solo admin
    const membership = await prisma.homeMember.findFirst({
      where: { userId, homeId, isActive: true },
      select: { role: true },
    });

    if (membership?.role !== 'ADMIN') {
      throw new ForbiddenError('Solo un administrador puede fijar o desfijar anuncios');
    }

    const updated = await prisma.announcement.update({
      where: { id: announcementId },
      data: { isPinned: !announcement.isPinned },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { votes: true } },
      },
    });

    eventBus.emit('announcement:updated', {
      homeId,
      announcement: {
        id: updated.id,
        title: updated.title,
        type: updated.type,
        authorId: updated.authorId,
      },
      actorId: userId,
    });

    return updated;
  },

  // Emitir voto
  async castVote(
    announcementId: string,
    homeId: string,
    userId: string,
    data: CastVoteInput
  ) {
    const announcement = await this.findById(announcementId, homeId);

    // Verificar que el anuncio es una encuesta o votacion
    if (announcement.type === AnnouncementType.INFO) {
      throw new ValidationError('No se puede votar en un anuncio informativo');
    }

    // Verificar que el indice de opcion es valido
    if (data.optionIndex >= announcement.options.length) {
      throw new ValidationError(
        `Opcion invalida. El anuncio tiene ${announcement.options.length} opciones (indices 0-${announcement.options.length - 1})`
      );
    }

    // Verificar que no ha expirado
    if (announcement.expiresAt && new Date() > announcement.expiresAt) {
      throw new ValidationError('Esta votacion ha expirado');
    }

    // Upsert: crear o actualizar voto (permite cambiar de opcion)
    const vote = await prisma.vote.upsert({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
      create: {
        announcementId,
        userId,
        optionIndex: data.optionIndex,
      },
      update: {
        optionIndex: data.optionIndex,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    eventBus.emit('vote:cast', {
      homeId,
      vote: {
        announcementId,
        userId,
        optionIndex: data.optionIndex,
      },
      actorId: userId,
    });

    return vote;
  },

  // Eliminar voto
  async removeVote(announcementId: string, homeId: string, userId: string) {
    // Verificar que el anuncio existe
    await this.findById(announcementId, homeId);

    const existingVote = await prisma.vote.findUnique({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
    });

    if (!existingVote) {
      throw new NotFoundError('No tienes un voto en este anuncio');
    }

    await prisma.vote.delete({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
    });

    eventBus.emit('vote:removed', {
      homeId,
      vote: {
        announcementId,
        userId,
        optionIndex: existingVote.optionIndex,
      },
      actorId: userId,
    });
  },

  // Obtener resultados de votacion
  async getResults(announcementId: string, homeId: string) {
    const announcement = await this.findById(announcementId, homeId);

    // Contar votos por opcion
    const voteCounts = await prisma.vote.groupBy({
      by: ['optionIndex'],
      where: { announcementId },
      _count: { id: true },
    });

    // Obtener total de miembros activos del hogar para calcular participacion
    const totalMembers = await prisma.homeMember.count({
      where: { homeId, isActive: true },
    });

    const totalVotes = announcement.votes.length;

    // Construir resultados por opcion
    const results = announcement.options.map((option: string, index: number) => {
      const voteGroup = voteCounts.find((v: { optionIndex: number; _count: { id: number } }) => v.optionIndex === index);
      const count = voteGroup ? voteGroup._count.id : 0;

      return {
        optionIndex: index,
        option,
        count,
        percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 10000) / 100 : 0,
      };
    });

    const quorumReached = announcement.quorum
      ? totalVotes >= announcement.quorum
      : null;

    const participationPercentage = totalMembers > 0
      ? Math.round((totalVotes / totalMembers) * 10000) / 100
      : 0;

    return {
      announcementId,
      title: announcement.title,
      type: announcement.type,
      options: results,
      totalVotes,
      totalMembers,
      participationPercentage,
      quorum: announcement.quorum,
      quorumReached,
      isExpired: announcement.expiresAt ? new Date() > announcement.expiresAt : false,
    };
  },
};
