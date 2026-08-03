import { Layer, Source } from 'react-map-gl/maplibre';

import { BORDE } from '../paleta';

import type { ColeccionProvincias } from './coropletico';

/**
 * El relleno del coroplético, compartido por los dos lados de la cortina y por
 * la lente Diferencia.
 *
 * Las provincias sin dato se pintan con el borde del chrome y no con el primer
 * color de la rampa: el gris tiene que leerse como «no sé», no como «poco».
 */
export function CapaProvincias({
  id,
  datos,
  maximo,
  colores,
  opacidad = 0.85,
}: {
  id: string;
  datos: ColeccionProvincias;
  maximo: number;
  colores: readonly string[];
  opacidad?: number;
}) {
  /** La rampa se arma en pasos parejos entre 0 y el máximo. */
  const escalones = colores.flatMap((color, i) =>
    i === 0 ? [] : [(maximo * i) / (colores.length - 1), color],
  );

  return (
    <Source id={id} type="geojson" data={datos}>
      <Layer
        id={`${id}-relleno`}
        type="fill"
        paint={{
          'fill-color': [
            'case',
            ['==', ['get', 'sinDato'], 1],
            BORDE,
            ['interpolate', ['linear'], ['abs', ['get', 'valor']], 0, colores[0] ?? BORDE, ...escalones],
          ],
          'fill-opacity': opacidad,
        }}
      />
      <Layer
        id={`${id}-borde`}
        type="line"
        paint={{
          // El territorio con mandato se marca con el borde, no con el relleno:
          // cambiarle el color rompería la lectura de la rampa justo donde se
          // está mirando.
          'line-color': ['case', ['==', ['get', 'tieneMandato'], 1], '#F2EFE7', '#5C594F'],
          'line-width': ['case', ['==', ['get', 'tieneMandato'], 1], 2.2, 0.7],
        }}
      />
    </Source>
  );
}
