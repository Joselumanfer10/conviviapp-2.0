import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '@/services/announcement.service';
import type { CreateAnnouncementInput, CastVoteInput } from '@conviviapp/shared';

export function useAnnouncements(homeId: string, type?: string) {
  return useQuery({
    queryKey: ['announcements', homeId, type],
    queryFn: () => announcementService.findAll(homeId, type),
    enabled: !!homeId,
  });
}

export function useAnnouncement(homeId: string, id: string) {
  return useQuery({
    queryKey: ['announcement', homeId, id],
    queryFn: () => announcementService.findById(homeId, id),
    enabled: !!homeId && !!id,
  });
}

export function useCreateAnnouncement(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) =>
      announcementService.create(homeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', homeId] });
    },
  });
}

export function useUpdateAnnouncement(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAnnouncementInput> }) =>
      announcementService.update(homeId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', homeId] });
    },
  });
}

export function useDeleteAnnouncement(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementService.delete(homeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', homeId] });
    },
  });
}

export function useTogglePin(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementService.togglePin(homeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', homeId] });
    },
  });
}

export function useCastVote(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CastVoteInput }) =>
      announcementService.castVote(homeId, id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcement', homeId, variables.id] });
      queryClient.invalidateQueries({ queryKey: ['announcements', homeId] });
    },
  });
}

export function useRemoveVote(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementService.removeVote(homeId, id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: ['announcement', homeId, id] });
      queryClient.invalidateQueries({ queryKey: ['announcements', homeId] });
    },
  });
}
