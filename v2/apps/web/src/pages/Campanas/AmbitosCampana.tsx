import { useQueries } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { Link } from 'wouter';

import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';

import { api } from '~/lib/api';

export function AmbitosCampana({ ids, enlaces = false }: { ids: number[]; enlaces?: boolean }) {
  const visibles = [...new Set(ids)].slice(0, 3);
  const lugares = useQueries({
    queries: visibles.map((id) => ({
      queryKey: ['geo', 'lugar', id],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        api.get<LugarMapa>(`/api/v1/geo/lugares/${id}`, { signal }),
      staleTime: 300_000,
    })),
  });
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!ids.length
        ? 'Todo el país'
        : visibles.map((id, i) => {
            const nombre =
              lugares[i]?.data?.name ??
              (lugares[i]?.isError ? 'Ámbito por verificar' : 'Consultando el lugar…');
            return (
              <span key={id}>
                {i ? ' · ' : ''}
                {enlaces ? (
                  <Link href={`/el-mapa?lugar=${id}`} className="underline underline-offset-4">
                    {nombre}
                  </Link>
                ) : (
                  nombre
                )}
              </span>
            );
          })}
      {ids.length > visibles.length ? (
        <span>y {ids.length - visibles.length} ámbitos más</span>
      ) : null}
    </span>
  );
}
