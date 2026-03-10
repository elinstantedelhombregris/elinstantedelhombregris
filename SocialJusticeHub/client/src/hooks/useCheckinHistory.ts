import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface CheckinEntry {
  id: number;
  weekOf: string;
  mood: number;
  progressRating: number;
  highlight: string | null;
  challenge: string | null;
  nextWeekIntention: string | null;
  goalsReviewed: number[];
  createdAt: string;
}

export function useCheckinHistory(enabled = true) {
  return useQuery<{ checkins: CheckinEntry[] }>({
    queryKey: ['/api/checkins'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/checkins');
      if (!res.ok) throw new Error('Failed to fetch checkin history');
      return res.json();
    },
    enabled,
    staleTime: 30000,
    retry: false,
  });
}
