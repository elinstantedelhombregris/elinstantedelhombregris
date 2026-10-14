import { useInfiniteQuery } from '@tanstack/react-query';
import { vinculoReservaSchema } from '@v2/shared';
import { useState } from 'react';
import { Link } from 'wouter';

import { ESTADOS_RESERVA } from '../Capacidades/estados';

import { FormularioGestion } from './Formulario';

import type { RecursosTarea, TareaIniciativa } from '@v2/shared';

import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';

export function RecursosTareaPanel({ id, t }: { id: number; t: TareaIniciativa }) {
  const { user } = useAuth();
  const [disponibles, setDisponibles] = useState(false);
  const q = useInfiniteQuery({
    queryKey: ['recursos-tarea', id, t.id, disponibles, user?.id],
    enabled: Boolean(user),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api.get<RecursosTarea>(
        `/api/iniciativas/${id}/tareas/${t.id}/recursos?${new URLSearchParams({ ...(disponibles ? { disponibles: 'si' } : {}), ...(pageParam ? { despues: pageParam } : {}) })}`,
        { signal },
      ),
    getNextPageParam: (p) => p.siguiente ?? undefined,
  });
  if (!user) return <p>Ingresá para consultar las reservas en las que participás.</p>;
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <section className="space-y-3">
      <h4 className="font-semibold">Recursos acordados para esta tarea</h4>
      <p className="text-sm">
        Solo ves tus acuerdos como solicitante u oferente. Otros integrantes pueden tener reservas
        que no aparecen acá. Recibir recursos no confirma el resultado de la tarea.
      </p>
      <button
        className="min-h-11 underline"
        onClick={() => {
          setDisponibles(!disponibles);
        }}
      >
        {disponibles ? 'Ver vinculadas' : 'Vincular una de mis reservas aceptadas'}
      </button>
      {q.isPending ? <p role="status">Consultando reservas…</p> : null}
      {q.isError ? (
        <div role="alert">
          No pudimos actualizar las reservas.{' '}
          <button
            className="min-h-11 underline"
            onClick={() => {
              void q.refetch();
            }}
          >
            Reintentar lectura
          </button>
        </div>
      ) : null}
      {!q.isPending && !q.isError && !items.length ? (
        <p>
          {disponibles
            ? 'No tenés reservas elegibles. Primero acordá una en Capacidades; necesitás administrar la tarea o tenerla asignada.'
            : 'No tenés reservas vinculadas a esta tarea.'}
        </p>
      ) : null}
      {items.map((r) => (
        <article key={r.id} className="border-tinta/30 space-y-2 border p-4">
          <h5 className="font-semibold">{r.titulo}</h5>
          <p>
            {ESTADOS_RESERVA[r.estado]} · {r.paraFecha}
          </p>
          <p>
            {r.cantidad === null
              ? 'Cantidad por evaluación'
              : `Acordadas: ${r.cantidad} ${r.unidad}`}
          </p>
          {r.cantidadDeclarada !== null ? (
            <p>
              {r.estado === 'entregada'
                ? 'Recepción confirmada'
                : 'Entrega declarada, pendiente de recepción'}
              : {r.cantidadDeclarada} {r.unidad}.
            </p>
          ) : null}
          <Link className="underline" href={`/capacidades/${r.capacidadId}`}>
            Consultar acuerdo y recepción
          </Link>
          {r.soySolicitante ? (
            <FormularioGestion
              ruta={`/${id}/tareas/${t.id}/recursos`}
              revision={r.revision}
              campos={[]}
              boton={disponibles ? 'Vincular reserva completa' : 'Desvincular de esta tarea'}
              preparar={(_v, recibo) =>
                vinculoReservaSchema.parse({
                  idLocal: recibo.idLocal,
                  reservaId: r.id,
                  revisionReserva: recibo.revision,
                  revisionTarea: t.revision,
                  accion: disponibles ? 'vincular' : 'desvincular',
                })
              }
            />
          ) : null}
        </article>
      ))}
      {q.hasNextPage ? (
        <button
          className="min-h-11 underline"
          disabled={q.isFetchingNextPage}
          onClick={() => {
            void q.fetchNextPage();
          }}
        >
          Ver más reservas
        </button>
      ) : null}
      <p className="text-sm">
        Una reserva completa puede abastecer una sola tarea. Desvincularla conserva el acuerdo y su
        cantidad comprometida.
      </p>
      <Link href="/capacidades" className="underline">
        Buscar o gestionar capacidades
      </Link>
    </section>
  );
}
