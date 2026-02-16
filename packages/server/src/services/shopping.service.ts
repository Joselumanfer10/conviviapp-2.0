import {
  CreateShoppingItemInput,
  UpdateShoppingItemInput,
  BuyShoppingItemInput,
  ShoppingItemStatus,
  SplitMode,
} from '@conviviapp/shared';
import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError, ForbiddenError } from '../middlewares/errorHandler';
import { expenseService } from './expense.service';
import { eventBus } from '../events';

export const shoppingService = {
  // Crear item de compra
  async create(homeId: string, addedById: string, data: CreateShoppingItemInput) {
    const item = await prisma.shoppingItem.create({
      data: {
        homeId,
        addedById,
        name: data.name,
        quantity: data.quantity || 1,
        unit: data.unit,
        category: data.category,
      },
      include: {
        addedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    eventBus.emit('shopping:item-added', {
      homeId,
      item: { id: item.id, name: item.name, quantity: item.quantity, status: item.status },
      actorId: addedById,
    });

    return item;
  },

  // Listar items del hogar
  async findAllByHome(
    homeId: string,
    options: { status?: ShoppingItemStatus; category?: string } = {}
  ) {
    const { status, category } = options;

    const items = await prisma.shoppingItem.findMany({
      where: {
        homeId,
        ...(status && { status }),
        ...(category && { category }),
      },
      include: {
        addedBy: { select: { id: true, name: true, avatarUrl: true } },
        boughtBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return items;
  },

  // Obtener item por ID
  async findById(itemId: string, homeId: string) {
    const item = await prisma.shoppingItem.findFirst({
      where: { id: itemId, homeId },
      include: {
        addedBy: { select: { id: true, name: true, avatarUrl: true } },
        boughtBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!item) {
      throw new NotFoundError('Item no encontrado');
    }

    return item;
  },

  // Actualizar item
  async update(itemId: string, homeId: string, data: UpdateShoppingItemInput) {
    const item = await this.findById(itemId, homeId);

    // Solo se puede actualizar si está pendiente
    if (item.status !== ShoppingItemStatus.PENDING) {
      throw new ValidationError('Solo se pueden editar items pendientes');
    }

    const updated = await prisma.shoppingItem.update({
      where: { id: itemId },
      data: {
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category,
      },
      include: {
        addedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    eventBus.emit('shopping:item-updated', {
      homeId,
      item: { id: updated.id, name: updated.name, quantity: updated.quantity, status: updated.status },
      actorId: updated.addedBy.id,
    });

    return updated;
  },

  // Eliminar item
  async delete(itemId: string, homeId: string, actorId?: string) {
    const item = await this.findById(itemId, homeId);

    // Solo se puede eliminar si está pendiente
    if (item.status !== ShoppingItemStatus.PENDING) {
      throw new ValidationError('Solo se pueden eliminar items pendientes');
    }

    await prisma.shoppingItem.delete({
      where: { id: itemId },
    });

    eventBus.emit('shopping:item-deleted', { homeId, itemId, actorId: actorId || '' });
  },

  // Marcar como comprado (crea gasto automáticamente si hay precio)
  async markAsBought(
    itemId: string,
    homeId: string,
    boughtById: string,
    data: BuyShoppingItemInput & { createExpense?: boolean } = {}
  ) {
    const item = await this.findById(itemId, homeId);

    if (item.status !== ShoppingItemStatus.PENDING) {
      throw new ValidationError('El item ya fue comprado o cancelado');
    }

    const updated = await prisma.shoppingItem.update({
      where: { id: itemId },
      data: {
        status: ShoppingItemStatus.BOUGHT,
        boughtById,
        boughtAt: new Date(),
        price: data.price,
        store: data.store,
      },
      include: {
        addedBy: { select: { id: true, name: true, avatarUrl: true } },
        boughtBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Crear gasto automáticamente si hay precio y createExpense es true (por defecto true)
    let expense = null;
    if (data.price && data.price > 0 && data.createExpense !== false) {
      expense = await expenseService.create(homeId, boughtById, {
        amount: data.price,
        description: `Compra: ${item.name}${data.store ? ` (${data.store})` : ''}`,
        splitMode: SplitMode.EQUAL,
        isRecurring: false,
      });
    }

    eventBus.emit('shopping:item-bought', {
      homeId,
      item: { id: updated.id, name: updated.name, quantity: updated.quantity, status: updated.status },
      actorId: boughtById,
    });

    return { ...updated, expense };
  },

  // Cancelar item
  async cancel(itemId: string, homeId: string) {
    const item = await this.findById(itemId, homeId);

    if (item.status !== ShoppingItemStatus.PENDING) {
      throw new ValidationError('Solo se pueden cancelar items pendientes');
    }

    const updated = await prisma.shoppingItem.update({
      where: { id: itemId },
      data: { status: ShoppingItemStatus.CANCELLED },
      include: {
        addedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return updated;
  },

  // Restaurar item cancelado
  async restore(itemId: string, homeId: string) {
    const item = await this.findById(itemId, homeId);

    if (item.status !== ShoppingItemStatus.CANCELLED) {
      throw new ValidationError('Solo se pueden restaurar items cancelados');
    }

    const updated = await prisma.shoppingItem.update({
      where: { id: itemId },
      data: { status: ShoppingItemStatus.PENDING },
      include: {
        addedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return updated;
  },

  // Convertir items comprados a gasto
  async convertToExpense(
    homeId: string,
    paidById: string,
    itemIds: string[],
    description?: string
  ) {
    // Obtener items comprados
    const items = await prisma.shoppingItem.findMany({
      where: {
        id: { in: itemIds },
        homeId,
        status: ShoppingItemStatus.BOUGHT,
      },
    });

    if (items.length === 0) {
      throw new ValidationError('No hay items válidos para convertir');
    }

    // Verificar que todos tienen precio
    const itemsWithoutPrice = items.filter((i) => !i.price);
    if (itemsWithoutPrice.length > 0) {
      throw new ValidationError(
        `Los siguientes items no tienen precio: ${itemsWithoutPrice.map((i) => i.name).join(', ')}`
      );
    }

    // Calcular total
    const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);

    // Generar descripción
    const expenseDescription =
      description || `Compras: ${items.map((i) => i.name).join(', ')}`;

    // Crear gasto (división igual por defecto)
    const expense = await expenseService.create(homeId, paidById, {
      amount: totalAmount,
      description: expenseDescription,
      splitMode: SplitMode.EQUAL,
      isRecurring: false,
    });

    // Actualizar items para marcarlos como sincronizados (eliminados de la lista activa)
    await prisma.shoppingItem.deleteMany({
      where: { id: { in: itemIds } },
    });

    return {
      expense,
      itemsConverted: items.length,
      totalAmount,
    };
  },

  // Obtener categorías únicas del hogar
  async getCategories(homeId: string) {
    const items = await prisma.shoppingItem.findMany({
      where: { homeId },
      select: { category: true },
      distinct: ['category'],
    });

    return items
      .map((i) => i.category)
      .filter((c): c is string => c !== null)
      .sort();
  },

  // Limpiar items comprados antiguos (más de 30 días)
  async cleanupOldBoughtItems(homeId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.shoppingItem.deleteMany({
      where: {
        homeId,
        status: ShoppingItemStatus.BOUGHT,
        boughtAt: { lt: thirtyDaysAgo },
      },
    });

    return result.count;
  },
};
