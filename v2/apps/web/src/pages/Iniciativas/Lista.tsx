import type { ReactNode } from 'react';

import { useGestionLista } from '~/lib/queries/gestion-iniciativas';

// T vincula el DTO de la consulta interna con el render de cada fila.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function ListaGestion<T>({
  ruta,
  children,
  vacio = 'Todavía no hay registros.',
  actualizar,
}: {
  ruta: string;
  children: (item: T) => ReactNode;
  vacio?: string;
  actualizar?: string;
}) {
  const q = useGestionLista<T>(ruta, true, actualizar ? 0 : Number.POSITIVE_INFINITY);
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <div className="mt-5 space-y-5">
      {actualizar ? (
        <button
          className="min-h-11 underline"
          type="button"
          disabled={q.isFetching}
          onClick={() => {
            void q.refetch();
          }}
        >
          {actualizar}
        </button>
      ) : null}
      {q.isPending ? <p role="status">Cargando…</p> : null}
      {q.isError ? (
        <div role="alert">
          <p>No pudimos actualizar. Conservamos los registros cargados.</p>
          <button
            className="min-h-11 underline"
            onClick={() => {
              if (q.isFetchNextPageError) void q.fetchNextPage();
              else void q.refetch();
            }}
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {!q.isPending && !q.isError && !items.length ? <p>{vacio}</p> : null}
      {items.map(children)}
      {q.hasNextPage ? (
        <button
          className="min-h-11 underline"
          disabled={q.isFetching}
          onClick={() => {
            void q.fetchNextPage();
          }}
        >
          Cargar más
        </button>
      ) : null}
    </div>
  );
}
