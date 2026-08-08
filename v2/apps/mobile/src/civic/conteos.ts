/**
 * De señales locales a conteos por celda — el puente entre la base del
 * teléfono y la fórmula de `@v2/civic-core`.
 *
 * Recibe señales ya aplanadas y no filas de drizzle: así es pura, se testea
 * sin base, y quien la llama decide qué tablas mirar.
 */

import {
  habitantesDeCelda,
  pointInCoverageArea,
  type ConteoCelda,
  type CoverageCell,
} from '@v2/civic-core';

export interface SenalParaConteo {
  lat: number;
  lng: number;
  /** Identidad seudónima de dispositivo. Dos señales de la misma persona en la misma celda son una voz. */
  actorKey: string;
  /** `true` para necesidad, ¡basta! y recurso. `false` para sueño, valor y compromiso. */
  verificable: boolean;
  /** Sólo tiene sentido cuando `verificable` es `true`. */
  confirmada: boolean;
}

/** Resuelve un punto a su provincia. La inyecta quien llama para no acoplar esto al GeoJSON. */
export type ProvinciaDe = (punto: { lat: number; lng: number }) => string | null;

export const conteosPorCelda = (
  senales: readonly SenalParaConteo[],
  cells: readonly CoverageCell[],
  provinciaDe: ProvinciaDe,
): ConteoCelda[] =>
  cells.map((cell) => {
    const area = { type: 'Polygon' as const, coordinates: cell.geometry.coordinates };
    const adentro = senales.filter((s) => pointInCoverageArea({ lat: s.lat, lng: s.lng }, area));

    // Personas distintas, no señales: regla 8 de la Constitución de producto.
    const voces = new Set(adentro.map((s) => s.actorKey));

    // Las deliberables ya contaron arriba, para el brillo. Acá sólo los hechos:
    // sólo ellos se corroboran (regla 11).
    const verificables = adentro.filter((s) => s.verificable);

    return {
      cellId: cell.id,
      vocesDistintas: voces.size,
      habitantes: habitantesDeCelda(cell, provinciaDe(cell.center)),
      verificables: verificables.length,
      confirmaciones: verificables.filter((s) => s.confirmada).length,
    };
  });
