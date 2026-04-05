import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useTerritoryDashboard(enabled = true) {
  return useQuery({
    queryKey: ['/api/user/territory-pulse'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/territory-pulse');
      if (!res.ok) return null;
      return res.json();
    },
    enabled,
    staleTime: 120000,
  });
}
