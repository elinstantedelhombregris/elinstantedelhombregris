/**
 * La única puerta por la que sale una coordenada de La Radiografía.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` R13 y §4.5.5 ·
 * `docs/specs/2026-08-11-d-el-registro-publico.md` §47.
 *
 * Vive en su propio archivo —y no adentro de la consulta— por dos motivos:
 * es la pieza que la guarda del punto (spec §11) tiene que poder probar sin
 * levantar una base, y es la que alguien va a tener la tentación de saltear el
 * día que necesite «la distancia exacta para una sola cosa». Que sea una
 * función sola, exportada y con test propio es lo que hace que saltearla se
 * note.
 */
import { PRECISION_ORDER, isCoarserOrEqual, publicLocation, validGeoPoint } from '@v2/civic-core';

import type { GeoPoint, LocationPrecision } from '@v2/civic-core';

/**
 * El piso al que se engrosa TODO punto antes de medir un kilómetro.
 *
 * La precisión almacenada es un espejo de lo que declaró el cliente, **no una
 * protección**: una fila con `precision = 'exact'` publicada al kilómetro es
 * un padrón de domicilios con otro nombre. Es el mismo `'500m'` que
 * `location-policy.ts` usa como piso protegido, y por la misma razón —
 * engrosar de más también miente: decir «en algún lugar de Rosario» cuando el
 * dato útil era «en estas seis cuadras».
 */
export const PISO_DE_PUBLICACION: LocationPrecision = '500m';

const esPrecision = (valor: string): valor is LocationPrecision =>
  (PRECISION_ORDER as readonly string[]).includes(valor);

/**
 * El punto publicable de una fila del corpus, a partir de lo que guarda la
 * base: dos `numeric` que el driver entrega como texto, y la precisión
 * declarada.
 */
export const puntoPublicable = (
  lat: string | null,
  lng: string | null,
  precision: string | null,
): GeoPoint | null => {
  // `Number(null)` es 0, así que sin este descarte una fila sin coordenada
  // aparecería frente a las costas de Ghana con toda naturalidad.
  if (lat === null || lng === null) return null;
  const crudo = validGeoPoint({ lat: Number(lat), lng: Number(lng) });
  if (!crudo) return null;

  const declarada = precision !== null && esPrecision(precision) ? precision : PISO_DE_PUBLICACION;
  // Se respeta lo declarado sólo cuando ya es igual o MÁS GRUESO que el piso.
  // Al revés —confiar en un `exact` guardado— es publicar sobre la precisión
  // almacenada, que es exactamente lo que R13 prohíbe.
  const efectiva = isCoarserOrEqual(declarada, PISO_DE_PUBLICACION)
    ? declarada
    : PISO_DE_PUBLICACION;

  return publicLocation(crudo, efectiva).point;
};
