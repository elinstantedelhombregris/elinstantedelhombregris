import { useQuery } from '@tanstack/react-query';

import { api } from '~/lib/api';

/**
 * El endpoint del instrumento. Prefijo versionado `/api/v1/civic/` — el mismo
 * que la app de campo ya habla.
 *
 * NO lo usa el panel de conversión de arriba: esa parte sigue con
 * `/api/open-data/*`, porque el instrumento no se paga en el camino crítico de
 * los 30 segundos. Estos hooks solo se montan cuando alguien pide el
 * instrumento (spec 3 §2).
 */

export type CapaMapa = 'voz' | 'pulso' | 'propuesta' | 'mandato';

export const CAPAS: readonly CapaMapa[] = ['voz', 'pulso', 'propuesta', 'mandato'];

export const NOMBRE_CAPA: Record<CapaMapa, string> = {
  voz: 'voces',
  pulso: 'pulso',
  propuesta: 'propuestas',
  mandato: 'mandato',
};

export interface SenalMapa {
  id: string;
  capa: CapaMapa;
  tipo: string | null;
  texto: string;
  lat: number | null;
  lng: number | null;
  precision: string;
  role: string;
  provinceId: number | null;
  cityId: number | null;
  createdAt: string;
}

export interface FiltrosSenales {
  capas: readonly CapaMapa[];
  /** '7d' | '30d' | 'todo' */
  rango: '7d' | '30d' | 'todo';
}

const DIAS: Record<'7d' | '30d', number> = { '7d': 7, '30d': 30 };

function desdeDe(rango: FiltrosSenales['rango'], ahora: number): string | null {
  if (rango === 'todo') return null;
  return new Date(ahora - DIAS[rango] * 86_400_000).toISOString();
}

/**
 * `habilitado` es lo que hace que el instrumento sea perezoso: mientras la
 * sección no se monta, la query no existe y no se pide un solo byte.
 */
export function useSenalesMapa(filtros: FiltrosSenales, habilitado: boolean) {
  const desde = desdeDe(filtros.rango, Date.now());
  const capas = [...filtros.capas].sort().join(',');

  return useQuery({
    queryKey: ['civic-map', 'signals', capas, filtros.rango],
    enabled: habilitado,
    queryFn: () => {
      const params = new URLSearchParams();
      if (capas) params.set('capas', capas);
      if (desde) params.set('desde', desde);
      return api.get<{ signals: SenalMapa[] }>(`/api/v1/civic/map/signals?${params.toString()}`);
    },
    select: (d) => d.signals,
  });
}

export function useCapasDisponibles(habilitado: boolean) {
  return useQuery({
    queryKey: ['civic-map', 'layers'],
    enabled: habilitado,
    queryFn: () => api.get<{ layers: Record<CapaMapa, number> }>('/api/v1/civic/map/layers'),
    select: (d) => d.layers,
  });
}
