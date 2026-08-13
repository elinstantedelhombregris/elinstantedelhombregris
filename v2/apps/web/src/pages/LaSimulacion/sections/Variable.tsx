import {
  claseDeVariable,
  dominioDe,
  numero,
  NOMBRE_DE_VARIABLE,
  UNIDAD_DE_VARIABLE,
} from '../simulacion-lectura';

import type { EstadoDeVariable } from '../useDiseno';
import type { ClaveVariable, Distribucion } from '@v2/civic-core';

/**
 * § Una variable de la mesa.
 *
 * Tres estados y ninguno es decorativo:
 *
 * - **fijada** — vale un número y el barrido no la toca. Se escribe a mano o se
 *   arrastra; el número está siempre a la vista, porque un dial que dice
 *   «Concentrado» en vez de `0,2` no se puede comunicar ni reproducir.
 * - **barrida** — el barrido la recorre sobre su dominio declarado.
 * - **noConectada** — el motor no la lee en este modo, **y no se dibuja un
 *   control**. Un dial que no hace nada es peor que una ausencia explicada: es
 *   la lección de MiroFish, donde trece de dieciséis perillas se generan y no
 *   las lee nadie, y quien mueva una de ésas y vea cambiar el resultado va a
 *   creer que aprendió algo.
 *
 * **El rango no se edita, y se dice por qué.** El motor toma los dominios de
 * `DOMINIOS`, cada uno con su razón escrita; un campo para escribir otro mínimo
 * sería un control que el motor no leería — la misma utilería que este módulo
 * existe para no tener.
 */

export interface VariableProps {
  readonly clave: ClaveVariable;
  readonly estado: EstadoDeVariable;
  readonly valor: number | null;
  readonly razon: string;
  readonly onAlternar: (clave: ClaveVariable) => void;
  readonly onFijar: (clave: ClaveVariable, valor: number) => void;
}

function prosaDeDistribucion(distribucion: Distribucion): string {
  switch (distribucion.forma) {
    case 'uniforme':
      return 'uniforme';
    case 'triangular':
      return `triangular con moda en ${numero(distribucion.modo)}`;
    case 'lognormal':
      return `lognormal (mediana ${numero(distribucion.mediana)}, σ ${numero(distribucion.sigma)})`;
    case 'discreta':
      return `discreta: ${distribucion.valores.map((v) => numero(v, 3)).join(' · ')}`;
  }
}

export function Variable({ clave, estado, valor, razon, onAlternar, onFijar }: VariableProps) {
  const dominio = dominioDe(clave);
  const id = `var-${clave}`;
  const idRazon = `${id}-razon`;
  const unidad = UNIDAD_DE_VARIABLE[clave];
  const paso = dominio.entero ? 1 : (dominio.maximo - dominio.minimo) / 200;

  return (
    <li className="border-papel-borde border-b py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <label htmlFor={id} className="font-archivo text-tinta block text-[16px] leading-[1.3]">
            {NOMBRE_DE_VARIABLE[clave]}
          </label>
          <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]">
            {clave} · {claseDeVariable(clave)}
          </span>
        </div>

        {estado === 'noConectada' ? (
          <span className="font-space text-tinta-50 border-tinta-30 border border-dashed px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]">
            No conectada
          </span>
        ) : (
          <button
            type="button"
            aria-pressed={estado === 'barrida'}
            onClick={() => {
              onAlternar(clave);
            }}
            className={`font-space border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${
              estado === 'barrida'
                ? 'bg-violeta border-violeta text-papel'
                : 'border-tinta text-tinta hover:bg-papel-presionado'
            }`}
          >
            {estado === 'barrida' ? 'Se barre' : 'Fijada'}
          </button>
        )}
      </div>

      {estado === 'noConectada' ? (
        <p className="text-tinta-50 mt-2 max-w-[70ch] text-[13px] leading-[1.5]">{razon}</p>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-4">
            <input
              type="range"
              min={dominio.minimo}
              max={dominio.maximo}
              step={paso}
              value={valor ?? dominio.minimo}
              disabled={estado === 'barrida'}
              aria-describedby={idRazon}
              aria-label={`${NOMBRE_DE_VARIABLE[clave]}, deslizador`}
              onChange={(e) => {
                onFijar(clave, Number(e.target.value));
              }}
              className="accent-violeta h-1 flex-1 cursor-pointer disabled:cursor-not-allowed"
            />
            <input
              id={id}
              type="number"
              min={dominio.minimo}
              max={dominio.maximo}
              step={dominio.entero ? 1 : 'any'}
              value={valor ?? ''}
              disabled={estado === 'barrida'}
              aria-describedby={idRazon}
              onChange={(e) => {
                const leido = Number(e.target.value);
                if (Number.isFinite(leido)) onFijar(clave, leido);
              }}
              className="font-space border-tinta text-tinta w-[110px] border bg-transparent px-2 py-1.5 text-right text-[15px] tabular-nums disabled:border-dashed disabled:text-tinta-30"
            />
          </div>

          <p id={idRazon} className="text-tinta-50 mt-2 max-w-[70ch] text-[13px] leading-[1.5]">
            <span className="font-space text-tinta-75">
              [{numero(dominio.minimo, 3)} – {numero(dominio.maximo, 3)}]
              {unidad === undefined ? '' : ` ${unidad}`} · {prosaDeDistribucion(dominio.distribucion)}
            </span>{' '}
            {dominio.razon}
          </p>
        </>
      )}
    </li>
  );
}
