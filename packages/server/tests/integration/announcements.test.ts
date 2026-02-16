import request from 'supertest';
import { getTestApp, generateAccessToken } from '../helpers';
import { HomeFactory, UserFactory } from '../factories';
import { prisma } from '../setup/prisma-test-client';

const app = getTestApp();

describe('Announcements API', () => {
  let adminToken: string;
  let memberToken: string;
  let homeId: string;

  beforeEach(async () => {
    const { home, admin } = await HomeFactory.createWithAdmin();
    homeId = home.id;
    adminToken = generateAccessToken(admin);

    const member = await UserFactory.create();
    await prisma.homeMember.create({
      data: { userId: member.id, homeId, role: 'MEMBER', isActive: true },
    });
    memberToken = generateAccessToken(member);
  });

  describe('POST /api/homes/:homeId/announcements', () => {
    it('crea anuncio informativo', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Aviso importante',
          content: 'Se corta el agua mañana de 10 a 14h',
          type: 'INFO',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Aviso importante');
      expect(response.body.data.type).toBe('INFO');
      expect(response.body.data.author).toBeDefined();
    });

    it('crea encuesta POLL con opciones', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '¿Qué cenamos?',
          content: 'Votad vuestra preferencia',
          type: 'POLL',
          options: ['Pizza', 'Sushi', 'Hamburguesa'],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe('POLL');
      expect(response.body.data.options).toHaveLength(3);
    });

    it('rechaza encuesta sin opciones suficientes', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Encuesta fallida',
          content: 'Solo una opción',
          type: 'POLL',
          options: ['Única opción'],
        });

      expect(response.status).toBe(400);
    });

    it('rechaza anuncio sin título', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '',
          content: 'Contenido sin título',
        });

      expect(response.status).toBe(400);
    });

    it('rechaza anuncio sin autenticación', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .send({ title: 'Test', content: 'Contenido' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/homes/:homeId/announcements', () => {
    it('lista anuncios del hogar', async () => {
      await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Anuncio 1', content: 'Contenido 1' });

      await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Anuncio 2', content: 'Contenido 2' });

      const response = await request(app)
        .get(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('filtra anuncios por tipo', async () => {
      await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Info', content: 'Contenido', type: 'INFO' });

      await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Encuesta',
          content: 'Contenido',
          type: 'POLL',
          options: ['Sí', 'No'],
        });

      const response = await request(app)
        .get(`/api/homes/${homeId}/announcements?type=POLL`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('POLL');
    });
  });

  describe('GET /api/homes/:homeId/announcements/:announcementId', () => {
    it('obtiene detalle del anuncio', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Detalle', content: 'Contenido detallado' });

      const announcementId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/homes/${homeId}/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Detalle');
    });

    it('retorna 404 con ID inexistente', async () => {
      const response = await request(app)
        .get(`/api/homes/${homeId}/announcements/id-inexistente`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/homes/:homeId/announcements/:announcementId', () => {
    it('autor actualiza su anuncio', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Original', content: 'Contenido original' });

      const announcementId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/homes/${homeId}/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Actualizado' });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Actualizado');
    });
  });

  describe('DELETE /api/homes/:homeId/announcements/:announcementId', () => {
    it('autor elimina su anuncio', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'A eliminar', content: 'Se eliminará' });

      const announcementId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/homes/${homeId}/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('miembro no puede eliminar anuncio de otro', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Del admin', content: 'Contenido del admin' });

      const announcementId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/homes/${homeId}/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /toggle-pin', () => {
    it('admin fija un anuncio', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Para fijar', content: 'Se fijará' });

      const announcementId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/homes/${homeId}/announcements/${announcementId}/toggle-pin`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.isPinned).toBe(true);
    });

    it('miembro no puede fijar anuncio', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Intento fijar', content: 'Sin permiso' });

      const announcementId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/homes/${homeId}/announcements/${announcementId}/toggle-pin`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /vote', () => {
    it('vota en una encuesta', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Votación',
          content: 'Elige tu opción',
          type: 'POLL',
          options: ['Opción A', 'Opción B'],
        });

      const announcementId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/homes/${homeId}/announcements/${announcementId}/vote`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ optionIndex: 0 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('rechaza voto en anuncio informativo', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Info', content: 'No se puede votar', type: 'INFO' });

      const announcementId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/homes/${homeId}/announcements/${announcementId}/vote`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ optionIndex: 0 });

      expect(response.status).toBe(400);
    });

    it('permite cambiar de opción (upsert)', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Cambio de voto',
          content: 'Se puede cambiar',
          type: 'POLL',
          options: ['A', 'B', 'C'],
        });

      const announcementId = createResponse.body.data.id;

      await request(app)
        .post(`/api/homes/${homeId}/announcements/${announcementId}/vote`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ optionIndex: 0 });

      const response = await request(app)
        .post(`/api/homes/${homeId}/announcements/${announcementId}/vote`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ optionIndex: 2 });

      expect(response.status).toBe(201);
      expect(response.body.data.optionIndex).toBe(2);
    });
  });

  describe('DELETE /vote', () => {
    it('elimina el voto propio', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Quitar voto',
          content: 'Desc',
          type: 'POLL',
          options: ['Sí', 'No'],
        });

      const announcementId = createResponse.body.data.id;

      await request(app)
        .post(`/api/homes/${homeId}/announcements/${announcementId}/vote`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ optionIndex: 0 });

      const response = await request(app)
        .delete(`/api/homes/${homeId}/announcements/${announcementId}/vote`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /results', () => {
    it('obtiene resultados de votación', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/announcements`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Resultados',
          content: 'Ver resultados',
          type: 'POLL',
          options: ['Opción A', 'Opción B'],
        });

      const announcementId = createResponse.body.data.id;

      await request(app)
        .post(`/api/homes/${homeId}/announcements/${announcementId}/vote`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ optionIndex: 0 });

      await request(app)
        .post(`/api/homes/${homeId}/announcements/${announcementId}/vote`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ optionIndex: 1 });

      const response = await request(app)
        .get(`/api/homes/${homeId}/announcements/${announcementId}/results`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalVotes).toBe(2);
      expect(response.body.data.options).toHaveLength(2);
      expect(response.body.data.options[0].count).toBe(1);
      expect(response.body.data.options[1].count).toBe(1);
      expect(response.body.data.participationPercentage).toBeGreaterThan(0);
    });
  });
});
