import { useQuery } from '@tanstack/react-query';
import { vinculoFichaTareaSchema } from '@v2/shared';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';

import { FormularioGestion } from './Formulario';
import { SelectorFicha } from './SelectorFicha';

import type { FichaElegible } from '@v2/shared';

import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';

function ElegirDestino({
  ruta,
  revision,
  actual,
  usuarioId,
}: {
  ruta: string;
  revision: number;
  actual: { fichaId: string; titulo: string } | null;
  usuarioId: number;
}) {
  const [seleccion, elegir] = useState<FichaElegible | null>(
    actual ? { id: actual.fichaId, titulo: actual.titulo, territorio: null } : null,
  );
  return (
    <details>
      <summary className="min-h-11 cursor-pointer underline">Elegir ficha de devolución</summary>
      <p className="my-3">
        Elegí una ficha que puedas editar antes de publicar evidencia. Después de cambiar el
        destino, actualizá los cuadernos de campo descargados.
      </p>
      <SelectorFicha usuarioId={usuarioId} seleccion={seleccion} elegir={elegir} />
      <p className="mt-3 font-semibold">
        Destino al guardar: {seleccion?.titulo ?? 'sin ficha vinculada'}.
      </p>
      <FormularioGestion
        key={seleccion?.id ?? 'sin-ficha'}
        ruta={ruta}
        revision={revision}
        campos={[
          {
            clave: 'confirmado',
            etiqueta: seleccion
              ? 'Revisé la ficha elegida y quiero vincular esta tarea.'
              : 'Quiero dejar esta tarea sin ficha de devolución.',
            tipo: 'checkbox',
          },
        ]}
        boton="Guardar destino"
        preparar={(v, r) => {
          if (!v.confirmado) throw new Error('Revisá el destino.');
          return vinculoFichaTareaSchema.parse({ ...r, fichaId: seleccion?.id ?? null });
        }}
      />
    </details>
  );
}

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
  const auth = useAuth();
  const ruta = `/${id}/tareas/${tareaId}/ficha`;
  const q = useQuery({
    queryKey: ['gestion-iniciativas', 'destino', id, tareaId],
    queryFn: () => api.get<{ fichaId: string; titulo: string } | null>('/api/iniciativas' + ruta),
  });
  const anterior = useRef(revision);
  const { refetch } = q;
  useEffect(() => {
    if (anterior.current === revision) return;
    anterior.current = revision;
    void refetch();
  }, [revision, refetch]);
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
      {administrar && auth.user && q.data !== undefined ? (
        <ElegirDestino
          key={`${ruta}:${auth.user.id}`}
          ruta={ruta}
          revision={revision}
          actual={q.data ?? null}
          usuarioId={auth.user.id}
        />
      ) : null}
    </div>
  );
}
