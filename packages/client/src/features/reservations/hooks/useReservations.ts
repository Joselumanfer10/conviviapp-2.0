import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reservationApiService } from '@/services/reservation.service';
import type { CreateSharedSpaceInput, UpdateSharedSpaceInput } from '@conviviapp/shared';

// ==================== SPACES ====================

export function useSharedSpaces(homeId: string) {
  return useQuery({
    queryKey: ['spaces', homeId],
    queryFn: () => reservationApiService.findAllSpaces(homeId),
    enabled: !!homeId,
  });
}

export function useSharedSpace(homeId: string, spaceId: string) {
  return useQuery({
    queryKey: ['spaces', homeId, spaceId],
    queryFn: () => reservationApiService.findSpaceById(homeId, spaceId),
    enabled: !!homeId && !!spaceId,
  });
}

export function useCreateSpace(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSharedSpaceInput) =>
      reservationApiService.createSpace(homeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', homeId] });
    },
  });
}

export function useUpdateSpace(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spaceId, data }: { spaceId: string; data: UpdateSharedSpaceInput }) =>
      reservationApiService.updateSpace(homeId, spaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', homeId] });
    },
  });
}

export function useDeleteSpace(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (spaceId: string) =>
      reservationApiService.deleteSpace(homeId, spaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', homeId] });
    },
  });
}

// ==================== RESERVATIONS ====================

export function useReservationsBySpace(homeId: string, spaceId: string, date?: string) {
  return useQuery({
    queryKey: ['reservations', homeId, spaceId, date],
    queryFn: () => reservationApiService.findBySpace(homeId, spaceId, date),
    enabled: !!homeId && !!spaceId,
  });
}

export function useReservationsByHome(homeId: string, date?: string) {
  return useQuery({
    queryKey: ['reservations', homeId, date],
    queryFn: () => reservationApiService.findByHome(homeId, date),
    enabled: !!homeId,
  });
}

export function useCreateReservation(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      spaceId,
      data,
    }: {
      spaceId: string;
      data: { startTime: Date; endTime: Date; note?: string };
    }) => reservationApiService.createReservation(homeId, spaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', homeId] });
      queryClient.invalidateQueries({ queryKey: ['spaces', homeId] });
    },
  });
}

export function useDeleteReservation(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) =>
      reservationApiService.deleteReservation(homeId, reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', homeId] });
      queryClient.invalidateQueries({ queryKey: ['spaces', homeId] });
    },
  });
}
