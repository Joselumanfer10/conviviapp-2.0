import apiClient from '@/lib/axios';
import type { Notification } from '@conviviapp/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface NotificationListResponse {
  notifications: Notification[];
  total: number;
}

export const notificationService = {
  async findAll(options?: {
    isRead?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<NotificationListResponse> {
    const params: Record<string, string> = {};
    if (options?.isRead !== undefined) params.isRead = String(options.isRead);
    if (options?.limit) params.limit = String(options.limit);
    if (options?.offset) params.offset = String(options.offset);
    const response = await apiClient.get<ApiResponse<NotificationListResponse>>(
      '/notifications',
      { params }
    );
    return response.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data.count;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<ApiResponse<Notification>>(
      `/notifications/${id}/read`
    );
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/mark-all-read');
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};
