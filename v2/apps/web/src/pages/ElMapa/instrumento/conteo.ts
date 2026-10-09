import { pointInPolygon } from '@v2/civic-core';

import { precisionValida } from '../lienzo/precision';

import type { GeoPoint, LocationPrecision } from '@v2/civic-core';

import { cuantos, mayuscula } from '~/lib/vocabulario';

/**
 * El conteo honesto (spec 3 §4) — el requisito duro del instrumento.
 *
 * Un lazo sobre precisión mixta NO puede mostrar un total único. Una voz vieja
 * que solo dice «Buenos Aires» y un pozo clavado en una esquina conviven dentro
 * del mismo polígono, y sumarlos produce un número que no significa nada.
 *
 * Cuatro clases, y la última es la que v1 no hacía: si el lazo roza La Matanza,
 * los 4.200 aportes que solo dicen «Buenos Aires» NO son de La Matanza. Se
 * nombran y se dejan afuera.
 */

export type ClasePrecision = 'exacta' | 'aproximada' | 'centroide' | 'provincial';

export interface SenalContable {
  id: string;
  lat: number | null;
  lng: number | null;
  precision: string;
  provinceId: number | null;
}

export interface ConteoArea {
  /** Punto exacto o ±100 m: el polígono las contiene de verdad. */
  exactas: string[];
  /** ±500 m o barrio: adentro, pero marcadas. */
  aproximadas: string[];
  /** Nivel localidad: el centro de la localidad cae adentro. */
  centroide: string[];
  /**
   * Provincias que el polígono toca y cuyas señales NO se cuentan.
   * No sabemos si son de esta zona: decir que sí sería inventar.
   */
  provinciasTocadas: number[];
  /** Cuántas señales provinciales quedaron sin contar, por honestidad. */
  provincialesSinContar: number;
  /** Las que sí se cuentan, en orden. Nunca hay un total indiferenciado. */
  contadas: string[];
}

const CLASE_POR_PRECISION: Record<LocationPrecision, ClasePrecision> = {
  exact: 'exacta',
  '100m': 'exacta',
  '500m': 'aproximada',
  neighborhood: 'aproximada',
  city: 'centroide',
  province: 'provincial',
};

export function claseDe(precision: string): ClasePrecision {
  return CLASE_POR_PRECISION[precisionValida(precision)];
}

/**
 * Clasifica lo que un polígono agarró.
 *
 * `provinciasEnArea` son las provincias cuyo dibujo el polígono toca, aunque
 * sea parcialmente — las calcula el lienzo, que es quien tiene la geometría.
 */
export function contarArea(
  senales: readonly SenalContable[],
  poligono: readonly GeoPoint[],
  provinciasEnArea: ReadonlySet<number>,
): ConteoArea {
  const conteo: ConteoArea = {
    exactas: [],
    aproximadas: [],
    centroide: [],
    provinciasTocadas: [...provinciasEnArea].sort((a, b) => a - b),
    provincialesSinContar: 0,
    contadas: [],
  };

  for (const senal of senales) {
    const clase = claseDe(senal.precision);

    if (clase === 'provincial') {
      // Sin coordenada no hay nada que testear contra el polígono. Si su
      // provincia está tocada, se nombra; si no, ni siquiera aparece.
      if (senal.provinceId !== null && provinciasEnArea.has(senal.provinceId)) {
        conteo.provincialesSinContar += 1;
      }
      continue;
    }

    if (typeof senal.lat !== 'number' || typeof senal.lng !== 'number') continue;
    if (!pointInPolygon({ lat: senal.lat, lng: senal.lng }, [...poligono])) continue;

    // Explícito a propósito: la clase nombra una categoría y el campo guarda
    // una lista. Indexar por nombre haría que renombrar una rompa la otra en
    // silencio, y estas cuatro listas son justamente lo que no puede mezclarse.
    if (clase === 'exacta') conteo.exactas.push(senal.id);
    else if (clase === 'aproximada') conteo.aproximadas.push(senal.id);
    else conteo.centroide.push(senal.id);
    conteo.contadas.push(senal.id);
  }

  return conteo;
}

