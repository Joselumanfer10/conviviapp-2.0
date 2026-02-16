import apiClient from '@/lib/axios';
import type { MonthlyReport } from '@conviviapp/shared';

export const reportApi = {
  async getMonthlyReport(homeId: string, month: number, year: number): Promise<MonthlyReport> {
    const { data } = await apiClient.get(`/homes/${homeId}/reports/monthly`, {
      params: { month, year },
    });
    return data.data;
  },
};
