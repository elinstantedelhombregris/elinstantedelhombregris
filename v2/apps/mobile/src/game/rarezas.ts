/**
 * Rarezas — flags de una estrella al nacer (spec §3.1).
 *
 * Puro y sin reloj: la hora local y el estado del evento llegan por
 * parámetro; el llamador (la capa DB/UI) decide qué hora es.
 */

import type { Star, TipoEstrella } from './types';

/** Fundadora: primera estrella de su tipo entre las ya existentes. */
export const esFundadora = (
  tipo: TipoEstrella,
  existentes: Pick<Star, 'tipo'>[],
): boolean => !existentes.some((s) => s.tipo === tipo);

/**
 * Nocturna: capturada entre las 22:00 y las 06:00 (hora local).
 * Rango [22, 24) ∪ [0, 6): las 22:00 en punto ya es nocturna; las 06:00
 * en punto ya no.
 */
export const esNocturna = (hora: number): boolean => {
  if (!Number.isInteger(hora) || hora < 0 || hora > 23) {
    throw new Error(`Hora inválida: ${hora}`);
  }
  return hora >= 22 || hora < 6;
};

/** Fugaz: capturada mientras un evento fugaz estaba activo. */
export const esFugaz = (eventoActivo: boolean): boolean => eventoActivo;

/** Calcula los tres flags de una vez, para usar al crear la estrella. */
export const calcularRarezas = (
  input: { tipo: TipoEstrella; hora: number; eventoActivo: boolean },
  existentes: Pick<Star, 'tipo'>[],
): { fundadora: boolean; nocturna: boolean; fugaz: boolean } => ({
  fundadora: esFundadora(input.tipo, existentes),
  nocturna: esNocturna(input.hora),
  fugaz: esFugaz(input.eventoActivo),
});
