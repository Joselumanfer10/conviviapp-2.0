import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '@/services/expense.service';
import type { CreateExpenseInput, UpdateExpenseInput, CreateSettlementInput } from '@conviviapp/shared';

export function useExpenses(homeId: string) {
  return useQuery({
    queryKey: ['expenses', homeId],
    queryFn: () => expenseService.findAll(homeId),
    enabled: !!homeId,
  });
}

export function useExpense(homeId: string, expenseId: string) {
  return useQuery({
    queryKey: ['expense', homeId, expenseId],
    queryFn: () => expenseService.findOne(homeId, expenseId),
    enabled: !!homeId && !!expenseId,
  });
}

export function useCreateExpense(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseInput) => expenseService.create(homeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', homeId] });
      queryClient.invalidateQueries({ queryKey: ['balances', homeId] });
    },
  });
}

export function useUpdateExpense(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, data }: { expenseId: string; data: UpdateExpenseInput }) =>
      expenseService.update(homeId, expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', homeId] });
      queryClient.invalidateQueries({ queryKey: ['balances', homeId] });
    },
  });
}

export function useDeleteExpense(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) => expenseService.delete(homeId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', homeId] });
      queryClient.invalidateQueries({ queryKey: ['balances', homeId] });
    },
  });
}

export function useBalances(homeId: string) {
  return useQuery({
    queryKey: ['balances', homeId],
    queryFn: () => expenseService.getBalances(homeId),
    enabled: !!homeId,
  });
}

export function useSuggestedTransfers(homeId: string) {
  return useQuery({
    queryKey: ['suggestedTransfers', homeId],
    queryFn: () => expenseService.getSuggestedTransfers(homeId),
    enabled: !!homeId,
  });
}

export function useCreateSettlement(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSettlementInput) => expenseService.createSettlement(homeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances', homeId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', homeId] });
      queryClient.invalidateQueries({ queryKey: ['suggestedTransfers', homeId] });
    },
  });
}

export function useSettlements(homeId: string) {
  return useQuery({
    queryKey: ['settlements', homeId],
    queryFn: () => expenseService.getSettlements(homeId),
    enabled: !!homeId,
  });
}

export function useConfirmSettlement(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settlementId: string) => expenseService.confirmSettlement(homeId, settlementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', homeId] });
      queryClient.invalidateQueries({ queryKey: ['balances', homeId] });
    },
  });
}

export function useRejectSettlement(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settlementId: string) => expenseService.rejectSettlement(homeId, settlementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', homeId] });
    },
  });
}
