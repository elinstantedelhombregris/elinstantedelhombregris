import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

import type { PaginaGestion, ResultadoFichaCampo } from '@v2/shared';

import { api } from '~/lib/api';

export function ResultadosCampo({ id }: { id: string }) {
  const q = useInfiniteQuery({
    queryKey: ['resultados-campo', id],
    initialPageParam: null as number | null,
    queryFn: ({ pageParam }) =>
      api.get<PaginaGestion<ResultadoFichaCampo>>(
        `/api/fichas/${id}/resultados-campo${pageParam ? `?cursor=${pageParam}` : ''}`,
      ),
    getNextPageParam: (p) => p.siguiente,
    staleTime: 0,
  });
  return (
    <section id="resultados-campo" className="mt-9 space-y-4 border-t pt-7">
      <h2 className="font-anton text-2xl">Lo que volvió del territorio</h2>
      <p>
        Resultados de tareas vinculadas a esta ficha. Una revisión describe su alcance y sus
        límites; no demuestra por sí sola que se alcanzó el futuro deseado.
      </p>
      {q.isPending ? <p role="status">Cargando resultados…</p> : null}
      {q.isError ? (
        <p role="alert">
          No pudimos actualizar los resultados.{' '}
          <button
            className="min-h-11 underline"
            onClick={() => {
              void q.refetch();
            }}
          >
            Reintentar
          </button>
        </p>
      ) : null}
      {!q.isPending && !q.isError && !q.data.pages.some((p) => p.items.length) ? (
        <p>Todavía no hay resultados de campo vinculados.</p>
      ) : null}
      {q.data?.pages
        .flatMap((p) => p.items)
        .map((r) => (
          <article key={r.id} className="border-tinta space-y-3 border p-4">
            <p className="text-sm">
              {r.retirada
                ? 'Resultado retirado'
                : r.revisada
                  ? 'Revisado por otra persona'
                  : 'Pendiente de revisión independiente'}
            </p>
            {!r.retirada ? (
              <>
                <h3 className="font-semibold">{r.titulo}</h3>
                <p className="whitespace-pre-wrap break-words">{r.texto}</p>
                {r.url ? (
                  <a className="underline" href={r.url} rel="noopener noreferrer" target="_blank">
                    Ver fuente
                  </a>
                ) : null}
                {r.resultadoEscucha ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      {r.resultadoEscucha.desde} a {r.resultadoEscucha.hasta} ·{' '}
                      {r.resultadoEscucha.observaciones} observaciones
                    </p>
                    <p>Quiénes faltaron: {r.resultadoEscucha.ausencias}</p>
                    <p>Límites: {r.resultadoEscucha.limites}</p>
                    <p>Próximo paso: {r.resultadoEscucha.proximoPaso}</p>
                  </div>
                ) : null}
                {r.revisada ? (
                  <p>
                    Revisión de {r.firmaRevision}: {r.notaRevision}
                  </p>
                ) : null}
              </>
            ) : (
              <p>
                Su contenido dejó de estar disponible. Revisá las conclusiones que dependían de este
                resultado.
              </p>
            )}
            <Link
              className="inline-flex min-h-11 items-center underline"
              href={`/iniciativas/${r.iniciativaSlug}?seccion=tareas&tarea=${r.tareaId}`}
            >
              Ver tarea: {r.tareaTitulo}
            </Link>
          </article>
        ))}
      {q.hasNextPage ? (
        <button
          className="min-h-11 underline"
          disabled={q.isFetching}
          onClick={() => {
            void q.fetchNextPage();
          }}
        >
          Cargar más resultados
        </button>
      ) : null}
    </section>
  );
}
