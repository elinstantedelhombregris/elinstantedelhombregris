import { publicLocation } from './geo.js';
import { isCoarserOrEqual } from './types.js';

import type {
  CivicAudience,
  CivicSensitivity,
  GeoPoint,
  LocationPrecision,
  LocationRole,
} from './types.js';

/**
 * La política de exactitud (decisión D7 de la spec paraguas
 * `docs/specs/2026-07-26-el-mapa-instrumento-territorial.md` §3.2).
 *
 * REEMPLAZA a `sharedPrecisionForAudience` de `juego/src/civic/location-policy.ts`,
 * que degradaba `exact` a `100m` para toda audiencia no privada sin mirar el rol
 * ni la sensibilidad — siendo que ambos tipos ya existían en el mismo archivo,
 * bajo el comentario «lo que sabemos del lugar y lo que autorizamos compartir
 * son ejes distintos». La política era más tosca que los tipos donde vivía.
 *
 *   La precisión no se gobierna. Se gobierna el rol de la ubicación.
 *
 * Un pozo, un semáforo roto, una esquina inundada o un punto donde se reparte
 * algo no sirven a 100 metros de distancia. `exact` es publicable y es el
 * default. La protección deja de ser ley del sistema y pasa a ser una
 * propuesta explicada y rechazable, para el único caso que la necesita.
 */

const finite = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Rechaza coordenadas incompletas, no finitas o fuera de WGS84. */
export const validGeoPoint = (point: GeoPoint | null | undefined): GeoPoint | null => {
  if (!point || !finite(point.lat) || !finite(point.lng)) return null;
  if (point.lat < -90 || point.lat > 90 || point.lng < -180 || point.lng > 180) return null;
  return { lat: point.lat, lng: point.lng };
};

export const normalizedLocationLabel = (value?: string | null): string | null => {
  const trimmed = value?.trim().slice(0, 120);
  // La etiqueta vacía es ausencia de etiqueta, no una etiqueta en blanco: por
  // eso no alcanza con `??`, que dejaría pasar la cadena vacía.
  return trimmed === undefined || trimmed === '' ? null : trimmed;
};

/**
 * El piso al que se engrosa un registro protegido. No es `city`: engrosar de
 * más también miente — dice «en algún lugar de Rosario» cuando el dato útil
 * era «en estas seis cuadras».
 */
const PROTECTED_FLOOR: LocationPrecision = '500m';

const COARSENED_BECAUSE =
  'Este registro habla de un lugar donde vive o está una persona. Te proponemos ' +
  'publicarlo con menos precisión para no exponerla.';

/**
 * De quién es el lugar del que habla el registro.
 *
 * `'tercero'` es la respuesta «es la casa de otra persona» —y también «sin
 * respuesta»— de la pregunta de la casa (spec `2026-08-11-a-la-tierra.md` §2.6).
 */
export type SujetoDeUbicacion = 'propio' | 'tercero';

export interface PublishedPrecisionInput {
  /** Lo que la persona eligió. */
  requested: LocationPrecision;
  role: LocationRole;
  sensitivity: CivicSensitivity;
  audience: CivicAudience;
  /**
   * Default `'propio'`, que es el caso de siempre. Con `'tercero'` la propuesta
   * de engrosado deja de ser rechazable: la persona manda sobre SU propia
   * ubicación, y sobre la casa de otro nadie firmó nada.
   */
  sujeto?: SujetoDeUbicacion;
}

export interface PublishedPrecisionResult {
  /** Lo que efectivamente se publica. */
  precision: LocationPrecision;
  /** Cuando difiere de lo pedido: por qué, en castellano, para mostrárselo. */
  coarsenedBecause: string | null;
  /**
   * Si la persona puede rechazar la propuesta y publicar lo que pidió.
   *
   * Es `true` cuando el registro habla del lugar propio: la persona manda sobre
   * su propia ubicación y el sistema propone en vez de imponer. **Y es `false`
   * cuando `sujeto` vale `'tercero'`** — el campo estaba previsto para esto
   * desde que se escribió («existe igual para que un régimen legal futuro pueda
   * ponerlo en `false`»), y el régimen llegó antes que la ley: sobre la casa de
   * otra persona, quien carga no tiene nada que consentir.
   */
  overridable: boolean;
}

