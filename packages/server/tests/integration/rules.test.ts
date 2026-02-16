import request from 'supertest';
import { getTestApp, generateAccessToken } from '../helpers';
import { HomeFactory, UserFactory } from '../factories';
import { prisma } from '../setup/prisma-test-client';

const app = getTestApp();

describe('House Rules API', () => {
  let token: string;
  let homeId: string;

  beforeEach(async () => {
    const { home, admin } = await HomeFactory.createWithAdmin();
    homeId = home.id;
    token = generateAccessToken(admin);
  });

  describe('POST /api/homes/:homeId/rules', () => {
    it('crea una regla correctamente', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'No fumar en zonas comunes',
          description: 'Queda prohibido fumar en el salón y la cocina',
          category: 'convivencia',
          priority: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('No fumar en zonas comunes');
      expect(response.body.data.category).toBe('convivencia');
      expect(response.body.data.priority).toBe(2);
      expect(response.body.data.createdBy).toBeDefined();
    });

    it('rechaza regla sin autenticación', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .send({
          title: 'Test',
          description: 'Descripción',
        });

      expect(response.status).toBe(401);
    });

    it('rechaza regla sin título', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '',
          description: 'Descripción de la regla',
        });

      expect(response.status).toBe(400);
    });

    it('rechaza regla sin descripción', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Regla sin descripción',
          description: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/homes/:homeId/rules', () => {
    it('lista reglas del hogar', async () => {
      await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Regla 1', description: 'Descripción 1' });

      await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Regla 2', description: 'Descripción 2', priority: 1 });

      const response = await request(app)
        .get(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('ordena por prioridad descendente', async () => {
      await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Baja prioridad', description: 'Desc', priority: 0 });

      await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Alta prioridad', description: 'Desc', priority: 5 });

      const response = await request(app)
        .get(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.data[0].title).toBe('Alta prioridad');
      expect(response.body.data[1].title).toBe('Baja prioridad');
    });
  });

  describe('GET /api/homes/:homeId/rules/:ruleId', () => {
    it('obtiene regla por ID', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Regla detalle', description: 'Descripción detallada' });

      const ruleId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/homes/${homeId}/rules/${ruleId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(ruleId);
      expect(response.body.data.title).toBe('Regla detalle');
    });

    it('retorna 404 con ID inexistente', async () => {
      const response = await request(app)
        .get(`/api/homes/${homeId}/rules/id-inexistente`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/homes/:homeId/rules/:ruleId', () => {
    it('actualiza regla del autor', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Original', description: 'Descripción original' });

      const ruleId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/homes/${homeId}/rules/${ruleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Actualizada' });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Actualizada');
    });

    it('rechaza actualización por no-autor', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Mi regla', description: 'Desc' });

      const ruleId = createResponse.body.data.id;

      // Crear otro miembro en el mismo hogar
      const otherUser = await UserFactory.create();
      await prisma.homeMember.create({
        data: { userId: otherUser.id, homeId, role: 'MEMBER', isActive: true },
      });
      const otherToken = generateAccessToken(otherUser);

      const response = await request(app)
        .patch(`/api/homes/${homeId}/rules/${ruleId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Intento de cambio' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/homes/:homeId/rules/:ruleId', () => {
    it('elimina regla del autor', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Regla a eliminar', description: 'Se eliminará' });

      const ruleId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/homes/${homeId}/rules/${ruleId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app)
        .get(`/api/homes/${homeId}/rules/${ruleId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe('POST /api/homes/:homeId/rules/:ruleId/accept', () => {
    it('acepta una regla', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Regla a aceptar', description: 'Desc' });

      const ruleId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/homes/${homeId}/rules/${ruleId}/accept`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.acceptedBy).toBeInstanceOf(Array);
      expect(response.body.data.acceptedBy.length).toBeGreaterThanOrEqual(1);
    });

    it('la aceptación es idempotente', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Regla idempotente', description: 'Desc' });

      const ruleId = createResponse.body.data.id;

      await request(app)
        .post(`/api/homes/${homeId}/rules/${ruleId}/accept`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .post(`/api/homes/${homeId}/rules/${ruleId}/accept`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      const acceptedBy = response.body.data.acceptedBy;
      const uniqueAccepted = [...new Set(acceptedBy)];
      expect(acceptedBy.length).toBe(uniqueAccepted.length);
    });
  });

  describe('GET /api/homes/:homeId/rules/:ruleId/acceptance', () => {
    it('obtiene estado de aceptación', async () => {
      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/rules`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Regla con aceptación', description: 'Desc' });

      const ruleId = createResponse.body.data.id;

      await request(app)
        .post(`/api/homes/${homeId}/rules/${ruleId}/accept`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .get(`/api/homes/${homeId}/rules/${ruleId}/acceptance`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.total).toBeGreaterThan(0);
      expect(response.body.data.accepted).toBe(1);
      expect(response.body.data.members).toBeInstanceOf(Array);
      expect(response.body.data.members[0]).toHaveProperty('hasAccepted');
    });
  });
});
