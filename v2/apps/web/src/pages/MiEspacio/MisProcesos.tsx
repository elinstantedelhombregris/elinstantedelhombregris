import { Link } from 'wouter';

import type { EspacioPersonal } from '@v2/shared';
export function MisProcesos({ procesos }: { procesos: NonNullable<EspacioPersonal['procesos']> }) {
  return (
    <section className="mt-10 border-t pt-6">
      <h3 className="font-anton text-3xl">Los diseños que estás cuidando.</h3>
      <p className="mt-3 text-sm">
        Fichas y campañas que abriste o donde aceptaste colaborar. Una invitación no te atribuye las
        voces de otras personas.
      </p>
      {procesos.length ? (
        <ul className="mt-5 divide-y">
          {procesos.map((p) => (
            <li key={p.tipo + p.id} className="py-4">
              <Link className="text-violeta underline" href={p.href}>
                {p.titulo}
              </Link>
              <p className="text-tinta-50 mt-2 text-sm">
                {p.tipo === 'ficha' ? 'Ficha de futuro' : 'Campaña'} · revisión {p.revision}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-tinta-50 mt-4 text-sm">Todavía no hay procesos a tu cargo.</p>
      )}
      <div className="mt-5 flex flex-wrap gap-5">
        <Link
          className="text-violeta inline-flex min-h-11 items-center underline"
          href="/fichas/nueva"
        >
          Abrir una ficha
        </Link>
        <Link
          className="text-violeta inline-flex min-h-11 items-center underline"
          href="/gestion/campanas"
        >
          Gestionar mis campañas
        </Link>
      </div>
    </section>
  );
}
