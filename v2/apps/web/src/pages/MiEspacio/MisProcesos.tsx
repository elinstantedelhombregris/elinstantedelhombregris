import { Link } from 'wouter';

import type { EspacioPersonal } from '@v2/shared';

/**
 * Las fichas y campañas que la persona abrió o donde aceptó colaborar.
 *
 * Armar una ficha es un paso avanzado: el enlace aparece recién cuando ya hay al
 * menos un aporte. «Gestionar mis campañas» es solo de quien administra.
 */
export function MisProcesos({
  procesos,
  puedeArmarFicha,
  esAdmin,
}: {
  procesos: NonNullable<EspacioPersonal['procesos']>;
  puedeArmarFicha: boolean;
  esAdmin: boolean;
}) {
  if (!procesos.length && !puedeArmarFicha && !esAdmin) return null;
  return (
    <section aria-labelledby="titulo-procesos" className="mt-10 border-t pt-6">
      <h3 id="titulo-procesos" className="font-anton text-3xl">
        Fichas y campañas a mi cargo
      </h3>
      <p className="mt-3 text-sm">
        Las que abriste vos o donde aceptaste colaborar. Una invitación no te atribuye los aportes
        de otras personas.
      </p>
      {procesos.length ? (
        <ul className="mt-5 divide-y">
          {procesos.map((p) => (
            <li key={p.tipo + p.id} className="py-4">
              <Link className="text-violeta underline" href={p.href}>
                {p.titulo}
              </Link>
              <p className="text-tinta-50 mt-2 text-sm">
                {/* Una ficha tiene versiones; una campaña, ediciones. */}
                {p.tipo === 'ficha' ? 'Ficha · versión' : 'Campaña · edición'} {p.revision}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-tinta-50 mt-4 text-sm">
          Todavía no tenés fichas ni campañas a tu cargo.
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-5">
        {puedeArmarFicha ? (
          <Link
            className="text-violeta inline-flex min-h-11 items-center underline"
            href="/fichas/nueva"
          >
            Armar una ficha nueva
          </Link>
        ) : null}
        {esAdmin ? (
          <Link
            className="text-violeta inline-flex min-h-11 items-center underline"
            href="/gestion/campanas"
          >
            Gestionar mis campañas
          </Link>
        ) : null}
      </div>
    </section>
  );
}
