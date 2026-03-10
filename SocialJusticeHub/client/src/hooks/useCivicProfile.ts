import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useCivicProfile(enabled = true) {
  return useQuery({
    queryKey: ['/api/civic-profile'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/civic-profile');
      if (!res.ok) throw new Error('Failed to fetch civic profile');
      return res.json();
    },
    enabled,
    staleTime: 60000,
    retry: false,
  });
}

export function useGoals(enabled = true) {
  return useQuery({
    queryKey: ['/api/goals'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/goals');
      if (!res.ok) throw new Error('Failed to fetch goals');
      return res.json();
    },
    enabled,
    staleTime: 30000,
    retry: false,
  });
}

export function useCurrentCheckin(enabled = true) {
  return useQuery({
    queryKey: ['/api/checkins/current-week'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/checkins/current-week');
      if (!res.ok) throw new Error('Failed to fetch current checkin');
      return res.json();
    },
    enabled,
    staleTime: 30000,
    retry: false,
  });
}

export function useCoachingSessions(enabled = true) {
  return useQuery({
    queryKey: ['/api/coaching/sessions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/coaching/sessions');
      if (!res.ok) throw new Error('Failed to fetch coaching sessions');
      return res.json();
    },
    enabled,
    staleTime: 60000,
    retry: false,
  });
}
