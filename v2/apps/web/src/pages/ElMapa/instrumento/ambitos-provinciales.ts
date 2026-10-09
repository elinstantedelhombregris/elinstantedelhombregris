import { claseDeCategoria } from '../el-mapa-data';

import type { LecturaMapa } from '~/lib/queries/civic-map';
import type { ProvinciaApi } from '~/lib/queries/open-data';
import type { ClaseSenal } from '~/lib/vocabulario';

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
