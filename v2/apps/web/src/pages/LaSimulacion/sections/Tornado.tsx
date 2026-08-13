import { NOMBRE_DE_VARIABLE, claseDeVariable } from '../simulacion-lectura';

import type { BarraDeTornado, ClaveVariable, Monotonia, Objetivo } from '@v2/civic-core';

/**
 * § El tornado — dibujado a mano, en SVG, sin librería de gráficos.
 *
 * Entra porque es la única lectura que alguien no técnico lee sin
 * entrenamiento. Y va **siempre con la nube al lado**: la respuesta del motor es
 * un escalón, y una barra promedia esa forma adentro suyo y la esconde.
 *
 * Tres decisiones que lo separan de un tornado de planilla:
 *
 * 1. **Una variable que el motor no lee no da una barra de largo cero.** Da una
 *    fila gris con la razón escrita. Una barra en cero se lee «la medimos y no
 *    importa», que es una afirmación distinta y falsa.
 * 2. **La monotonía se mide sobre los puntos intermedios**, no se supone. Una
 *    variable que sube y después baja es información de primera clase, no un
 *    promedio a esconder.
 * 3. **La barra es decorativa (`aria-hidden`) y el número es el dato.** Es el
 *    mismo criterio de las barras del Mandato Vivo, y es lo que hace que esto
 *    funcione con un lector de pantalla.
 *
 * **La barra se dibuja con lo mismo con lo que se ordena la lista**, y eso hubo
 * que arreglarlo: el rect iba de `bajo` a `alto` —los extremos del rango— y la
 * lista ordenaba por `amplitud` —el recorrido observado—. Para una variable no
 * monótona no son el mismo número, y había una inversión real: `horizonte`
 * quedaba primera con una barra más corta que la de `participacion`, que
 * quedaba segunda. **El ojo leía lo contrario que la lista.** Ahora el rect va
 * de `minimo` a `maximo`, que mide exactamente `amplitud`. Cuando el recorrido
 * se sale de los extremos, la fila lo dice con el número: sin eso, una barra
 * más larga que su propio «de → a» sería otra contradicción, sólo que al revés.
 *
 * A mano y no con la librería que ya está instalada: `recharts` vive en el
 * sistema de diseño viejo y arrastraría sus fuentes, sus colores y sus tooltips
 * a una página de papel. Cuarenta líneas de SVG con `viewBox` cuestan menos que
 * pelearle el layout, y el CLAUDE.md pide una sola librería de cada cosa.
 */

const ANCHO = 260;
const ALTO = 18;

const MONOTONIA: Readonly<Record<Monotonia, { texto: string; clase: string }>> = {
  creciente: { texto: 'sube', clase: 'text-verde' },
  decreciente: { texto: 'baja', clase: 'text-cian' },
  noMonotona: { texto: 'sube y baja', clase: 'text-sello' },
  plana: { texto: 'no se mueve', clase: 'text-tinta-50' },
};

export interface TornadoProps {
  readonly barras: readonly BarraDeTornado[];
  readonly objetivo: Objetivo;
  readonly formato: (v: number) => string;
  readonly elegida: ClaveVariable | null;
  readonly onElegir: (clave: ClaveVariable) => void;
}

function extremos(barras: readonly BarraDeTornado[]): { minimo: number; maximo: number } {
  let minimo = Number.POSITIVE_INFINITY;
  let maximo = Number.NEGATIVE_INFINITY;
  for (const barra of barras) {
    if (barra.estado !== 'medida') continue;
    for (const punto of barra.puntos) {
      if (punto.salida < minimo) minimo = punto.salida;
      if (punto.salida > maximo) maximo = punto.salida;
    }
  }
  if (!Number.isFinite(minimo) || !Number.isFinite(maximo)) return { minimo: 0, maximo: 0 };
  return { minimo, maximo };
}

/**
 * Si el recorrido observado se sale de los dos extremos del rango.
 *
 * Cuando pasa, la barra es más larga que el «de → a» de al lado y hay que
 * decirlo con el número: una barra que no se corresponde con ninguna cifra de su
 * propia fila es la misma clase de defecto que este componente acaba de cerrar.
 */
