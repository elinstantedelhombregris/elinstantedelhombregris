import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api } from '~/lib/api';

/**
 * La Radiografía — el contrato de lectura de la constelación.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §3, §4.5, §5.
 *
 * Un solo endpoint de lectura, anónimo y sin efectos: `GET
 * /api/v1/civic/radiografia`. No hay escritura en esta página — no la va a
 * haber nunca. La convergencia se mide, no se vota (§12).
 *
 * Los tipos de acá son **el contrato compartido**, no una copia de la fila de
 * base: `FilaPublicable` gobierna lo que la página puede ver (R15) y el
 * servidor arma cada campo a mano antes de mandarlo.
 */

/** Las cuatro clases de la spec B §2.1. El color codifica esto y no el tipo. */
export type ClaseSenal = 'hecho' | 'deseo' | 'acto' | 'meta';

/**
 * Un nodo dibujable. `clase` llega como `string` **a propósito**: si el
 * vocabulario de B crece con una quinta clase, la página tiene que seguir
 * dibujando el nodo y contarlo, no romperse ni —peor— tratarlo como si fuera
 * de una clase que no es. Quien lo consume lo estrecha con `esClase()`.
 *
 * `x,y,z` los calcula el servidor con `esferaDeFibonacci` (los centroides de
 * núcleo) y `espiralAurea` (los miembros adentro), las dos de `@v2/civic-core`.
 */
export interface MiembroDeNucleo {
  id: string;
  clase: string;
  x: number;
  y: number;
  z: number;
}

export interface NucleoPublico {
  id: string;
  /**
   * La señal **real** más cercana al centro, entre las que cedieron licencia
   * (R8, §4.5.4). Nunca un resumen generado.
   */
  frase: { id: string; texto: string } | null;
  /** Por qué no hay frase, cuando no la hay. Ej.: `sin cesión de licencia`. */
  textoOmitido: string | null;
  senales: number;
  /** `{ deseo: 12, hecho: 3 }` — la composición manda sobre el tamaño (§3.1). */
  clases: Record<string, number>;
  provincias: number;
  /** Los dos más lejanos, sobre el punto engrosado y a la decena de km (R13). */
  distancia: { a: string; b: string; km: number } | null;
  miembros: MiembroDeNucleo[];
}

/**
 * Las dos clases de arista de R6. La `medida` la infiere la máquina desde los
 * vectores; la `declarada` la afirmó una persona con una adhesión. Nunca se
 * dibujan con el mismo trazo.
 */
export interface AristaDeConvergencia {
  a: string;
  b: string;
  similitud: number;
  tipo: 'medida' | 'declarada';
}

export interface RadiografiaPublica {
  /** El corte de la última corrida del análisis. `null` si nunca corrió (R4). */
  corte: string | null;
  modelo: string | null;
  analizadas: number;
  sinVector: number;
  total: number;
  provinciasSinSenal: number;
  umbral: number;
  nucleos: NucleoPublico[];
  /** Las voces solas. No es un residuo: es una voz que nadie repitió (§6). */
  solas: MiembroDeNucleo[];
  aristas: AristaDeConvergencia[];
}

/**
 * `0,72` es **provisorio** y está declarado como tal en la spec §4.6: no se
 * puede calibrar sin corpus, y no sale de 1/φ ni de ningún número lindo (R10).
 */
export const UMBRAL_INICIAL = 0.72;

/** Las `k` vecinas por señal del grafo medido (§4.5.1). */
export const K_VECINAS = 12;

export interface PedidoDeRadiografia {
  umbral: number;
  k?: number;
}

/**
 * El pedido al servidor.
 *
 * `placeholderData: keepPreviousData` es lo que hace que mover el deslizador
 * no parpadee en blanco: mientras viaja el pedido nuevo, la página sigue
 * mostrando el corte anterior y recalcula los núcleos en el navegador con el
 * mismo `nucleosAlUmbral` que usa el servidor. El dato viejo nunca se pinta
 * como si fuera el nuevo — quien lo consume sabe, por `data.umbral`, a qué
 * umbral corresponde lo que tiene en la mano.
 *
 * **Un detalle del servidor que gobierna lo que se puede recalcular acá:**
 * `aristas` trae **sólo las visibles a `umbral`**. Subir el umbral en el
 * navegador es exacto —las aristas que hacen falta son un subconjunto de las
 * que llegaron—; bajarlo no se puede calcular sin volver a preguntar. Eso lo
 * resuelve `construirVista` con sus tres estados, y no este hook.
 */
export function useRadiografia({ umbral, k = K_VECINAS }: PedidoDeRadiografia) {
  return useQuery({
    queryKey: ['radiografia', umbral, k],
    queryFn: () =>
      api.get<RadiografiaPublica>(
        `/api/v1/civic/radiografia?umbral=${umbral.toFixed(2)}&k=${String(k)}`,
      ),
    placeholderData: keepPreviousData,
  });
}
