import { CreateHomeInput, UpdateHomeInput, JoinHomeInput } from '@conviviapp/shared';
import { HomeRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ConflictError, ForbiddenError, NotFoundError } from '../middlewares/errorHandler';
import { eventBus } from '../events';
import crypto from 'crypto';

// Caracteres legibles (sin 0, O, I, l, 1)
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Generar código de invitación único
const generateInviteCode = (length = 8): string => {
  const randomBytes = crypto.randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    code += CHARSET[randomBytes[i] % CHARSET.length];
  }

  return code;
};

// Tipos para los formateadores basados en las queries Prisma
interface HomeWithMembersAndCount {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  inviteCode: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  members?: Array<{ userId: string; role: HomeRole }>;
  _count?: { members: number };
}

interface MemberWithUser {
  id: string;
  userId: string;
  role: HomeRole;
  nickname: string | null;
  joinedAt: Date;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
}

// Formatear hogar para respuesta
const formatHomeResponse = (home: HomeWithMembersAndCount, userId: string) => {
  const membership = home.members?.find((m) => m.userId === userId);
  return {
    id: home.id,
    name: home.name,
    description: home.description,
    address: home.address,
    inviteCode: home.inviteCode,
    currency: home.currency,
    memberCount: home._count?.members ?? home.members?.length ?? 0,
    myRole: membership?.role,
    createdAt: home.createdAt,
    updatedAt: home.updatedAt,
  };
};

// Formatear miembro para respuesta
const formatMemberResponse = (member: MemberWithUser, currentUserId: string) => ({
  id: member.id,
  userId: member.userId,
  name: member.user.name,
  email: member.user.email,
  avatarUrl: member.user.avatarUrl,
  role: member.role,
  nickname: member.nickname,
  joinedAt: member.joinedAt,
  isCurrentUser: member.userId === currentUserId,
});

