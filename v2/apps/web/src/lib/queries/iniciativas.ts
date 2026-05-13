import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth/csrf';

export interface Iniciativa {
  id: number;
  slug: string;
  title: string;
  summary: string;
  kind: 'plan' | 'mission' | 'community' | 'territorial';
  planCode: string | null;
  bodyMarkdown: string | null;
  coverImageUrl: string | null;
  status: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export function useIniciativa(slug: string) {
  return useQuery({
    queryKey: ['iniciativa', slug],
    queryFn: () => api.get<{ iniciativa: Iniciativa }>(`/api/iniciativas/${slug}`),
    enabled: slug.length > 0,
  });
}

export function useJoinIniciativa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.post<{ ok: true; alreadyMember?: boolean }>(
        `/api/iniciativas/${id}/join`,
        {},
        { csrfToken: readCsrfToken() },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['iniciativa'] });
    },
  });
}

export function useLeaveIniciativa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.post<{ ok: true }>(`/api/iniciativas/${id}/leave`, {}, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['iniciativa'] });
    },
  });
}
