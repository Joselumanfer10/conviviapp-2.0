import apiClient from '@/lib/axios';
import type {
  SharedSpace,
  Reservation,
  CreateSharedSpaceInput,
  UpdateSharedSpaceInput,
  CreateReservationInput,
} from '@conviviapp/shared';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const reservationApiService = {
  // ==================== SPACES ====================

  async createSpace(homeId: string, data: CreateSharedSpaceInput): Promise<SharedSpace> {
    const response = await apiClient.post<ApiResponse<SharedSpace>>(
      `/homes/${homeId}/reservations/spaces`,
      data
    );
    return response.data.data;
  },

  async findAllSpaces(homeId: string): Promise<SharedSpace[]> {
    const response = await apiClient.get<ApiResponse<SharedSpace[]>>(
      `/homes/${homeId}/reservations/spaces`
    );
    return response.data.data;
  },

  async findSpaceById(homeId: string, spaceId: string): Promise<SharedSpace> {
    const response = await apiClient.get<ApiResponse<SharedSpace>>(
      `/homes/${homeId}/reservations/spaces/${spaceId}`
    );
    return response.data.data;
  },

  async updateSpace(
    homeId: string,
    spaceId: string,
    data: UpdateSharedSpaceInput
  ): Promise<SharedSpace> {
    const response = await apiClient.patch<ApiResponse<SharedSpace>>(
      `/homes/${homeId}/reservations/spaces/${spaceId}`,
      data
    );
    return response.data.data;
  },

  async deleteSpace(homeId: string, spaceId: string): Promise<void> {
    await apiClient.delete(`/homes/${homeId}/reservations/spaces/${spaceId}`);
  },

  // ==================== RESERVATIONS ====================

  async createReservation(
    homeId: string,
    spaceId: string,
    data: Omit<CreateReservationInput, 'spaceId'>
  ): Promise<Reservation> {
    const response = await apiClient.post<ApiResponse<Reservation>>(
      `/homes/${homeId}/reservations/spaces/${spaceId}/reservations`,
      data
    );
    return response.data.data;
  },

  async findBySpace(
    homeId: string,
    spaceId: string,
    date?: string
  ): Promise<Reservation[]> {
    const params = date ? { date } : {};
    const response = await apiClient.get<ApiResponse<Reservation[]>>(
      `/homes/${homeId}/reservations/spaces/${spaceId}/reservations`,
      { params }
    );
    return response.data.data;
  },

  async findByHome(homeId: string, date?: string): Promise<Reservation[]> {
    const params = date ? { date } : {};
    const response = await apiClient.get<ApiResponse<Reservation[]>>(
      `/homes/${homeId}/reservations`,
      { params }
    );
    return response.data.data;
  },

  async deleteReservation(homeId: string, reservationId: string): Promise<void> {
    await apiClient.delete(`/homes/${homeId}/reservations/${reservationId}`);
  },
};
