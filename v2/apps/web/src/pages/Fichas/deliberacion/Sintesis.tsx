import { useState } from 'react';

import { EditorSintesis } from './EditorSintesis';

import type { FichaFuturo, ArgumentoFicha } from '@v2/shared';

import { BotonPapel } from '~/components/papel/primitives';

export function Sintesis({
  ficha,
  argumentos,
}: {
  ficha: FichaFuturo;
  argumentos: ArgumentoFicha[];
}) {
  const [edicion, setEdicion] = useState<FichaFuturo | null>(null);
  const [aviso, setAviso] = useState('');
  const s = ficha.contenido.sintesis;
  return (
    <section className="mt-8" aria-labelledby="titulo-sintesis">
      <h3 id="titulo-sintesis" className="font-anton text-2xl">
        Síntesis facilitada y revisable
      </h3>
      <p className="mt-3">
        Recoge acuerdos parciales y desacuerdos de este proceso. No es una votación vinculante ni un
        mandato de toda la población.
      </p>
      {ficha.sintesisRevisar ? (
        <p role="status" className="border-sello mt-3 border-l-2 pl-4">
          Una intervención citada fue retirada. La síntesis está oculta hasta que el equipo publique
          una nueva revisión sin ese contenido.
        </p>
      ) : null}
      {aviso ? <p role="status">{aviso}</p> : null}
      {edicion ? (
        <EditorSintesis
          ficha={edicion}
          argumentos={argumentos}
          cerrar={() => {
            setEdicion(null);
          }}
          guardado={() => {
            setEdicion(null);
            setAviso('Guardamos la síntesis en una nueva revisión de la ficha.');
          }}
        />
      ) : (
        <>
          {s ? (
            <div className="border-tinta mt-4 border p-5">
              <p className="font-semibold">
                {s.estado === 'publicada' ? 'Síntesis publicada' : 'Síntesis en revisión'} ·
                Firma declarada: {s.firma}
              </p>
              <dl className="mt-4 space-y-4">
                {[
                  ['Alcance', s.alcance],
                  ['Participación y método de recuento', s.participacion],
                  ['Ausencias y límites de la invitación', s.ausencias],
                  ['Desacuerdos pendientes', s.disensos],
                  ['Próxima revisión', s.proximaRevision],
                ].map(([t, v]) => (
                  <div key={t}>
                    <dt className="font-semibold">{t}</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words">{v}</dd>
                  </div>
                ))}
              </dl>
              <h4 className="mt-5 font-semibold">Acuerdos parciales</h4>
              {!s.acuerdos.length ? (
                <p className="mt-2">Todavía no se registraron acuerdos parciales.</p>
              ) : (
                <ol className="mt-3 list-decimal space-y-4 pl-5">
                  {s.acuerdos.map((a, i) => (
                    <li key={i}>
                      <p className="whitespace-pre-wrap break-words">{a.texto}</p>
                      <ul className="mt-2 flex flex-wrap gap-3">
                        {a.argumentoIds.map((id) => (
                          <li key={id}>
                            <a className="underline" href={`#argumento-${id}`}>
                              Intervención {id.slice(0, 8)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : !ficha.sintesisRevisar ? (
            <p className="mt-3">
              La síntesis está pendiente. No se infieren acuerdos a partir de adhesiones.
            </p>
          ) : null}
          {ficha.puedoEditar && ficha.contenido.proceso ? (
            <BotonPapel
              className="mt-4"
              variant="fantasma"
              onClick={() => {
                setEdicion(ficha);
                setAviso('');
              }}
            >
              Preparar o revisar síntesis
            </BotonPapel>
          ) : null}
        </>
      )}
    </section>
  );
}
