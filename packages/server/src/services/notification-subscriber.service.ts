import { eventBus } from '../events';
import { notificationService } from './notification.service';

export function initNotificationSubscriber(): void {
  // Gastos
  eventBus.on('expense:created', async ({ homeId, expense, actorId }) => {
    await notificationService.createForHomeMembers(homeId, actorId, {
      title: 'Nuevo gasto',
      body: `Se registró un gasto de ${expense.amount}€: ${expense.description}`,
      link: `/homes/${homeId}/expenses`,
    });
  });

  // Tareas asignadas
  eventBus.on('assignment:created', async ({ homeId, assignment, actorId }) => {
    await notificationService.create({
      userId: assignment.assignedToId,
      title: 'Nueva tarea asignada',
      body: 'Se te ha asignado una nueva tarea',
      link: `/homes/${homeId}/tasks`,
    });
  });

  eventBus.on('assignment:completed', async ({ homeId, assignment, actorId }) => {
    await notificationService.createForHomeMembers(homeId, actorId, {
      title: 'Tarea completada',
      body: 'Una tarea ha sido completada',
      link: `/homes/${homeId}/tasks`,
    });
  });

  // Compras
  eventBus.on('shopping:item-bought', async ({ homeId, item, actorId }) => {
    await notificationService.createForHomeMembers(homeId, actorId, {
      title: 'Artículo comprado',
      body: `Se compró: ${item.name}`,
      link: `/homes/${homeId}/shopping`,
    });
  });

  // Anuncios
  eventBus.on('announcement:created', async ({ homeId, announcement, actorId }) => {
    await notificationService.createForHomeMembers(homeId, actorId, {
      title: 'Nuevo anuncio',
      body: announcement.title,
      link: `/homes/${homeId}/announcements`,
    });
  });

  // Liquidaciones
  eventBus.on('settlement:created', async ({ homeId, settlement, actorId }) => {
    await notificationService.create({
      userId: settlement.toUserId,
      title: 'Nueva liquidación',
      body: `Tienes una liquidación pendiente de ${settlement.amount}€`,
      link: `/homes/${homeId}/expenses`,
    });
  });

  eventBus.on('settlement:confirmed', async ({ homeId, settlement, actorId }) => {
    await notificationService.create({
      userId: settlement.fromUserId,
      title: 'Pago confirmado',
      body: `Tu pago de ${settlement.amount}€ ha sido confirmado`,
      link: `/homes/${homeId}/expenses`,
    });
  });

  // Miembros
  eventBus.on('home:member-joined', async ({ homeId, member }) => {
    await notificationService.createForHomeMembers(homeId, member.userId, {
      title: 'Nuevo miembro',
      body: `${member.name} se unió al hogar`,
      link: `/homes/${homeId}`,
    });
  });

  console.log('[Notifications] Subscriber inicializado');
}
