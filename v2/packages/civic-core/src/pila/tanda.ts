/**
 * El armado de una tanda de Mirar (spec 2026-10-19-mi-argentina-ideal-la-pila.md §4).
 *
 * Sin azar escondido: la misma entrada da siempre la misma tanda. El orden es
 *   1. donde la región de quien mira todavía no llega a OPINIONES_PARA_CONTAR;
 *   2. menos respuestas en total (un aporte que llegó tarde tiene la misma oportunidad);
 *   3. el más viejo primero, y a igualdad, el id.
 * Sobre ese orden, dos reglas de reparto: los lugares 3, 6 y 9 prefieren la
 * provincia de quien mira y después su región; nunca van cuatro seguidos del
 * mismo tema si hay alternativa.
 */
import { regionDe, type Region } from '../regiones.js';

export const TAMANO_DE_TANDA = 10;
export const OPINIONES_PARA_CONTAR = 5;

export interface CandidatoDeTanda {
  readonly id: string;
  /** Respuestas con valor (incluye «Paso»), de cualquier actor. */
  readonly respuestas: number;
  /** «Yo también» + «Yo no» de la región de quien mira; 0 si no se sabe su región. */
  readonly opinionesDeMiRegion: number;
  readonly publicadaEn: string;
  readonly tema: string | null;
  /** ISO de la provincia de quien lo escribió. */
  readonly provinciaIso: string | null;
}

export interface QuienMira {
  readonly provinciaIso: string | null;
  /** Desde «Completar los de tu región»: sólo vale si es la región de quien mira. */
  readonly priorizarRegion?: Region | null;
}

function urgente(c: CandidatoDeTanda, region: Region | null): boolean {
  return region !== null && c.opinionesDeMiRegion < OPINIONES_PARA_CONTAR;
}

export function ordenarCandidatos(
  candidatos: readonly CandidatoDeTanda[],
  region: Region | null,
): CandidatoDeTanda[] {
  return [...candidatos].sort(
    (x, y) =>
      Number(urgente(y, region)) - Number(urgente(x, region)) ||
      x.respuestas - y.respuestas ||
      x.publicadaEn.localeCompare(y.publicadaEn) ||
      x.id.localeCompare(y.id),
  );
}

export function armarTanda(
  candidatos: readonly CandidatoDeTanda[],
  mira: QuienMira,
  tamano = TAMANO_DE_TANDA,
): string[] {
  const region = regionDe(mira.provinciaIso);
  const ordenados = ordenarCandidatos(candidatos, region);
  const elegidos: CandidatoDeTanda[] = [];
  const usados = new Set<string>();
  while (elegidos.length < tamano && usados.size < ordenados.length) {
    const lugar = elegidos.length + 1;
    let pool = ordenados.filter((c) => !usados.has(c.id));
    if (lugar % 3 === 0 && mira.provinciaIso) {
      const deMiProvincia = pool.filter((c) => c.provinciaIso === mira.provinciaIso);
      const deMiRegion = pool.filter((c) => region !== null && regionDe(c.provinciaIso) === region);
      if (deMiProvincia.length) pool = deMiProvincia;
      else if (deMiRegion.length) pool = deMiRegion;
    }
    const ultimos = elegidos.slice(-3);
    const temaRepetido =
      ultimos.length === 3 && ultimos.every((c) => c.tema !== null && c.tema === ultimos[0]?.tema)
        ? ultimos[0]?.tema
        : undefined;
    const elegido =
      pool.find((c) => temaRepetido === undefined || c.tema !== temaRepetido) ?? pool[0];
    if (!elegido) break;
    elegidos.push(elegido);
    usados.add(elegido.id);
  }
  return elegidos.map((c) => c.id);
}
