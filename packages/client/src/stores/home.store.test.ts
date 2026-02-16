import { describe, it, expect, beforeEach } from 'vitest';
import { useHomeStore } from './home.store';

const mockHome = (overrides = {}) => ({
  id: 'home-1',
  name: 'Piso Centro',
  description: 'Piso compartido en el centro',
  address: 'Calle Mayor 1',
  inviteCode: 'abc123',
  currency: 'EUR',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  defaultSplitMode: 'EQUAL' as const,
  taskRotationEnabled: true,
  ...overrides,
});

describe('useHomeStore', () => {
  beforeEach(() => {
    useHomeStore.setState({
      currentHome: null,
      homes: [],
    });
  });

  it('tiene estado inicial vacio', () => {
    const state = useHomeStore.getState();
    expect(state.currentHome).toBeNull();
    expect(state.homes).toEqual([]);
  });

  it('setHomes establece la lista de hogares', () => {
    const homes = [mockHome(), mockHome({ id: 'home-2', name: 'Piso Playa' })];

    useHomeStore.getState().setHomes(homes as any);

    expect(useHomeStore.getState().homes).toHaveLength(2);
    expect(useHomeStore.getState().homes[0].name).toBe('Piso Centro');
  });

  it('setCurrentHome establece el hogar actual', () => {
    const home = mockHome();

    useHomeStore.getState().setCurrentHome(home as any);

    expect(useHomeStore.getState().currentHome?.id).toBe('home-1');
  });

  it('addHome anade un hogar a la lista', () => {
    useHomeStore.getState().setHomes([mockHome()] as any);
    useHomeStore.getState().addHome(mockHome({ id: 'home-2', name: 'Nuevo' }) as any);

    expect(useHomeStore.getState().homes).toHaveLength(2);
    expect(useHomeStore.getState().homes[1].name).toBe('Nuevo');
  });

  it('updateHome actualiza un hogar existente en la lista', () => {
    useHomeStore.getState().setHomes([mockHome()] as any);

    useHomeStore.getState().updateHome('home-1', { name: 'Actualizado' });

    expect(useHomeStore.getState().homes[0].name).toBe('Actualizado');
  });

  it('updateHome actualiza currentHome si coincide el id', () => {
    const home = mockHome();
    useHomeStore.getState().setCurrentHome(home as any);
    useHomeStore.getState().setHomes([home] as any);

    useHomeStore.getState().updateHome('home-1', { name: 'Nuevo nombre' });

    expect(useHomeStore.getState().currentHome?.name).toBe('Nuevo nombre');
  });

  it('updateHome no modifica currentHome si no coincide el id', () => {
    useHomeStore.getState().setCurrentHome(mockHome() as any);
    useHomeStore.getState().setHomes([mockHome(), mockHome({ id: 'home-2' })] as any);

    useHomeStore.getState().updateHome('home-2', { name: 'Otro' });

    expect(useHomeStore.getState().currentHome?.name).toBe('Piso Centro');
  });

  it('removeHome elimina un hogar de la lista', () => {
    useHomeStore.getState().setHomes([
      mockHome(),
      mockHome({ id: 'home-2' }),
    ] as any);

    useHomeStore.getState().removeHome('home-1');

    expect(useHomeStore.getState().homes).toHaveLength(1);
    expect(useHomeStore.getState().homes[0].id).toBe('home-2');
  });

  it('removeHome limpia currentHome si coincide el id eliminado', () => {
    useHomeStore.getState().setCurrentHome(mockHome() as any);
    useHomeStore.getState().setHomes([mockHome()] as any);

    useHomeStore.getState().removeHome('home-1');

    expect(useHomeStore.getState().currentHome).toBeNull();
  });
});
