import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '@/services/calendar.service';
import type { CreateCalendarEventInput, UpdateCalendarEventInput } from '@conviviapp/shared';

export function useCalendarEvents(homeId: string, month?: number, year?: number) {
  return useQuery({
    queryKey: ['calendar', homeId, month, year],
    queryFn: () => calendarService.findAll(homeId, month, year),
    enabled: !!homeId,
  });
}

export function useAggregatedCalendar(homeId: string, month: number, year: number) {
  return useQuery({
    queryKey: ['calendar-aggregated', homeId, month, year],
    queryFn: () => calendarService.getAggregated(homeId, month, year),
    enabled: !!homeId && !!month && !!year,
  });
}

export function useCalendarEvent(homeId: string, eventId: string) {
  return useQuery({
    queryKey: ['calendar-event', homeId, eventId],
    queryFn: () => calendarService.findById(homeId, eventId),
    enabled: !!homeId && !!eventId,
  });
}

export function useCreateCalendarEvent(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCalendarEventInput) =>
      calendarService.create(homeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', homeId] });
      queryClient.invalidateQueries({ queryKey: ['calendar-aggregated', homeId] });
    },
  });
}

export function useUpdateCalendarEvent(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateCalendarEventInput }) =>
      calendarService.update(homeId, eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', homeId] });
      queryClient.invalidateQueries({ queryKey: ['calendar-aggregated', homeId] });
    },
  });
}

export function useDeleteCalendarEvent(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => calendarService.delete(homeId, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', homeId] });
      queryClient.invalidateQueries({ queryKey: ['calendar-aggregated', homeId] });
    },
  });
}
