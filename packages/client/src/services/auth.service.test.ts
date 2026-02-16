import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de axios antes de importar el servicio
vi.mock('@/lib/axios', () => {
  const mockClient = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { default: mockClient, apiClient: mockClient };
});

import { authService } from './auth.service';
import apiClient from '@/lib/axios';

const mockedClient = vi.mocked(apiClient);

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('envia datos de registro y retorna usuario con token', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', email: 'nuevo@test.com', name: 'Nuevo' },
            accessToken: 'token-123',
          },
        },
      };
      mockedClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.register({
        email: 'nuevo@test.com',
        password: 'password123',
        name: 'Nuevo',
      });

      expect(mockedClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'nuevo@test.com',
        password: 'password123',
        name: 'Nuevo',
      });
      expect(result.user.email).toBe('nuevo@test.com');
      expect(result.accessToken).toBe('token-123');
    });
  });

  describe('login', () => {
    it('envia credenciales y retorna usuario con token', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', email: 'test@test.com', name: 'Test' },
            accessToken: 'jwt-token',
          },
        },
      };
      mockedClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(mockedClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password123',
      });
      expect(result.accessToken).toBe('jwt-token');
    });
  });

  describe('logout', () => {
    it('envia peticion de logout', async () => {
      mockedClient.post.mockResolvedValueOnce({ data: { success: true } });

      await authService.logout();

      expect(mockedClient.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('refresh', () => {
    it('renueva el token de acceso', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: '1', email: 'test@test.com', name: 'Test' },
            accessToken: 'nuevo-token',
          },
        },
      };
      mockedClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.refresh();

      expect(mockedClient.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result.accessToken).toBe('nuevo-token');
    });
  });

  describe('me', () => {
    it('obtiene el usuario actual', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', email: 'test@test.com', name: 'Test' },
        },
      };
      mockedClient.get.mockResolvedValueOnce(mockResponse);

      const result = await authService.me();

      expect(mockedClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result.email).toBe('test@test.com');
    });
  });
});
