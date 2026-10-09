import { useId, useState } from 'react';

import {
  RELACIONES,
  RELACION_INICIAL,
  esRelacion,
  esUuid,
  type RelacionFicha,
} from './presentacion';
import { SeleccionarFuentes } from './SeleccionarFuentes';

import type { ContenidoFicha, FichaFuturo } from '@v2/shared';

import { BotonPapel } from '~/components/papel/primitives';
import { CAMPO } from '~/components/participacion/constantes';

type Vinculo = ContenidoFicha['vinculos'][number];

interface Props {
  vinculos: Vinculo[];
  campana: string | null | undefined;
  /** Los aportes que la ficha ya tenía guardados: de ellos se conoce el texto. */
  conocidos: FichaFuturo['aportes'];
  cambiar: (vinculos: Vinculo[]) => void;
  error?: string | undefined;
}

const LARGO_EXTRACTO = 140;
/** Un aporte en una línea: el texto, no su identificador. */
function extracto(texto: string) {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  return limpio.length > LARGO_EXTRACTO ? `${limpio.slice(0, LARGO_EXTRACTO).trimEnd()}…` : limpio;
}

type LecturaDeVinculo =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'reservado' }
  | { tipo: 'retirado' }
  | { tipo: 'desconocido' };

/** Sólo se conoce el texto de lo que la ficha ya tenía guardado o de lo que se eligió acá. */
function leerVinculo(
  senalId: string,
  guardado: FichaFuturo['aportes'][number] | undefined,
  elegidos: Record<string, string | null>,
): LecturaDeVinculo {
  if (guardado) {
    if (!guardado.disponible) return { tipo: 'retirado' };
    return guardado.texto ? { tipo: 'texto', texto: guardado.texto } : { tipo: 'reservado' };
  }
  if (!(senalId in elegidos)) return { tipo: 'desconocido' };
  const texto = elegidos[senalId];
  return texto ? { tipo: 'texto', texto } : { tipo: 'reservado' };
}

/**
 * Los aportes de una ficha. Primero se elige cómo se relacionan y después se
 * vinculan desde el registro público; pegar un enlace queda como camino secundario.
 */
export function VinculosDeLaFicha({ vinculos, campana, conocidos, cambiar, error }: Props) {
  const errorId = useId();
  const pegadoId = useId();
  const [relacion, setRelacion] = useState<RelacionFicha>(RELACION_INICIAL);
  const [textos, setTextos] = useState<Record<string, string | null>>({});
  const [pegado, setPegado] = useState('');
  const [errorPegado, setErrorPegado] = useState('');
  const agregar = (senalId: string) => {
    if (vinculos.some((v) => v.senalId === senalId && v.relacion === relacion)) return;
    cambiar([...vinculos, { senalId, relacion }]);
  };
  return (
    <fieldset className="border-tinta border p-4" aria-describedby={error ? errorId : undefined}>
      <legend className="px-2 font-bold">Aportes vinculados a esta ficha</legend>
      <p className="text-sm">
        Elegí cómo se relaciona un aporte con la ficha y después vinculalo. Vincular un aporte como
        evidencia no cambia su estado de comprobación.
      </p>
      <label className="mt-4 block text-sm font-bold">
        Cómo se relaciona el aporte con la ficha
        <select
          value={relacion}
          onChange={(e) => {
            if (esRelacion(e.target.value)) setRelacion(e.target.value);
          }}
          className={CAMPO}
        >
          {Object.entries(RELACIONES).map(([clave, rotulo]) => (
            <option key={clave} value={clave}>
              {rotulo}
            </option>
          ))}
        </select>
      </label>
      <SeleccionarFuentes
        campana={campana}
        relacion={relacion}
        vinculados={vinculos.filter((v) => v.relacion === relacion).map((v) => v.senalId)}
        elegir={(id, texto) => {
          setTextos((previos) => ({ ...previos, [id]: texto }));
          agregar(id);
        }}
      />
      <details className="mt-5">
        <summary className="min-h-11 cursor-pointer py-2 text-sm underline">
          Pegar un enlace de aporte
        </summary>
        <label htmlFor={pegadoId} className="mt-2 block text-sm">
          Enlace del aporte
        </label>
        <input
          id={pegadoId}
          value={pegado}
          aria-invalid={errorPegado ? true : undefined}
          aria-describedby={errorPegado ? `${pegadoId}-error` : undefined}
          onChange={(e) => {
            setPegado(e.target.value);
          }}
          className={CAMPO}
        />
        {errorPegado ? (
          <p id={`${pegadoId}-error`} role="alert" className="text-sello mt-2 text-sm">
            {errorPegado}
          </p>
        ) : null}
        <BotonPapel
          type="button"
          variant="fantasma"
          className="mt-3"
          onClick={() => {
            const id = pegado.trim().split('/senal/').pop()?.split(/[?#]/)[0] ?? '';
            if (!esUuid(id)) {
              setErrorPegado('Pegá el enlace de un aporte, que termina en /senal/ y un código.');
              return;
            }
            agregar(id);
            setPegado('');
            setErrorPegado('');
          }}
        >
          Vincular este enlace
        </BotonPapel>
      </details>
      {error ? (
        <p id={errorId} role="alert" className="text-sello mt-4 text-sm">
          {error}
        </p>
      ) : null}
      <ul className="mt-5">
        {vinculos.map((v, i) => {
          const lectura = leerVinculo(
            v.senalId,
            conocidos.find((a) => a.senalId === v.senalId),
            textos,
          );
          return (
            <li
              key={`${v.senalId}-${v.relacion}-${i}`}
              className="border-tinta/25 border-t py-2 text-sm"
            >
              <p className="font-bold">{RELACIONES[v.relacion]}</p>
              {lectura.tipo === 'desconocido' ? (
                <p className="text-tinta-75 my-1 break-all">{v.senalId}</p>
              ) : (
                <p className="my-1 break-words">
                  {lectura.tipo === 'retirado'
                    ? 'Este aporte dejó de estar disponible.'
                    : lectura.tipo === 'reservado'
                      ? 'Texto reservado por su autor.'
                      : `«${extracto(lectura.texto)}»`}
                </p>
              )}
              {lectura.tipo === 'retirado' ? null : (
                <a
                  className="underline"
                  href={`/senal/${v.senalId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver el aporte (se abre en otra pestaña)
                </a>
              )}
              <button
                type="button"
                className="ml-3 min-h-11 underline"
                onClick={() => {
                  cambiar(vinculos.filter((_, posicion) => posicion !== i));
                }}
              >
                Quitar vínculo {i + 1}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
