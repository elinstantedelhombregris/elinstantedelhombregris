import { useState } from 'react';

import { CampoDato } from '../cuaderno/CampoDato';

import { TIPOS_ARGUMENTO } from './NuevoArgumento';

import type { ArgumentoFicha, FichaFuturo } from '@v2/shared';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useOperacionPersonal } from '~/lib/queries/participacion';

const MOTIVOS = [
  ['autoria', 'Retiro mi propia intervención'],
  ['datos_personales', 'Contiene datos personales'],
  ['agresion', 'Agresión'],
  ['fuera_de_alcance', 'Fuera del alcance acordado'],
] as const;
export function Intervencion({
  argumento: a,
  ficha,
}: {
  argumento: ArgumentoFicha;
  ficha: FichaFuturo;
}) {
  const [confirmar, setConfirmar] = useState(false);
  const [motivo, setMotivo] = useState(a.esMio ? 'autoria' : 'datos_personales');
  const op = useOperacionPersonal();
  return (
    <li id={`argumento-${a.id}`} className="border-tinta border p-5">
      <p className="text-sm">
        {TIPOS_ARGUMENTO.find(([v]) => v === a.tipo)?.[1] ?? a.tipo} ·{' '}
        {new Date(a.fecha).toLocaleDateString('es-AR')} · Referencia {a.id.slice(0, 8)}
      </p>
      {a.retirado ? (
        <p className="mt-3">
          Intervención retirada. Motivo: {MOTIVOS.find(([v]) => v === a.motivo)?.[1] ?? 'retiro'}.
          El texto y la firma no se muestran.
        </p>
      ) : (
        <>
          <p className="mt-3 whitespace-pre-wrap break-words">{a.texto}</p>
          <p className="mt-3 text-sm">Firma declarada: {a.firma}</p>
          {a.respondeA ? (
            <p className="mt-2 text-sm">
              <a className="underline" href={`#argumento-${a.respondeA}`}>
                Responde a la intervención {a.respondeA.slice(0, 8)}
              </a>
              . Si no aparece, cargá más intervenciones.
            </p>
          ) : null}
          {a.alternativaId ? (
            <p className="mt-2 text-sm">
              <a className="underline" href={`/fichas/${ficha.id}?vista=alternativas#diseno`}>
                Alternativa discutida: {a.alternativaId.slice(0, 8)}
              </a>
            </p>
          ) : null}
          {a.fuenteIds.length ? (
            <ul className="mt-3 text-sm">
              {a.fuenteIds.map((id) => (
                <li key={id}>
                  <a href="#evidencia" className="underline">
                    {ficha.contenido.cuaderno?.fuentes.find((f) => f.id === id)?.titulo ??
                      'Fuente retirada del cuaderno: revisar esta referencia'}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {a.puedoRetirar ? (
            confirmar ? (
              <div className="mt-4">
                <p>
                  Al retirar, el texto deja de estar disponible y cualquier síntesis que lo cite
                  requiere revisión.
                </p>
                <CampoDato
                  etiqueta="Motivo del retiro"
                  valor={motivo}
                  opciones={MOTIVOS.filter(([v]) =>
                    v === 'autoria' ? a.esMio : ficha.puedoEditar,
                  )}
                  cambiar={setMotivo}
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <BotonPapel
                    disabled={op.isPending}
                    onClick={() => {
                      op.mutate(
                        {
                          metodo: 'post',
                          ruta: `/api/v1/fichas/argumentos/${a.id}/retiro`,
                          cuerpo: { motivo },
                        },
                        {
                          onSuccess: () => {
                            setConfirmar(false);
                          },
                        },
                      );
                    }}
                  >
                    Confirmar retiro
                  </BotonPapel>
                  <button
                    disabled={op.isPending}
                    className="min-h-11 underline"
                    onClick={() => {
                      setConfirmar(false);
                    }}
                  >
                    Cancelar retiro
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="mt-2 min-h-11 underline"
                onClick={() => {
                  setConfirmar(true);
                }}
              >
                Retirar intervención
              </button>
            )
          ) : null}
        </>
      )}
      <ErrorOperacion mensaje={op.error?.message} />
    </li>
  );
}
