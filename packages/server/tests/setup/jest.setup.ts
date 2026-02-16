import { cleanDatabase, disconnectDatabase } from './prisma-test-client';

// Configurar DATABASE_URL para que el Prisma client del server use la DB de test
const DATABASE_URL_TEST =
  process.env.DATABASE_URL_TEST ||
  'postgresql://test:test@localhost:5433/conviviapp_test';
process.env.DATABASE_URL = DATABASE_URL_TEST;

// Configurar secrets de JWT para tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

// Aumentar timeout para tests de integración
jest.setTimeout(15000);

// Limpiar la base de datos antes de cada test
beforeEach(async () => {
  await cleanDatabase();
});

// Cerrar conexiones después de todos los tests del archivo
afterAll(async () => {
  await disconnectDatabase();
});
