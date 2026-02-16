import request from 'supertest';
import { getTestApp } from '../helpers';
import { HomeFactory, DEFAULT_PASSWORD } from '../factories';

const app = getTestApp();

describe('Shopping API', () => {
  let token: string;
  let homeId: string;
  let userId: string;

  beforeEach(async () => {
    const { home, admin } = await HomeFactory.createWithMembers(2);
    homeId = home.id;
    userId = admin.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, password: DEFAULT_PASSWORD });

    token = loginResponse.body.data.accessToken;
  });

  // ============ POST /api/homes/:homeId/shopping - Añadir item ============

  describe('POST /api/homes/:homeId/shopping', () => {
    it('añade un item a la lista de compras', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Leche',
          quantity: 2,
          unit: 'litros',
          category: 'Lácteos',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Leche');
      expect(response.body.data.quantity).toBe(2);
      expect(response.body.data.unit).toBe('litros');
      expect(response.body.data.category).toBe('Lácteos');
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.addedBy).toBeDefined();
    });

    it('crea item con valores por defecto', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Pan' });

      expect(response.status).toBe(201);
      expect(response.body.data.quantity).toBe(1);
    });

    it('rechaza item sin nombre', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '', quantity: 1 });

      expect(response.status).toBe(400);
    });

    it('rechaza sin autenticación', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  // ============ GET /api/homes/:homeId/shopping - Listar items ============

  describe('GET /api/homes/:homeId/shopping', () => {
    it('lista los items de compras del hogar', async () => {
      for (const name of ['Leche', 'Pan', 'Huevos']) {
        await request(app)
          .post(`/api/homes/${homeId}/shopping`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name });
      }

      const response = await request(app)
        .get(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('filtra items por estado', async () => {
      // Crear item y marcarlo como comprado
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Comprado' });

      await request(app)
        .post(`/api/homes/${homeId}/shopping/${createRes.body.data.id}/buy`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 5 });

      // Crear otro pendiente
      await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Pendiente' });

      // Filtrar solo pendientes
      const response = await request(app)
        .get(`/api/homes/${homeId}/shopping?status=PENDING`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Pendiente');
    });
  });

  // ============ PATCH /api/homes/:homeId/shopping/:itemId - Actualizar ============

  describe('PATCH /api/homes/:homeId/shopping/:itemId', () => {
    it('actualiza un item pendiente', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Original', quantity: 1 });

      const itemId = createRes.body.data.id;

      const response = await request(app)
        .patch(`/api/homes/${homeId}/shopping/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Actualizado', quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Actualizado');
      expect(response.body.data.quantity).toBe(5);
    });

    it('rechaza actualización de item ya comprado', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });

      const itemId = createRes.body.data.id;

      // Marcar como comprado
      await request(app)
        .post(`/api/homes/${homeId}/shopping/${itemId}/buy`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 3 });

      // Intentar actualizar
      const response = await request(app)
        .patch(`/api/homes/${homeId}/shopping/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nuevo nombre' });

      expect(response.status).toBe(400);
    });
  });

  // ============ DELETE /api/homes/:homeId/shopping/:itemId - Eliminar ============

  describe('DELETE /api/homes/:homeId/shopping/:itemId', () => {
    it('elimina un item pendiente', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Para Borrar' });

      const itemId = createRes.body.data.id;

      const response = await request(app)
        .delete(`/api/homes/${homeId}/shopping/${itemId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('eliminado');
    });

    it('rechaza eliminar item ya comprado', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Comprado' });

      const itemId = createRes.body.data.id;

      await request(app)
        .post(`/api/homes/${homeId}/shopping/${itemId}/buy`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 10 });

      const response = await request(app)
        .delete(`/api/homes/${homeId}/shopping/${itemId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  // ============ POST /api/homes/:homeId/shopping/:itemId/buy - Marcar comprado ============

  describe('POST /api/homes/:homeId/shopping/:itemId/buy', () => {
    it('marca item como comprado', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Jabón' });

      const itemId = createRes.body.data.id;

      const response = await request(app)
        .post(`/api/homes/${homeId}/shopping/${itemId}/buy`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 3.50, store: 'Mercadona' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('BOUGHT');
      expect(response.body.data.price).toBe(3.50);
      expect(response.body.data.store).toBe('Mercadona');
      expect(response.body.data.boughtBy).toBeDefined();
      expect(response.body.data.boughtAt).toBeDefined();
    });

    it('crea gasto automáticamente al comprar con precio', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Detergente' });

      const itemId = createRes.body.data.id;

      const response = await request(app)
        .post(`/api/homes/${homeId}/shopping/${itemId}/buy`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 8.99, store: 'Lidl' });

      expect(response.status).toBe(200);
      // Debe incluir el gasto creado
      expect(response.body.data.expense).toBeDefined();
      expect(response.body.data.expense.amount).toBe(8.99);
      expect(response.body.data.expense.description).toContain('Detergente');

      // Verificar que el gasto existe en la lista de gastos
      const expensesRes = await request(app)
        .get(`/api/homes/${homeId}/expenses`)
        .set('Authorization', `Bearer ${token}`);

      expect(expensesRes.body.data.length).toBeGreaterThanOrEqual(1);
      const autoExpense = expensesRes.body.data.find(
        (e: any) => e.description.includes('Detergente')
      );
      expect(autoExpense).toBeDefined();
      expect(autoExpense.amount).toBe(8.99);
    });

    it('no crea gasto si no hay precio', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Sin Precio' });

      const itemId = createRes.body.data.id;

      const response = await request(app)
        .post(`/api/homes/${homeId}/shopping/${itemId}/buy`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('BOUGHT');
      expect(response.body.data.expense).toBeNull();
    });

    it('rechaza comprar item ya comprado', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Ya Comprado' });

      const itemId = createRes.body.data.id;

      // Primera compra
      await request(app)
        .post(`/api/homes/${homeId}/shopping/${itemId}/buy`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 5 });

      // Segunda compra
      const response = await request(app)
        .post(`/api/homes/${homeId}/shopping/${itemId}/buy`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 5 });

      expect(response.status).toBe(400);
    });
  });

  // ============ Cancelar y restaurar ============

  describe('POST /api/homes/:homeId/shopping/:itemId/cancel', () => {
    it('cancela un item pendiente', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Para Cancelar' });

      const itemId = createRes.body.data.id;

      const response = await request(app)
        .post(`/api/homes/${homeId}/shopping/${itemId}/cancel`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CANCELLED');
    });
  });

  describe('POST /api/homes/:homeId/shopping/:itemId/restore', () => {
    it('restaura un item cancelado', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/shopping`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Para Restaurar' });

      const itemId = createRes.body.data.id;

      // Cancelar
      await request(app)
        .post(`/api/homes/${homeId}/shopping/${itemId}/cancel`)
        .set('Authorization', `Bearer ${token}`);

      // Restaurar
      const response = await request(app)
        .post(`/api/homes/${homeId}/shopping/${itemId}/restore`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('PENDING');
    });
  });
});
