import { useEffect, useRef } from 'react';

import { cantidadDe } from './presentacion';

import type { DisenoFicha } from '@v2/shared';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal, escribir } from '~/lib/queries/participacion';

type Afirmacion = DisenoFicha['afirmaciones'][number];

function textoDeRespuestas(a: Afirmacion): string {
  if (a.acuerdo === null)
    return a.respuestas === 0
      ? 'Todavía nadie respondió; el desglose público espera al menos cinco respuestas.'
      : `${cantidadDe(a.respuestas, 'respuesta', 'respuestas')}; el desglose público espera al menos cinco.`;
  const desacuerdos =
    a.desacuerdo === null
      ? '—'
      : cantidadDe(a.desacuerdo, 'desacuerdo', 'desacuerdos', 'ningún desacuerdo');
  const pases = a.paso === null ? '—' : cantidadDe(a.paso, 'pase', 'pases', 'ningún pase');
  return `${cantidadDe(a.acuerdo, 'acuerdo', 'acuerdos', 'ningún acuerdo')} · ${desacuerdos} · ${pases}.`;
}

export function TarjetaAfirmacion({
  afirmacion: a,
  registraExposicion,
  avisar,
}: {
  afirmacion: Afirmacion;
  registraExposicion: boolean;
  avisar: (texto: string) => void;
}) {
  const auth = useAuth();
  const op = useOperacionPersonal();
  const ref = useRef<HTMLLIElement>(null);
  const registrada = useRef<string | null>(null);
  useEffect(() => {
    if (!registraExposicion || !auth.user || a.miExpuesta || !ref.current) return;
    const clave = `${auth.user.id}:${a.id}`;
    if (registrada.current === clave) return;
    const registrar = () => {
      registrada.current = clave;
      void escribir('post', `/api/v1/fichas/afirmaciones/${a.id}/exposicion`).catch(() => {
        registrada.current = null;
      });
    };
    if (typeof IntersectionObserver === 'undefined') return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          registrar();
          observador.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observador.observe(ref.current);
    return () => {
      observador.disconnect();
    };
  }, [registraExposicion, auth.user, a.id, a.miExpuesta]);
  return (
    <li ref={ref} className="bg-papel-crudo border-tinta border p-5">
      <p className="text-lg leading-relaxed">{a.texto}</p>
      {auth.user ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {(
            [
              ['acuerdo', 'Estoy de acuerdo'],
              ['desacuerdo', 'No estoy de acuerdo'],
              ['paso', 'Prefiero pasar'],
            ] as const
          ).map(([valor, rotulo]) => (
            <BotonConMotivo
              key={valor}
              type="button"
              motivo={null}
              ocupado={op.isPending}
              tono={a.miRespuesta === valor ? 'violeta' : 'papel'}
              aria-pressed={a.miRespuesta === valor}
              onClick={() => {
                op.mutate(
                  {
                    metodo: 'post',
                    ruta: `/api/v1/fichas/afirmaciones/${a.id}/respuesta`,
                    cuerpo: { valor },
                  },
                  {
                    onSuccess: () => {
                      avisar('Registramos tu respuesta.');
                    },
                  },
                );
              }}
            >
              {rotulo}
            </BotonConMotivo>
          ))}
        </div>
      ) : null}
      <p className="text-tinta-50 mt-4 text-sm">{textoDeRespuestas(a)}</p>
      <ErrorOperacion mensaje={op.error?.message} />
      {a.puedoRetirar ? (
        <button
          type="button"
          className="text-sello mt-3 min-h-11 underline"
          onClick={() => {
            op.mutate(
              { metodo: 'delete', ruta: `/api/v1/fichas/afirmaciones/${a.id}` },
              {
                onSuccess: () => {
                  avisar('Retiramos tu afirmación.');
                },
              },
            );
          }}
        >
          Retirar mi afirmación
        </button>
      ) : null}
    </li>
  );
}
