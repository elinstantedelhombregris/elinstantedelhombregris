import { useQuery } from '@tanstack/react-query';

export const useAIInsights = () => {
  return useQuery<{ narrative: string; generatedAt: string }>({
    queryKey: ['/api/analytics/insights'],
    staleTime: 300000,
    retry: false,
  });
};
