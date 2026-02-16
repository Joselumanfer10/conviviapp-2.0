import apiClient from '@/lib/axios';
import type { Announcement, ApiResponse } from '@conviviapp/shared';
import type { CreateAnnouncementInput, CastVoteInput } from '@conviviapp/shared';

export const announcementService = {
  async findAll(homeId: string, type?: string): Promise<Announcement[]> {
    const params = type ? { type } : {};
    const response = await apiClient.get<ApiResponse<Announcement[]>>(
      `/homes/${homeId}/announcements`,
      { params }
    );
    return response.data.data;
  },

  async findById(homeId: string, id: string): Promise<Announcement> {
    const response = await apiClient.get<ApiResponse<Announcement>>(
      `/homes/${homeId}/announcements/${id}`
    );
    return response.data.data;
  },

  async create(homeId: string, data: CreateAnnouncementInput): Promise<Announcement> {
    const response = await apiClient.post<ApiResponse<Announcement>>(
      `/homes/${homeId}/announcements`,
      data
    );
    return response.data.data;
  },

  async update(
    homeId: string,
    id: string,
    data: Partial<CreateAnnouncementInput>
  ): Promise<Announcement> {
    const response = await apiClient.patch<ApiResponse<Announcement>>(
      `/homes/${homeId}/announcements/${id}`,
      data
    );
    return response.data.data;
  },

  async delete(homeId: string, id: string): Promise<void> {
    await apiClient.delete(`/homes/${homeId}/announcements/${id}`);
  },

  async togglePin(homeId: string, id: string): Promise<Announcement> {
    const response = await apiClient.patch<ApiResponse<Announcement>>(
      `/homes/${homeId}/announcements/${id}/pin`
    );
    return response.data.data;
  },

  async castVote(homeId: string, id: string, data: CastVoteInput): Promise<Announcement> {
    const response = await apiClient.post<ApiResponse<Announcement>>(
      `/homes/${homeId}/announcements/${id}/vote`,
      data
    );
    return response.data.data;
  },

  async removeVote(homeId: string, id: string): Promise<void> {
    await apiClient.delete(`/homes/${homeId}/announcements/${id}/vote`);
  },

  async getResults(homeId: string, id: string): Promise<Announcement> {
    const response = await apiClient.get<ApiResponse<Announcement>>(
      `/homes/${homeId}/announcements/${id}/results`
    );
    return response.data.data;
  },
};
