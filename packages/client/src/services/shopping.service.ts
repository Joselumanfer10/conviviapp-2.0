import apiClient from '@/lib/axios';
import type { ShoppingItem, CreateShoppingItemInput, UpdateShoppingItemInput } from '@conviviapp/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const shoppingService = {
  async create(homeId: string, data: CreateShoppingItemInput): Promise<ShoppingItem> {
    const response = await apiClient.post<ApiResponse<ShoppingItem>>(
      `/homes/${homeId}/shopping`,
      data
    );
    return response.data.data;
  },

  async findAll(homeId: string): Promise<ShoppingItem[]> {
    const response = await apiClient.get<ApiResponse<ShoppingItem[]>>(
      `/homes/${homeId}/shopping`
    );
    return response.data.data;
  },

  async update(
    homeId: string,
    itemId: string,
    data: UpdateShoppingItemInput
  ): Promise<ShoppingItem> {
    const response = await apiClient.patch<ApiResponse<ShoppingItem>>(
      `/homes/${homeId}/shopping/${itemId}`,
      data
    );
    return response.data.data;
  },

  async delete(homeId: string, itemId: string): Promise<void> {
    await apiClient.delete(`/homes/${homeId}/shopping/${itemId}`);
  },

  async markAsBought(
    homeId: string,
    itemId: string,
    data: { price?: number; store?: string }
  ): Promise<ShoppingItem> {
    const response = await apiClient.post<ApiResponse<ShoppingItem>>(
      `/homes/${homeId}/shopping/${itemId}/buy`,
      data
    );
    return response.data.data;
  },
};
