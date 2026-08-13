import { NOMBRE_DE_VARIABLE, numero } from '../simulacion-lectura';

import type { Importancia as ImportanciaDeVariable, Objetivo } from '@v2/civic-core';

/**
 * § El ranking de importancia — correlación de rangos, con su intervalo.
 *
 * **Spearman y no Pearson**: la respuesta es un escalón, y Pearson mide
 * linealidad — descontaría como «poco importante» a una variable que decide
 * todo de golpe. Spearman correlaciona rangos y le alcanza con que el orden se
 * conserve.
 *
 * **Y el intervalo va siempre.** Sale de un bootstrap sobre las mismas
 * corridas, así que es gratis —remuestrear un array no son corridas nuevas—, y
 * sin él un ρ de 0,63 con doscientas muestras se lee como si sus decimales
 * significaran algo.
 *
 * Una variable cuyo lado no varió no da un cero: da `sin variación` con su
 * razón. Un 0 se leería «no se relacionan», que es otra cosa.
 *
 * **Y con menos corridas que el piso no se publica ρ.** Es la misma vara con la
 * que la sección de al lado decide si hay dispersión que mostrar: antes esta
 * publicaba `ρ 0,71 · [0,73, 1,00] · 5 corridas` mientras la otra decía «5
 * corridas no alcanzan», con el estimador afuera de su propio intervalo. Dos
 * varas en la misma pantalla no son dos lecturas: son una contradicción, y quien
 * mira no tiene cómo saber cuál creer. `sin muestras` y `sin variación` se
 * escriben distinto porque dicen cosas distintas — una es «no alcanza para
 * medir» y la otra es «se midió y no se movió».
 */

const ANCHO = 240;
const ALTO = 20;

export interface ImportanciaProps {
  readonly importancia: readonly ImportanciaDeVariable[];
  readonly objetivo: Objetivo;
}

/** ρ ∈ [−1, 1] → x del lienzo, con el cero en el medio. */
const x = (rho: number): number => ((Math.min(1, Math.max(-1, rho)) + 1) / 2) * ANCHO;

export function Importancia({ importancia, objetivo }: ImportanciaProps) {
  const ordenadas = [...importancia].sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === 'medida' ? -1 : 1;
    if (a.estado === 'medida' && b.estado === 'medida') {
      return Math.abs(b.correlacion.valor) - Math.abs(a.correlacion.valor);
    }
    return 0;
  });

  return (
    <section aria-labelledby="titulo-importancia" className="mt-10">
      <h2 id="titulo-importancia" className="font-anton text-tinta text-[24px] leading-[1.15]">
        Cuál manda, con todas moviéndose a la vez
      </h2>
      <p className="text-tinta-75 mb-4 mt-1 max-w-[70ch] text-[14px] leading-[1.5]">
        Correlación de rangos entre cada variable y {objetivo}, sobre el hipercubo latino. La barra
        clara es el intervalo del bootstrap: si cruza el cero, el signo no está decidido y el
        decimal no significa nada.
      </p>

      <ul className="border-tinta border-t-2">
        {ordenadas.map((fila) => (
          <li
            key={fila.clave}
            className="border-papel-borde flex flex-wrap items-center gap-4 border-b py-3"
          >
            <span className="font-archivo text-tinta w-[190px] text-[15px]">
              {NOMBRE_DE_VARIABLE[fila.clave]}
            </span>

            {fila.estado === 'medida' ? (
              <>
                <svg
                  aria-hidden
                  viewBox={`0 0 ${String(ANCHO)} ${String(ALTO)}`}
                  width={ANCHO}
                  height={ALTO}
                  className="max-w-full"
                >
                  <line
                    x1={x(0)}
                    y1={0}
                    x2={x(0)}
                    y2={ALTO}
                    stroke="currentColor"
                    className="text-tinta-30"
                    strokeWidth={1}
                  />
                  <rect
                    x={Math.min(x(fila.p05.valor), x(fila.p95.valor))}
                    y={5}
                    width={Math.max(1, Math.abs(x(fila.p95.valor) - x(fila.p05.valor)))}
                    height={ALTO - 10}
                    className="fill-violeta"
                    opacity={0.3}
                  />
                  <rect
                    x={Math.min(x(0), x(fila.correlacion.valor))}
                    y={8}
                    width={Math.max(2, Math.abs(x(fila.correlacion.valor) - x(0)))}
                    height={ALTO - 16}
                    className="fill-violeta"
                  />
                </svg>
                <span className="font-space text-tinta-75 text-[12px] tabular-nums">
                  ρ {numero(fila.correlacion.valor, 2)} · [{numero(fila.p05.valor, 2)},{' '}
                  {numero(fila.p95.valor, 2)}] · {fila.n} corridas
                </span>
              </>
            ) : (
              <span className="text-tinta-50 max-w-[62ch] text-[13px] leading-[1.45]">
                <span className="font-space mr-2 text-[11px] uppercase tracking-[0.1em]">
                  {fila.estado === 'sinMuestras' ? 'sin muestras' : 'sin variación'}
                </span>
                {fila.razon}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
