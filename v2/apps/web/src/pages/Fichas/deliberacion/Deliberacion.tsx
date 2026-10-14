import { Link } from 'wouter';

import { Intervencion } from './Intervencion';
import { NuevoArgumento } from './NuevoArgumento';
import { Proceso } from './Proceso';
import { Sintesis } from './Sintesis';

import type { FichaFuturo } from '@v2/shared';

import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { useDeliberacion } from '~/lib/queries/deliberacion';

export function Deliberacion({ ficha }: { ficha: FichaFuturo }) {
  const auth = useAuth();
  const q = useDeliberacion(ficha.id);
  const argumentos = q.data?.pages.flatMap((p) => p.argumentos) ?? [];
  const cuenta = q.data?.pages[0];
  const p = ficha.contenido.proceso;
  const hoy = new Date().toISOString().slice(0, 10);
  const abierta = p && p.inicio <= hoy && p.cierre >= hoy;
  return (
    <section
      id="conversacion"
      className="border-tinta mt-10 border-t-2 pt-8"
      aria-labelledby="titulo-conversacion"
    >
      <h2 id="titulo-conversacion" className="font-anton text-4xl">
        Conversar y construir acuerdos
      </h2>
      <Proceso ficha={ficha} />
      {cuenta ? (
        <p className="mt-6 text-sm">
          {cuenta.participantes} cuentas con intervenciones vigentes · {cuenta.total} intervenciones
          registradas, incluidas las retiradas. Una persona puede usar más de una cuenta; este
          recuento no mide representatividad.
        </p>
      ) : null}
      {q.isPending ? (
        <p className="mt-4" role="status">
          Consultando la conversación…
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
          Reintentar conversación
        </button>
      ) : null}
      {cuenta?.total === 0 ? <p className="mt-4">Todavía no hay intervenciones.</p> : null}
      <ul className="mt-5 space-y-4">
        {argumentos.map((a) => (
          <Intervencion key={a.id} argumento={a} ficha={ficha} />
        ))}
      </ul>
      {q.hasNextPage ? (
        <button
          className="mt-3 min-h-11 underline"
          disabled={q.isFetchingNextPage}
          onClick={() => {
            void q.fetchNextPage();
          }}
        >
          Cargar más intervenciones
        </button>
      ) : null}
      {p ? (
        abierta ? (
          auth.user ? (
            <NuevoArgumento ficha={ficha} argumentos={argumentos} />
          ) : (
            <Link
              className="mt-4 inline-flex min-h-11 underline"
              href={hrefIngresar(`/fichas/${ficha.id}#conversacion`)}
            >
              Ingresar para intervenir
            </Link>
          )
        ) : (
          <p className="mt-5">
            {hoy < p.inicio
              ? `La conversación abre el ${p.inicio}.`
              : `El período de intervenciones cerró el ${p.cierre}. La síntesis sigue disponible para revisión.`}
          </p>
        )
      ) : null}
      <Sintesis ficha={ficha} argumentos={argumentos} />
    </section>
  );
}
