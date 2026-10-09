import { Link } from 'wouter';

import { BotonConMotivo } from './BotonConMotivo';
import { ErrorOperacion } from './Elementos';

import type { SeguimientoTipo } from '@v2/shared';

import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { useMiEspacio, useOperacionPersonal } from '~/lib/queries/participacion';

/** Qué se sigue, con su artículo: «esta campaña», «este lugar». */
const OBJETOS: Record<SeguimientoTipo, string> = {
  campana: 'esta campaña',
  territorio: 'este lugar',
  ficha: 'esta ficha',
  tema: 'este tema',
};

export function Seguir({
  tipo,
  objeto,
  className,
}: {
  tipo: SeguimientoTipo;
  objeto: string;
  /** Clases del botón: para ponerlo del ancho de las acciones que lo rodean. */
  className?: string;
}) {
  const auth = useAuth();
  const espacio = useMiEspacio(auth.user?.id);
  const op = useOperacionPersonal();
  const seguido = espacio.data?.seguimientos.find((s) => s.tipo === tipo && s.objeto === objeto);
  const que = OBJETOS[tipo];
  if (!auth.user)
    return (
      <Link
        href={hrefIngresar()}
        className="text-violeta inline-flex min-h-11 items-center underline"
      >
        Ingresar para seguir {que}
      </Link>
    );
  const acabaDeSeguir = op.isSuccess && op.variables.metodo === 'post';
  const acabaDeDejar = op.isSuccess && op.variables.metodo === 'delete';
  return (
    <div>
      <BotonConMotivo
        tono="papel"
        motivo={null}
        {...(className ? { className } : {})}
        ocupado={op.isPending || espacio.isLoading}
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
        {seguido ? 'Dejar de seguir' : `Seguir ${que}`}
      </BotonConMotivo>
      <p role="status" className="text-tinta-75 mt-3 text-sm leading-relaxed">
        {seguido || acabaDeSeguir ? (
          <>
            Ya seguís {que}. Las novedades te llegan a{' '}
            <Link href="/mi-espacio" className="underline underline-offset-4">
              Mi espacio
            </Link>
            .
          </>
        ) : acabaDeDejar ? (
          `Dejaste de seguir ${que}.`
        ) : null}
      </p>
      <ErrorOperacion mensaje={op.error?.message} />
    </div>
  );
}