/**
 * El único lugar donde se decide qué precisión sale al mundo.
 *
 * El servidor la recalcula sobre lo que llega del cliente y nunca le cree la
 * precisión declarada (spec 4 §4): un cliente modificado no puede publicar
 * más fino de lo que la política permite.
 */
export function publishedPrecision(input: PublishedPrecisionInput): PublishedPrecisionResult {
  const protegido =
    input.role === 'subject' && input.sensitivity === 'high' && input.audience !== 'private';
  // Vale en las tres salidas y no sólo en la que engrosa: si dijera `true`
  // cuando no hay propuesta que rechazar, la ingesta que lo lea entendería que
  // sobre esa fila hay algo que la persona puede decidir, y no lo hay.
  const overridable = (input.sujeto ?? 'propio') === 'propio';

  if (!protegido) {
    return { precision: input.requested, coarsenedBecause: null, overridable };
  }

  // Ya venía igual o más grueso que el piso: no hay nada que proponer.
  if (isCoarserOrEqual(input.requested, PROTECTED_FLOOR)) {
    return { precision: input.requested, coarsenedBecause: null, overridable };
  }

  return { precision: PROTECTED_FLOOR, coarsenedBecause: COARSENED_BECAUSE, overridable };
}

export interface PrepareRecordLocationInput {
  point: GeoPoint | null | undefined;
  requestedPrecision?: LocationPrecision;
  role?: LocationRole;
  sensitivity?: CivicSensitivity;
  audience?: CivicAudience;
  locationLabel?: string | null;
  /** De quién es el lugar. Default `'propio'`. */
  sujeto?: SujetoDeUbicacion;
  /**
   * La persona rechazó la propuesta de engrosado (§3.2: es rechazable).
   * Solo tiene efecto cuando `publishedPrecision` marcó `overridable`.
   */
  overrideCoarsening?: boolean;
}

export interface PreparedRecordLocation {
  /** El punto tal como se conoce. Su custodia es de quien lo capturó. */
  exact: GeoPoint | null;
  /** El punto que se publica, ya con su precisión aplicada. */
  publicPoint: GeoPoint | null;
  /** La precisión con la que se publica. */
  publishedPrecision: LocationPrecision;
  /** Por qué se engrosó, si se engrosó y no fue rechazado. */
  coarsenedBecause: string | null;
  locationLabel: string | null;
}

/**
 * Fuente única para derivar lo publicable a partir del dato conocido.
 * La comparten la bóveda local del móvil, la ingesta del servidor y el panel
 * de la web, para que las tres no puedan divergir sobre el mismo consentimiento.
 */
export const prepareRecordLocation = (
  input: PrepareRecordLocationInput,
): PreparedRecordLocation => {
  const exact = validGeoPoint(input.point);
  const requested = input.requestedPrecision ?? 'province';
  const decision = publishedPrecision({
    requested,
    role: input.role ?? 'subject',
    sensitivity: input.sensitivity ?? 'low',
    audience: input.audience ?? 'collective',
    sujeto: input.sujeto ?? 'propio',
  });

  const rechazado = input.overrideCoarsening === true && decision.overridable;
  const precision = rechazado ? requested : decision.precision;
  const locationLabel = normalizedLocationLabel(input.locationLabel);

  return {
    exact,
    publicPoint: publicLocation(exact, precision, locationLabel).point,
    publishedPrecision: precision,
    coarsenedBecause: rechazado ? null : decision.coarsenedBecause,
    locationLabel,
  };
};
