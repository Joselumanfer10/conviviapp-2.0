import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import type { CreateTaskInput, UpdateTaskInput, AssignTaskInput } from '@conviviapp/shared';

export function useTasks(homeId: string) {
  return useQuery({
    queryKey: ['tasks', homeId],
    queryFn: () => taskService.findAll(homeId),
    enabled: !!homeId,
  });
}

export function useTask(homeId: string, taskId: string) {
  return useQuery({
    queryKey: ['task', homeId, taskId],
    queryFn: () => taskService.findOne(homeId, taskId),
    enabled: !!homeId && !!taskId,
  });
}

export function useCreateTask(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => taskService.create(homeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', homeId] });
    },
  });
}

export function useUpdateTask(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
      taskService.update(homeId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', homeId] });
    },
  });
}

export function useDeleteTask(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.delete(homeId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', homeId] });
    },
  });
}

export function useCreateAssignment(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: AssignTaskInput }) =>
      taskService.createAssignment(homeId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', homeId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', homeId] });
    },
  });
}

export function useAssignments(homeId: string) {
  return useQuery({
    queryKey: ['assignments', homeId],
    queryFn: () => taskService.getAssignments(homeId),
    enabled: !!homeId,
  });
}

export function useStartAssignment(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) =>
      taskService.startAssignment(homeId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', homeId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', homeId] });
      queryClient.invalidateQueries({ queryKey: ['karma', homeId] });
    },
  });
}

export function useCompleteAssignment(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, notes }: { assignmentId: string; notes?: string }) =>
      taskService.completeAssignment(homeId, assignmentId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', homeId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', homeId] });
      queryClient.invalidateQueries({ queryKey: ['karma', homeId] });
    },
  });
}

export function useSkipAssignment(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, notes }: { assignmentId: string; notes?: string }) =>
      taskService.skipAssignment(homeId, assignmentId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', homeId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', homeId] });
      queryClient.invalidateQueries({ queryKey: ['karma', homeId] });
    },
  });
}

export function useMyAssignments() {
  return useQuery({
    queryKey: ['myAssignments'],
    queryFn: () => taskService.getMyAssignments(),
  });
}

export function useKarmaRanking(homeId: string) {
  return useQuery({
    queryKey: ['karma', homeId],
    queryFn: () => taskService.getKarmaRanking(homeId),
    enabled: !!homeId,
  });
}
