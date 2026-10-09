import { claseDeCategoria } from '../el-mapa-data';

import type { LecturaMapa } from '~/lib/queries/civic-map';
import type { ProvinciaApi } from '~/lib/queries/open-data';
import type { ClaseSenal } from '~/lib/vocabulario';

/**
 * El sombreado de una provincia con aportes NO es un color de clase: pintarla
 * del violeta de «deseo» le atribuía a toda la provincia un tipo de aporte que
 * nadie declaró (revisión del 9/10). Es un velo neutro, el mismo para todas, que
 * solo dice «acá hay aportes» y nunca «acá pasó».
 */
export const COLOR_DEL_VELO_PROVINCIAL = '#C9C5BA';
export const COLOR_DEL_BORDE_PROVINCIAL = '#8E8A82';

/** Qué significa el sombreado. Va como leyenda del modo Mapa, sobre el mapa. */
export const LEYENDA_DEL_VELO =
  'Sombreado: provincia con aportes, con o sin punto. No marca dónde pasó.';

interface Propiedades {
  name: string;
  provinceId: number | null;
  total: number;
}
type GeometriaProvincia =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] };
export interface ColeccionProvincial<P = { name: string }> {
  type: 'FeatureCollection';
  features: { type: 'Feature'; geometry: GeometriaProvincia; properties: P }[];
}
export function pintarAmbitos(
  geometria: ColeccionProvincial,
  resumen: LecturaMapa['metadata'] | undefined,
  provincias: readonly ProvinciaApi[],
  clases?: ReadonlySet<ClaseSenal>,
): ColeccionProvincial<Propiedades> {
  const ids = new Map(provincias.map((p) => [p.name, p.id]));
  const totales = new Map(
    resumen?.porProvincia.map((p) => [
      p.provinceId,
      clases
        ? p.tipos.reduce((n, t) => {
            const clase = claseDeCategoria(t.tipo);
            return n + (clase === null || clases.has(clase) ? t.total : 0);
          }, 0)
        : p.total,
    ]) ?? [],
  );
  return {
    type: 'FeatureCollection',
    features: geometria.features.map((f) => {
      const provinceId = ids.get(f.properties.name) ?? null;
      return {
        ...f,
        properties: {
          ...f.properties,
          provinceId,
          total: provinceId === null ? 0 : (totales.get(provinceId) ?? 0),
        },
      };
    }),
  };
}
