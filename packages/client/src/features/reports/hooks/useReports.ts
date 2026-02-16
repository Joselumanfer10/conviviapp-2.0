import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/services/report.service';

export function useMonthlyReport(homeId: string, month: number, year: number) {
  return useQuery({
    queryKey: ['report', homeId, month, year],
    queryFn: () => reportApi.getMonthlyReport(homeId, month, year),
    enabled: !!homeId && month >= 1 && month <= 12,
  });
}
