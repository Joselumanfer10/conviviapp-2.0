import request from 'supertest';
import { getTestApp, generateAccessToken } from '../helpers';
import { HomeFactory } from '../factories';

const app = getTestApp();

describe('Calendar API', () => {
  let token: string;
  let homeId: string;

  beforeEach(async () => {
    const { home, admin } = await HomeFactory.createWithAdmin();
    homeId = home.id;
    token = generateAccessToken(admin);
  });

  describe('POST /api/homes/:homeId/calendar', () => {
    it('crea evento correctamente', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Reunión de piso',
          description: 'Hablar de temas pendientes',
          startDate: '2026-03-15T18:00:00.000Z',
          allDay: false,
          color: '#3B82F6',
          category: 'reunion',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Reunión de piso');
      expect(response.body.data.color).toBe('#3B82F6');
      expect(response.body.data.category).toBe('reunion');
    });

    it('crea evento de día completo', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Cumpleaños de Ana',
          startDate: '2026-04-20T00:00:00.000Z',
          allDay: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.allDay).toBe(true);
    });

    it('rechaza evento sin título', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '',
          startDate: '2026-03-15T18:00:00.000Z',
        });

      expect(response.status).toBe(400);
    });

    it('rechaza evento sin autenticación', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .send({
          title: 'Test',
          startDate: '2026-03-15T18:00:00.000Z',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/homes/:homeId/calendar', () => {
    it('lista eventos del hogar', async () => {
      await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Evento 1', startDate: '2026-03-10T10:00:00.000Z' });

      await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Evento 2', startDate: '2026-03-20T14:00:00.000Z' });

      const response = await request(app)
        .get(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('filtra eventos por mes y año', async () => {
      await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Marzo', startDate: '2026-03-10T10:00:00.000Z' });

      await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Abril', startDate: '2026-04-10T10:00:00.000Z' });

      const response = await request(app)
        .get(`/api/homes/${homeId}/calendar?month=3&year=2026`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Marzo');
    });
  });

  describe('GET /api/homes/:homeId/calendar/:eventId', () => {
    it('obtiene evento por ID', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Evento detalle', startDate: '2026-03-15T18:00:00.000Z' });

      const eventId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/homes/${homeId}/calendar/${eventId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Evento detalle');
    });

    it('retorna 404 con ID inexistente', async () => {
      const response = await request(app)
        .get(`/api/homes/${homeId}/calendar/id-inexistente`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/homes/:homeId/calendar/:eventId', () => {
    it('actualiza evento', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Original', startDate: '2026-03-15T18:00:00.000Z' });

      const eventId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/homes/${homeId}/calendar/${eventId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Actualizado', color: '#EF4444' });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Actualizado');
      expect(response.body.data.color).toBe('#EF4444');
    });
  });

  describe('DELETE /api/homes/:homeId/calendar/:eventId', () => {
    it('elimina evento', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'A eliminar', startDate: '2026-03-15T18:00:00.000Z' });

      const eventId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/homes/${homeId}/calendar/${eventId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const getResponse = await request(app)
        .get(`/api/homes/${homeId}/calendar/${eventId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe('GET /api/homes/:homeId/calendar/aggregated', () => {
    it('retorna vista agregada con mes y año', async () => {
      await request(app)
        .post(`/api/homes/${homeId}/calendar`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Evento marzo', startDate: '2026-03-15T18:00:00.000Z' });

      const response = await request(app)
        .get(`/api/homes/${homeId}/calendar/aggregated?month=3&year=2026`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('rechaza sin parámetros month y year', async () => {
      const response = await request(app)
        .get(`/api/homes/${homeId}/calendar/aggregated`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });
});
