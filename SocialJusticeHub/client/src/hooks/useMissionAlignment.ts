import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useMissionAlignment(enabled = true) {
  return useQuery({
    queryKey: ['/api/user/mission-alignment'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/mission-alignment');
      if (!res.ok) return null;
      return res.json();
    },
    enabled,
    staleTime: 60000,
  });
}
