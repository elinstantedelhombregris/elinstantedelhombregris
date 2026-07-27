/**
 * Rotación diaria de contenido — pura y determinística (spec §4).
 *
 * La pregunta del día, las tres sugerencias de compromiso y la variante del
 * cierre de Noche Completa salen todas de la fecha local (YYYY-MM-DD):
 * mismo día → mismo contenido, sin estado, sin RNG persistido.
 */

import { esFechaISO } from './racha';

/** Día del año 1..366 de una fecha ISO local (YYYY-MM-DD). */
export const diaDelAno = (fecha: string): number => {
  if (!esFechaISO(fecha)) throw new Error(`Fecha inválida: ${fecha}`);
  const [y, m, d] = fecha.split('-').map(Number) as [number, number, number];
  const inicio = Date.UTC(y, 0, 1);
  const dia = Date.UTC(y, m - 1, d);
  return Math.round((dia - inicio) / 86_400_000) + 1;
};

/** Índice de la pregunta del día: día del año % total (spec §4). */
export const indicePregunta = (fecha: string, total: number): number => {
  if (!Number.isInteger(total) || total < 1) {
    throw new Error(`Total inválido: ${total}`);
  }
  return diaDelAno(fecha) % total;
};

/**
 * Índice de la pregunta extra (evento fugaz): la opuesta del corpus,
 * garantizada distinta de la del día mientras haya más de una pregunta.
 */
export const indicePreguntaExtra = (fecha: string, total: number): number => {
  const base = indicePregunta(fecha, total);
  if (total < 2) return base;
  return (base + Math.floor(total / 2)) % total;
};

/** Variante del texto de Noche Completa (rota entre las disponibles). */
export const indiceVariante = (fecha: string, total: number): number =>
  indicePregunta(fecha, total);

/** Lo mínimo que este módulo necesita saber de un compromiso del mazo. */
export interface CompromisoDelMazo {
  categoria: string;
}

/**
 * Tres sugerencias del mazo para hoy: tres categorías DISTINTAS (variedad),
 * rotando por fecha tanto las categorías como el ítem dentro de cada una.
 * Devuelve índices sobre el mazo recibido, en el orden de las categorías.
 */
export const indicesCompromisosDelDia = (
  fecha: string,
  mazo: readonly CompromisoDelMazo[],
): number[] => {
  if (mazo.length === 0) return [];
  const dia = diaDelAno(fecha);

  // Categorías en orden de primera aparición (estable respecto del mazo).
  const categorias: string[] = [];
  const porCategoria = new Map<string, number[]>();
  mazo.forEach((c, i) => {
    if (!porCategoria.has(c.categoria)) {
      porCategoria.set(c.categoria, []);
      categorias.push(c.categoria);
    }
    porCategoria.get(c.categoria)!.push(i);
  });

  const k = Math.min(3, categorias.length);
  const paso = Math.max(1, Math.floor(categorias.length / k));
  const indices: number[] = [];
  for (let j = 0; j < k; j++) {
    const cat = categorias[(dia + j * paso) % categorias.length]!;
    const items = porCategoria.get(cat)!;
    indices.push(items[(dia + j) % items.length]!);
  }
  return indices;
};

/**
 * Fecha local (YYYY-MM-DD) de un timestamp ISO 8601, según el reloj del
 * dispositivo. Sirve para contar "estrellas capturadas hoy" (desafío 24 h).
 */
export const fechaLocalDeISO = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error(`Timestamp inválido: ${iso}`);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
