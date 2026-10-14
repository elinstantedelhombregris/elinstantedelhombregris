import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AnalisisOpiniones } from '@v2/civic-core';
import type {
  CampanaPublica,
  EspacioPersonal,
  ContribucionInput,
  ContratoCampana,
  EstadoCampana,
  DisenoFicha,
} from '@v2/shared';

import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth/csrf';
import { useAuth } from '~/lib/auth/use-auth';

export async function tokenParticipacion() {
  const actual = readCsrfToken();
  if (actual) return actual;
  const r = await api.get<{ csrfToken: string }>('/api/v1/contribuciones/contexto');
  return r.csrfToken;
}
export async function escribir<T>(
  metodo: 'post' | 'put' | 'patch' | 'delete',
  ruta: string,
  cuerpo?: unknown,
): Promise<T> {
  const csrfToken = await tokenParticipacion();
  return metodo === 'delete'
    ? api.del<T>(ruta, { csrfToken })
    : api[metodo]<T>(ruta, cuerpo, { csrfToken });
}
export function useCampanas(mias = false) {
  const auth = useAuth();
  return useQuery({
    queryKey: ['campanas', mias, auth.user?.id ?? null],
    enabled: !auth.isLoading && (!mias || Boolean(auth.user)),
    queryFn: () =>
      api.get<
        Pick<CampanaPublica, 'id' | 'slug' | 'revision' | 'estado' | 'contrato' | 'actualizadaEn'>[]
      >(`/api/v1/campanas${mias ? '?mias=1' : ''}`),
  });
}
export function useCampana(id: string | undefined, edicion?: number) {
  const auth = useAuth();
  return useQuery({
    queryKey: ['campanas', id, edicion, auth.user?.id ?? null],
    enabled: Boolean(id) && !auth.isLoading,
    queryFn: () =>
      api.get<CampanaPublica>(
        `/api/v1/campanas/${id ?? ''}${edicion ? `?edicion=${edicion}` : ''}`,
      ),
  });
}
export interface ReciboParticipacion {
  idPublico: string;
  estado: string;
  tipo: string;
  precisionPublicada: string;
  yaExistia: boolean;
  avisos: string[];
  contexto?: { campanaId: string | null; edicion: number | null };
}
export function usePublicarAporte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: ContribucionInput) =>
      escribir<ReciboParticipacion>('post', '/api/v1/contribuciones', v),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['campanas'] });
      void qc.invalidateQueries({ queryKey: ['mi-espacio'] });
      for (const key of [
        'radiografia',
        'civic-map',
        'senal',
        'senales',
        'campanas',
        'analytics',
        'mandato',
        'deliberacion',
        'relaciones-fichas',
        'vision-compartida',
      ])
        void qc.invalidateQueries({ queryKey: [key] });
      void qc.invalidateQueries({ queryKey: ['civic-map'] });
    },
  });
}
export function useLecturaAsistida() {
  return useMutation({
    mutationFn: (texto: string) =>
      escribir<{
        lectura: string;
        condiciones: string[];
        pregunta: string;
        proveedor: string;
        modelo: string;
      }>('post', '/api/v1/contribuciones/interpretar', { texto, autorizaProveedor: true }),
  });
}
export function useMiEspacio(usuarioId: number | undefined) {
  return useQuery({
    queryKey: ['mi-espacio', usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: () => api.get<EspacioPersonal>('/api/v1/mi-espacio'),
  });
}
export function useOperacionPersonal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      metodo: 'post' | 'put' | 'patch' | 'delete';
      ruta: string;
      cuerpo?: unknown;
    }) => escribir(v.metodo, v.ruta, v.cuerpo),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['mi-espacio'] });
      for (const key of [
        'radiografia',
        'civic-map',
        'senal',
        'senales',
        'campanas',
        'analytics',
        'mandato',
        'deliberacion',
        'relaciones-fichas',
        'vision-compartida',
      ])
        void qc.invalidateQueries({ queryKey: [key] });
      void qc.invalidateQueries({ queryKey: ['recuperables'] });
      void qc.invalidateQueries({ queryKey: ['avisos-civicos'] });
      void qc.invalidateQueries({ queryKey: ['diseno'] });
      void qc.invalidateQueries({ queryKey: ['fichas'] });
      void qc.invalidateQueries({ queryKey: ['aporte-privado'] });
    },
  });
}
export function useGuardarCampana(id?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { contrato: ContratoCampana; revision?: number; idLocal: string }) =>
      id
        ? escribir<{ id: string }>('put', `/api/v1/campanas/${id}`, {
            contrato: v.contrato,
            revision: v.revision,
          })
        : escribir<{ id: string }>('post', '/api/v1/campanas', {
            contrato: v.contrato,
            idLocal: v.idLocal,
          }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['campanas'] });
    },
  });
}
export function useEstadoCampana(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { revision: number; estado: EstadoCampana; motivo: string }) =>
      escribir('post', `/api/v1/campanas/${id}/estado`, v),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['campanas'] });
    },
  });
}
export function useDisenoFicha(id: string, userId?: number) {
  return useQuery({
    queryKey: ['diseno', id, userId],
    queryFn: () =>
      api.get<DisenoFicha & { analisisOpiniones: AnalisisOpiniones }>(
        `/api/v1/fichas/${id}/diseno`,
      ),
  });
}
