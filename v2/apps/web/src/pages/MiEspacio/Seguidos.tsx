import { Link } from 'wouter';

import type { EspacioPersonal } from '@v2/shared';

import { BotonAccion, EnlaceAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useOperacionPersonal } from '~/lib/queries/participacion';

export function Seguidos({ espacio }: { espacio: EspacioPersonal }) {
  const op = useOperacionPersonal();
  return (
    <section aria-labelledby="titulo-seguidos">
      <h2 id="titulo-seguidos" className="font-anton text-3xl">
        Lo que sigo
      </h2>
      <p className="mt-3">
        Seguir una campaña o una ficha es una elección privada. No cuenta como apoyo ni como voto.
      </p>
      <ErrorOperacion mensaje={op.error?.message} />
      <ul className="mt-6 divide-y border-y">
        {espacio.seguimientos.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <Link href={s.href} className="text-violeta underline">
              {s.titulo}
            </Link>
            <BotonAccion
              tono="papel"
              disabled={op.isPending}
              onClick={() => {
                op.mutate({ metodo: 'delete', ruta: `/api/v1/mi-espacio/seguimientos/${s.id}` });
              }}
            >
              Dejar de seguir
            </BotonAccion>
          </li>
        ))}
      </ul>
      {!espacio.seguimientos.length ? (
        <Nota>
          Todavía no seguís nada. Cuando encuentres una campaña o una ficha que te interese, podés
          seguirla desde su página.
        </Nota>
      ) : null}
      <EnlaceAccion href="/campanas">Explorar campañas</EnlaceAccion>
    </section>
  );
}
