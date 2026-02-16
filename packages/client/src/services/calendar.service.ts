import apiClient from '@/lib/axios';
import type {
  CalendarEvent,
  AggregatedCalendarItem,
  ApiResponse,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '@conviviapp/shared';

export const calendarService = {
  async findAll(homeId: string, month?: number, year?: number): Promise<CalendarEvent[]> {
    const params: Record<string, number> = {};
    if (month !== undefined) params.month = month;
    if (year !== undefined) params.year = year;

    const response = await apiClient.get<ApiResponse<CalendarEvent[]>>(
      `/homes/${homeId}/calendar`,
      { params }
    );
    return response.data.data;
  },

  async findById(homeId: string, eventId: string): Promise<CalendarEvent> {
    const response = await apiClient.get<ApiResponse<CalendarEvent>>(
      `/homes/${homeId}/calendar/${eventId}`
    );
    return response.data.data;
  },

  async create(homeId: string, data: CreateCalendarEventInput): Promise<CalendarEvent> {
    const response = await apiClient.post<ApiResponse<CalendarEvent>>(
      `/homes/${homeId}/calendar`,
      data
    );
    return response.data.data;
  },

  async update(
    homeId: string,
    eventId: string,
    data: UpdateCalendarEventInput
  ): Promise<CalendarEvent> {
    const response = await apiClient.patch<ApiResponse<CalendarEvent>>(
      `/homes/${homeId}/calendar/${eventId}`,
      data
    );
    return response.data.data;
  },

  async delete(homeId: string, eventId: string): Promise<void> {
    await apiClient.delete(`/homes/${homeId}/calendar/${eventId}`);
  },

  async getAggregated(
    homeId: string,
    month: number,
    year: number
  ): Promise<AggregatedCalendarItem[]> {
    const response = await apiClient.get<ApiResponse<AggregatedCalendarItem[]>>(
      `/homes/${homeId}/calendar/aggregated`,
      { params: { month, year } }
    );
    return response.data.data;
  },
};
