import apiClient from '@/lib/axios';
import type { User, LoginInput, RegisterInput } from '@conviviapp/shared';

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const authService = {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    return response.data.data;
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      data
    );
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refresh(): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/refresh'
    );
    return response.data.data;
  },

  async me(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },
};
