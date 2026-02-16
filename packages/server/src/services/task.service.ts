import { CreateTaskInput, UpdateTaskInput, AssignTaskInput, TaskStatus, TaskFrequency } from '@conviviapp/shared';
import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError, ForbiddenError } from '../middlewares/errorHandler';
import { eventBus } from '../events';

// Transiciones válidas de estado
const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.SKIPPED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.PENDING],
  [TaskStatus.COMPLETED]: [],
  [TaskStatus.SKIPPED]: [TaskStatus.PENDING],
};

const canTransition = (from: TaskStatus, to: TaskStatus): boolean => {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
};

// Calcular próxima fecha según frecuencia
const getNextDueDate = (frequency: TaskFrequency, fromDate = new Date()): Date => {
  const date = new Date(fromDate);

  switch (frequency) {
    case TaskFrequency.DAILY:
      date.setDate(date.getDate() + 1);
      break;
    case TaskFrequency.WEEKLY:
      date.setDate(date.getDate() + 7);
      break;
    case TaskFrequency.BIWEEKLY:
      date.setDate(date.getDate() + 14);
      break;
    case TaskFrequency.MONTHLY:
      date.setMonth(date.getMonth() + 1);
      break;
    case TaskFrequency.ONCE:
    default:
      date.setDate(date.getDate() + 7);
  }

  return date;
};

