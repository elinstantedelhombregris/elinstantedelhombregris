/**
 * La política de exactitud vive en `@v2/civic-core` (decisión D7).
 *
 * Lo que había acá degradaba `exact` a `100m` para toda audiencia que no fuera
 * privada, sin mirar `LocationRole` ni `CivicSensitivity` — teniendo los dos
 * tipos en el mismo archivo, bajo el comentario «lo que sabemos del lugar y lo
 * que autorizamos compartir son ejes distintos». La política era más tosca que
 * los tipos donde vivía.
 *
 * La regla nueva: no se gobierna la precisión, se gobierna el ROL de la
 * ubicación. Un pozo observado (`capture`) y un punto de reparto
 * (`meeting_point`) se publican exactos, porque a 100 metros no sirven. La
 * protección queda para el único caso que la necesita —`subject` de alta
 * sensibilidad fuera del canal privado— y es una propuesta explicada y
 * rechazable, no una ley.
 *
 * `sharedPrecisionForAudience` ya no existe: la reemplaza `publishedPrecision`.
 */
export {
  prepareRecordLocation,
  publishedPrecision,
  normalizedLocationLabel,
  validGeoPoint,
} from '@v2/civic-core';
export type {
  PreparedRecordLocation,
  PrepareRecordLocationInput,
  PublishedPrecisionInput,
  PublishedPrecisionResult,
} from '@v2/civic-core';
