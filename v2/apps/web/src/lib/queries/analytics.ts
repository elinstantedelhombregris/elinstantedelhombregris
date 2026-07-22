import { useQuery } from '@tanstack/react-query';

import { api } from '~/lib/api';

interface VocesCount {
  total: number;
}

/**
 * Live "voces" total — dreams/señales citizens dropped on the map.
 * Backs the header FOMO counter and (Phase 2) the home CifrasStrip.
 */
export function useVocesCount() {
  return useQuery({
    queryKey: ['analytics', 'voces-count'],
    queryFn: () => api.get<VocesCount>('/api/analytics/voces-count'),
  });
}
