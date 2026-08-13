/**
 * De qué habla la ubicación de una señal — el rol y la sensibilidad, por tipo.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §4.7. La tabla estaba escrita en
 * la spec y **no existía en código**: lo único que había era el `ROL_POR_TIPO`
 * de tres entradas de `apps/api/src/features/civic-map/capturas.ts`, sobre los
 * tres tipos de captura viejos, y la spec pedía explícitamente extenderlo a los
 * nueve del canon. Mientras no existió, cualquiera que necesitara el rol de una
 * señal tenía dos opciones: escribirse su propia tabla —y así es como nacen las
 * tres copias— o clavar `subject` y perder la mitad del vocabulario.
 *
 * ## La pregunta, una sola, en los nueve tipos
 *
 * > **¿Esto habla de una casa donde vive alguien?** · *Es mi casa* · *Es la
 * > casa de otra persona* · *No*
 *
 * **Derivar el rol del tipo no puede servir para saltear la pregunta.**
 * `publishedPrecision` engrosa sólo cuando `role === 'subject'` y la
 * sensibilidad es alta, así que una fila con `low` clavado no se engrosa jamás:
 * poner `sueño` en `subject`+`low` con la razón «no expone nada» era publicar
 * exacta la casa de quien sueña y llamarlo inocuo.
 *
 * ## Sin respuesta NO es «no»
 *
 * Es el caso que decide si esto protege algo. `'no'` es una respuesta —el lugar
 * no es la casa de nadie, y la señal se publica con el rol de su tipo—;
 * `'sinRespuesta'` es la ausencia de una, y cae del lado seguro:
 * `subject` + `high` + `overridable: false`, para los nueve tipos. Un default
 * que resolviera la ausencia como `'no'` sería el `0` que dice «no sé» con el
 * valor más permisivo, que es exactamente lo que el resto de este paquete
 * existe para no tener.
 */

import { TIPOS_SENAL } from './vocabulario.js';

import type { SujetoDeUbicacion } from '../location-policy.js';
import type { CivicSensitivity, LocationRole } from '../types.js';
import type { TipoSenal } from './vocabulario.js';

/** Las cuatro respuestas posibles, incluida la que no llegó. */
export type RespuestaDeVivienda = 'propia' | 'ajena' | 'no' | 'sinRespuesta';

export const RESPUESTAS_DE_VIVIENDA: readonly RespuestaDeVivienda[] = [
  'propia',
  'ajena',
  'no',
  'sinRespuesta',
];

/**
 * El rol de cada tipo **cuando la respuesta es «no»**, exhaustivo sobre el
 * canon.
 *
 * - `basta` y `compromiso` → `capture`: dónde estaba parado quien vio el pozo,
 *   dónde se va a hacer la obra. Es una cosa en un lugar, no una persona.
 * - `recurso` y `práctica` → `meeting_point`: un comedor existe para que lo
 *   encuentren, y sin exactitud un recurso no se puede usar.
 * - `necesidad`, `saber`, `sueño`, `propuesta` y `pregunta` → `service_area`:
 *   los cinco hablan **de** un lugar o de un área, y no señalan un punto.
 *
 * El `satisfies` es la guarda: un décimo tipo sin fila no compila, y una fila
 * de más tampoco. La tabla **no se exporta** por lo mismo que `TECHO_POR_TIPO`
 * de `direcciones.ts`: su uso natural `TABLA[tipo]` falla abierto con una clave
 * que no matchea exactamente, y `noUncheckedIndexedAccess` no lo caza sobre un
 * objeto de claves conocidas. El único lector es `encuadreDeUbicacion`.
 */
const ROL_POR_TIPO = {
  basta: 'capture',
  necesidad: 'service_area',
  recurso: 'meeting_point',
  práctica: 'meeting_point',
  saber: 'service_area',
  sueño: 'service_area',
  propuesta: 'service_area',
  compromiso: 'capture',
  pregunta: 'service_area',
} satisfies Record<TipoSenal, LocationRole>;

/**
 * Los cuatro tipos cuyo rol **cambia** con la respuesta.
 *
 * «Qué tenés para prestar» suele estar en tu casa, y heredar `meeting_point`
 * era publicarla exacta sin escapatoria. Los otros cinco no cambian de rol
 * porque hablan de un área: lo que cambia en ellos es la sensibilidad.
 */
const CAMBIAN_CON_LA_PREGUNTA: readonly TipoSenal[] = ['basta', 'necesidad', 'recurso', 'compromiso'];

/** La tabla llaveada en NFC, por la misma razón que `techoDeTipo`: un cliente iOS manda NFD. */
const ROL_POR_TIPO_NFC: ReadonlyMap<string, LocationRole> = new Map(
  TIPOS_SENAL.map((tipo): [string, LocationRole] => [tipo.normalize('NFC'), ROL_POR_TIPO[tipo]]),
);

export interface EncuadreDeUbicacion {
  readonly role: LocationRole;
  readonly sensitivity: CivicSensitivity;
  /** `'tercero'` vuelve la propuesta de engrosado NO rechazable: nadie consiente por otro. */
  readonly sujeto: SujetoDeUbicacion;
}

/**
 * El encuadre de una señal: qué es ese lugar para ella y cuánto daño hace
 * publicarlo fino.
 *
 * Devuelve el más restrictivo ante un tipo que no reconoce, con el mismo
 * criterio que `direccionPermitida`: la firma dice `TipoSenal` y en runtime los
 * tipos se borran, así que lo que no está en la tabla se trata como lo que no
 * se sabe — `subject` + `high`.
 */
export function encuadreDeUbicacion(
  tipo: TipoSenal,
  respuesta: RespuestaDeVivienda,
): EncuadreDeUbicacion {
  const delTipo = ROL_POR_TIPO_NFC.get(tipo.normalize('NFC'));

  // Sin respuesta, o con un tipo que no está en el canon: el lado seguro, y es
  // el mismo lado en los dos casos porque la pregunta que no se contestó y el
  // tipo que no se entiende dejan al sistema sabiendo lo mismo, que es nada.
  if (respuesta === 'sinRespuesta' || delTipo === undefined) {
    return { role: 'subject', sensitivity: 'high', sujeto: 'tercero' };
  }

  if (respuesta === 'no') {
    return { role: delTipo, sensitivity: 'low', sujeto: 'propio' };
  }

  const role: LocationRole = CAMBIAN_CON_LA_PREGUNTA.includes(tipo) ? 'subject' : delTipo;
  return respuesta === 'propia'
    ? { role, sensitivity: 'moderate', sujeto: 'propio' }
    : { role, sensitivity: 'high', sujeto: 'tercero' };
}
