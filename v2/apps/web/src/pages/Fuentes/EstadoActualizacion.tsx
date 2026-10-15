import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

const intentoSchema = z.object({
  fecha: z.string().datetime(),
  estado: z.enum(['correcta', 'fallida']),
  detalle: z.string(),
});
export function EstadoActualizacion({ recurso }: { recurso: 'geo' | 'fuentes' }) {
  const intento = useQuery({
    queryKey: [recurso, 'ultimo-intento'],
    retry: false,
    queryFn: async ({ signal }) => {
      const respuesta = await fetch(`/${recurso}/ultimo-intento.json`, {
        signal,
        cache: 'no-store',
      });
      if (!respuesta.ok)
        throw new Error('No pudimos consultar el último intento de actualización.');
      return intentoSchema.parse(await respuesta.json());
    },
  });
  if (intento.isLoading)
    return (
      <p role="status" className="mt-4 text-sm">
        Consultando el estado de actualización…
      </p>
    );
  if (intento.isError)
    return (
      <p role="status" className="mt-4 text-sm">
        No pudimos consultar el último intento. La edición publicada sigue disponible; su estado de
        actualización no pudo comprobarse.
      </p>
    );
  if (intento.data?.estado !== 'fallida') return null;
  return (
    <p role="status" className="border-violeta mt-4 border-l-2 pl-4">
      Falló la actualización del {intento.data.fecha.slice(0, 10)}. Se conserva la edición válida
      mostrada aquí.{' '}
      <a href={`/${recurso}/ultimo-intento.json`} className="underline">
        Ver el motivo del intento
      </a>
      .
    </p>
  );
}
