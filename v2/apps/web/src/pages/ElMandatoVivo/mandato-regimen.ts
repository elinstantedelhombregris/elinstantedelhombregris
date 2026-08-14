/**
 * Régimen de honestidad del documento (spec 2.3): qué se puede mostrar
 * según cuántos datos reales hay. Puro y testeado — la política de
 * «cero porcentajes inventados» vive acá, no repartida por el JSX.
 */
import { leerTipoSenal, type TipoSenal } from '~/lib/vocabulario';

export const UMBRAL_PORCENTAJE = 100;

export type Regimen = 'cero' | 'palitos' | 'porcentaje';

export function regimenDe(total: number): Regimen {
  if (total <= 0) return 'cero';
  return total < UMBRAL_PORCENTAJE ? 'palitos' : 'porcentaje';
}

/** «18,4%» — es-AR, un decimal máximo. Solo llamar en régimen 'porcentaje'. */
export function formatoPorcentaje(parte: number, total: number): string {
  return `${((parte / total) * 100).toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;
}

export type Urgencia = 'crítica' | 'alta' | 'cubierta si se organiza';

/** Fórmula publicada de la urgencia de una brecha (spec §4.III). */
export function urgenciaDeBrecha(piden: number, ofrecen: number): Urgencia {
  if (ofrecen === 0) return 'crítica';
  if (ofrecen < piden) return 'alta';
  return 'cubierta si se organiza';
}

export function humanizarTema(tema: string): string {
  return tema.replaceAll('_', ' ');
}

export interface ConteoTipo {
  tipo: TipoSenal;
  total: number;
}

export interface ConteoDeTipos {
  readonly porTipo: readonly ConteoTipo[];
  /**
   * Las voces con una categoría que la paleta no reconoce, contadas APARTE.
   *
   * Antes se plegaban en `valor` con un `?? 'valor'`, y el documento del mandato
   * publicaba «valor: 3» cuando lo que había eran dos filas sin categoría y una
   * que decía otra cosa. Eso es una afirmación sobre lo que la gente vino a
   * decir, sacada de lo que el sistema no supo leer: es la regla 5 al revés —una
   * síntesis que esconde su propio hueco en vez de mostrarlo.
   */
  readonly sinReconocer: number;
}

/** Cuenta por tipo de la paleta y ordena desc, sin plegar lo que no reconoce. */
export function plegarTipos(porTipo: readonly { tipo: string | null; total: number }[]): ConteoDeTipos {
  const acumulado = new Map<TipoSenal, number>();
  let sinReconocer = 0;
  for (const fila of porTipo) {
    const lectura = leerTipoSenal(fila.tipo ?? '');
    if (!lectura.reconocido) {
      sinReconocer += fila.total;
      continue;
    }
    acumulado.set(lectura.tipo, (acumulado.get(lectura.tipo) ?? 0) + fila.total);
  }
  return {
    porTipo: [...acumulado.entries()]
      .map(([tipo, total]) => ({ tipo, total }))
      .sort((a, b) => b.total - a.total),
    sinReconocer,
  };
}

/** Cuántas brechas críticas entran en el documento (spec §4.III «tope 6»). */
export const TOPE_BRECHAS = 6;

export interface Brecha {
  provincia: string;
  piden: number;
  ofrecen: number;
}

/**
 * Recorta las brechas a las primeras `TOPE_BRECHAS`, ordenadas por urgencia
 * (`piden − ofrecen` desc — la misma fórmula que ordena en la API, spec
 * §4.III). El endpoint `GET /api/mandato/documento` NO aplica este tope: lo
 * devuelve todo ordenado; el recorte es una regla de renderizado y vive acá,
 * no en el backend, para que quede testeada como el resto del régimen.
 */
export function topeBrechas<T extends Brecha>(brechas: readonly T[]): T[] {
  return [...brechas].sort((a, b) => b.piden - b.ofrecen - (a.piden - a.ofrecen)).slice(0, TOPE_BRECHAS);
}
