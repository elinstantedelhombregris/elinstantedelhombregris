/**
 * La ubicación de una señal ensayada — la política de la real, sin excepción.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §3.9 y §7.1, y la
 * regla 2 de la Constitución de producto: *la ubicación exacta es privada por
 * defecto; lo público usa precisión reducida*.
 *
 * ## Qué estaba mal
 *
 * Las señales ensayadas nacían con `territorioId` y un `celdaId` sintético y
 * **nada más**: no pasaban por `prepareRecordLocation`, ni por `techoDeTipo`,
 * ni por `direccionPermitida`. No se veía porque el modo gente todavía no pinta
 * un mapa. El día que lo pinte, una señal ensayada saldría con una precisión
 * que ninguna señal real puede tener —y alguien miraría ese mapa y sacaría
 * conclusiones sobre qué se ve y qué no—. Un ensayo cuya salida no pasa por la
 * misma compuerta que lo real no ensaya lo real: ensaya un sistema sin
 * compuerta, que es justamente el que no queremos construir.
 *
 * La regla del módulo, que es la que gobierna este archivo: *todo campo que la
 * ingesta real exige, el generador lo produce; y todo campo que la ingesta real
 * deriva, el generador lo deriva **con la misma función***. Acá esa función es
 * `prepareRecordLocation`, la misma que llama `capturas.ts` en el servidor.
 *
 * ## Lo que el generador NO sabe, y por eso no inventa
 *
 * Sabe la provincia y su celda sintética. No sabe departamento, ni localidad,
 * ni punto — `Persona.territorio` los lleva en `null` y `celdaId` no es una
 * celda de una grilla real. **Eso se dice**, en `HUECOS_DE_UBICACION_ENSAYADA`,
 * en vez de fabricar una coordenada para que la fila se vea completa. Una
 * ubicación inventada en un ensayo es peor que una ausente: la ausente se nota.
 */

import { direccionPermitida } from '../direcciones.js';
import { prepareRecordLocation, publishedPrecision } from '../location-policy.js';
import { encuadreDeUbicacion } from '../senal/ubicacion.js';

import type { PermisoDireccion } from '../direcciones.js';
import type { RespuestaDeVivienda } from '../senal/ubicacion.js';
import type { TipoSenal } from '../senal/vocabulario.js';
import type { CivicSensitivity, LocationPrecision, LocationRole } from '../types.js';

/**
 * Qué no sabe el generador sobre el lugar de una señal ensayada.
 *
 * Es una lista y no un `null` por lo mismo que `territoriosSinPersona` en
 * `elenco.ts`: no es lo mismo «acá no hay departamento» que «este instrumento
 * no sabe de departamentos». La segunda es una propiedad del instrumento y
 * quien lea el resultado tiene derecho a saberla.
 */
export type HuecoDeUbicacion = 'departamento' | 'localidad' | 'punto' | 'calle';

export const HUECOS_DE_UBICACION_ENSAYADA: readonly HuecoDeUbicacion[] = Object.freeze([
  'departamento',
  'localidad',
  'punto',
  'calle',
]);

/**
 * Lo más fino que el generador puede pedir: la provincia.
 *
 * No es una elección de diseño ni un piso de protección — es lo único que sabe.
 * Va por `prepareRecordLocation` igual, y no clavado en la fila, porque lo que
 * se publica lo decide la política y no el que carga: si mañana el generador
 * supiera la localidad, cambia esta constante y la protección sigue corriendo
 * en el mismo lugar.
 */
export const PRECISION_QUE_CONOCE_EL_GENERADOR: LocationPrecision = 'province';

/**
 * Lo que la ingesta real escribe en las columnas de ubicación, para una señal
 * que nadie dijo. Los nombres son los de `senales_ensayadas`.
 */
