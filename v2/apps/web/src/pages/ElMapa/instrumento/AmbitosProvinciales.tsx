import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

import { pintarAmbitos } from './ambitos-provinciales';
import { COLOR_CLASE } from './paleta';

import type { ColeccionProvincial } from './ambitos-provinciales';
import type { LecturaMapa } from '~/lib/queries/civic-map';
import type { ClaseSenal } from '~/lib/vocabulario';

import { useProvincias } from '~/lib/queries/open-data';

export function AmbitosProvinciales({
  resumen,
  clases,
}: {
  resumen: LecturaMapa['metadata'] | undefined;
  clases: ReadonlySet<ClaseSenal>;
}) {
  const provincias = useProvincias();
  const geometria = useQuery({
    queryKey: ['geometria-provincias'],
    staleTime: Infinity,
    queryFn: async ({ signal }) => {
      const r = await fetch('/geo/provincias.geojson', { signal });
      if (!r.ok) throw new Error('La geometría provincial no está disponible.');
      return (await r.json()) as ColeccionProvincial;
    },
  });
  const datos = useMemo(
    () =>
      geometria.data ? pintarAmbitos(geometria.data, resumen, provincias.data ?? [], clases) : null,
    [geometria.data, resumen, provincias.data, clases],
  );
  if (!datos) return null;
  return (
    <Source id="ambitos-provinciales" type="geojson" data={datos}>
      <Layer
        id="ambitos-provincia-relleno"
        type="fill"
        paint={{
          'fill-color': COLOR_CLASE.deseo,
          'fill-opacity': ['case', ['>', ['get', 'total'], 0], 0.2, 0],
        }}
      />
      <Layer
        id="ambitos-provincia-borde"
        type="line"
        paint={{
          'line-color': COLOR_CLASE.deseo,
          'line-width': ['case', ['>', ['get', 'total'], 0], 1.5, 0],
          'line-opacity': 0.65,
        }}
      />
    </Source>
  );
}
