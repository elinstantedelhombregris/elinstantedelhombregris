import { procesoFichaSchema, type FichaFuturo, type ProcesoFicha } from '@v2/shared';
import { useState } from 'react';

import { CampoDato } from '../cuaderno/CampoDato';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useGuardarFicha } from '~/lib/queries/fichas';

const CAMPOS = [
  ['pregunta', 'Pregunta a resolver'],
  ['ambito', 'Alcance y decisiones que incluye'],
  ['convocatoria', 'A quiénes y cómo se convoca'],
  ['facilitacion', 'Firma pública de la facilitación'],
  ['inicio', 'Fecha de apertura'],
  ['cierre', 'Fecha de cierre'],
  ['reglas', 'Reglas de participación'],
  ['metodoCierre', 'Cómo se elaborará y revisará el cierre'],
  ['moderacion', 'Política de moderación'],
  ['apelacion', 'Cómo pedir revisión de una moderación'],
] as const;
const VACIO: ProcesoFicha = {
  pregunta: '',
  ambito: '',
  convocatoria: '',
  facilitacion: '',
  inicio: '',
  cierre: '',
  reglas: '',
  metodoCierre: '',
  moderacion: '',
  apelacion: '',
};
export function Proceso({ ficha }: { ficha: FichaFuturo }) {
  const [edicion, setEdicion] = useState<FichaFuturo | null>(null);
  const [aviso, setAviso] = useState('');
  const p = ficha.contenido.proceso;
  return (
    <div className="mt-5">
      <h3 className="font-anton text-2xl">Reglas y participación</h3>
      {aviso ? <p role="status">{aviso}</p> : null}
      {edicion ? (
        <EditorProceso
          ficha={edicion}
          cerrar={() => {
            setEdicion(null);
          }}
          guardado={() => {
            setEdicion(null);
            setAviso('Guardamos las reglas en una nueva revisión.');
          }}
        />
      ) : (
        <>
          {p ? (
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {CAMPOS.map(([clave, etiqueta]) => (
                <div key={clave}>
                  <dt className="font-semibold">{etiqueta}</dt>
                  <dd className="mt-1 whitespace-pre-wrap break-words">{p[clave]}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3">
              La conversación todavía no está abierta. El equipo editor debe publicar pregunta,
              invitación, fechas y reglas.
            </p>
          )}
          {ficha.puedoEditar ? (
            <BotonPapel
              className="mt-4"
              variant="fantasma"
              onClick={() => {
                setEdicion(ficha);
                setAviso('');
              }}
            >
              {p ? 'Revisar reglas y participación' : 'Preparar la conversación'}
            </BotonPapel>
          ) : null}
        </>
      )}
    </div>
  );
}
function EditorProceso({
  ficha,
  cerrar,
  guardado,
}: {
  ficha: FichaFuturo;
  cerrar: () => void;
  guardado: () => void;
}) {
  const [valor, setValor] = useState(ficha.contenido.proceso ?? VACIO);
  const [error, setError] = useState('');
  const guardar = useGuardarFicha(ficha.id, ficha.revision);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const r = procesoFichaSchema.safeParse(valor);
        if (!r.success) {
          setError(
            'Completá todos los campos y revisá que el cierre sea posterior o igual a la apertura.',
          );
          return;
        }
        guardar.mutate(
          { contenido: { ...ficha.contenido, proceso: r.data }, idLocal: ficha.id },
          { onSuccess: guardado },
        );
      }}
    >
      <p className="mt-3 text-sm">
        Solo firmá por vos o por un equipo que te autorizó. Las fechas rigen por día UTC. Un cambio
        de reglas queda registrado en la revisión de la ficha.
      </p>
      <fieldset disabled={guardar.isPending}>
        {CAMPOS.map(([clave, etiqueta]) => (
          <CampoDato
            key={clave}
            etiqueta={etiqueta}
            valor={valor[clave]}
            tipo={
              clave === 'inicio' || clave === 'cierre'
                ? 'date'
                : clave === 'facilitacion'
                  ? 'texto'
                  : 'largo'
            }
            cambiar={(v) => {
              setValor({ ...valor, [clave]: v });
            }}
          />
        ))}
        <ErrorOperacion mensaje={error || guardar.error?.message} />
        {guardar.error ? (
          <a href={`/fichas/${ficha.id}`} target="_blank" rel="noreferrer" className="underline">
            Consultar la versión actual conservando este borrador
          </a>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-4">
          <BotonPapel type="submit">Publicar reglas y participación</BotonPapel>
          <button type="button" className="min-h-11 underline" onClick={cerrar}>
            Cancelar
          </button>
        </div>
      </fieldset>
    </form>
  );
}