export interface UbicacionEnsayada {
  readonly precision: LocationPrecision;
  readonly locationRole: LocationRole;
  readonly sensitivity: CivicSensitivity;
  /** El mínimo entre el techo del tipo y el piso del rol — `direccionPermitida`. */
  readonly permisoDireccion: PermisoDireccion;
  /**
   * Siempre `'sin_direccion'`: el generador no conoce calle ni altura, así que
   * no hay dirección que degradar. Va como campo y no como comentario porque la
   * columna existe, es `NOT NULL`, y el CHECK
   * `sim_senales_sujeto_sensible_sin_direccion_chk` la mira.
   */
  readonly direccionEstado: 'sin_direccion';
  /** La respuesta a la pregunta de la casa con la que se armó esta señal. */
  readonly vivienda: RespuestaDeVivienda;
  /** `false` cuando el lugar es de otra persona: nadie consiente por otro. */
  readonly overridable: boolean;
  /** Por qué se engrosó, cuando se engrosó. La misma frase que ve una persona real. */
  readonly engrosadaPorque: string | null;
  /** Lo que este instrumento no sabe del lugar. Dicho, no inventado. */
  readonly faltan: readonly HuecoDeUbicacion[];
}

/**
 * La ubicación de una señal ensayada, derivada con las funciones de la real.
 *
 * Tres llamadas y ninguna decisión propia: `encuadreDeUbicacion` da el rol y la
 * sensibilidad desde el tipo y la respuesta, `prepareRecordLocation` decide qué
 * precisión sale al mundo, y `direccionPermitida` dice qué parte de una
 * dirección podría publicarse — que acá es siempre menos de lo que hay, porque
 * no hay ninguna.
 */
export function ubicacionEnsayada(
  tipo: TipoSenal,
  vivienda: RespuestaDeVivienda,
): UbicacionEnsayada {
  const encuadre = encuadreDeUbicacion(tipo, vivienda);

  const pedido = {
    // Nadie capturó un punto: no hay uno que engrosar y tampoco uno que guardar.
    point: null,
    requestedPrecision: PRECISION_QUE_CONOCE_EL_GENERADOR,
    role: encuadre.role,
    sensitivity: encuadre.sensitivity,
    // `collective` es la audiencia de lo que se dibuja en un mapa público, que
    // es lo que un ensayo ensaya. Con `private` la protección ni siquiera corre.
    audience: 'collective' as const,
    sujeto: encuadre.sujeto,
  };

  const publicada = prepareRecordLocation(pedido);

  /**
   * La segunda llamada no es un descuido: `prepareRecordLocation` **no propaga
   * `overridable`**, así que la única forma de saber si la propuesta de
   * engrosado era rechazable es preguntárselo a `publishedPrecision`, que es la
   * función que lo decide. Es preferible a copiar acá la regla
   * `sujeto === 'propio'`: una copia se desincroniza el día que el régimen
   * cambie, y las dos llamadas son puras y sobre las mismas entradas.
   */
  const decision = publishedPrecision({
    requested: PRECISION_QUE_CONOCE_EL_GENERADOR,
    role: encuadre.role,
    sensitivity: encuadre.sensitivity,
    audience: 'collective',
    sujeto: encuadre.sujeto,
  });

  return {
    precision: publicada.publishedPrecision,
    locationRole: encuadre.role,
    sensitivity: encuadre.sensitivity,
    permisoDireccion: direccionPermitida(tipo, encuadre.role, encuadre.sensitivity),
    direccionEstado: 'sin_direccion',
    vivienda,
    overridable: decision.overridable,
    engrosadaPorque: publicada.coarsenedBecause,
    faltan: HUECOS_DE_UBICACION_ENSAYADA,
  };
}

/**
 * El reparto declarado de la pregunta de la casa.
 *
 * Es una palanca del diseño y no un default escondido, con el mismo argumento
 * que `anonimato`: un corpus sintético donde nadie habla de la casa de nadie
 * hace que **todo barrido sea sistemáticamente optimista sobre la protección**,
 * y ninguna corrida podría reproducir el caso que la regla 2 existe para
 * cubrir.
 */
export type RepartoDeVivienda = Readonly<Record<RespuestaDeVivienda, number>>;

/**
 * El reparto de una corrida que no lo declaró: **todo sin respuesta**.
 *
 * No es `'no'` en el 100%, que sería el reparto más permisivo —rol del tipo,
 * sensibilidad `low`, nada se engrosa— disfrazado de default razonable. Una
 * corrida que no dice de qué habla su población cae del lado seguro, y el
 * resultado lo muestra: todas las señales salen `subject` + `high`, que es
 * visible y raro, en vez de salir publicables y parecer normales.
 */
export const VIVIENDA_SIN_DECLARAR: RepartoDeVivienda = Object.freeze({
  propia: 0,
  ajena: 0,
  no: 0,
  sinRespuesta: 1,
});
