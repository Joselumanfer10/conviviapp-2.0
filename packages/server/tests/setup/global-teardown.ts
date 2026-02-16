import { execSync } from 'child_process';

export default async function globalTeardown(): Promise<void> {
  console.log('\n🧹 Limpiando entorno de tests...\n');

  // Opcionalmente, detener el contenedor
  // Por defecto lo dejamos corriendo para acelerar siguientes ejecuciones
  if (process.env.STOP_TEST_DB === 'true') {
    try {
      console.log('📦 Deteniendo contenedor de PostgreSQL...');
      execSync('docker-compose -f ../../docker-compose.test.yml down', {
        cwd: __dirname,
        stdio: 'pipe',
      });
      console.log('✅ Contenedor detenido');
    } catch (error) {
      console.log('⚠️  Error al detener contenedor');
    }
  } else {
    console.log('ℹ️  Contenedor de test mantenido (usar STOP_TEST_DB=true para detener)');
  }

  console.log('\n✅ Limpieza completada\n');
}
