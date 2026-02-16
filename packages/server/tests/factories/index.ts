export { UserFactory, DEFAULT_PASSWORD } from './user.factory';
export { HomeFactory } from './home.factory';

// Resetear todos los contadores de factories
export function resetFactories(): void {
  const { UserFactory } = require('./user.factory');
  const { HomeFactory } = require('./home.factory');

  UserFactory.reset();
  HomeFactory.reset();
}