/**
 * El encabezado del panel, en castellano y por clase.
 *
 * Devuelve renglones sueltos a propósito: no hay un renglón de total. Si algún
 * día alguien quiere sumar, va a tener que sumar a mano y darse cuenta de que
 * está sumando cosas distintas.
 */
export function renglonesDeConteo(conteo: ConteoArea): string[] {
  const renglones: string[] = [];

  if (conteo.exactas.length > 0) {
    renglones.push(
      `${cuantos(conteo.exactas.length, 'aporte', 'aportes')} con punto exacto o casi exacto`,
    );
  }
  if (conteo.aproximadas.length > 0) {
    renglones.push(
      `${cuantos(conteo.aproximadas.length, 'aporte', 'aportes')} con ubicación aproximada (su barrio o hasta 500 m)`,
    );
  }
  if (conteo.centroide.length > 0) {
    renglones.push(
      `${cuantos(conteo.centroide.length, 'aporte', 'aportes')} ubicados en el centro de su localidad`,
    );
  }
  if (conteo.provinciasTocadas.length > 0 && conteo.provincialesSinContar > 0) {
    const provincias = cuantos(
      conteo.provinciasTocadas.length,
      'provincia tocada',
      'provincias tocadas',
      true,
    );
    const resto =
      conteo.provincialesSinContar === 1
        ? 'su aporte no se cuenta acá: no sabemos si es de esta zona'
        : `sus ${conteo.provincialesSinContar.toLocaleString('es-AR')} aportes no se cuentan acá: no sabemos si son de esta zona`;
    renglones.push(`${provincias}: ${resto}`);
  }
  return renglones;
}

/**
 * Un área sin aportes publicados. Dice lo que se sabe —no hay aportes con
 * ubicación adentro— y no lo que no se sabe: que nadie haya dicho nada ahí.
 */
export const AREA_VACIA =
  'No hay aportes publicados en esta área: nadie cargó nada, o lo cargó sin ubicación.';

/**
 * Cuántas celdas del área no tienen aportes publicados, sin afirmar silencio.
 *
 * Una celda sin puntos es una celda donde nadie cargó algo con ubicación, o
 * donde lo que se cargó quedó a nivel provincia o localidad. No es una celda
 * donde «nadie dijo nada» (revisión del 9/10, principio «nunca inventar
 * puntos» al revés: tampoco inventar silencios).
 */
export function fraseDeCeldasSinAportes(sinAportes: number, total: number): string {
  if (total <= 0) return '';
  const causa = 'nadie cargó nada, o lo cargó sin ubicación';
  if (total === 1) {
    return sinAportes > 0
      ? `En la única celda del área no hay aportes publicados: ${causa}.`
      : 'La única celda del área tiene aportes publicados.';
  }
  const celdas = total.toLocaleString('es-AR');
  if (sinAportes <= 0) return `Las ${celdas} celdas del área tienen aportes publicados.`;
  if (sinAportes >= total) {
    return `En las ${celdas} celdas del área no hay aportes publicados: ${causa}.`;
  }
  return `En ${sinAportes.toLocaleString('es-AR')} de ${celdas} celdas no hay aportes publicados: ${causa}.`;
}

/**
 * Cuántos aportes cumplen los filtros y cuántos se muestran, en una sola frase.
 *
 * Antes eran tres renglones con el mismo número («4 en la consulta · 4 en esta
 * página», «4 sin punto», «4 de 4 coincidentes»): la revisión del 9/10 contó
 * el «4» cinco veces en una pantalla. Acá va una vez; lo que está sin punto lo
 * dice el contador del mapa.
 */
export function frasePorPagina(total: number, entregados: number): string {
  if (total <= 0) return `${mayuscula(cuantos(0, 'aporte', 'aportes'))} cumple los filtros.`;
  if (entregados >= total) {
    return `${mayuscula(cuantos(total, 'aporte', 'aportes'))} ${total === 1 ? 'cumple' : 'cumplen'} los filtros.`;
  }
  return `Mostramos ${entregados.toLocaleString('es-AR')} de ${total.toLocaleString('es-AR')} aportes que cumplen los filtros.`;
}
