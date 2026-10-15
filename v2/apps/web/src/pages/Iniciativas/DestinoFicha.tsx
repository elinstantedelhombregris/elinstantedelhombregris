import { useQuery } from '@tanstack/react-query';
import { vinculoFichaTareaSchema } from '@v2/shared';
import { Link } from 'wouter';

import { texto } from './campos';
import { FormularioGestion } from './Formulario';

import { api } from '~/lib/api';

export function DestinoFicha({
  id,
  tareaId,
  revision,
  administrar,
}: {
  id: number;
  tareaId: number;
  revision: number;
  administrar: boolean;
}) {
  const ruta = `/${id}/tareas/${tareaId}/ficha`;
  const q = useQuery({
    queryKey: ['gestion-iniciativas', 'destino', id, tareaId, revision],
    queryFn: () => api.get<{ fichaId: string; titulo: string } | null>('/api/iniciativas' + ruta),
  });
  return (
    <div className="space-y-3 text-sm">
      {q.isPending ? (
        <p>Cargando ficha de devolución…</p>
      ) : q.isError ? (
        <p role="alert">
          No pudimos consultar el destino.{' '}
          <button
            className="underline"
            onClick={() => {
              void q.refetch();
            }}
          >
            Reintentar
          </button>
        </p>
      ) : q.data ? (
        <p>
          Los resultados vuelven a{' '}
          <Link className="underline" href={`/fichas/${q.data.fichaId}#resultados-campo`}>
            {q.data.titulo}
          </Link>
          .
        </p>
      ) : (
        <p>Todavía no se eligió una ficha para devolver los resultados.</p>
      )}
      {administrar ? (
        <details>
          <summary className="cursor-pointer underline">Elegir ficha de devolución</summary>
          <p className="mt-3">
            Pegá el enlace de una ficha que puedas editar. Elegila antes de publicar evidencia. El
            cambio requiere actualizar los cuadernos de campo descargados.
          </p>
          <FormularioGestion
            ruta={ruta}
            revision={revision}
            campos={[
              {
                clave: 'ficha',
                etiqueta: 'Enlace o identificador de la ficha (vacío para quitar)',
              },
            ]}
            boton="Guardar destino"
            preparar={(v, r) => {
              const entrada = texto(v, 'ficha').trim();
              return vinculoFichaTareaSchema.parse({
                ...r,
                fichaId: entrada ? entrada.split('/fichas/').at(-1)?.split(/[?#]/)[0] : null,
              });
            }}
            onSuccess={() => {
              void q.refetch();
            }}
          />
        </details>
      ) : null}
    </div>
  );
}
