import apiClient from '@/lib/axios';
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  UserBalance,
  Transfer,
  Settlement,
  CreateSettlementInput,
} from '@conviviapp/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const expenseService = {
  async create(homeId: string, data: CreateExpenseInput): Promise<Expense> {
    const response = await apiClient.post<ApiResponse<Expense>>(
      `/homes/${homeId}/expenses`,
      data
    );
    return response.data.data;
  },

  async findAll(homeId: string): Promise<Expense[]> {
    const response = await apiClient.get<ApiResponse<Expense[]>>(
      `/homes/${homeId}/expenses`
    );
    return response.data.data;
  },

  async findOne(homeId: string, expenseId: string): Promise<Expense> {
    const response = await apiClient.get<ApiResponse<Expense>>(
      `/homes/${homeId}/expenses/${expenseId}`
    );
    return response.data.data;
  },

  async update(
    homeId: string,
    expenseId: string,
    data: UpdateExpenseInput
  ): Promise<Expense> {
    const response = await apiClient.patch<ApiResponse<Expense>>(
      `/homes/${homeId}/expenses/${expenseId}`,
      data
    );
    return response.data.data;
  },

  async delete(homeId: string, expenseId: string): Promise<void> {
    await apiClient.delete(`/homes/${homeId}/expenses/${expenseId}`);
  },

  async getBalances(homeId: string): Promise<UserBalance[]> {
    const response = await apiClient.get<ApiResponse<UserBalance[]>>(
      `/homes/${homeId}/expenses/balances`
    );
    return response.data.data;
  },

  async getSuggestedTransfers(homeId: string): Promise<Transfer[]> {
    const response = await apiClient.get<ApiResponse<Transfer[]>>(
      `/homes/${homeId}/expenses/settlements/suggested`
    );
    return response.data.data;
  },

  async createSettlement(
    homeId: string,
    data: CreateSettlementInput
  ): Promise<Settlement> {
    const response = await apiClient.post<ApiResponse<Settlement>>(
      `/homes/${homeId}/expenses/settlements`,
      data
    );
    return response.data.data;
  },

  async getSettlements(homeId: string): Promise<Settlement[]> {
    const response = await apiClient.get<ApiResponse<Settlement[]>>(
      `/homes/${homeId}/expenses/settlements`
    );
    return response.data.data;
  },

  async confirmSettlement(homeId: string, settlementId: string): Promise<Settlement> {
    const response = await apiClient.post<ApiResponse<Settlement>>(
      `/homes/${homeId}/expenses/settlements/${settlementId}/confirm`
    );
    return response.data.data;
  },

  async rejectSettlement(homeId: string, settlementId: string): Promise<Settlement> {
    const response = await apiClient.post<ApiResponse<Settlement>>(
      `/homes/${homeId}/expenses/settlements/${settlementId}/reject`
    );
    return response.data.data;
  },
};
