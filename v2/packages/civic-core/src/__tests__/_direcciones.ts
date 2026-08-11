import { publishedPrecision } from '../location-policy.js';

import type {
  EntradaUbicacionPublicable,
  PermisoDireccion,
  RangoDeAltura,
  TipoConTechoDeDireccion,
} from '../direcciones.js';
import type { PublishedPrecisionResult } from '../location-policy.js';
import type { CivicSensitivity, LocationPrecision, LocationRole } from '../types.js';

/**
 * Las fixtures que comparten `direcciones.test.ts` y `direcciones-guardas.test.ts`,
 * con la misma idea que `_conteo.ts`: cada test cambia sólo lo que le importa y
 * así lo que varía queda a la vista.
 */

/** `AV JOSE MARIA MORENO 1450`, CABA. Rango publicado completo. */
export const RANGO_COMPLETO: RangoDeAltura = { tipo: 'completo', desde: 1301, hasta: 1600 };

/**
 * `AV JUAN BAUTISTA ALBERDI`, CABA, id `0204901001480`, verificado contra la
 * API: se conoce dónde termina y no dónde empieza.
 */
export const ALBERDI: RangoDeAltura = { tipo: 'parcialHasta', hasta: 3200 };

/** Córdoba entera: georef no publica un solo rango de esa provincia. */
export const SIN_RANGO: RangoDeAltura = { tipo: 'ausente' };

export const ROLES: readonly LocationRole[] = [
  'subject',
  'capture',
  'service_area',
  'meeting_point',
];

export const SENSIBILIDADES: readonly CivicSensitivity[] = ['low', 'moderate', 'high'];

/**
 * La escala de permisos, escrita a mano. `direcciones.ts` no la exporta —lo que
 * exporta es el tipo—, así que ésta es la lista independiente contra la que se
 * afirma que `permisoMasRestrictivo` es el mínimo sobre la escala entera.
 */
export const PERMISOS_CONOCIDOS: readonly PermisoDireccion[] = [
  'completa',
  'solo_calle',
  'ninguna',
];

export const PRECISIONES: readonly LocationPrecision[] = [
  'exact',
  '100m',
  '500m',
  'neighborhood',
  'city',
  'province',
];

export const TIPOS: readonly TipoConTechoDeDireccion[] = [
  'basta',
  'recurso',
  'práctica',
  'compromiso',
  'necesidad',
  'saber',
  'sueño',
  'propuesta',
  'pregunta',
];

/**
 * La precisión publicada tal como la calcula el sistema, no una fabricada a
 * mano: el `coarsenedBecause` de una fixture inventada no prueba nada sobre el
 * camino real, que es el que decide si la dirección se retira.
 */
export const precisionReal = (
  requested: LocationPrecision,
  role: LocationRole,
  sensitivity: CivicSensitivity,
): PublishedPrecisionResult =>
  publishedPrecision({ requested, role, sensitivity, audience: 'collective' });

/**
 * Una captura de campo: un pozo, con calle y altura del catálogo, sin punto.
 * Es el caso emblemático de la spec — Córdoba, sin GPS, calle escrita a mano.
 */
export const entrada = (
  parcial: Partial<EntradaUbicacionPublicable>,
): EntradaUbicacionPublicable => ({
  tipo: 'basta',
  direccion: { calleId: 77, altura: 1450, textoLibre: null },
  rango: RANGO_COMPLETO,
  jerarquia: { cityId: 3040, departmentId: 512 },
  precision: precisionReal('exact', 'capture', 'low'),
  hayPunto: false,
  role: 'capture',
  sensitivity: 'low',
  ...parcial,
});
