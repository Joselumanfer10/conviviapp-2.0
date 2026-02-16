import request from 'supertest';
import { getTestApp } from '../helpers';
import { UserFactory, HomeFactory, DEFAULT_PASSWORD } from '../factories';

const app = getTestApp();

describe('Expense API', () => {
  let token: string;
  let homeId: string;
  let userId: string;

  beforeEach(async () => {
    // Crear hogar con admin
    const { home, admin } = await HomeFactory.createWithAdmin();
    homeId = home.id;
    userId = admin.id;

    // Login para obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

    token = loginResponse.body.data.accessToken;
  });

  describe('POST /api/homes/:homeId/expenses', () => {
    it('crea un gasto correctamente', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 50,
          description: 'Compra supermercado',
          splitMode: 'EQUAL',
          isRecurring: false,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(50);
      expect(response.body.data.description).toBe('Compra supermercado');
      expect(response.body.data.paidById).toBe(userId);
    });

    it('rechaza gasto sin autenticación', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/expenses`)
        .send({
          amount: 50,
          description: 'Test',
          splitMode: 'EQUAL',
          isRecurring: false,
        });

      expect(response.status).toBe(401);
    });

    it('rechaza gasto con monto negativo', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: -50,
          description: 'Test',
          splitMode: 'EQUAL',
          isRecurring: false,
        });

      expect(response.status).toBe(400);
    });

    it('rechaza gasto sin descripción', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 50,
          description: '',
          splitMode: 'EQUAL',
          isRecurring: false,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/homes/:homeId/expenses', () => {
    it('lista los gastos del hogar', async () => {
      // Crear algunos gastos
      await request(app)
        .post(`/api/homes/${homeId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 30,
          description: 'Gasto 1',
          splitMode: 'EQUAL',
          isRecurring: false,
        });

      await request(app)
        .post(`/api/homes/${homeId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 40,
          description: 'Gasto 2',
          splitMode: 'EQUAL',
          isRecurring: false,
        });

      const response = await request(app)
        .get(`/api/homes/${homeId}/expenses`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('soporta paginación', async () => {
      // Crear varios gastos
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post(`/api/homes/${homeId}/expenses`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            amount: 10 * (i + 1),
            description: `Gasto ${i + 1}`,
            splitMode: 'EQUAL',
            isRecurring: false,
          });
      }

      const response = await request(app)
        .get(`/api/homes/${homeId}/expenses?page=1&limit=2`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(5);
      expect(response.body.pagination.totalPages).toBe(3);
    });
  });

  describe('GET /api/homes/:homeId/balances', () => {
    it('calcula balances correctamente', async () => {
      // Crear hogar con 2 miembros
      const { home, members } = await HomeFactory.createWithMembers(2);

      // Login con el admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: members[0].email,
          password: DEFAULT_PASSWORD,
        });

      const adminToken = loginResponse.body.data.accessToken;

      // El admin paga 100€ (dividido entre 2 = 50€ cada uno)
      await request(app)
        .post(`/api/homes/${home.id}/expenses`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 100,
          description: 'Test balance',
          splitMode: 'EQUAL',
          isRecurring: false,
        });

      const response = await request(app)
        .get(`/api/homes/${home.id}/expenses/balances`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);

      // El que pagó debe tener balance positivo (+50)
      const payerBalance = response.body.data.find(
        (b: any) => b.user.id === members[0].id
      );
      expect(payerBalance.balance).toBe(50);

      // El otro debe tener balance negativo (-50)
      const otherBalance = response.body.data.find(
        (b: any) => b.user.id === members[1].id
      );
      expect(otherBalance.balance).toBe(-50);
    });
  });
});
