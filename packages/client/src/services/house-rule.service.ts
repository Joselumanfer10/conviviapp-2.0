import apiClient from '@/lib/axios';
import type { HouseRule, CreateHouseRuleInput, UpdateHouseRuleInput } from '@conviviapp/shared';

interface AcceptanceStatus {
  total: number;
  accepted: number;
  members: Array<{
    userId: string;
    name: string;
    avatarUrl: string | null;
    hasAccepted: boolean;
  }>;
}

export const houseRuleApi = {
  async getAll(homeId: string): Promise<HouseRule[]> {
    const { data } = await apiClient.get(`/homes/${homeId}/rules`);
    return data.data;
  },

  async getById(homeId: string, ruleId: string): Promise<HouseRule> {
    const { data } = await apiClient.get(`/homes/${homeId}/rules/${ruleId}`);
    return data.data;
  },

  async create(homeId: string, input: CreateHouseRuleInput): Promise<HouseRule> {
    const { data } = await apiClient.post(`/homes/${homeId}/rules`, input);
    return data.data;
  },

  async update(homeId: string, ruleId: string, input: UpdateHouseRuleInput): Promise<HouseRule> {
    const { data } = await apiClient.patch(`/homes/${homeId}/rules/${ruleId}`, input);
    return data.data;
  },

  async delete(homeId: string, ruleId: string): Promise<void> {
    await apiClient.delete(`/homes/${homeId}/rules/${ruleId}`);
  },

  async accept(homeId: string, ruleId: string): Promise<HouseRule> {
    const { data } = await apiClient.post(`/homes/${homeId}/rules/${ruleId}/accept`);
    return data.data;
  },

  async getAcceptanceStatus(homeId: string, ruleId: string): Promise<AcceptanceStatus> {
    const { data } = await apiClient.get(`/homes/${homeId}/rules/${ruleId}/acceptance`);
    return data.data;
  },
};
