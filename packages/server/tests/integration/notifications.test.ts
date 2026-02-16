import request from 'supertest';
import { getTestApp, generateAccessToken } from '../helpers';
import { UserFactory } from '../factories';
import { prisma } from '../setup/prisma-test-client';

const app = getTestApp();

describe('Notifications API', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const user = await UserFactory.create();
    userId = user.id;
    token = generateAccessToken(user);
  });

  async function createNotification(overrides: Partial<{
    userId: string;
    title: string;
    body: string;
    link: string;
    isRead: boolean;
  }> = {}) {
    return prisma.notification.create({
      data: {
        userId: overrides.userId ?? userId,
        title: overrides.title ?? 'Notificación de prueba',
        body: overrides.body ?? 'Cuerpo de la notificación',
        link: overrides.link,
        isRead: overrides.isRead ?? false,
      },
    });
  }

  describe('GET /api/notifications', () => {
    it('lista notificaciones del usuario', async () => {
      await createNotification({ title: 'Notificación 1' });
      await createNotification({ title: 'Notificación 2' });

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('filtra por estado de lectura', async () => {
      await createNotification({ title: 'No leída', isRead: false });
      await createNotification({ title: 'Leída', isRead: true });

      const response = await request(app)
        .get('/api/notifications?isRead=false')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.notifications).toHaveLength(1);
      expect(response.body.data.notifications[0].title).toBe('No leída');
    });

    it('no muestra notificaciones de otro usuario', async () => {
      const otherUser = await UserFactory.create();
      await createNotification({ userId: otherUser.id, title: 'De otro usuario' });
      await createNotification({ title: 'Mía' });

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.data.notifications).toHaveLength(1);
      expect(response.body.data.notifications[0].title).toBe('Mía');
    });

    it('rechaza sin autenticación', async () => {
      const response = await request(app).get('/api/notifications');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('cuenta notificaciones no leídas', async () => {
      await createNotification({ isRead: false });
      await createNotification({ isRead: false });
      await createNotification({ isRead: true });

      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(2);
    });

    it('retorna 0 sin notificaciones', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('marca notificación como leída', async () => {
      const notification = await createNotification({ isRead: false });

      const response = await request(app)
        .patch(`/api/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.isRead).toBe(true);
    });

    it('retorna 404 con notificación de otro usuario', async () => {
      const otherUser = await UserFactory.create();
      const notification = await createNotification({ userId: otherUser.id });

      const response = await request(app)
        .patch(`/api/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/notifications/mark-all-read', () => {
    it('marca todas como leídas', async () => {
      await createNotification({ isRead: false });
      await createNotification({ isRead: false });
      await createNotification({ isRead: false });

      const response = await request(app)
        .patch('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const countResponse = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);

      expect(countResponse.body.data.count).toBe(0);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('elimina notificación propia', async () => {
      const notification = await createNotification();

      const response = await request(app)
        .delete(`/api/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const listResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(listResponse.body.data.notifications).toHaveLength(0);
    });

    it('no puede eliminar notificación de otro usuario', async () => {
      const otherUser = await UserFactory.create();
      const notification = await createNotification({ userId: otherUser.id });

      const response = await request(app)
        .delete(`/api/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
