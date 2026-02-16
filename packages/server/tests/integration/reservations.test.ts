import request from 'supertest';
import { getTestApp, generateAccessToken } from '../helpers';
import { HomeFactory, UserFactory } from '../factories';
import { prisma } from '../setup/prisma-test-client';

const app = getTestApp();

describe('Reservations API', () => {
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

  async function createSpace(name = 'Lavadora') {
    const response = await request(app)
      .post(`/api/homes/${homeId}/reservations/spaces`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name, description: `Espacio ${name}`, slotSize: 30 });
    return response.body.data;
  }

  function futureDate(hoursFromNow: number) {
    const d = new Date();
    d.setHours(d.getHours() + hoursFromNow);
    return d.toISOString();
  }

  describe('Spaces - POST /api/homes/:homeId/reservations/spaces', () => {
    it('admin crea espacio correctamente', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Lavadora',
          description: 'Lavadora del sótano',
          slotSize: 60,
          maxDuration: 120,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Lavadora');
      expect(response.body.data.slotSize).toBe(60);
      expect(response.body.data.maxDuration).toBe(120);
    });

    it('miembro no puede crear espacio', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Secadora', slotSize: 30 });

      expect(response.status).toBe(403);
    });

    it('rechaza espacio sin nombre', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '', slotSize: 30 });

      expect(response.status).toBe(400);
    });
  });

  describe('Spaces - GET /api/homes/:homeId/reservations/spaces', () => {
    it('lista espacios del hogar', async () => {
      await createSpace('Lavadora');
      await createSpace('Terraza');

      const response = await request(app)
        .get(`/api/homes/${homeId}/reservations/spaces`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('Spaces - GET /api/homes/:homeId/reservations/spaces/:spaceId', () => {
    it('obtiene espacio por ID', async () => {
      const space = await createSpace('Lavadora');

      const response = await request(app)
        .get(`/api/homes/${homeId}/reservations/spaces/${space.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Lavadora');
    });

    it('retorna 404 con ID inexistente', async () => {
      const response = await request(app)
        .get(`/api/homes/${homeId}/reservations/spaces/id-inexistente`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Spaces - PATCH /api/homes/:homeId/reservations/spaces/:spaceId', () => {
    it('admin actualiza espacio', async () => {
      const space = await createSpace('Lavadora');

      const response = await request(app)
        .patch(`/api/homes/${homeId}/reservations/spaces/${space.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Lavadora Premium' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Lavadora Premium');
    });
  });

  describe('Spaces - DELETE /api/homes/:homeId/reservations/spaces/:spaceId', () => {
    it('admin elimina espacio (soft delete)', async () => {
      const space = await createSpace('Lavadora Vieja');

      const response = await request(app)
        .delete(`/api/homes/${homeId}/reservations/spaces/${space.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Reservations - POST /spaces/:spaceId/reservations', () => {
    it('crea reserva correctamente', async () => {
      const space = await createSpace('Lavadora');

      const response = await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces/${space.id}/reservations`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({

          startTime: futureDate(2),
          endTime: futureDate(3),
          note: 'Lavar ropa blanca',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.note).toBe('Lavar ropa blanca');
      expect(response.body.data.space).toBeDefined();
    });

    it('detecta solapamiento de reservas', async () => {
      const space = await createSpace('Lavadora');

      await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces/${space.id}/reservations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({

          startTime: futureDate(2),
          endTime: futureDate(4),
        });

      const response = await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces/${space.id}/reservations`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({

          startTime: futureDate(3),
          endTime: futureDate(5),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('permite reservas sin solapamiento', async () => {
      const space = await createSpace('Lavadora');

      await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces/${space.id}/reservations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({

          startTime: futureDate(2),
          endTime: futureDate(3),
        });

      const response = await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces/${space.id}/reservations`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({

          startTime: futureDate(4),
          endTime: futureDate(5),
        });

      expect(response.status).toBe(201);
    });

    it('rechaza reserva con inicio posterior al fin', async () => {
      const space = await createSpace('Lavadora');

      const response = await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces/${space.id}/reservations`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({

          startTime: futureDate(5),
          endTime: futureDate(3),
        });

      expect(response.status).toBe(400);
    });

    it('valida duración máxima del espacio', async () => {
      const spaceResponse = await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Sala limitada', maxDuration: 60, slotSize: 30 });

      const space = spaceResponse.body.data;

      const response = await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces/${space.id}/reservations`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({

          startTime: futureDate(2),
          endTime: futureDate(5),
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Reservations - GET /api/homes/:homeId/reservations', () => {
    it('lista reservas del hogar', async () => {
      const space = await createSpace('Lavadora');

      await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces/${space.id}/reservations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({

          startTime: futureDate(2),
          endTime: futureDate(3),
        });

      const response = await request(app)
        .get(`/api/homes/${homeId}/reservations`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Reservations - DELETE /:reservationId', () => {
    it('cancela reserva propia', async () => {
      const space = await createSpace('Lavadora');

      const createResponse = await request(app)
        .post(`/api/homes/${homeId}/reservations/spaces/${space.id}/reservations`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({

          startTime: futureDate(2),
          endTime: futureDate(3),
        });

      const reservationId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/homes/${homeId}/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
