/**
 * Los dos relojes de una señal — se llavean por TIPO, no por clase.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §2.6.
 *
 * `vence` es cuándo la señal deja de afirmar; `gracia` es cuánto más se la
 * muestra marcada antes de caducar. Una señal sin los dos relojes no la barre
 * ningún cron, y el hecho afirma para siempre.
 *
 * Es una de las tres razones bloqueantes por las que el tipo no puede
 * desaparecer debajo de la clase: una composición declarada sólo por clase no
 * puede setear `vence_el` ni `caduca_el` de una señal ensayada, y un generador
 * que los llena con una constante produce una dimensión que el análisis de
 * sensibilidad va a reportar como insensible — y va a tener razón.
 *
 * Vive aparte de `vocabulario.ts` porque es otra cosa: el vocabulario dice qué
 * tipos hay y de qué clase son; esto dice cuánto vive cada uno.
 */
import type { TipoSenal } from './vocabulario.js';

/**
 * `compromiso` no tiene vencimiento de tabla: **vence el día que declara**.
 * Ponerle un default sería inventar la fecha que la persona eligió, que es
 * justo el campo por el que un `acto` es un acto.
 */
export type Reloj =
  | { plazo: 'tabla'; venceDias: number; graciaDias: number }
  | { plazo: 'declarado'; graciaDias: number };

/**
 * La tabla. Los cinco `hecho` llevan su propio par; los `deseo` y la `meta`
 * van por plazo fijo de clase —730 días un deseo, 365 una pregunta— y por eso
 * comparten gracia.
 */
const RELOJ_DE = {
  basta: { plazo: 'tabla', venceDias: 90, graciaDias: 45 },
  necesidad: { plazo: 'tabla', venceDias: 180, graciaDias: 90 },
  recurso: { plazo: 'tabla', venceDias: 30, graciaDias: 15 },
  práctica: { plazo: 'tabla', venceDias: 180, graciaDias: 90 },
  saber: { plazo: 'tabla', venceDias: 365, graciaDias: 182 },
  sueño: { plazo: 'tabla', venceDias: 730, graciaDias: 90 },
  propuesta: { plazo: 'tabla', venceDias: 730, graciaDias: 90 },
  pregunta: { plazo: 'tabla', venceDias: 365, graciaDias: 90 },
  compromiso: { plazo: 'declarado', graciaDias: 30 },
} satisfies Record<TipoSenal, Reloj>;

/** El reloj de un tipo. Total sobre `TipoSenal`: no hay tipo sin reloj. */
export const relojDe = (tipo: TipoSenal): Reloj => RELOJ_DE[tipo];

/** Un día, en milisegundos. El reloj entra por parámetro; esto es una unidad. */
export const DIA_MS = 24 * 60 * 60 * 1000;

/** Los dos instantes de una señal, calculados desde su publicación. */
export interface Vencimientos {
  venceEl: number;
  caducaEl: number;
}

/**
 * Los dos instantes, a partir de la publicación.
 *
 * `comprometidoPara` es obligatorio para `compromiso` y se ignora para el
 * resto. Si falta en un compromiso, esto **tira**: un acto sin fecha no es un
 * acto, y dejarlo pasar con un default sería exactamente el campo constante
 * que vuelve insensible el análisis.
 */
export function vencimientosDe(
  tipo: TipoSenal,
  publicadaEn: number,
  comprometidoPara: number | null,
): Vencimientos {
  const reloj = relojDe(tipo);
  if (reloj.plazo === 'declarado') {
    if (comprometidoPara === null) {
      throw new Error(
        `Un «${tipo}» necesita la fecha que declara y llegó sin ella. ` +
          'Un acto sin fecha no se puede cumplir ni vencer, y ponerle un default ' +
          'sería inventar la fecha que la persona eligió.',
      );
    }
    return {
      venceEl: comprometidoPara,
      caducaEl: comprometidoPara + reloj.graciaDias * DIA_MS,
    };
  }
  const venceEl = publicadaEn + reloj.venceDias * DIA_MS;
  return { venceEl, caducaEl: venceEl + reloj.graciaDias * DIA_MS };
}
