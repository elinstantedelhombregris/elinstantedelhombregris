import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { FichaElegible, PaginaFichasEditables } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';
import { api } from '~/lib/api';

export function SelectorFicha({
  usuarioId,
  seleccion,
  elegir,
}: {
  usuarioId: number;
  seleccion: FichaElegible | null;
  elegir: (f: FichaElegible | null) => void;
}) {
  const [texto, setTexto] = useState('');
  const [buscar, setBuscar] = useState('');
  const q = useInfiniteQuery({
    queryKey: ['fichas-editables', usuarioId, buscar],
    staleTime: 0,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api.get<PaginaFichasEditables>(
        `/api/v1/fichas/editables?${new URLSearchParams({ buscar, ...(pageParam ? { cursor: pageParam } : {}) })}`,
        { signal },
      ),
    getNextPageParam: (p) => p.siguiente ?? undefined,
  });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  const opciones =
    seleccion && !items.some((f) => f.id === seleccion.id) ? [seleccion, ...items] : items;
  return (
    <div className="space-y-3">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const proxima = texto.trim();
          if (proxima === buscar) void q.refetch();
          else setBuscar(proxima);
        }}
      >
        <label className="min-w-0 flex-1">
          Buscar entre tus fichas editables
          <input
            className={CAMPO}
            value={texto}
            type="search"
            maxLength={120}
            onChange={(e) => {
              setTexto(e.target.value);
            }}
          />
        </label>
        <button className="min-h-11 underline" type="submit">
          Buscar fichas
        </button>
      </form>
      {q.isPending ? <p role="status">Cargando fichas editables…</p> : null}
      {q.isError ? (
        <div role="alert">
          <p>No pudimos actualizar las fichas. Conservamos tu selección.</p>
          <button
            type="button"
            className="min-h-11 underline"
            onClick={() => {
              if (q.isFetchNextPageError) void q.fetchNextPage();
              else void q.refetch();
            }}
          >
            Reintentar fichas
          </button>
        </div>
      ) : null}
      {!q.isPending && !q.isError && items.length === 0 ? (
        <p>
          No hay fichas editables con esta búsqueda. Para vincular una, necesitás crearla o aceptar
          una invitación como editor.
        </p>
      ) : null}
      <label className="block">
        Ficha donde devolver los resultados
        <select
          className={CAMPO}
          value={seleccion?.id ?? ''}
          onChange={(e) => {
            elegir(opciones.find((f) => f.id === e.target.value) ?? null);
          }}
        >
          <option value="">Sin ficha vinculada</option>
          {opciones.map((f) => (
            <option key={f.id} value={f.id}>
              {f.titulo}
              {f.territorio ? ` · ${f.territorio}` : ''}
            </option>
          ))}
        </select>
      </label>
      {q.hasNextPage ? (
        <button
          className="min-h-11 underline"
          type="button"
          disabled={q.isFetching}
          onClick={() => {
            void q.fetchNextPage();
          }}
        >
          Cargar más fichas
        </button>
      ) : null}
      <p>
        La búsqueda no cambia el destino. Revisá tu selección y guardala para vincular la tarea.
      </p>
    </div>
  );
}
