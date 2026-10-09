import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';

export function Avisos() {
  const auth = useAuth();
  const q = useQuery({
    queryKey: ['avisos-civicos', auth.user?.id],
    queryFn: () =>
      api.get<
        { id: string; titulo: string; href: string; leidoEn: string | null; fecha: string }[]
      >('/api/v1/mi-espacio/avisos'),
  });
  const op = useOperacionPersonal();
  return (
    <section aria-labelledby="titulo-avisos">
      <h2 id="titulo-avisos" className="font-anton text-3xl">
        Avisos
      </h2>
      <ErrorOperacion mensaje={q.error?.message ?? op.error?.message} />
      <ul className="mt-6 divide-y border-y">
        {q.data?.map((a) => (
          <li key={a.id} className="py-5">
            <Link href={a.href} className="text-violeta underline">
              {a.titulo}
            </Link>
            <p className="mt-2 text-sm">{new Date(a.fecha).toLocaleString('es-AR')}</p>
            {!a.leidoEn ? (
              <BotonAccion
                tono="papel"
                className="mt-3"
                onClick={() => {
                  op.mutate({ metodo: 'post', ruta: `/api/v1/mi-espacio/avisos/${a.id}/leido` });
                }}
              >
                Marcar como leído
              </BotonAccion>
            ) : null}
          </li>
        ))}
      </ul>
      {q.data?.length === 0 ? (
        <Nota>Cuando una campaña o ficha que seguís tenga novedades, las vas a ver acá.</Nota>
      ) : null}
      <Link
        href="/notificaciones"
        className="text-violeta mt-5 inline-flex min-h-11 items-center underline"
      >
        Ver otros avisos de mi actividad
      </Link>
    </section>
  );
}
