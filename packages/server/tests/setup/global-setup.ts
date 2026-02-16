import { execSync } from 'child_process';
import { Client } from 'pg';

const DATABASE_URL_TEST =
  process.env.DATABASE_URL_TEST ||
  'postgresql://test:test@localhost:5433/conviviapp_test';

export default async function globalSetup(): Promise<void> {
  console.log('\n🚀 Iniciando entorno de tests...\n');

  // 1. Iniciar contenedor de PostgreSQL
  try {
    console.log('📦 Iniciando contenedor de PostgreSQL...');
    execSync('docker-compose -f ../../docker-compose.test.yml up -d --wait', {
      cwd: __dirname,
      stdio: 'pipe',
    });
  } catch (error) {
    console.log('⚠️  Contenedor ya existente o error al iniciar');
  }

  // 2. Esperar a que PostgreSQL esté listo
  console.log('⏳ Esperando a PostgreSQL...');
  const client = new Client({ connectionString: DATABASE_URL_TEST });

  let retries = 30;
  while (retries > 0) {
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log('✅ PostgreSQL listo');
      break;
    } catch {
      retries--;
      if (retries === 0) {
        throw new Error('❌ PostgreSQL no disponible después de 30 intentos');
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // 3. Sincronizar schema de Prisma con la base de datos de test
  console.log('🔄 Sincronizando schema...');
  execSync('npx prisma db push --accept-data-loss', {
    cwd: __dirname + '/../..',
    env: {
      ...process.env,
      DATABASE_URL: DATABASE_URL_TEST,
    },
    stdio: 'pipe',
  });
  console.log('✅ Schema sincronizado');

  console.log('\n✅ Entorno de tests listo\n');
}
