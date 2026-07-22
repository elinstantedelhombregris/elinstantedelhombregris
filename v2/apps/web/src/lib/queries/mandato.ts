import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth/csrf';

export interface PulseSignalDetail {
  id: number;
  body: string;
  provinceId: number | null;
  theme: string | null;
  sentiment: number | null;
  source: string;
  createdAt: string;
  userId: number | null;
}

export interface Propuesta {
  id: number;
  title: string;
  summary: string;
  bodyMarkdown: string | null;
  status: string;
  voteScore: number;
  voteCount: number;
  provinceId: number | null;
  authorId: number | null;
  createdAt: string;
  updatedAt: string;
}

export function usePulsoById(id: number) {
  return useQuery({
    queryKey: ['pulso', id],
    queryFn: () => api.get<{ signal: PulseSignalDetail }>(`/api/pulso/${id}`),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function usePropuestaById(id: number) {
  return useQuery({
    queryKey: ['propuesta', id],
    queryFn: () => api.get<{ proposal: Propuesta }>(`/api/propuestas/${id}`),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useVotePropuesta(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (value: -1 | 0 | 1) =>
      api.post<{ ok: true; voteScore: number; voteCount: number }>(
        `/api/propuestas/${id}/vote`,
        { value },
        { csrfToken: readCsrfToken() },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['propuesta', id] });
    },
  });
}

export interface DocumentoMandato {
  generadoEl: string;
  voces: { total: number; porTipo: { tipo: string | null; total: number }[] };
  recursos: { total: number; porProvincia: { provincia: string | null; total: number }[] };
  brechas: { provincia: string; piden: number; ofrecen: number }[];
  senales: {
    total: number;
    clasificadas: number;
    temas: {
      tema: string;
      total: number;
      ultima: { id: number; texto: string; provincia: string | null; fecha: string } | null;
    }[];
  };
  propuestas: { id: number; titulo: string; resumen: string; estado: string; votos: number; apoyo: number }[];
}

/** El agregado completo detrás del documento del mandato (spec 2.3). */
export function useMandatoDocumento() {
  return useQuery({
    queryKey: ['mandato', 'documento'],
    queryFn: () => api.get<DocumentoMandato>('/api/mandato/documento'),
  });
}
