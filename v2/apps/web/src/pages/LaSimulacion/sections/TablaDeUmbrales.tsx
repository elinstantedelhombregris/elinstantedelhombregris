import { explicarProcedencia, magnitudEsHipotesis, numero } from '../simulacion-lectura';

import type { UmbralDeTerritorio } from '@v2/civic-core';

import { TablaPapel, type ColumnaPapel } from '~/components/papel/primitives';


/**
 * § La tabla de umbrales — el titular del módulo.
 *
 * La respuesta del motor es un **escalón** y no una rampa: medido, el borde de
 * `participacion` está en 438,15, y una grilla de paso 50 evalúa 350 y 400 y no
 * ve nada. Con la derivada valiendo 0 en casi todo el dominio e infinita en un
 * punto, la pregunta útil no es «cuánto sube el alcance por cada punto de
 * participación» sino **«¿a partir de qué participación gana mandato mi
 * provincia?»**. Es un número por territorio, se encuentra por bisección en
 * unas quince corridas, y es además el número que le sirve a una persona real.
 *
 * Los tres estados dicen tres cosas distintas y ninguno es un cero:
 *
 * - **encontrado** — el número, con la fórmula a la vista;
 * - **ya tiene** — lo que lo sostiene no es la voz que este barrido mueve;
 * - **inalcanzable** — ni en el tope del dominio cruza el piso y lo sostiene.
 *   No es «infinito» ni un guion: es una afirmación con su tope declarado.
 */

export interface TablaDeUmbralesProps {
  readonly umbrales: readonly UmbralDeTerritorio[];
}

const RANGO: Readonly<Record<UmbralDeTerritorio['estado'], number>> = {
  encontrado: 0,
  yaTiene: 1,
  inalcanzable: 2,
};

function ordenar(umbrales: readonly UmbralDeTerritorio[]): readonly UmbralDeTerritorio[] {
  return [...umbrales].sort((a, b) => {
    if (RANGO[a.estado] !== RANGO[b.estado]) return RANGO[a.estado] - RANGO[b.estado];
    if (a.estado === 'encontrado' && b.estado === 'encontrado') {
      return a.participacion.valor - b.participacion.valor;
    }
    return a.territorioId < b.territorioId ? -1 : 1;
  });
}

const COLUMNAS: readonly ColumnaPapel<UmbralDeTerritorio>[] = [
  {
    clave: 'territorio',
    rotulo: 'Provincia',
    celda: (u) => <span className="text-[16px]">{u.territorioId}</span>,
  },
  {
    clave: 'umbral',
    rotulo: 'Voces cada 100 mil que hacen falta',
    alinear: 'der',
    celda: (u) => {
      if (u.estado === 'encontrado') {
        return (
          <span
            className={`font-space text-[17px] font-bold ${
              magnitudEsHipotesis(u.participacion) ? 'text-sello' : 'text-tinta'
            }`}
          >
            {numero(u.participacion.valor, 2)}
          </span>
        );
      }
      if (u.estado === 'yaTiene') {
        return <span className="font-space text-verde text-[13px] uppercase">ya lo tiene</span>;
      }
      return (
        <span className="font-space text-sello text-[13px] uppercase">
          ni con {numero(u.tope.valor)}
        </span>
      );
    },
  },
  {
    clave: 'razon',
    rotulo: 'Cómo se sabe',
    celda: (u) => (
      <span className="text-tinta-50 block max-w-[52ch] text-[13px] leading-[1.45]">
        {u.estado === 'encontrado'
          ? `${explicarProcedencia(u.participacion.procedencia)} · ${String(u.corridas)} corridas`
          : u.razon}
      </span>
    ),
  },
];

export function TablaDeUmbrales({ umbrales }: TablaDeUmbralesProps) {
  return (
    <section aria-labelledby="titulo-umbrales" className="mt-10">
      <h2 id="titulo-umbrales" className="font-anton text-tinta text-[28px] leading-[1.1]">
        A partir de cuántas voces gana mandato cada provincia
      </h2>
      <p className="text-tinta-75 mb-5 mt-2 max-w-[70ch] text-[15px] leading-[1.55]">
        Un número por provincia, encontrado por bisección con las demás variables en lo que dice la
        mesa. Cambiá una y los veinticuatro se mueven: eso es lo que hay que mirar.
      </p>
      <TablaPapel
        caption="La participación mínima con la que cada provincia gana mandato, con el estado de cada una."
        columnas={COLUMNAS}
        filas={ordenar(umbrales)}
        claveDeFila={(u) => u.territorioId}
        vacio="Todavía no se corrió el barrido de umbrales."
      />
    </section>
  );
}
