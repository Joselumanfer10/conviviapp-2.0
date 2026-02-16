import request from 'supertest';
import { getTestApp } from '../helpers';
import { HomeFactory, DEFAULT_PASSWORD } from '../factories';
import { prisma } from '../setup/prisma-test-client';

const app = getTestApp();

describe('Task API', () => {
  let token: string;
  let homeId: string;
  let adminId: string;
  let memberId: string;
  let memberToken: string;

  beforeEach(async () => {
    // Crear hogar con 2 miembros
    const { home, admin, members } = await HomeFactory.createWithMembers(2);
    homeId = home.id;
    adminId = admin.id;
    memberId = members[1].id;

    // Login como admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, password: DEFAULT_PASSWORD });
    token = adminLogin.body.data.accessToken;

    // Login como miembro
    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: members[1].email, password: DEFAULT_PASSWORD });
    memberToken = memberLogin.body.data.accessToken;
  });

  // ============ CRUD de Tareas ============

  describe('POST /api/homes/:homeId/tasks', () => {
    it('crea una tarea correctamente', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Limpiar cocina',
          description: 'Fregar platos y limpiar encimera',
          frequency: 'WEEKLY',
          difficulty: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Limpiar cocina');
      expect(response.body.data.frequency).toBe('WEEKLY');
      expect(response.body.data.difficulty).toBe(2);
      expect(response.body.data.isActive).toBe(true);
    });

    it('crea tarea con valores por defecto', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Sacar basura' });

      expect(response.status).toBe(201);
      expect(response.body.data.frequency).toBe('WEEKLY');
      expect(response.body.data.difficulty).toBe(1);
    });

    it('rechaza tarea sin nombre', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '', frequency: 'WEEKLY' });

      expect(response.status).toBe(400);
    });

    it('rechaza sin autenticación', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/homes/:homeId/tasks', () => {
    it('lista las tareas del hogar', async () => {
      // Crear 3 tareas
      for (const name of ['Cocina', 'Baño', 'Salón']) {
        await request(app)
          .post(`/api/homes/${homeId}/tasks`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name });
      }

      const response = await request(app)
        .get(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('no incluye tareas desactivadas por defecto', async () => {
      // Crear y luego desactivar una tarea
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Tarea Activa' });

      const taskToDelete = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Tarea a Eliminar' });

      await request(app)
        .delete(`/api/homes/${homeId}/tasks/${taskToDelete.body.data.id}`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .get(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Tarea Activa');
    });
  });

  describe('PATCH /api/homes/:homeId/tasks/:taskId', () => {
    it('actualiza una tarea', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nombre Original' });

      const taskId = createRes.body.data.id;

      const response = await request(app)
        .patch(`/api/homes/${homeId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nombre Actualizado', difficulty: 3 });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Nombre Actualizado');
      expect(response.body.data.difficulty).toBe(3);
    });
  });

  describe('DELETE /api/homes/:homeId/tasks/:taskId', () => {
    it('desactiva una tarea (soft delete)', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Para Eliminar' });

      const taskId = createRes.body.data.id;

      const response = await request(app)
        .delete(`/api/homes/${homeId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('desactivada');
    });
  });

  // ============ Asignaciones ============

  describe('POST /api/homes/:homeId/tasks/:taskId/assignments', () => {
    it('crea una asignación correctamente', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Limpiar baño' });

      const taskId = createRes.body.data.id;
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .post(`/api/homes/${homeId}/tasks/${taskId}/assignments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedToId: memberId, dueDate });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assignedToId).toBe(memberId);
      expect(response.body.data.status).toBe('PENDING');
    });

    it('rechaza asignación a no-miembro del hogar', async () => {
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });

      const taskId = createRes.body.data.id;
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .post(`/api/homes/${homeId}/tasks/${taskId}/assignments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedToId: 'nonexistent-user', dueDate });

      expect(response.status).toBe(400);
    });
  });

  // ============ Completar con karma ============

  describe('POST /api/homes/:homeId/assignments/:assignmentId/complete', () => {
    let assignmentId: string;
    let taskDifficulty: number;

    beforeEach(async () => {
      taskDifficulty = 3;

      // Crear tarea con dificultad 3
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Tarea difícil', difficulty: taskDifficulty });

      const taskId = createRes.body.data.id;

      // Asignar al miembro con fecha futura (para bonus de puntualidad)
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const assignRes = await request(app)
        .post(`/api/homes/${homeId}/tasks/${taskId}/assignments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedToId: memberId, dueDate });

      assignmentId = assignRes.body.data.id;

      // Primero iniciar la tarea (PENDING -> IN_PROGRESS)
      await request(app)
        .post(`/api/homes/${homeId}/tasks/assignments/${assignmentId}/start`)
        .set('Authorization', `Bearer ${memberToken}`);
    });

    it('completa la asignación y otorga karma', async () => {
      const response = await request(app)
        .post(`/api/homes/${homeId}/tasks/assignments/${assignmentId}/complete`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ notes: 'Todo limpio' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.completedAt).toBeDefined();

      // Karma: dificultad(3) * 10 + 5 (bonus puntualidad) = 35
      expect(response.body.data.karmaChange).toBe(35);

      // Verificar karma en DB
      const member = await prisma.homeMember.findFirst({
        where: { userId: memberId, homeId },
      });
      expect(member!.karma).toBe(35);
    });

    it('otorga karma negativo al saltar tarea', async () => {
      // Volver a PENDING primero (IN_PROGRESS -> PENDING)
      await request(app)
        .post(`/api/homes/${homeId}/tasks/assignments/${assignmentId}/start`)
        .set('Authorization', `Bearer ${memberToken}`);

      // Esto fallaría porque IN_PROGRESS no puede ir a SKIPPED directamente
      // Necesitamos volver a PENDING primero
      // Según STATUS_TRANSITIONS: IN_PROGRESS -> [COMPLETED, PENDING]
      // y PENDING -> [IN_PROGRESS, SKIPPED]

      // Resetear: crear una nueva asignación en PENDING y saltarla
      const createRes = await request(app)
        .post(`/api/homes/${homeId}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Tarea para saltar', difficulty: 2 });

      const taskId = createRes.body.data.id;
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const assignRes = await request(app)
        .post(`/api/homes/${homeId}/tasks/${taskId}/assignments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedToId: memberId, dueDate });

      const newAssignmentId = assignRes.body.data.id;

      // Saltar directamente desde PENDING
      const response = await request(app)
        .post(`/api/homes/${homeId}/tasks/assignments/${newAssignmentId}/skip`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('SKIPPED');
      // Karma negativo: dificultad(2) * -5 = -10
      expect(response.body.data.karmaChange).toBe(-10);
    });

    it('rechaza transición inválida de estado', async () => {
      // Completar primero
      await request(app)
        .post(`/api/homes/${homeId}/tasks/assignments/${assignmentId}/complete`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({});

      // Intentar iniciar de nuevo (COMPLETED -> IN_PROGRESS no es válido)
      const response = await request(app)
        .post(`/api/homes/${homeId}/tasks/assignments/${assignmentId}/start`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(400);
    });
  });

  // ============ Karma ranking ============

  describe('GET /api/homes/:homeId/tasks/karma', () => {
    it('retorna ranking de karma del hogar', async () => {
      const response = await request(app)
        .get(`/api/homes/${homeId}/tasks/karma`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('rank');
      expect(response.body.data[0]).toHaveProperty('userId');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('karma');
    });
  });
});
