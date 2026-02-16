import apiClient from '@/lib/axios';
import type { Task, TaskAssignment, CreateTaskInput, UpdateTaskInput, AssignTaskInput } from '@conviviapp/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const taskService = {
  async create(homeId: string, data: CreateTaskInput): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>(
      `/homes/${homeId}/tasks`,
      data
    );
    return response.data.data;
  },

  async findAll(homeId: string): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>(
      `/homes/${homeId}/tasks`
    );
    return response.data.data;
  },

  async findOne(homeId: string, taskId: string): Promise<Task> {
    const response = await apiClient.get<ApiResponse<Task>>(
      `/homes/${homeId}/tasks/${taskId}`
    );
    return response.data.data;
  },

  async update(homeId: string, taskId: string, data: UpdateTaskInput): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `/homes/${homeId}/tasks/${taskId}`,
      data
    );
    return response.data.data;
  },

  async delete(homeId: string, taskId: string): Promise<void> {
    await apiClient.delete(`/homes/${homeId}/tasks/${taskId}`);
  },

  async createAssignment(
    homeId: string,
    taskId: string,
    data: AssignTaskInput
  ): Promise<TaskAssignment> {
    const response = await apiClient.post<ApiResponse<TaskAssignment>>(
      `/homes/${homeId}/tasks/${taskId}/assignments`,
      data
    );
    return response.data.data;
  },

  async getAssignments(homeId: string): Promise<TaskAssignment[]> {
    const response = await apiClient.get<ApiResponse<TaskAssignment[]>>(
      `/homes/${homeId}/tasks/assignments`
    );
    return response.data.data;
  },

  async startAssignment(homeId: string, assignmentId: string): Promise<TaskAssignment> {
    const response = await apiClient.post<ApiResponse<TaskAssignment>>(
      `/homes/${homeId}/tasks/assignments/${assignmentId}/start`
    );
    return response.data.data;
  },

  async completeAssignment(homeId: string, assignmentId: string, notes?: string): Promise<TaskAssignment> {
    const response = await apiClient.post<ApiResponse<TaskAssignment>>(
      `/homes/${homeId}/tasks/assignments/${assignmentId}/complete`,
      { notes }
    );
    return response.data.data;
  },

  async skipAssignment(homeId: string, assignmentId: string, notes?: string): Promise<TaskAssignment> {
    const response = await apiClient.post<ApiResponse<TaskAssignment>>(
      `/homes/${homeId}/tasks/assignments/${assignmentId}/skip`,
      { notes }
    );
    return response.data.data;
  },

  async getMyAssignments(): Promise<TaskAssignment[]> {
    const response = await apiClient.get<ApiResponse<TaskAssignment[]>>(
      '/me/assignments'
    );
    return response.data.data;
  },

  async getKarmaRanking(homeId: string): Promise<KarmaEntry[]> {
    const response = await apiClient.get<ApiResponse<KarmaEntry[]>>(
      `/homes/${homeId}/tasks/karma`
    );
    return response.data.data;
  },
};

interface KarmaEntry {
  rank: number;
  odUserId: string;
  name: string;
  avatarUrl: string | null;
  karma: number;
}
