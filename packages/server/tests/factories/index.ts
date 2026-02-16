export { UserFactory, DEFAULT_PASSWORD } from './user.factory';
export { HomeFactory } from './home.factory';

// Importar directamente para evitar require() dinamico
import { UserFactory as UF } from './user.factory';
import { HomeFactory as HF } from './home.factory';

// Resetear todos los contadores de factories
export function resetFactories(): void {
  UF.reset();
  HF.reset();
}
