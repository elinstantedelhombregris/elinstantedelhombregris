import { Link } from 'wouter';

import { FONDO_DE_TEMA, TINTA_DE_TEMA, type Tema } from '../radiografia-data';

/**
 * § El vacío, que es lo que se ve hoy (spec §6, y V2/V3/V4 de
 * `2026-08-02-el-vacio-como-pieza.md`).
 *
 * Vacío **propio**, que invita sin disculparse, y que **se desarma solo**
 * cuando llega el dato: no hay ningún flag que alguien tenga que acordarse de
 * bajar. La página decide qué mostrar contando lo que trajo el servidor, y el
 * día que haya dos señales con vector esto no se renderiza más.
 *
 * Tres estados, y ninguno pide perdón:
 *
 *  - **cero señales** — el cielo vacío en grabado de semitono;
 *  - **una señal** — un punto solo, rotulado;
 *  - **cero con vector, pero hay señales esperando** — el job todavía no
 *    corrió, y eso se dice, no se disimula (R3).
 */

export interface CieloVacioProps {
  /** Señales con vector, o sea las dibujables. */
  analizadas: number;
  /** Señales que existen y no tienen vector todavía. */
  sinVector: number;
  tema: Tema;
}

export function CieloVacio({ analizadas, sinVector, tema }: CieloVacioProps) {
  const fondo = FONDO_DE_TEMA[tema];
  const tinta = TINTA_DE_TEMA[tema];
  const nocturno = tema === 'nocturno';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';

  const { titulo, glosa } = decir(analizadas, sinVector);

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
        href="/el-mapa"
        className="bg-violeta text-papel font-space hover:bg-tinta relative mt-8 px-7 py-[18px] text-[13px] font-bold uppercase tracking-[0.08em] transition-colors"
      >
        Dejá la tuya en el mapa
      </Link>
    </div>
  );
}

function decir(analizadas: number, sinVector: number): { titulo: string; glosa: string } {
  if (analizadas === 0 && sinVector > 0) {
    return {
      titulo: 'Hay voces, y todavía nadie las midió.',
      glosa: `${String(sinVector)} ${sinVector === 1 ? 'señal está' : 'señales están'} esperando análisis. El trabajo que calcula los vectores se corre a mano y todavía no corrió — no se dibuja lo que no se midió, y no se esconde lo que falta.`,
    };
  }
  if (analizadas === 1) {
    return {
      titulo: 'La primera. Todavía no hay con qué compararla.',
      glosa: 'Una constelación necesita dos estrellas para tener una línea.',
    };
  }
  return {
    titulo: 'Todavía no habló nadie.',
    glosa: 'Una constelación necesita dos estrellas para tener una línea.',
  };
}
