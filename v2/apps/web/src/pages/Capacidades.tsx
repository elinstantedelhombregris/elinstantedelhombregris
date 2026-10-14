import { Link, useRoute, useSearch } from 'wouter';

import { DetalleCapacidad } from './Capacidades/DetalleCapacidad';
import { EjemploReserva } from './Capacidades/EjemploReserva';
import { NuevaCapacidad } from './Capacidades/NuevaCapacidad';
import { ResumenCapacidad } from './Capacidades/ResumenCapacidad';

import { ErrorOperacion, MarcoParticipacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { useCapacidades } from '~/lib/queries/capacidades';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

export function Capacidades() {
  useTituloDePagina('Capacidades y reservas');
  const [, params] = useRoute('/capacidades/:id');
  const search = useSearch();
  const q = new URLSearchParams(search);
  return (
    <MarcoParticipacion
      titulo="Capacidades y reservas"
      entrada="Conectá lo que hace falta con lo que alguien puede ofrecer. Revisá condiciones, acordá la reserva y confirmá qué se recibió."
      kicker="Del futuro deseado a la acción"
    >
      <nav className="mb-6 flex flex-wrap gap-4">
        <Link className="min-h-11 underline" href="/capacidades">
          Explorar ofertas
        </Link>
        <Link className="min-h-11 underline" href="/capacidades?propias=si">
          Mis ofertas y solicitudes
        </Link>
        <Link className="min-h-11 underline" href="/capacidades/ejemplo">
          Probar con un ejemplo
        </Link>
      </nav>
      {params?.id === 'ejemplo' ? (
        <EjemploReserva />
      ) : params?.id ? (
        <DetalleCapacidad key={params.id} id={params.id} fichaId={q.get('fichaId') ?? ''} />
      ) : (
        <Listado key={search} params={q} />
      )}
    </MarcoParticipacion>
  );
}
function Listado({ params }: { params: URLSearchParams }) {
  const auth = useAuth();
  const filtro = new URLSearchParams();
  for (const key of ['senalId', 'propias', 'territorioId']) {
    const v = params.get(key);
    if (v) filtro.set(key, v);
  }
  const q = useCapacidades(filtro.toString());
  const senal = params.get('senalId');
  const fichaId = params.get('fichaId');
  const ofertas = q.data?.pages.flatMap((p) => p.capacidades) ?? [];
  return (
    <>
      {fichaId ? (
        <p className="mb-4">
          Estás buscando capacidades para una ficha. Al abrir una oferta llevaremos su referencia a
          la solicitud.
        </p>
      ) : null}
      {params.has('propias') && !auth.user && !auth.isLoading ? (
        <Link
          href={hrefIngresar('/capacidades?propias=si')}
          className="inline-flex min-h-11 underline"
        >
          Ingresá para ver tus ofertas y solicitudes
        </Link>
      ) : null}
      {senal ? (
        <Link href={`/senal/${senal}`} className="inline-flex min-h-11 underline">
          Volver al aporte de origen
        </Link>
      ) : (
        <p>
          Para publicar una oferta, abrí un aporte propio de recurso o práctica desde{' '}
          <Link href="/mi-espacio" className="underline">
            Mi espacio
          </Link>
          . Si todavía no lo registraste,{' '}
          <Link href="/imaginar" className="underline">
            sumá tu aporte
          </Link>
          .
        </p>
      )}
      {q.isPending ? (
        <p role="status" className="mt-5">
          Consultando ofertas…
        </p>
      ) : null}
      <ErrorOperacion mensaje={q.error?.message} />
      {q.isError ? (
        <button
          className="min-h-11 underline"
          onClick={() => {
            void q.refetch();
          }}
        >
          Reintentar ofertas
        </button>
      ) : null}
      {!q.isPending && !q.isError && ofertas.length === 0 ? (
        <p className="mt-5">Todavía no hay ofertas para esta consulta.</p>
      ) : null}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {ofertas.map((c) => (
          <article key={c.id} className="border-tinta min-w-0 border p-5">
            <h2 className="font-anton break-words text-2xl">{c.titulo}</h2>
            <ResumenCapacidad c={c} />
            <Link
              href={`/capacidades/${c.id}${fichaId ? `?fichaId=${encodeURIComponent(fichaId)}` : ''}`}
              className="mt-3 inline-flex min-h-11 underline"
            >
              Ver condiciones y reservas →
            </Link>
          </article>
        ))}
      </div>
      {q.hasNextPage ? (
        <button
          className="mt-5 min-h-11 underline"
          disabled={q.isFetchingNextPage}
          onClick={() => {
            void q.fetchNextPage();
          }}
        >
          Cargar más ofertas
        </button>
      ) : null}
      {senal && params.get('ofrecer') === 'si' ? (
        auth.user ? (
          <NuevaCapacidad senalId={senal} />
        ) : (
          <Link
            className="mt-5 inline-flex min-h-11 underline"
            href={hrefIngresar(`/capacidades?${params.toString()}`)}
          >
            Ingresá con la cuenta autora para ofrecer
          </Link>
        )
      ) : null}
    </>
  );
}
