import { useQuery } from '@tanstack/react-query';
import { archivoGeografico, GEOGRAFIA } from '@v2/shared';
import { z } from 'zod';

const punto = z.array(z.number().finite()).min(2);
const poligono = z.array(z.array(punto).min(3)).min(1);
const coleccion = z.object({
  type: z.literal('FeatureCollection'),
  features: z
    .array(
      z.object({
        type: z.literal('Feature'),
        properties: z.object({ name: z.string().min(1) }),
        geometry: z.discriminatedUnion('type', [
          z.object({ type: z.literal('Polygon'), coordinates: poligono }),
          z.object({ type: z.literal('MultiPolygon'), coordinates: z.array(poligono).min(1) }),
        ]),
      }),
    )
    .min(1),
});

/** Una sola descarga validada para ámbitos y análisis. */
export function useGeometriaProvincial() {
  return useQuery({
    queryKey: ['geometria-provincias', GEOGRAFIA.version],
    staleTime: Infinity,
    retry: false,
    queryFn: async ({ signal }) => {
      const respuesta = await fetch(archivoGeografico('provincias'), { signal });
      if (!respuesta.ok) throw new Error('No pudimos cargar los límites provinciales.');
      return coleccion.parse(await respuesta.json());
    },
  });
}
