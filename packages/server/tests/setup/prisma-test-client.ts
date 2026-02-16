import { PrismaClient } from '@prisma/client';

const DATABASE_URL_TEST =
  process.env.DATABASE_URL_TEST ||
  'postgresql://test:test@localhost:5433/conviviapp_test';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL_TEST,
    },
  },
  log: process.env.DEBUG_PRISMA ? ['query', 'error', 'warn'] : ['error'],
});

// Función para limpiar todas las tablas
export async function cleanDatabase(): Promise<void> {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables.length > 0) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  }
}

// Función para desconectar
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