function seSaleDeLosExtremos(barra: BarraDeTornado): boolean {
  if (barra.estado !== 'medida') return false;
  const piso = Math.min(barra.bajo.valor, barra.alto.valor);
  const techo = Math.max(barra.bajo.valor, barra.alto.valor);
  return barra.minimo.valor < piso || barra.maximo.valor > techo;
}

export function Tornado({ barras, objetivo, formato, elegida, onElegir }: TornadoProps) {
  const { minimo, maximo } = extremos(barras);
  const rango = maximo - minimo;

  const ordenadas = [...barras].sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === 'medida' ? -1 : 1;
    if (a.estado === 'medida' && b.estado === 'medida') return b.amplitud.valor - a.amplitud.valor;
    return 0;
  });

  const x = (valor: number): number => (rango <= 0 ? ANCHO / 2 : ((valor - minimo) / rango) * ANCHO);

  return (
    <section aria-labelledby="titulo-tornado">
      <h2 id="titulo-tornado" className="font-anton text-tinta text-[24px] leading-[1.15]">
        Qué mueve el resultado
      </h2>
      <p className="text-tinta-75 mb-4 mt-1 max-w-[62ch] text-[14px] leading-[1.5]">
        Cada barra recorre una variable sola sobre su dominio declarado y mide cuánto se mueve{' '}
        {objetivo}. {rango <= 0 ? 'Ninguna movió nada: el rango entero dio el mismo número.' : null}{' '}
        Elegí una para ver su forma en la nube de al lado — una barra larga puede ser una rampa o un
        escalón, y no son lo mismo.
      </p>

      <ul className="border-tinta border-t-2">
        {ordenadas.map((barra) => (
          <li key={barra.clave} className="border-papel-borde border-b">
            {barra.estado === 'noConectada' ? (
              <div className="py-3">
                <p className="font-archivo text-tinta-50 text-[15px]">
                  {NOMBRE_DE_VARIABLE[barra.clave]}
                  <span className="font-space ml-2 text-[11px] uppercase tracking-[0.1em]">
                    no conectada
                  </span>
                </p>
                <p className="text-tinta-50 max-w-[62ch] text-[12px] leading-[1.45]">
                  {barra.incertidumbre.tipo === 'sinDominio'
                    ? barra.incertidumbre.razon
                    : 'El motor no la lee en este modo.'}
                </p>
              </div>
            ) : (
              <button
                type="button"
                aria-pressed={elegida === barra.clave}
                onClick={() => {
                  onElegir(barra.clave);
                }}
                className={`block w-full py-3 text-left transition-colors ${
                  elegida === barra.clave ? 'bg-papel-presionado' : 'hover:bg-papel-presionado'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-archivo text-tinta text-[15px]">
                    {NOMBRE_DE_VARIABLE[barra.clave]}
                    <span className="font-space text-tinta-50 ml-2 text-[11px] uppercase tracking-[0.1em]">
                      {claseDeVariable(barra.clave)}
                    </span>
                  </span>
                  <span className={`font-space text-[12px] ${MONOTONIA[barra.monotonia].clase}`}>
                    {MONOTONIA[barra.monotonia].texto}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3">
                  <svg
                    aria-hidden
                    viewBox={`0 0 ${String(ANCHO)} ${String(ALTO)}`}
                    width={ANCHO}
                    height={ALTO}
                    className="max-w-full shrink"
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
                    <rect
                      x={x(barra.minimo.valor)}
                      y={4}
                      width={Math.max(2, x(barra.maximo.valor) - x(barra.minimo.valor))}
                      height={ALTO - 8}
                      className={
                        barra.monotonia === 'noMonotona' ? 'fill-sello' : 'fill-violeta'
                      }
                    />
                    {barra.puntos.map((punto, i) => (
                      <circle
                        key={i}
                        cx={x(punto.salida)}
                        cy={ALTO / 2}
                        r={1.5}
                        className="fill-tinta"
                      />
                    ))}
                  </svg>
                  <span className="font-space text-tinta-75 text-[12px] tabular-nums">
                    {formato(barra.bajo.valor)} → {formato(barra.alto.valor)}
                    {seSaleDeLosExtremos(barra) ? (
                      <span className="text-sello ml-2">
                        pasa por {formato(barra.minimo.valor)} y {formato(barra.maximo.valor)}
                      </span>
                    ) : null}
                  </span>
                </div>
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
