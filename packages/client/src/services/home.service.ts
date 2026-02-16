import apiClient from '@/lib/axios';
import type { Home, HomeMember, CreateHomeInput, JoinHomeInput } from '@conviviapp/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const homeService = {
  async create(data: CreateHomeInput): Promise<Home> {
    const response = await apiClient.post<ApiResponse<Home>>('/homes', data);
    return response.data.data;
  },

  async findAll(): Promise<Home[]> {
    const response = await apiClient.get<ApiResponse<Home[]>>('/homes');
    return response.data.data;
  },

  async findOne(id: string): Promise<Home> {
    const response = await apiClient.get<ApiResponse<Home>>(`/homes/${id}`);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateHomeInput>): Promise<Home> {
    const response = await apiClient.patch<ApiResponse<Home>>(`/homes/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/homes/${id}`);
  },

  async join(data: JoinHomeInput): Promise<HomeMember> {
    const response = await apiClient.post<ApiResponse<HomeMember>>('/homes/join', data);
    return response.data.data;
  },

  async leave(homeId: string): Promise<void> {
    await apiClient.post(`/homes/${homeId}/leave`);
  },

  async getMembers(homeId: string): Promise<HomeMember[]> {
    const response = await apiClient.get<ApiResponse<HomeMember[]>>(`/homes/${homeId}/members`);
    return response.data.data;
  },

  async regenerateInviteCode(homeId: string): Promise<{ inviteCode: string }> {
    const response = await apiClient.post<ApiResponse<{ inviteCode: string }>>(
      `/homes/${homeId}/invite/regenerate`
    );
    return response.data.data;
  },

  async updateMemberRole(homeId: string, memberId: string, role: string): Promise<HomeMember> {
    const response = await apiClient.patch<ApiResponse<HomeMember>>(`/homes/${homeId}/members/${memberId}`, { role });
    return response.data.data;
  },

  async removeMember(homeId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/homes/${homeId}/members/${memberId}`);
  },

  async transferOwnership(homeId: string, newAdminId: string): Promise<void> {
    await apiClient.post(`/homes/${homeId}/transfer`, { newAdminId });
  },
};
