/**
 * La vuelta — lo que alguien recibe después de hablar.
 *
 * Hasta que existió esto, la plataforma tomaba y no devolvía nada: cargabas una
 * voz, caía en un mapa y se terminaba. No podías ver la tuya, mandársela a
 * nadie, ni mirar la de otro. Y la corroboración —que es una mecánica de DOS
 * personas— tenía sus endpoints construidos y ninguna forma de llegar a ellos,
 * así que el umbral de dos confirmaciones tenía techo real cero.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ClaseSenal, TipoSenal } from '~/lib/vocabulario';

import { api } from '~/lib/api';


export interface SenalDetallada {
  idPublico: string;
  tipo: TipoSenal;
  clase: ClaseSenal;
  tema: string | null;
  titulo: string | null;
  texto: string;
  fuente: string | null;
  /** Sale SIEMPRE con «sin verificar» al lado. Nunca sola. */
  firma: string | null;
  estado: string;
  lat: number | null;
  lng: number | null;
  precision: string;
  provinceId: number | null;
  direccionTexto: string | null;
  comprometidoPara: string | null;
  desenlace: string | null;
  periodicidad: string | null;
  creadaEn: string;
}

export interface ConfirmacionPublica {
  veredicto: string;
  metodo: string;
  proximidad: string;
  /** Si suma al umbral. Las que no suman igual se muestran, con su procedencia. */
  cuenta: boolean;
  creadaEn: string;
}

export interface FichaDeSenal {
  senal: SenalDetallada;
  adhesiones: { total: number; mia: boolean };
  confirmaciones: ConfirmacionPublica[];
  respuestas: string[];
  umbral: number;
  seVerifica: boolean;
}

/** La ficha entera en una llamada: la pantalla no se arma por partes. */
export function useSenal(idPublico: string | undefined) {
  return useQuery({
    queryKey: ['senales', 'ficha', idPublico],
    enabled: idPublico !== undefined && idPublico !== '',
    queryFn: () => api.get<FichaDeSenal>(`/api/v1/civic/senales/${idPublico ?? ''}`),
  });
}

export interface Cola {
  senales: SenalDetallada[];
  /** Por qué la cola está vacía, cuando lo está por una razón y no por falta de trabajo. */
  razon: string | null;
  umbral?: number;
}

/**
 * La cola del «¿sigue así?».
 *
 * `staleTime` corto a propósito: es una cola de trabajo y lo que ya miró otra
 * persona tiene que desaparecer pronto. Una cola cacheada media hora manda a
 * dos personas a confirmar lo mismo.
 */
export function useCola() {
  return useQuery({
    queryKey: ['senales', 'cola'],
    queryFn: () => api.get<Cola>('/api/v1/civic/senales/cola'),
    staleTime: 30_000,
  });
}

export interface ResultadoAdhesion {
  total: number;
  esNueva: boolean;
}

/**
 * «Yo también».
 *
 * Invalida la ficha y la cola, no el mapa entero: adherir no cambia dónde está
 * nada, cambia cuánta gente dice que también le pasa.
 */
export function useAdherir(idPublico: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adherir: boolean) =>
      adherir
        ? api.post<ResultadoAdhesion>(`/api/v1/civic/senales/${idPublico}/adhesion`, {})
        : api.del<ResultadoAdhesion>(`/api/v1/civic/senales/${idPublico}/adhesion`),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['senales', 'ficha', idPublico] }),
        qc.invalidateQueries({ queryKey: ['senales', 'cola'] }),
      ]);
    },
  });
}

export interface EnvioDeConfirmacion {
  veredicto: string;
  metodo: string;
  proximidad: string;
  nota?: string | null;
}

export interface ResultadoConfirmacion {
  cuentan: number;
  correcciones: number;
  umbral: number;
  estado: string;
  corroboroAhora: boolean;
}

/**
 * El segundo par de ojos.
 *
 * Invalida además la luz del país: una corroboración mueve la nitidez del
 * territorio, que es el único de los dos ejes del mapa que esto cambia.
 */
export function useConfirmar(idPublico: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (envio: EnvioDeConfirmacion) =>
      api.post<ResultadoConfirmacion>(`/api/v1/civic/senales/${idPublico}/confirmacion`, envio),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['senales', 'ficha', idPublico] }),
        qc.invalidateQueries({ queryKey: ['senales', 'cola'] }),
        qc.invalidateQueries({ queryKey: ['senales', 'luz'] }),
      ]);
    },
  });
}
