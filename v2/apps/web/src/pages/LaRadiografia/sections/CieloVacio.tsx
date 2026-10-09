import { Link } from 'wouter';

import { type Tema } from '../radiografia-data';

import { FONDO_DEL_TEMA, TINTA_DEL_TEMA } from '~/components/mapa/pintor-senales';
import { APORTAR_HREF } from '~/lib/participacion/aportar';

/**
 * § El vacío, que es lo que se ve hoy (spec §6, y V2/V3/V4 de
 * `2026-08-02-el-vacio-como-pieza.md`).
 *
 * Vacío **propio**, que invita sin disculparse, y que **se desarma solo**
 * cuando llega el dato: no hay ningún flag que alguien tenga que acordarse de
 * bajar. La página decide qué mostrar contando lo que trajo el servidor, y el
 * día que haya dos señales con vector esto no se renderiza más.
 *
 * Es **el único** estado vacío de la página: la cabecera de procedencia, el
 * contador y la lectura de opiniones no repiten el mismo «todavía no hay» con
 * otras palabras (revisión del 9/10: cuatro vacíos en una pantalla). Cuatro
 * estados, y ninguno pide perdón:
 *
 *  - **todavía no corrió ningún análisis** — se dice, sin ceros;
 *  - **hay aportes pero ninguno con análisis** — el job todavía no corrió sobre
 *    ellos, y eso se dice, no se disimula (R3);
 *  - **un solo aporte analizado** — no hay con qué compararlo;
 *  - **varios, pero ninguna relación** — con los filtros de ahora no se dibuja nada.
 */

export interface CieloVacioProps {
  /** Aportes con análisis, o sea los dibujables. */
  analizadas: number;
  /** Aportes que existen y no tienen análisis todavía. */
  sinVector: number;
  /** Si ya corrió algún análisis. Sin él, el vacío dice que todavía no hay uno. */
  corrio?: boolean;
  tema: Tema;
}

export function CieloVacio({ analizadas, sinVector, corrio = true, tema }: CieloVacioProps) {
  const fondo = FONDO_DEL_TEMA[tema];
  const tinta = TINTA_DEL_TEMA[tema];
  const nocturno = tema === 'nocturno';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';

  const { titulo, glosa } = decir(analizadas, sinVector, corrio);

  return (
    <div
      className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden px-8 py-16 text-center"
      style={{ background: fondo }}
    >
      {/* Grabado de semitono: sólo en la lámina del vacío, nunca sobre la
          superficie viva — el tramado pelea contra apuntarle a un nodo y leer
          una frase, y el pase de trama se paga en cada cuadro (§5.1). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${tinta} 1px, transparent 1px)`,
          backgroundSize: '9px 9px',
          opacity: nocturno ? 0.14 : 0.1,
        }}
      />

      <p
        className={`font-anton relative max-w-[620px] text-[clamp(28px,3.6vw,44px)] leading-[1.08] ${texto}`}
      >
        {titulo}
      </p>
      <p className={`relative mt-5 max-w-[520px] text-[16px] leading-[1.6] ${meta}`}>{glosa}</p>

      <Link
        href={APORTAR_HREF}
        className="bg-violeta text-papel font-space hover:bg-tinta relative mt-8 px-7 py-[18px] text-[13px] font-bold uppercase tracking-[0.08em] transition-colors"
      >
        Sumá tu aporte en el mapa
      </Link>
    </div>
  );
}

function decir(
  analizadas: number,
  sinVector: number,
  corrio: boolean,
): { titulo: string; glosa: string } {
  if (analizadas === 0 && sinVector > 0) {
    return {
      titulo: 'Hay aportes. Falta poder compararlos.',
      glosa: `${sinVector.toLocaleString('es-AR')} ${sinVector === 1 ? 'aporte de esta consulta todavía no tiene' : 'aportes de esta consulta todavía no tienen'} análisis. Podés verlos en el mapa o abrir el laboratorio para ver cómo se leen las relaciones.`,
    };
  }
  if (analizadas === 1) {
    return {
      titulo: 'Hay un solo aporte analizado. Todavía no hay con qué compararlo.',
      glosa: 'Para que aparezca una línea hacen falta al menos dos.',
    };
  }
  if (!corrio) {
    return {
      titulo: 'Todavía no hay un análisis.',
      glosa:
        'Cuando se analice el primer lote, acá se van a agrupar los aportes según qué tan parecido es su texto.',
    };
  }
  return {
    titulo: 'Acá todavía no aparecen relaciones.',
    glosa:
      'Esta lectura necesita más textos comparables. Que no se dibujen relaciones no significa que nadie haya participado: un aporte puede conservar su texto reservado o quedar fuera de estos filtros.',
  };
}
