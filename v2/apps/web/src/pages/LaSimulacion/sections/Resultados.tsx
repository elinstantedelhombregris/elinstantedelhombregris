import { entero, formatoDeObjetivo } from '../simulacion-lectura';

import { FichaDeCorrida } from './FichaDeCorrida';
import { Importancia } from './Importancia';
import { Incertidumbre } from './Incertidumbre';
import { Nube } from './Nube';
import { TablaDeUmbrales } from './TablaDeUmbrales';
import { Tornado } from './Tornado';

import type {
  BarraDeTornado,
  ClaveVariable,
  Corrida,
  Objetivo,
  PuntoDeBarra,
  ResultadoBarrido,
} from '@v2/civic-core';

/** Los puntos medidos de una variable, o ninguno si no se eligió o no está conectada. */
function puntosDe(
  barras: readonly BarraDeTornado[],
  elegida: ClaveVariable | null,
): readonly PuntoDeBarra[] {
  if (elegida === null) return [];
  for (const barra of barras) {
    if (barra.clave === elegida && barra.estado === 'medida') return barra.puntos;
  }
  return [];
}

/**
 * § Los resultados — cada método con su lectura, y la negativa con su cuenta.
 *
 * El caso `seNiega` no es un error: es una decisión de diseño con nombre. Arriba
 * del techo declarado el módulo **se niega y explica la cuenta**, en vez de
 * congelar la pestaña. Negarse con una cuenta a la vista es lo que impide que
 * la primera persona que baje a nivel municipio se lleve puesta la herramienta,
 * y es más útil que una barra que no avanza.
 */

export interface ResultadosProps {
  readonly resultado: ResultadoBarrido;
  readonly base: Corrida;
  readonly objetivo: Objetivo;
  readonly territorios: number;
  readonly elegida: ClaveVariable | null;
  readonly onElegir: (clave: ClaveVariable) => void;
}

export function Resultados({
  resultado,
  base,
  objetivo,
  territorios,
  elegida,
  onElegir,
}: ResultadosProps) {
  if (resultado.estado === 'seNiega') {
    return (
      <section aria-labelledby="titulo-niega" className="border-sello mt-10 border-2 p-6">
        <h2 id="titulo-niega" className="font-anton text-sello text-[24px] leading-[1.15]">
          El módulo se niega, y te muestra la cuenta
        </h2>
        <p className="text-tinta-75 mt-2 max-w-[70ch] text-[15px] leading-[1.55]">
          {resultado.razon}
        </p>
        <p className="font-space text-tinta-50 mt-3 text-[12px] tabular-nums">
          {entero(resultado.territorioCorridas.valor)}{' '}
          {resultado.territorioCorridas.unidad} contra un techo de{' '}
          {entero(resultado.techo.valor)}.
        </p>
      </section>
    );
  }

  const formato = formatoDeObjetivo(objetivo);
  const { salida } = resultado;

  return (
    <>
      {salida.metodo === 'umbral' ? <TablaDeUmbrales salida={salida} /> : null}

      {salida.metodo === 'unaPorVez' ? (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Tornado
            barras={salida.barras}
            objetivo={objetivo}
            formato={formato}
            elegida={elegida}
            onElegir={onElegir}
          />
          <Nube
            clave={elegida}
            objetivo={objetivo}
            formato={formato}
            puntos={puntosDe(salida.barras, elegida)}
          />
        </div>
      ) : null}

      {salida.metodo === 'hipercubo' ? (
        <>
          <Incertidumbre estimaciones={salida.estimaciones} territorios={territorios} />
          <Importancia importancia={salida.importancia} objetivo={objetivo} />
        </>
      ) : null}

      <FichaDeCorrida corrida={base} />
    </>
  );
}
