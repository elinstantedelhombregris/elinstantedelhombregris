import {
  sintesisFichaSchema,
  type SintesisFicha,
  type FichaFuturo,
  type ArgumentoFicha,
} from '@v2/shared';
import { useState } from 'react';

import { CampoDato } from '../cuaderno/CampoDato';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useGuardarFicha } from '~/lib/queries/fichas';

const VACIA: SintesisFicha = {
  estado: 'borrador',
  firma: '',
  alcance: '',
  participacion: '',
  ausencias: '',
  acuerdos: [],
  disensos: '',
  proximaRevision: '',
};
const CAMPOS = [
  ['firma', 'Firma pública de quien revisó la síntesis'],
  ['alcance', 'Qué cubre esta síntesis'],
  ['participacion', 'Quiénes participaron y cómo se contaron'],
  ['ausencias', 'Personas ausentes y límites de la invitación'],
  ['disensos', 'Desacuerdos y alternativas todavía abiertas'],
  ['proximaRevision', 'Fecha de próxima revisión'],
] as const;
export function EditorSintesis({
  ficha,
  argumentos,
  cerrar,
  guardado,
}: {
  ficha: FichaFuturo;
  argumentos: ArgumentoFicha[];
  cerrar: () => void;
  guardado: () => void;
}) {
  const [valor, setValor] = useState(ficha.contenido.sintesis ?? VACIA);
  const [error, setError] = useState('');
  const guardar = useGuardarFicha(ficha.id, ficha.revision);
  const cambiarAcuerdo = (indice: number, cambio: Partial<SintesisFicha['acuerdos'][number]>) => {
    setValor({
      ...valor,
      acuerdos: valor.acuerdos.map((a, i) => (i === indice ? { ...a, ...cambio } : a)),
    });
  };
  return (
    <form
      className="mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        const r = sintesisFichaSchema.safeParse(valor);
        if (!r.success) {
          setError(
            'Completá los apartados, la firma y la fecha. Cada acuerdo necesita al menos una intervención como referencia.',
          );
          return;
        }
        guardar.mutate(
          { contenido: { ...ficha.contenido, sintesis: r.data }, idLocal: ficha.id },
          { onSuccess: guardado },
        );
      }}
    >
      <p>
        Antes de publicar, contrastá cada acuerdo con las intervenciones y documentá qué quedó
        abierto. Las síntesis en revisión también son visibles para cualquiera.
      </p>
      <fieldset disabled={guardar.isPending}>
        <CampoDato
          etiqueta="Estado de la síntesis"
          valor={valor.estado}
          opciones={[
            ['borrador', 'En revisión (visible para cualquiera)'],
            ['publicada', 'Revisada para publicar'],
          ]}
          cambiar={(v) => {
            setValor({ ...valor, estado: v === 'publicada' ? 'publicada' : 'borrador' });
          }}
        />
        {CAMPOS.map(([clave, etiqueta]) => (
          <CampoDato
            key={clave}
            etiqueta={etiqueta}
            valor={valor[clave]}
            tipo={clave === 'proximaRevision' ? 'date' : clave === 'firma' ? 'texto' : 'largo'}
            cambiar={(v) => {
              setValor({ ...valor, [clave]: v });
            }}
          />
        ))}
        {valor.acuerdos.map((a, i) => (
          <fieldset key={i} className="border-tinta mt-5 border p-4">
            <legend>Acuerdo parcial {i + 1}</legend>
            <CampoDato
              etiqueta={`Texto del acuerdo ${i + 1}`}
              tipo="largo"
              valor={a.texto}
              cambiar={(texto) => {
                cambiarAcuerdo(i, { texto });
              }}
            />
            <p className="mt-3 text-sm">
              Intervenciones que lo fundamentan. Cargá más intervenciones en la conversación si
              falta alguna.
            </p>
            {argumentos
              .filter((x) => !x.retirado)
              .map((x) => (
                <label key={x.id} className="flex min-h-11 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={a.argumentoIds.includes(x.id)}
                    onChange={(e) => {
                      cambiarAcuerdo(i, {
                        argumentoIds: e.target.checked
                          ? [...a.argumentoIds, x.id]
                          : a.argumentoIds.filter((id) => id !== x.id),
                      });
                    }}
                  />
                  {x.firma}: {x.texto?.slice(0, 150)}
                </label>
              ))}
            {a.argumentoIds
              .filter((id) => !argumentos.some((x) => x.id === id && !x.retirado))
              .map((id) => (
                <p key={id}>
                  Referencia no cargada o retirada: {id.slice(0, 8)}.{' '}
                  <button
                    type="button"
                    className="min-h-11 underline"
                    onClick={() => {
                      cambiarAcuerdo(i, { argumentoIds: a.argumentoIds.filter((x) => x !== id) });
                    }}
                  >
                    Quitar referencia {id.slice(0, 8)}
                  </button>
                </p>
              ))}
            <button
              type="button"
              className="mt-3 min-h-11 underline"
              onClick={() => {
                setValor({ ...valor, acuerdos: valor.acuerdos.filter((_, n) => n !== i) });
              }}
            >
              Quitar acuerdo {i + 1}
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className="mt-3 min-h-11 underline"
          disabled={valor.acuerdos.length >= 20}
          onClick={() => {
            setValor({ ...valor, acuerdos: [...valor.acuerdos, { texto: '', argumentoIds: [] }] });
          }}
        >
          Agregar acuerdo parcial
        </button>
        <ErrorOperacion mensaje={error || guardar.error?.message} />
        {guardar.error ? (
          <a
            href={`/fichas/${ficha.id}#conversacion`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Consultar la versión actual conservando este borrador
          </a>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-4">
          <BotonPapel type="submit">Guardar síntesis</BotonPapel>
          <button type="button" className="min-h-11 underline" onClick={cerrar}>
            Cancelar
          </button>
        </div>
      </fieldset>
    </form>
  );
}
