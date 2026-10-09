import { Link } from 'wouter';

import { BotonAccion, ErrorOperacion } from './Elementos';

import type { SeguimientoTipo } from '@v2/shared';

import { useAuth } from '~/lib/auth/use-auth';
import { useMiEspacio, useOperacionPersonal } from '~/lib/queries/participacion';

export function Seguir({ tipo, objeto }: { tipo: SeguimientoTipo; objeto: string }) {
  const auth = useAuth();
  const espacio = useMiEspacio(auth.user?.id);
  const op = useOperacionPersonal();
  const seguido = espacio.data?.seguimientos.find((s) => s.tipo === tipo && s.objeto === objeto);
  if (!auth.user)
    return (
      <Link href="/ingresar" className="text-violeta inline-flex min-h-11 items-center underline">
        Ingresar para seguir este proceso
      </Link>
    );
  return (
    <div>
      <BotonAccion
        tono="papel"
        disabled={op.isPending}
        onClick={() => {
          op.mutate(
            seguido
              ? { metodo: 'delete', ruta: `/api/v1/mi-espacio/seguimientos/${seguido.id}` }
              : {
                  metodo: 'post',
                  ruta: '/api/v1/mi-espacio/seguimientos',
                  cuerpo: { tipo, objeto },
                },
          );
        }}
      >
        {seguido ? 'Dejar de seguir' : 'Seguir este proceso'}
      </BotonAccion>
      <ErrorOperacion mensaje={op.error?.message} />
    </div>
  );
}
