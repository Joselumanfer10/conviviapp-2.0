import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginInput, RegisterInput } from '@conviviapp/shared';

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate('/dashboard');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate('/dashboard');
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
    onError: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
}

export function useCurrentUser() {
  const { setAuth, logout } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const refreshResponse = await authService.refresh();
        setAuth(refreshResponse.user, refreshResponse.accessToken);
        return refreshResponse.user;
      } catch {
        logout();
        throw new Error('No autenticado');
      }
    },
    retry: false,
    staleTime: Infinity,
  });
}

export function useInitAuth() {
  return useQuery({
    queryKey: ['initAuth'],
    queryFn: async () => {
      try {
        const response = await authService.refresh();
        useAuthStore.getState().setAuth(response.user, response.accessToken);
        return response.user;
      } catch {
        // No hay sesión activa, simplemente marcar como no loading
        useAuthStore.getState().setLoading(false);
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