export const homeService = {
  // Crear nuevo hogar
  async create(userId: string, data: CreateHomeInput) {
    const inviteCode = generateInviteCode();

    const home = await prisma.home.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        currency: data.currency || 'EUR',
        defaultSplitMode: data.defaultSplitMode || 'EQUAL',
        inviteCode,
        members: {
          create: {
            userId,
            role: HomeRole.ADMIN,
          },
        },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true, userId: true },
        },
        _count: { select: { members: true } },
      },
    });

    return formatHomeResponse(home, userId);
  },

  // Listar hogares del usuario
  async findAllByUser(userId: string) {
    const memberships = await prisma.homeMember.findMany({
      where: { userId, isActive: true },
      include: {
        home: {
          include: {
            _count: { select: { members: { where: { isActive: true } } } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m: any) => ({
      id: m.home.id,
      name: m.home.name,
      description: m.home.description,
      memberCount: m.home._count.members,
      myRole: m.role,
      joinedAt: m.joinedAt,
    }));
  },

  // Obtener detalle de un hogar
  async findById(homeId: string, userId: string) {
    const home = await prisma.home.findUnique({
      where: { id: homeId },
      include: {
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
          orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
        },
      },
    });

    if (!home) {
      throw new NotFoundError('Hogar no encontrado');
    }

    const membership = home.members.find((m: any) => m.userId === userId);

    return {
      id: home.id,
      name: home.name,
      description: home.description,
      address: home.address,
      inviteCode: home.inviteCode,
      currency: home.currency,
      defaultSplitMode: home.defaultSplitMode,
      taskRotationEnabled: home.taskRotationEnabled,
      myRole: membership?.role,
      members: home.members.map((m: any) => formatMemberResponse(m, userId)),
      createdAt: home.createdAt,
      updatedAt: home.updatedAt,
    };
  },

  // Actualizar hogar (solo admin)
  async update(homeId: string, data: UpdateHomeInput) {
    const home = await prisma.home.update({
      where: { id: homeId },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        currency: data.currency,
        defaultSplitMode: data.defaultSplitMode,
      },
    });

    return home;
  },

  // Eliminar hogar (solo admin)
  async delete(homeId: string) {
    await prisma.home.delete({
      where: { id: homeId },
    });
  },

  // Regenerar código de invitación
  async regenerateInviteCode(homeId: string) {
    const newCode = generateInviteCode();

    const home = await prisma.home.update({
      where: { id: homeId },
      data: { inviteCode: newCode },
      select: { inviteCode: true },
    });

    return { inviteCode: home.inviteCode };
  },

  // Unirse a un hogar con código
  async join(userId: string, data: JoinHomeInput) {
    // Buscar hogar por código
    const home = await prisma.home.findUnique({
      where: { inviteCode: data.inviteCode.toUpperCase().replace(/[-\s]/g, '') },
      include: {
        members: { where: { isActive: true } },
        _count: { select: { members: { where: { isActive: true } } } },
      },
    });

    if (!home) {
      throw new NotFoundError('Código de invitación inválido');
    }

    // Verificar si ya es miembro
    const existingMembership = home.members.find((m: any) => m.userId === userId);

    if (existingMembership) {
      throw new ConflictError('Ya eres miembro de este hogar');
    }

    // Verificar límite de miembros (10 por defecto)
    if (home._count.members >= 10) {
      throw new ConflictError('El hogar ha alcanzado el límite de miembros');
    }

    // Crear membresía
    await prisma.homeMember.create({
      data: {
        userId,
        homeId: home.id,
        role: HomeRole.MEMBER,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    eventBus.emit('home:member-joined', {
      homeId: home.id,
      member: { userId, role: 'MEMBER', name: user?.name || '' },
    });

    return {
      homeId: home.id,
      name: home.name,
      message: `Te has unido a "${home.name}"`,
    };
  },

  // Salir de un hogar
  async leave(homeId: string, userId: string) {
    const membership = await prisma.homeMember.findUnique({
      where: { userId_homeId: { userId, homeId } },
      include: {
        home: {
          include: {
            members: { where: { isActive: true } },
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundError('No eres miembro de este hogar');
    }

    // Verificar si es el único admin
    if (membership.role === HomeRole.ADMIN) {
      const otherAdmins = membership.home.members.filter(
        (m: any) => m.role === HomeRole.ADMIN && m.userId !== userId
      );

      if (otherAdmins.length === 0) {
        const otherMembers = membership.home.members.filter((m: any) => m.userId !== userId);

        if (otherMembers.length > 0) {
          throw new ForbiddenError(
            'Debes transferir la administración antes de salir'
          );
        }
        // Si es el único miembro, eliminar el hogar
        await prisma.home.delete({ where: { id: homeId } });
        return { message: 'Hogar eliminado al ser el único miembro' };
      }
    }

    // Marcar como inactivo (soft delete)
    await prisma.homeMember.update({
      where: { id: membership.id },
      data: { isActive: false, leftAt: new Date() },
    });

    eventBus.emit('home:member-left', { homeId, memberId: userId });

    return { message: 'Has salido del hogar' };
  },

  // Listar miembros del hogar
  async getMembers(homeId: string, currentUserId: string) {
    const members = await prisma.homeMember.findMany({
      where: { homeId, isActive: true },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });

    return members.map((m: any) => formatMemberResponse(m, currentUserId));
  },

  // Cambiar rol de un miembro (solo admin)
  async updateMemberRole(homeId: string, memberId: string, newRole: HomeRole, currentUserId: string) {
    const member = await prisma.homeMember.findFirst({
      where: { id: memberId, homeId, isActive: true },
    });

    if (!member) {
      throw new NotFoundError('Miembro no encontrado');
    }

    // No puede cambiar su propio rol
    if (member.userId === currentUserId) {
      throw new ForbiddenError('No puedes cambiar tu propio rol');
    }

    const updated = await prisma.homeMember.update({
      where: { id: memberId },
      data: { role: newRole },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return formatMemberResponse(updated, currentUserId);
  },

  // Expulsar miembro (solo admin)
  async removeMember(homeId: string, memberId: string, currentUserId: string) {
    const member = await prisma.homeMember.findFirst({
      where: { id: memberId, homeId, isActive: true },
    });

    if (!member) {
      throw new NotFoundError('Miembro no encontrado');
    }

    // No puede expulsarse a sí mismo
    if (member.userId === currentUserId) {
      throw new ForbiddenError('No puedes expulsarte a ti mismo. Usa la opción de salir.');
    }

    // No puede expulsar a otro admin
    if (member.role === HomeRole.ADMIN) {
      throw new ForbiddenError('No puedes expulsar a otro administrador');
    }

    await prisma.homeMember.update({
      where: { id: memberId },
      data: { isActive: false, leftAt: new Date() },
    });

    eventBus.emit('home:member-left', { homeId, memberId: member.userId });

    return { message: 'Miembro expulsado del hogar' };
  },

  // Transferir administración
  async transferOwnership(homeId: string, newAdminId: string, currentUserId: string) {
    // Verificar que el nuevo admin es miembro
    const newAdmin = await prisma.homeMember.findFirst({
      where: { userId: newAdminId, homeId, isActive: true },
    });

    if (!newAdmin) {
      throw new NotFoundError('El usuario no es miembro de este hogar');
    }

    if (newAdmin.userId === currentUserId) {
      throw new ForbiddenError('Ya eres administrador');
    }

    // Transacción: promover nuevo admin, degradar actual
    await prisma.$transaction([
      prisma.homeMember.updateMany({
        where: { userId: newAdminId, homeId },
        data: { role: HomeRole.ADMIN },
      }),
      prisma.homeMember.updateMany({
        where: { userId: currentUserId, homeId },
        data: { role: HomeRole.MEMBER },
      }),
    ]);

    return { message: 'Administración transferida correctamente' };
  },
};
