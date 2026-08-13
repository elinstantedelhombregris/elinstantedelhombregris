import { OBJETIVOS } from '@v2/civic-core';

import { formatoDeObjetivo, NOMBRE_DE_OBJETIVO } from '../simulacion-lectura';

import type { Estimacion, Objetivo } from '@v2/civic-core';

/**
 * § La incertidumbre, dibujada — no escondida y no inventada.
 *
 * Las cuatro variantes se dibujan **distinto**, porque dicen cosas distintas:
 *
 * - **muestra** — banda p05–p95, caja p25–p75 y la mediana. El centro es la
 *   mediana y no el promedio: con una respuesta en escalón, el promedio cae en
 *   un valor que ninguna corrida produjo.
 * - **exacta** — una marca, y la frase. **No es un intervalo de ancho cero**:
 *   decir «±0» sugeriría que se midió una varianza y dio cero. Lo que pasa es
 *   que el modo forma es determinista, y **un modelo incapaz de dudar no es un
 *   modelo más certero**.
 * - **sin dominio** — la variable no está conectada. Fila gris con su razón,
 *   nunca una banda de ancho cero.
 * - **sin dato** — no hay muestras suficientes. Por debajo de veinte corridas un
 *   p05 y un p95 son los extremos observados con otro nombre, y se dice así.
 *
 * Y lo que esta banda **no** es, dicho arriba y no en un pie: no es el intervalo
 * de confianza de un pronóstico. Es la dispersión que produce **el rango que la
 * persona declaró**. Que el piso sean 100 voces cada 100.000 o que el período
 * sea el mes no se estima con corridas: se declara, y se barre aparte.
 */

const ANCHO = 300;
const ALTO = 26;

export interface IncertidumbreProps {
  readonly estimaciones: Readonly<Record<Objetivo, Estimacion>>;
  readonly territorios: number;
}

/** El dominio natural de cada objetivo, para que las filas sean comparables. */
function dominioDe(objetivo: Objetivo, territorios: number): { minimo: number; maximo: number } {
  return objetivo === 'territoriosConMandato'
    ? { minimo: 0, maximo: Math.max(1, territorios) }
    : { minimo: 0, maximo: 1 };
}

export function Incertidumbre({ estimaciones, territorios }: IncertidumbreProps) {
  return (
    <section aria-labelledby="titulo-incertidumbre" className="mt-10">
      <h2 id="titulo-incertidumbre" className="font-anton text-tinta text-[24px] leading-[1.15]">
        Cuánto se mueve cada resultado
      </h2>
      <p className="text-tinta-75 mb-4 mt-1 max-w-[70ch] text-[14px] leading-[1.5]">
        La banda es la dispersión que produce el rango que declaraste en la mesa. No es el intervalo
        de confianza de un pronóstico: nadie estimó la incertidumbre del modelo, y decir lo
        contrario sería mentir por omisión.
      </p>

      <ul className="border-tinta border-t-2">
        {OBJETIVOS.map((objetivo) => (
          <Fila
            key={objetivo}
            objetivo={objetivo}
            estimacion={estimaciones[objetivo]}
            territorios={territorios}
          />
        ))}
      </ul>
    </section>
  );
}

function Fila({
  objetivo,
  estimacion,
  territorios,
}: {
  objetivo: Objetivo;
  estimacion: Estimacion;
  territorios: number;
}) {
  const formato = formatoDeObjetivo(objetivo);
  const { minimo, maximo } = dominioDe(objetivo, territorios);
  const x = (valor: number): number =>
    maximo - minimo <= 0 ? 0 : ((valor - minimo) / (maximo - minimo)) * ANCHO;

  return (
    <li className="border-papel-borde flex flex-wrap items-center gap-4 border-b py-3">
      <span className="font-archivo text-tinta w-[190px] text-[15px]">
        {NOMBRE_DE_OBJETIVO[objetivo]}
      </span>

      {estimacion.tipo === 'muestra' ? (
        <>
          <svg
            aria-hidden
            viewBox={`0 0 ${String(ANCHO)} ${String(ALTO)}`}
            width={ANCHO}
            height={ALTO}
            className="max-w-full"
          >
            <line
              x1={x(estimacion.minimo.valor)}
              y1={ALTO / 2}
              x2={x(estimacion.maximo.valor)}
              y2={ALTO / 2}
              stroke="currentColor"
              className="text-tinta-30"
              strokeWidth={1}
            />
            <rect
              x={x(estimacion.p05.valor)}
              y={7}
              width={Math.max(1, x(estimacion.p95.valor) - x(estimacion.p05.valor))}
              height={12}
              className="fill-violeta"
              opacity={0.28}
            />
            <rect
              x={x(estimacion.p25.valor)}
              y={7}
              width={Math.max(1, x(estimacion.p75.valor) - x(estimacion.p25.valor))}
              height={12}
              className="fill-violeta"
            />
            <line
              x1={x(estimacion.centro.valor)}
              y1={4}
              x2={x(estimacion.centro.valor)}
              y2={ALTO - 4}
              stroke="currentColor"
              className="text-tinta"
              strokeWidth={2}
            />
          </svg>
          <span className="font-space text-tinta-75 text-[12px] tabular-nums">
            mediana {formato(estimacion.centro.valor)} · p05 {formato(estimacion.p05.valor)} – p95{' '}
            {formato(estimacion.p95.valor)} · {estimacion.n} corridas
          </span>
        </>
      ) : estimacion.tipo === 'exacta' ? (
        <>
          <svg
            aria-hidden
            viewBox={`0 0 ${String(ANCHO)} ${String(ALTO)}`}
            width={ANCHO}
            height={ALTO}
            className="max-w-full"
          >
            <line
              x1={0}
              y1={ALTO / 2}
              x2={ANCHO}
              y2={ALTO / 2}
              stroke="currentColor"
              className="text-papel-borde"
              strokeWidth={1}
            />
            <line
              x1={x(estimacion.valor.valor)}
              y1={4}
              x2={x(estimacion.valor.valor)}
              y2={ALTO - 4}
              stroke="currentColor"
              className="text-tinta"
              strokeWidth={2}
            />
          </svg>
          <span className="font-space text-tinta-75 max-w-[46ch] text-[12px]">
            {formato(estimacion.valor.valor)} — exacta, no «±0»: este modo es determinista y no hay
            varianza que medir. Un modelo incapaz de dudar no es más certero.
          </span>
        </>
      ) : (
        <span className="text-tinta-50 max-w-[62ch] text-[13px] leading-[1.45]">
          <span className="font-space mr-2 text-[11px] uppercase tracking-[0.1em]">
            {estimacion.tipo === 'sinDominio' ? 'sin dominio' : 'sin dato'}
          </span>
          {estimacion.razon}
        </span>
      )}
    </li>
  );
}
