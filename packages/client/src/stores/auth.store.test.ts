import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('tiene estado inicial correcto', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('setAuth establece usuario, token y marca como autenticado', () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
    const mockToken = 'jwt-token-123';

    useAuthStore.getState().setAuth(mockUser as any, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('logout limpia todo el estado de autenticacion', () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
    useAuthStore.getState().setAuth(mockUser as any, 'token');

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('setUser actualiza usuario y isAuthenticated', () => {
    const mockUser = { id: '2', email: 'otro@test.com', name: 'Otro' };

    useAuthStore.getState().setUser(mockUser as any);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('setUser con null marca como no autenticado', () => {
    useAuthStore.getState().setUser({ id: '1' } as any);
    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('setAccessToken actualiza solo el token', () => {
    useAuthStore.getState().setAccessToken('nuevo-token');

    expect(useAuthStore.getState().accessToken).toBe('nuevo-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('setLoading actualiza el estado de carga', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);

    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
  });
});
