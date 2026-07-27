import { pointInPolygon } from '@v2/civic-core';

import { precisionValida } from '../lienzo/precision';

import type { GeoPoint, LocationPrecision } from '@v2/civic-core';


/**
 * El conteo honesto (spec 3 §4) — el requisito duro del instrumento.
 *
 * Un lazo sobre precisión mixta NO puede mostrar un total único. Una voz vieja
 * que solo dice «Buenos Aires» y un pozo clavado en una esquina conviven dentro
 * del mismo polígono, y sumarlos produce un número que no significa nada.
 *
 * Cuatro clases, y la última es la que v1 no hacía: si el lazo roza La Matanza,
 * las 4.200 voces que solo dicen «Buenos Aires» NO son de La Matanza. Se
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
  const n = (cantidad: number, singular: string, plural: string): string =>
    `${String(cantidad)} ${cantidad === 1 ? singular : plural}`;

  if (conteo.exactas.length > 0) {
    renglones.push(n(conteo.exactas.length, 'con punto exacto', 'con punto exacto'));
  }
  if (conteo.aproximadas.length > 0) {
    renglones.push(n(conteo.aproximadas.length, 'aproximada', 'aproximadas'));
  }
  if (conteo.centroide.length > 0) {
    renglones.push(
      n(conteo.centroide.length, 'por centro de localidad', 'por centro de localidad'),
    );
  }
  if (conteo.provinciasTocadas.length > 0 && conteo.provincialesSinContar > 0) {
    renglones.push(
      `${n(conteo.provinciasTocadas.length, 'provincia tocada', 'provincias tocadas')} — ` +
        `sus ${String(conteo.provincialesSinContar)} señales no se cuentan acá, no sabemos si son de esta zona`,
    );
  }
  return renglones;
}

/** Un área vacía también es información, y hay que decirlo así. */
export const AREA_VACIA = 'No hay nada acá todavía. Que un área esté vacía también es información.';
