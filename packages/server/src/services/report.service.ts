import { prisma } from '../lib/prisma';
import type { MonthlyReport } from '@conviviapp/shared';

export const reportService = {
  async getMonthlyReport(homeId: string, month: number, year: number): Promise<MonthlyReport> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const [expenses, assignments, members, karmaData] = await Promise.all([
      // Gastos del mes
      prisma.expense.findMany({
        where: {
          homeId,
          createdAt: { gte: startDate, lte: endDate },
        },
        include: {
          paidBy: { select: { id: true, name: true } },
          participants: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
      }),

      // Asignaciones del mes
      prisma.taskAssignment.findMany({
        where: {
          task: { homeId },
          dueDate: { gte: startDate, lte: endDate },
        },
        include: {
          assignedTo: { select: { id: true, name: true } },
        },
      }),

      // Miembros activos
      prisma.homeMember.findMany({
        where: { homeId, isActive: true },
        include: { user: { select: { id: true, name: true } } },
      }),

      // Karma
      prisma.homeMember.findMany({
        where: { homeId, isActive: true },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { karma: 'desc' },
      }),
    ]);

    // Agregar gastos por miembro
    const expensesByMember = new Map<string, { totalPaid: number; totalOwed: number; name: string }>();
    for (const m of members) {
      expensesByMember.set(m.userId, { totalPaid: 0, totalOwed: 0, name: m.user.name });
    }

    for (const expense of expenses) {
      const current = expensesByMember.get(expense.paidById);
      if (current) {
        current.totalPaid += expense.amount;
      }
      for (const participant of expense.participants) {
        const p = expensesByMember.get(participant.userId);
        if (p) {
          p.totalOwed += participant.share;
        }
      }
    }

    // Agregar tareas por miembro
    const tasksByMember = new Map<string, { completed: number; assigned: number; name: string }>();
    for (const m of members) {
      tasksByMember.set(m.userId, { completed: 0, assigned: 0, name: m.user.name });
    }

    for (const assignment of assignments) {
      const current = tasksByMember.get(assignment.assignedToId);
      if (current) {
        current.assigned += 1;
        if (assignment.status === 'COMPLETED') {
          current.completed += 1;
        }
      }
    }

    const totalAssigned = assignments.length;
    const totalCompleted = assignments.filter((a) => a.status === 'COMPLETED').length;

    return {
      month,
      year,
      expenses: {
        total: expenses.reduce((sum, e) => sum + e.amount, 0),
        count: expenses.length,
        byMember: Array.from(expensesByMember.entries()).map(([userId, data]) => ({
          userId,
          name: data.name,
          totalPaid: Math.round(data.totalPaid * 100) / 100,
          totalOwed: Math.round(data.totalOwed * 100) / 100,
        })),
      },
      tasks: {
        totalAssigned,
        totalCompleted,
        completionRate: totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0,
        byMember: Array.from(tasksByMember.entries()).map(([userId, data]) => ({
          userId,
          name: data.name,
          completed: data.completed,
          assigned: data.assigned,
        })),
      },
      karma: {
        ranking: karmaData.map((m) => ({
          userId: m.userId,
          name: m.user.name,
          karma: m.karma,
        })),
      },
    };
  },
};
