import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

import {
  COLOR_DEL_BORDE_PROVINCIAL,
  COLOR_DEL_VELO_PROVINCIAL,
  LEYENDA_DEL_VELO,
  pintarAmbitos,
} from './ambitos-provinciales';

import type { ColeccionProvincial } from './ambitos-provinciales';
import type { LecturaMapa } from '~/lib/queries/civic-map';
import type { ClaseSenal } from '~/lib/vocabulario';

import { useProvincias } from '~/lib/queries/open-data';

export function LeyendaDelVelo() {
  return (
    <div className="border-oscuro-borde bg-oscuro-barra/95 flex max-w-[min(260px,calc(100vw-5rem))] items-start gap-2 border p-2.5 backdrop-blur">
      <span
        aria-hidden
        className="mt-0.5 h-3 w-3 shrink-0 border"
        style={{
          backgroundColor: `${COLOR_DEL_VELO_PROVINCIAL}33`,
          borderColor: COLOR_DEL_BORDE_PROVINCIAL,
        }}
      />
      <p className="text-oscuro-secundario text-[12px] leading-snug">{LEYENDA_DEL_VELO}</p>
    </div>
  );
}

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
          'fill-color': COLOR_DEL_VELO_PROVINCIAL,
          'fill-opacity': ['case', ['>', ['get', 'total'], 0], 0.14, 0],
        }}
      />
      <Layer
        id="ambitos-provincia-borde"
        type="line"
        paint={{
          'line-color': COLOR_DEL_BORDE_PROVINCIAL,
          'line-width': ['case', ['>', ['get', 'total'], 0], 1.5, 0],
          'line-opacity': 0.65,
        }}
      />
    </Source>
  );
}
