import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PermisosIniciativa } from '@v2/shared';

import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth/csrf';
import { useAuth } from '~/lib/auth/use-auth';

export interface Iniciativa {
  id: number;
  revision: number;
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
  const auth = useAuth();
  return useQuery({
    queryKey: ['iniciativa', slug, auth.user?.id ?? null],
    queryFn: () =>
      api.get<{ iniciativa: Iniciativa; permisos: PermisosIniciativa }>(`/api/iniciativas/${slug}`),
    enabled: slug.length > 0 && !auth.isLoading,
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
      void qc.invalidateQueries({ queryKey: ['diseno'] });
      void qc.invalidateQueries({ queryKey: ['gestion-iniciativas'] });
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
      void qc.invalidateQueries({ queryKey: ['diseno'] });
      void qc.invalidateQueries({ queryKey: ['gestion-iniciativas'] });
    },
  });
}
