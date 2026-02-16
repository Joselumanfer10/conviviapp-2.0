import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { houseRuleApi } from '@/services/house-rule.service';
import type { CreateHouseRuleInput, UpdateHouseRuleInput } from '@conviviapp/shared';
import { toast } from 'sonner';

export function useHouseRules(homeId: string) {
  return useQuery({
    queryKey: ['rules', homeId],
    queryFn: () => houseRuleApi.getAll(homeId),
    enabled: !!homeId,
  });
}

export function useCreateHouseRule(homeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHouseRuleInput) => houseRuleApi.create(homeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', homeId] });
      toast.success('Regla creada');
    },
    onError: () => toast.error('Error al crear la regla'),
  });
}

export function useUpdateHouseRule(homeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: UpdateHouseRuleInput }) =>
      houseRuleApi.update(homeId, ruleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', homeId] });
      toast.success('Regla actualizada');
    },
    onError: () => toast.error('Error al actualizar la regla'),
  });
}

export function useDeleteHouseRule(homeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => houseRuleApi.delete(homeId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', homeId] });
      toast.success('Regla eliminada');
    },
    onError: () => toast.error('Error al eliminar la regla'),
  });
}

export function useAcceptHouseRule(homeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => houseRuleApi.accept(homeId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', homeId] });
      toast.success('Regla aceptada');
    },
    onError: () => toast.error('Error al aceptar la regla'),
  });
}

export function useAcceptanceStatus(homeId: string, ruleId: string | null) {
  return useQuery({
    queryKey: ['rules', homeId, ruleId, 'acceptance'],
    queryFn: () => houseRuleApi.getAcceptanceStatus(homeId, ruleId!),
    enabled: !!homeId && !!ruleId,
  });
}
