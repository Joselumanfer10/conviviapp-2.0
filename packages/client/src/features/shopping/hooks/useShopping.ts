import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shoppingService } from '@/services/shopping.service';
import type { CreateShoppingItemInput, UpdateShoppingItemInput } from '@conviviapp/shared';

export function useShoppingItems(homeId: string) {
  return useQuery({
    queryKey: ['shopping', homeId],
    queryFn: () => shoppingService.findAll(homeId),
    enabled: !!homeId,
  });
}

export function useCreateShoppingItem(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShoppingItemInput) => shoppingService.create(homeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', homeId] });
    },
  });
}

export function useUpdateShoppingItem(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateShoppingItemInput }) =>
      shoppingService.update(homeId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', homeId] });
    },
  });
}

export function useDeleteShoppingItem(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => shoppingService.delete(homeId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', homeId] });
    },
  });
}

export function useMarkAsBought(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: { price?: number; store?: string };
    }) => shoppingService.markAsBought(homeId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', homeId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', homeId] });
    },
  });
}
