import { useInfiniteQuery } from '@tanstack/react-query';

import type { ContenidoSintesisNacional, PaginaGestion, ResultadoFichaCampo } from '@v2/shared';

import { api } from '~/lib/api';

type Ref = ContenidoSintesisNacional['referencias'][number];
export function ElegirResultado({
  referencia: r,
  cambiar,
}: {
  referencia: Ref;
  cambiar: (v: Ref['resultadoCampo']) => void;
}) {
  const q = useInfiniteQuery({
    queryKey: ['resultados-campo', r.fichaId],
    initialPageParam: null as number | null,
    queryFn: ({ pageParam, signal }) =>
      api.get<PaginaGestion<ResultadoFichaCampo>>(
        `/api/fichas/${r.fichaId}/resultados-campo${pageParam ? `?cursor=${pageParam}` : ''}`,
        { signal },
      ),
    getNextPageParam: (p) => p.siguiente,
  });
  const resultados =
    q.data?.pages.flatMap((p) => p.items).filter((e) => e.revisada && !e.retirada && e.revision) ??
    [];
  return (
    <div className="mt-3">
      <label className="grid gap-2">
        Resultado revisado
        <select
          required
          className="border-tinta w-full border bg-transparent p-3"
          value={r.resultadoCampo?.id ?? ''}
          onChange={(e) => {
            const v = resultados.find((r) => r.id === Number(e.target.value));
            cambiar(v?.revision ? { id: v.id, revision: v.revision } : null);
          }}
        >
          <option value="">Elegí un resultado de esta ficha</option>
          {resultados.map((e) => (
            <option key={e.id} value={e.id}>
              {e.titulo} · revisión {e.revision}
            </option>
          ))}
        </select>
      </label>
      {q.isPending && <p>Cargando resultados…</p>}
      {q.isError && (
        <p role="alert">
          No pudimos consultar los resultados.{' '}
          <button type="button" className="min-h-11 underline" onClick={() => void q.refetch()}>
            Reintentar
          </button>
        </p>
      )}
      {q.hasNextPage && (
        <button type="button" className="min-h-11 underline" onClick={() => void q.fetchNextPage()}>
          Cargar más resultados
        </button>
      )}
      <p className="mt-2 text-sm">
        La revisión del resultado no prueba por sí sola que el objetivo se haya alcanzado.
      </p>
    </div>
  );
}