export const taskService = {
  // ============ CRUD de Tareas (Plantillas) ============

  async create(homeId: string, data: CreateTaskInput, actorId?: string) {
    const task = await prisma.task.create({
      data: {
        homeId,
        name: data.name,
        description: data.description,
        frequency: data.frequency || TaskFrequency.WEEKLY,
        difficulty: data.difficulty || 1,
      },
    });

    eventBus.emit('task:created', {
      homeId,
      task: { id: task.id, name: task.name, frequency: task.frequency },
      actorId: actorId || '',
    });

    return task;
  },

  async findAllByHome(homeId: string, options: { isActive?: boolean } = {}) {
    const tasks = await prisma.task.findMany({
      where: {
        homeId,
        ...(options.isActive !== undefined && { isActive: options.isActive }),
      },
      include: {
        assignments: {
          take: 1,
          orderBy: { dueDate: 'desc' },
          include: {
            assignedTo: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: { select: { assignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((task) => ({
      ...task,
      lastAssignment: task.assignments[0] || null,
      totalAssignments: task._count.assignments,
    }));
  },

  async findById(taskId: string, homeId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, homeId },
      include: {
        assignments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Tarea no encontrada');
    }

    return task;
  },

  async update(taskId: string, homeId: string, data: UpdateTaskInput, actorId?: string) {
    await this.findById(taskId, homeId);

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        difficulty: data.difficulty,
      },
    });

    eventBus.emit('task:updated', {
      homeId,
      task: { id: task.id, name: task.name, frequency: task.frequency },
      actorId: actorId || '',
    });

    return task;
  },

  async delete(taskId: string, homeId: string, actorId?: string) {
    await this.findById(taskId, homeId);

    // Soft delete
    await prisma.task.update({
      where: { id: taskId },
      data: { isActive: false },
    });

    eventBus.emit('task:deleted', { homeId, taskId, actorId: actorId || '' });
  },

  // ============ Asignaciones ============

  async createAssignment(homeId: string, data: AssignTaskInput & { taskId: string }) {
    // Verificar que la tarea existe y pertenece al hogar
    const task = await prisma.task.findFirst({
      where: { id: data.taskId, homeId, isActive: true },
    });

    if (!task) {
      throw new NotFoundError('Tarea no encontrada');
    }

    // Verificar que el usuario es miembro del hogar
    const member = await prisma.homeMember.findFirst({
      where: { userId: data.assignedToId, homeId, isActive: true },
    });

    if (!member) {
      throw new ValidationError('El usuario no es miembro del hogar');
    }

    const assignment = await prisma.taskAssignment.create({
      data: {
        taskId: data.taskId,
        assignedToId: data.assignedToId,
        dueDate: data.dueDate,
      },
      include: {
        task: true,
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    eventBus.emit('assignment:created', {
      homeId,
      assignment: { id: assignment.id, taskId: assignment.taskId, assignedToId: assignment.assignedToId, status: assignment.status, dueDate: assignment.dueDate },
      actorId: data.assignedToId,
    });

    return assignment;
  },

  async findAssignmentsByHome(
    homeId: string,
    options: { status?: TaskStatus; assignedToId?: string; page?: number; limit?: number } = {}
  ) {
    const { status, assignedToId, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = {
      task: { homeId },
      ...(status && { status }),
      ...(assignedToId && { assignedToId }),
    };

    const [assignments, total] = await Promise.all([
      prisma.taskAssignment.findMany({
        where,
        include: {
          task: { select: { id: true, name: true, difficulty: true } },
          assignedTo: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.taskAssignment.count({ where }),
    ]);

    return {
      assignments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async findMyAssignments(userId: string, options: { status?: TaskStatus; homeId?: string } = {}) {
    const { status, homeId } = options;

    const assignments = await prisma.taskAssignment.findMany({
      where: {
        assignedToId: userId,
        ...(status && { status }),
        ...(homeId && { task: { homeId } }),
      },
      include: {
        task: {
          select: { id: true, name: true, difficulty: true, home: { select: { id: true, name: true } } },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return assignments;
  },

  async findAssignmentById(assignmentId: string, homeId: string) {
    const assignment = await prisma.taskAssignment.findFirst({
      where: { id: assignmentId, task: { homeId } },
      include: {
        task: true,
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!assignment) {
      throw new NotFoundError('Asignación no encontrada');
    }

    return assignment;
  },

  // Cambiar estado de asignación
  async updateAssignmentStatus(
    assignmentId: string,
    homeId: string,
    userId: string,
    newStatus: TaskStatus,
    notes?: string
  ) {
    const assignment = await this.findAssignmentById(assignmentId, homeId);

    // Solo el asignado puede cambiar el estado
    if (assignment.assignedToId !== userId) {
      // Verificar si es admin
      const membership = await prisma.homeMember.findFirst({
        where: { userId, homeId, isActive: true },
      });

      if (membership?.role !== 'ADMIN') {
        throw new ForbiddenError('Solo el asignado o un admin puede cambiar el estado');
      }
    }

    // Validar transición
    if (!canTransition(assignment.status as TaskStatus, newStatus)) {
      throw new ValidationError(
        `No se puede cambiar de ${assignment.status} a ${newStatus}`
      );
    }

    const updated = await prisma.taskAssignment.update({
      where: { id: assignmentId },
      data: {
        status: newStatus,
        notes: notes || assignment.notes,
        completedAt: newStatus === TaskStatus.COMPLETED ? new Date() : null,
      },
      include: {
        task: true,
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Actualizar karma según el resultado
    const difficulty = assignment.task.difficulty;
    let karmaChange = 0;

    if (newStatus === TaskStatus.COMPLETED) {
      // Karma positivo: dificultad × 10, bonus si a tiempo
      karmaChange = difficulty * 10;
      const isOnTime = new Date() <= new Date(assignment.dueDate);
      if (isOnTime) karmaChange += 5; // Bonus por completar a tiempo
    } else if (newStatus === TaskStatus.SKIPPED) {
      // Karma negativo: dificultad × -5
      karmaChange = difficulty * -5;
    }

    if (karmaChange !== 0) {
      await prisma.homeMember.updateMany({
        where: { userId: assignment.assignedToId, homeId, isActive: true },
        data: { karma: { increment: karmaChange } },
      });
    }

    // Si se completa y la tarea es recurrente, crear siguiente asignación
    if (newStatus === TaskStatus.COMPLETED && assignment.task.frequency !== TaskFrequency.ONCE) {
      await this.createNextAssignment(assignment.task.id, homeId, assignment.assignedToId, assignment.dueDate);
    }

    const eventName = newStatus === TaskStatus.COMPLETED
      ? 'assignment:completed' as const
      : newStatus === TaskStatus.IN_PROGRESS
        ? 'assignment:started' as const
        : 'assignment:skipped' as const;

    eventBus.emit(eventName, {
      homeId,
      assignment: { id: updated.id, taskId: updated.taskId, assignedToId: updated.assignedToId, status: updated.status, dueDate: updated.dueDate },
      actorId: userId,
    });

    return { ...updated, karmaChange };
  },

  // Obtener ranking de karma del hogar
  async getKarmaRanking(homeId: string) {
    const members = await prisma.homeMember.findMany({
      where: { homeId, isActive: true },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { karma: 'desc' },
    });

    return members.map((m, index) => ({
      rank: index + 1,
      odUserId: m.userId,
      name: m.user.name,
      avatarUrl: m.user.avatarUrl,
      karma: m.karma,
    }));
  },

  // Crear siguiente asignación (rotación simple)
  async createNextAssignment(taskId: string, homeId: string, lastAssignedToId: string, lastDueDate?: Date) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || !task.isActive) return null;

    // Obtener miembros activos del hogar
    const members = await prisma.homeMember.findMany({
      where: { homeId, isActive: true },
      orderBy: { joinedAt: 'asc' },
    });

    if (members.length === 0) return null;

    // Rotación: siguiente usuario en la lista
    const lastIndex = members.findIndex((m) => m.userId === lastAssignedToId);
    const nextIndex = (lastIndex + 1) % members.length;
    const nextUserId = members[nextIndex].userId;

    // Calcular desde la fecha de vencimiento anterior (no desde hoy)
    // Si la fecha anterior ya pasó, usar hoy como base para no crear en el pasado
    const baseDate = lastDueDate && new Date(lastDueDate) > new Date()
      ? new Date(lastDueDate)
      : new Date();
    const nextDueDate = getNextDueDate(task.frequency as TaskFrequency, baseDate);

    const assignment = await prisma.taskAssignment.create({
      data: {
        taskId,
        assignedToId: nextUserId,
        dueDate: nextDueDate,
      },
    });

    return assignment;
  },

  // Atajos para cambios de estado
  async startAssignment(assignmentId: string, homeId: string, userId: string) {
    return this.updateAssignmentStatus(assignmentId, homeId, userId, TaskStatus.IN_PROGRESS);
  },

  async completeAssignment(assignmentId: string, homeId: string, userId: string, notes?: string) {
    return this.updateAssignmentStatus(assignmentId, homeId, userId, TaskStatus.COMPLETED, notes);
  },

  async skipAssignment(assignmentId: string, homeId: string, userId: string, notes?: string) {
    return this.updateAssignmentStatus(assignmentId, homeId, userId, TaskStatus.SKIPPED, notes);
  },
};
