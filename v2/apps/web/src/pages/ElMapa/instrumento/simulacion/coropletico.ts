import type { Diferencia, Retrato } from '@v2/civic-core';

/**
 * Armar el coroplético desde un retrato — spec §7.
 *
 * `sinDato` no es cosmético y es la razón por la que este módulo existe: una
 * provincia que el retrato no conoce se marca, no se pinta en cero. Cero dice
 * «acá no habla nadie»; sin dato dice «no sé». Confundirlos es exactamente lo
 * que la regla S8 prohíbe.
 */

export interface PropiedadesProvincia {
  name: string;
  valor: number;
  /** 1 · 0 en vez de booleano: maplibre compara números en sus expresiones. */
  tieneMandato: number;
  sinDato: number;
}

export interface FeatureProvincia {
  type: 'Feature';
  properties: PropiedadesProvincia;
  geometry: unknown;
}

export interface ColeccionProvincias {
  type: 'FeatureCollection';
  features: FeatureProvincia[];
}

interface FeatureCruda {
  type: string;
  properties: { name?: unknown };
  geometry: unknown;
}

/** Valida la forma del GeoJSON crudo sin confiar en que llegó bien. */
function featuresDe(geometria: unknown): FeatureCruda[] | null {
  if (typeof geometria !== 'object' || geometria === null) return null;
  const col = geometria as { type?: unknown; features?: unknown };
  if (col.type !== 'FeatureCollection' || !Array.isArray(col.features)) return null;
  return col.features as FeatureCruda[];
}

function construir(
  geometria: unknown,
  valorDe: (nombre: string) => { valor: number; tieneMandato: boolean } | null,
): ColeccionProvincias | null {
  const features = featuresDe(geometria);
  if (features === null) return null;

  return {
    type: 'FeatureCollection',
    features: features.map((f) => {
      const nombre = typeof f.properties.name === 'string' ? f.properties.name : '';
      const dato = valorDe(nombre);
      return {
        type: 'Feature' as const,
        geometry: f.geometry,
        properties: {
          name: nombre,
          valor: dato?.valor ?? 0,
          tieneMandato: dato?.tieneMandato === true ? 1 : 0,
          sinDato: dato === null ? 1 : 0,
        },
      };
    }),
  };
}

export function coropleticoDe(geometria: unknown, retrato: Retrato): ColeccionProvincias | null {
  return construir(geometria, (nombre) => {
    const t = retrato.porTerritorio.get(nombre);
    if (t === undefined) return null;
    return { valor: t.voces.valor, tieneMandato: t.tieneMandato };
  });
}

export function coropleticoDiferencia(
  geometria: unknown,
  diferencia: Diferencia,
): ColeccionProvincias | null {
  return construir(geometria, (nombre) => {
    const t = diferencia.porTerritorio.get(nombre);
    if (t === undefined) return null;
    return { valor: t.delta.valor, tieneMandato: t.ganaMandato };
  });
}

/**
 * El techo de la rampa. Nunca cero: dividir por cero pintaría todo el país del
 * color más intenso justo cuando no hay nada que mostrar.
 */
export function maximoDe(coleccion: ColeccionProvincias | null): number {
  if (coleccion === null) return 1;
  return Math.max(1, ...coleccion.features.map((f) => Math.abs(f.properties.valor)));
}
