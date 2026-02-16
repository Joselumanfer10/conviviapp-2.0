import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { homeService } from '@/services/home.service';
import { useHomeStore } from '@/stores/home.store';
import type { CreateHomeInput, JoinHomeInput, UpdateHomeInput } from '@conviviapp/shared';

export function useHomes() {
  const { setHomes } = useHomeStore();

  return useQuery({
    queryKey: ['homes'],
    queryFn: async () => {
      const homes = await homeService.findAll();
      setHomes(homes);
      return homes;
    },
  });
}

export function useHome(homeId: string) {
  const { setCurrentHome } = useHomeStore();

  return useQuery({
    queryKey: ['home', homeId],
    queryFn: async () => {
      const home = await homeService.findOne(homeId);
      setCurrentHome(home);
      return home;
    },
    enabled: !!homeId,
  });
}

export function useCreateHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addHome } = useHomeStore();

  return useMutation({
    mutationFn: (data: CreateHomeInput) => homeService.create(data),
    onSuccess: (home) => {
      addHome(home);
      queryClient.invalidateQueries({ queryKey: ['homes'] });
      navigate(`/homes/${home.id}`);
    },
  });
}

export function useJoinHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinHomeInput) => homeService.join(data),
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ['homes'] });
      navigate(`/homes/${member.homeId}`);
    },
  });
}

export function useLeaveHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { removeHome } = useHomeStore();

  return useMutation({
    mutationFn: (homeId: string) => homeService.leave(homeId),
    onSuccess: (_, homeId) => {
      removeHome(homeId);
      queryClient.invalidateQueries({ queryKey: ['homes'] });
      navigate('/dashboard');
    },
  });
}

export function useHomeMembers(homeId: string) {
  return useQuery({
    queryKey: ['home', homeId, 'members'],
    queryFn: () => homeService.getMembers(homeId),
    enabled: !!homeId,
  });
}

export function useUpdateHome(homeId: string) {
  const queryClient = useQueryClient();
  const { updateHome } = useHomeStore();

  return useMutation({
    mutationFn: (data: UpdateHomeInput) => homeService.update(homeId, data),
    onSuccess: (updatedHome) => {
      updateHome(homeId, updatedHome);
      queryClient.invalidateQueries({ queryKey: ['home', homeId] });
      queryClient.invalidateQueries({ queryKey: ['homes'] });
    },
  });
}

export function useDeleteHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { removeHome } = useHomeStore();

  return useMutation({
    mutationFn: (homeId: string) => homeService.delete(homeId),
    onSuccess: (_, homeId) => {
      removeHome(homeId);
      queryClient.invalidateQueries({ queryKey: ['homes'] });
      navigate('/dashboard');
    },
  });
}

export function useRegenerateInviteCode(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => homeService.regenerateInviteCode(homeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', homeId] });
    },
  });
}

export function useUpdateMemberRole(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      homeService.updateMemberRole(homeId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', homeId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['home', homeId] });
    },
  });
}

export function useRemoveMember(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => homeService.removeMember(homeId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', homeId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['home', homeId] });
    },
  });
}
