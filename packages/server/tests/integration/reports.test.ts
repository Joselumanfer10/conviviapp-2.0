import request from 'supertest';
import { getTestApp, generateAccessToken } from '../helpers';
import { HomeFactory } from '../factories';

const app = getTestApp();

describe('Reports API', () => {
  let token: string;
  let homeId: string;

  beforeEach(async () => {
    const { home, admin } = await HomeFactory.createWithAdmin();
    homeId = home.id;
    token = generateAccessToken(admin);
  });

  describe('GET /api/homes/:homeId/reports/monthly', () => {
    it('retorna reporte mensual con estructura correcta', async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const response = await request(app)
        .get(`/api/homes/${homeId}/reports/monthly?month=${month}&year=${year}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('month', month);
      expect(response.body.data).toHaveProperty('year', year);
      expect(response.body.data).toHaveProperty('expenses');
      expect(response.body.data).toHaveProperty('tasks');
      expect(response.body.data).toHaveProperty('karma');
      expect(response.body.data.expenses).toHaveProperty('total');
      expect(response.body.data.expenses).toHaveProperty('count');
      expect(response.body.data.expenses).toHaveProperty('byMember');
      expect(response.body.data.tasks).toHaveProperty('totalAssigned');
      expect(response.body.data.tasks).toHaveProperty('totalCompleted');
      expect(response.body.data.tasks).toHaveProperty('completionRate');
      expect(response.body.data.karma).toHaveProperty('ranking');
    });

    it('retorna datos de gastos por miembro', async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      await request(app)
        .post(`/api/homes/${homeId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
          description: 'Supermercado',
          splitMode: 'EQUAL',
          isRecurring: false,
        });

      const response = await request(app)
        .get(`/api/homes/${homeId}/reports/monthly?month=${month}&year=${year}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.expenses.total).toBe(100);
      expect(response.body.data.expenses.count).toBe(1);
      expect(response.body.data.expenses.byMember.length).toBeGreaterThan(0);
    });

    it('rechaza mes inválido', async () => {
      const response = await request(app)
        .get(`/api/homes/${homeId}/reports/monthly?month=13&year=2026`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('usa mes actual por defecto cuando month=0 (falsy)', async () => {
      const response = await request(app)
        .get(`/api/homes/${homeId}/reports/monthly?month=0&year=2026`)
        .set('Authorization', `Bearer ${token}`);

      // month=0 es falsy en JS, por lo que parseInt("0") || default usa el mes actual
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.month).toBe(new Date().getMonth() + 1);
    });

    it('usa mes y año actuales por defecto', async () => {
      const response = await request(app)
        .get(`/api/homes/${homeId}/reports/monthly`)
        .set('Authorization', `Bearer ${token}`);

      const now = new Date();

      expect(response.status).toBe(200);
      expect(response.body.data.month).toBe(now.getMonth() + 1);
      expect(response.body.data.year).toBe(now.getFullYear());
    });

    it('rechaza sin autenticación', async () => {
      const response = await request(app)
        .get(`/api/homes/${homeId}/reports/monthly?month=2&year=2026`);

      expect(response.status).toBe(401);
    });

    it('retorna ranking de karma', async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const response = await request(app)
        .get(`/api/homes/${homeId}/reports/monthly?month=${month}&year=${year}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.karma.ranking).toBeInstanceOf(Array);
      expect(response.body.data.karma.ranking.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.karma.ranking[0]).toHaveProperty('userId');
      expect(response.body.data.karma.ranking[0]).toHaveProperty('name');
      expect(response.body.data.karma.ranking[0]).toHaveProperty('karma');
    });
  });
});
