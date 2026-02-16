import request from 'supertest';
import { getTestApp } from '../helpers';
import { UserFactory, DEFAULT_PASSWORD } from '../factories';

const app = getTestApp();

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registra un usuario correctamente', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'nuevo@test.com',
          password: 'Password123!',
          name: 'Nuevo Usuario',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('nuevo@test.com');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('rechaza registro con email duplicado', async () => {
      await UserFactory.create({ email: 'existente@test.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existente@test.com',
          password: 'Password123!',
          name: 'Otro Usuario',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('rechaza registro con contraseña débil', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: '123',
          name: 'Test',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('rechaza registro sin email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'Password123!',
          name: 'Test',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('permite login con credenciales válidas', async () => {
      await UserFactory.create({ email: 'login@test.com' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: DEFAULT_PASSWORD,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.email).toBe('login@test.com');
    });

    it('rechaza login con contraseña incorrecta', async () => {
      await UserFactory.create({ email: 'wrong@test.com' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('rechaza login con usuario inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('retorna usuario autenticado', async () => {
      const user = await UserFactory.create();

      // Primero hacemos login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: DEFAULT_PASSWORD,
        });

      const token = loginResponse.body.data.accessToken;

      // Luego consultamos /me
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.email).toBe(user.email);
    });

    it('rechaza petición sin token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('rechaza petición con token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token-invalido');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
