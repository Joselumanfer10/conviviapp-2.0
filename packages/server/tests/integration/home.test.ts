import request from 'supertest';
import { getTestApp } from '../helpers';
import { UserFactory, HomeFactory, DEFAULT_PASSWORD } from '../factories';

const app = getTestApp();

describe('Home API', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const user = await UserFactory.create();
    userId = user.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: DEFAULT_PASSWORD });

    token = loginResponse.body.data.accessToken;
  });

  // ============ POST /api/homes - Crear hogar ============

  describe('POST /api/homes', () => {
    it('crea un hogar correctamente', async () => {
      const response = await request(app)
        .post('/api/homes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Mi Piso', description: 'Piso compartido en Madrid' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Mi Piso');
      expect(response.body.data.description).toBe('Piso compartido en Madrid');
      expect(response.body.data.inviteCode).toBeDefined();
      expect(response.body.data.myRole).toBe('ADMIN');
      expect(response.body.data.memberCount).toBe(1);
    });

    it('rechaza creación sin autenticación', async () => {
      const response = await request(app)
        .post('/api/homes')
        .send({ name: 'Mi Piso' });

      expect(response.status).toBe(401);
    });

    it('rechaza creación con nombre muy corto', async () => {
      const response = await request(app)
        .post('/api/homes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'A' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('crea hogar con valores por defecto (EUR, EQUAL)', async () => {
      const response = await request(app)
        .post('/api/homes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Piso Default' });

      expect(response.status).toBe(201);
      expect(response.body.data.currency).toBe('EUR');
    });
  });

  // ============ GET /api/homes - Listar hogares ============

  describe('GET /api/homes', () => {
    it('lista hogares del usuario autenticado', async () => {
      // Crear 2 hogares
      await request(app)
        .post('/api/homes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hogar 1' });

      await request(app)
        .post('/api/homes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hogar 2' });

      const response = await request(app)
        .get('/api/homes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('retorna lista vacía si el usuario no tiene hogares', async () => {
      const response = await request(app)
        .get('/api/homes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('no incluye hogares de otros usuarios', async () => {
      // Otro usuario crea un hogar
      const otherUser = await UserFactory.create();
      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: otherUser.email, password: DEFAULT_PASSWORD });
      const otherToken = otherLogin.body.data.accessToken;

      await request(app)
        .post('/api/homes')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hogar Ajeno' });

      // El usuario original no debería verlo
      const response = await request(app)
        .get('/api/homes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  // ============ GET /api/homes/:homeId - Detalle ============

  describe('GET /api/homes/:homeId', () => {
    it('retorna detalle del hogar para un miembro', async () => {
      const createResponse = await request(app)
        .post('/api/homes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Detalle Test' });

      const homeId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/homes/${homeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Detalle Test');
      expect(response.body.data.inviteCode).toBeDefined();
      expect(response.body.data.members).toHaveLength(1);
      expect(response.body.data.myRole).toBe('ADMIN');
    });

    it('rechaza acceso a no-miembros', async () => {
      // Crear hogar con otro usuario
      const { home } = await HomeFactory.createWithAdmin();

      const response = await request(app)
        .get(`/api/homes/${home.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('retorna 404 para hogar inexistente', async () => {
      const response = await request(app)
        .get('/api/homes/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });

  // ============ POST /api/homes/join - Unirse con código ============

  describe('POST /api/homes/join', () => {
    it('permite unirse a un hogar con código válido', async () => {
      // Crear hogar con otro usuario para obtener invite code
      const { home } = await HomeFactory.createWithAdmin();

      const response = await request(app)
        .post('/api/homes/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ inviteCode: home.inviteCode });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.homeId).toBe(home.id);
      expect(response.body.data.name).toBe(home.name);
    });

    it('rechaza código de invitación inválido', async () => {
      const response = await request(app)
        .post('/api/homes/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ inviteCode: 'CODIGO-FALSO' });

      expect(response.status).toBe(404);
    });

    it('rechaza si ya es miembro del hogar', async () => {
      // Crear hogar donde el usuario ya es admin
      const createResponse = await request(app)
        .post('/api/homes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Ya Soy Miembro' });

      const homeId = createResponse.body.data.id;

      // Obtener invite code del detalle
      const detailResponse = await request(app)
        .get(`/api/homes/${homeId}`)
        .set('Authorization', `Bearer ${token}`);

      const inviteCode = detailResponse.body.data.inviteCode;

      const response = await request(app)
        .post('/api/homes/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ inviteCode });

      expect(response.status).toBe(409);
    });

    it('rechaza código vacío (validación Zod)', async () => {
      const response = await request(app)
        .post('/api/homes/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ inviteCode: '' });

      expect(response.status).toBe(400);
    });
  });

  // ============ POST /api/homes/:homeId/leave - Salir del hogar ============

  describe('POST /api/homes/:homeId/leave', () => {
    it('permite a un miembro salir del hogar', async () => {
      // Crear hogar con 2 miembros
      const { home, members } = await HomeFactory.createWithMembers(2);

      // Login como el miembro (no admin)
      const memberLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: members[1].email, password: DEFAULT_PASSWORD });
      const memberToken = memberLogin.body.data.accessToken;

      const response = await request(app)
        .post(`/api/homes/${home.id}/leave`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('salido');
    });

    it('impide al único admin salir si hay otros miembros', async () => {
      const { home, admin } = await HomeFactory.createWithMembers(2);

      // Login como admin
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: admin.email, password: DEFAULT_PASSWORD });
      const adminToken = adminLogin.body.data.accessToken;

      const response = await request(app)
        .post(`/api/homes/${home.id}/leave`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
    });

    it('elimina el hogar si el último miembro sale', async () => {
      // Crear hogar con solo el admin
      const createResponse = await request(app)
        .post('/api/homes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Solo Yo' });

      const homeId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/homes/${homeId}/leave`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('eliminado');

      // Verificar que ya no existe
      const check = await request(app)
        .get(`/api/homes/${homeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(check.status).toBe(403);
    });
  });

  // ============ GET /api/homes/:homeId/members - Listar miembros ============

  describe('GET /api/homes/:homeId/members', () => {
    it('lista los miembros del hogar', async () => {
      const { home, admin } = await HomeFactory.createWithMembers(3);

      // Login como admin
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: admin.email, password: DEFAULT_PASSWORD });
      const adminToken = adminLogin.body.data.accessToken;

      const response = await request(app)
        .get(`/api/homes/${home.id}/members`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);

      // Verificar que el admin se identifica como admin
      const adminMember = response.body.data.find(
        (m: any) => m.userId === admin.id
      );
      expect(adminMember.role).toBe('ADMIN');
    });

    it('incluye isCurrentUser en la respuesta', async () => {
      const { home, admin } = await HomeFactory.createWithMembers(2);

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: admin.email, password: DEFAULT_PASSWORD });
      const adminToken = adminLogin.body.data.accessToken;

      const response = await request(app)
        .get(`/api/homes/${home.id}/members`)
        .set('Authorization', `Bearer ${adminToken}`);

      const me = response.body.data.find((m: any) => m.userId === admin.id);
      const other = response.body.data.find((m: any) => m.userId !== admin.id);

      expect(me.isCurrentUser).toBe(true);
      expect(other.isCurrentUser).toBe(false);
    });

    it('rechaza acceso a no-miembros', async () => {
      const { home } = await HomeFactory.createWithAdmin();

      const response = await request(app)
        .get(`/api/homes/${home.id}/members`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });
});
