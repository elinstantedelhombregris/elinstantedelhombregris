import { pintarNube } from '../nube-pintor';
import { NOMBRE_DE_VARIABLE, numero, UNIDAD_DE_VARIABLE } from '../simulacion-lectura';

import type { ClaveVariable, Objetivo, PuntoDeBarra } from '@v2/civic-core';

/**
 * § La nube — para que el escalón se vea.
 *
 * Ésta es la pieza que impide que el tornado mienta. Una barra larga puede ser
 * una rampa suave o un salto de golpe, y la barra las dibuja igual: acá se ve
 * cuál de las dos es. Medido sobre el motor: participación 50, 100, 200, 300,
 * 366 y 367 dan **todas** el mismo resultado, y entre 438,14 y 438,16 el país
 * entero cambia de estado. Eso, en una barra, es indistinguible de una recta.
 *
 * Cuando el salto existe, se dice con palabras y con números arriba del dibujo,
 * porque el dibujo es `aria-hidden` y la afirmación no puede vivir sólo ahí.
 */

export interface NubeProps {
  readonly clave: ClaveVariable | null;
  readonly puntos: readonly PuntoDeBarra[];
  readonly objetivo: Objetivo;
  readonly formato: (v: number) => string;
}

export function Nube({ clave, puntos, objetivo, formato }: NubeProps) {
  if (clave === null) {
    return (
      <section aria-label="La forma de la respuesta" className="text-tinta-50 text-[14px]">
        Elegí una variable del tornado para ver la forma de su respuesta.
      </section>
    );
  }

  const nube = pintarNube(puntos);
  const unidad = UNIDAD_DE_VARIABLE[clave] ?? '';

  const camino = nube.puntos
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');

  return (
    <section aria-labelledby="titulo-nube">
      <h2 id="titulo-nube" className="font-anton text-tinta text-[24px] leading-[1.15]">
        La forma de la respuesta
      </h2>
      <p className="text-tinta-75 mb-3 mt-1 max-w-[62ch] text-[14px] leading-[1.5]">
        {NOMBRE_DE_VARIABLE[clave]} contra {objetivo}.{' '}
        {nube.plana ? (
          <>
            En todo el rango declarado el resultado no se movió ni una vez. Eso no es «poco
            importante»: es que en este tramo la variable no decide nada.
          </>
        ) : nube.salto === null ? (
          <>La respuesta se mueve de a poco: acá una derivada significaría algo.</>
        ) : (
          <>
            <strong className="text-sello">Hay un escalón.</strong> Entre {numero(nube.salto.desde)}{' '}
            y {numero(nube.salto.hasta)} {unidad} el resultado pasa de{' '}
            {formato(nube.salto.deValor)} a {formato(nube.salto.aValor)}: el{' '}
            {Math.round(nube.salto.fraccion * 100)}% de todo el recorrido en un solo tramo. Una
            derivada acá sería 0 en casi todo el dominio e infinita en un punto.
          </>
        )}
      </p>

      <svg
        aria-hidden
        viewBox={`0 0 ${String(nube.ancho)} ${String(nube.alto)}`}
        width="100%"
        height={nube.alto}
        className="max-w-[460px]"
      >
        {nube.marcasY.map((marca) => (
          <g key={`y${String(marca.valor)}`}>
            <line
              x1={nube.margen.izq}
              y1={marca.posicion}
              x2={nube.ancho - nube.margen.der}
              y2={marca.posicion}
              stroke="currentColor"
              className="text-papel-borde"
              strokeWidth={1}
            />
            <text
              x={nube.margen.izq - 6}
              y={marca.posicion + 4}
              textAnchor="end"
              className="fill-tinta-50 font-space"
              fontSize={10}
            >
              {formato(marca.valor)}
            </text>
          </g>
        ))}

        {nube.marcasX.map((marca) => (
          <text
            key={`x${String(marca.valor)}`}
            x={marca.posicion}
            y={nube.alto - 10}
            textAnchor="middle"
            className="fill-tinta-50 font-space"
            fontSize={10}
          >
            {numero(marca.valor, 1)}
          </text>
        ))}

        {camino === '' ? null : (
          <path d={camino} fill="none" stroke="currentColor" className="text-tinta-30" strokeWidth={1} />
        )}

        {nube.puntos.map((punto, i) => (
          <circle key={i} cx={punto.x} cy={punto.y} r={3} className="fill-violeta" />
        ))}
      </svg>

      <p className="font-space text-tinta-50 mt-1 text-[10px] uppercase tracking-[0.1em]">
        eje horizontal: {NOMBRE_DE_VARIABLE[clave]} {unidad === '' ? '' : `(${unidad})`} · vertical:{' '}
        {objetivo}
      </p>
    </section>
  );
}
