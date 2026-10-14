import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

import { fechaCampana } from './Campanas/presentacion';
import { rotuloDePrueba } from './Fichas/presentacion';

import type { PaginaAccionesIniciativa } from '@v2/shared';

import { Button } from '~/components/ui/button';
import { api } from '~/lib/api';

export function IniciativaAcciones({ slug }: { slug: string }) {
  const q = useInfiniteQuery({
    queryKey: ['acciones-iniciativa', slug],
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) =>
      api.get<PaginaAccionesIniciativa>(
        `/api/iniciativas/${encodeURIComponent(slug)}/acciones${pageParam ? `?cursor=${pageParam}` : ''}`,
      ),
    getNextPageParam: (p) => p.siguiente ?? undefined,
  });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <section aria-labelledby="acciones-titulo" className="mb-8 space-y-5">
      <h2 id="acciones-titulo" className="font-serif text-2xl">
        Acciones que nacen de una ficha
      </h2>
      <p className="text-muted-foreground text-sm">
        Cada tarea conserva la alternativa que la originó. La responsabilidad se acepta desde la
        prueba; observar y revisar resultados son pasos posteriores a realizarla.
      </p>
      {q.isPending ? <p role="status">Cargando acciones…</p> : null}
      {q.isError ? (
        <div role="alert">
          <p>No pudimos actualizar las acciones. Conservamos las que ya se habían cargado.</p>
          <Button
            variant="secondary"
            onClick={() => {
              if (q.isFetchNextPageError) void q.fetchNextPage();
              else void q.refetch();
            }}
          >
            Reintentar acciones
          </Button>
        </div>
      ) : null}
      {!q.isPending && !q.isError && !items.length ? (
        <p>
          Todavía no hay acciones vinculadas. Quien organiza una prueba puede conectarla con esta
          iniciativa desde su ficha.
        </p>
      ) : null}
      <div className="space-y-4">
        {items.map((a) => (
          <article key={a.pruebaId} className="space-y-3 rounded-xl border border-white/15 p-5">
            <p className="text-sm font-semibold">{rotuloDePrueba(a.estado)}</p>
            <h3 className="font-serif text-xl">{a.titulo}</h3>
            <p className="whitespace-pre-wrap">{a.alcance}</p>
            <p>Responsabilidad aceptada: {a.responsableNombre ?? 'pendiente'}.</p>
            <p>Revisión prevista: {fechaCampana(a.plazo)}.</p>
            {a.plazo < new Date().toISOString().slice(0, 10) &&
            a.estado !== 'resultado_revisado' ? (
              <p className="text-sm">
                La fecha prevista ya pasó; falta registrar la revisión. Esto no determina
                incumplimiento.
              </p>
            ) : null}
            <p>
              Hito: {a.hito} · {a.revisionRealizada ? 'revisión registrada' : 'pendiente'}.
            </p>
            <p className="whitespace-pre-wrap">Recursos y condiciones: {a.recursos}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link className="text-iris-violet underline" href={`/fichas/${a.fichaId}`}>
                Ver alternativa, pasos y evidencia
              </Link>
              <Link
                className="text-iris-violet underline"
                href={`/capacidades?fichaId=${a.fichaId}`}
              >
                Buscar capacidades para esta ficha
              </Link>
            </div>
          </article>
        ))}
      </div>
      {q.hasNextPage ? (
        <Button
          variant="secondary"
          disabled={q.isFetching}
          onClick={() => {
            void q.fetchNextPage();
          }}
        >
          Cargar más acciones
        </Button>
      ) : null}
    </section>
  );
}
