/**
 * Eventos — estrellas fugaces (spec §3.4).
 *
 * Determinista y testeable: el RNG (mulberry32) se siembra con un hash de la
 * fecha (YYYY-MM-DD), así el mismo día siempre decide lo mismo en el mismo
 * dispositivo, sin persistir nada más que "ya la vio hoy". Los eventos
 * expiran en silencio — cero FOMO (spec §3.7).
 */

import type { EventoFugaz } from './types';

/** Probabilidad diaria de estrella fugaz (máx. 1 por día). */
export const PROBABILIDAD_EVENTO = 0.15;

/** Los tres efectos posibles, equiprobables. */
export const EVENTOS: readonly EventoFugaz[] = [
  'pregunta-extra',
  'brasas-x2',
  'desafio-24h',
];

/** RNG determinista de 32 bits — mulberry32. */
export const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Hash FNV-1a de 32 bits para convertir la fecha-semilla en seed numérica. */
export const hashSemilla = (semilla: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < semilla.length; i++) {
    h ^= semilla.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

/**
 * ¿Aparece una estrella fugaz hoy? Máximo una por día: si ya la vio,
 * jamás vuelve a aparecer ese día.
 */
export const shouldTrigger = (dateSeed: string, yaVioHoy: boolean): boolean => {
  if (yaVioHoy) return false;
  const rng = mulberry32(hashSemilla(`${dateSeed}#trigger`));
  return rng() < PROBABILIDAD_EVENTO;
};

/** Elige el efecto del día, uniforme entre los tres (seed independiente). */
export const pickEvento = (dateSeed: string): EventoFugaz => {
  const rng = mulberry32(hashSemilla(`${dateSeed}#tipo`));
  return EVENTOS[Math.floor(rng() * EVENTOS.length)]!;
};

/** Copys rioplatenses para la UI del evento. */
export const descripcionEvento = (evento: EventoFugaz): string => {
  switch (evento) {
    case 'pregunta-extra':
      return 'Una pregunta extra cayó del cielo. Si la respondés, +2 brasas.';
    case 'brasas-x2':
      return 'Hoy las brasas valen doble. Aprovechá la noche.';
    case 'desafio-24h':
      return 'Desafío de 24 horas: capturá 3 estrellas hoy y ganás +8 brasas.';
  }
};
