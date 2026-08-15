/**
 * El vocabulario de la corroboración — quién dice «sí, está», y cómo lo sabe.
 *
 * Spec: `docs/specs/2026-08-11-c-la-corroboracion.md` §2.1, §2.2 y §2.6.
 *
 * Los dos vocabularios NO se inventan acá: los escribió
 * `apps/mobile/src/civic/verification-provenance.ts` en castellano rioplatense
 * y con su consecuencia declarada. Esto los cierra y los sube al núcleo, que es
 * donde la web, el teléfono y la base pueden compartirlos sin copiarlos.
 */

/** Los seis veredictos. Cerrado: un séptimo se agrega acá o no existe. */
export type VeredictoDeConfirmacion =
  | 'confirm'
  | 'correct'
  | 'duplicate'
  | 'stale'
  | 'unsafe'
  | 'cannot_verify';

export const VEREDICTOS: readonly VeredictoDeConfirmacion[] = [
  'confirm',
  'correct',
  'duplicate',
  'stale',
  'unsafe',
  'cannot_verify',
];

/** Los cinco métodos: cómo lo sabe quien confirma. */
export type MetodoDeVerificacion = 'saw_now' | 'know_place' | 'checked_source' | 'field_visit' | 'cannot_verify';

export const METODOS: readonly MetodoDeVerificacion[] = [
  'saw_now',
  'know_place',
  'checked_source',
  'field_visit',
  'cannot_verify',
];

/**
 * **Dos confirmaciones independientes corroboran un hecho.**
 *
 * Por qué dos y no otro número, en corto (la razón larga está en la spec §2.1):
 *
 * - **Uno no es corroboración, es un par.** El autor más un confirmante son dos
 *   aparatos. Con dos confirmantes hacen falta tres actores distintos.
 * - **Tres es inalcanzable el día uno.** Con las tablas en cero, un umbral de
 *   tres deja `confirmaciones = 0` para siempre — y cero nitidez significa «hay
 *   hechos sin confirmar», o sea que el mapa afirmaría que nunca se comprobó
 *   nada. Es falso y desmoraliza.
 * - Dos es el número más chico que no es un par, y el más grande que se alcanza
 *   sin usuarios.
 *
 * **El umbral no se congela: se sella.** El valor que juzga una corroboración
 * es el que quedó estampado en la fila, no el que esté acá mañana. Subirlo a
 * tres no reescribe la historia.
 *
 * **Qué lo cambiaría**, escrito antes de tener el dato: cuando existan 1.000
 * corroboraciones reales se audita a mano una muestra en campo, y si más del 5%
 * de los hechos corroborados no resiste, sube a tres.
 */
export const UMBRAL_CORROBORACION = 2;

/**
 * Qué métodos SUMAN al umbral cuando la señal tiene punto.
 *
 * `saw_now` y `field_visit` son los dos que afirman presencia. `know_place` y
 * `checked_source` se registran igual y aparecen en la ficha con su
 * procedencia, pero **con `cuenta = false`**: saber cómo es el barrio no es lo
 * mismo que haber ido a mirar. `cannot_verify` nunca suma.
 *
 * Sin punto, la presencia no significa nada —no hay a dónde ir— así que
 * cualquier método salvo `cannot_verify` cuenta.
 */
export function metodoCuenta(metodo: MetodoDeVerificacion, hayPunto: boolean): boolean {
  if (metodo === 'cannot_verify') return false;
  if (!hayPunto) return true;
  return metodo === 'saw_now' || metodo === 'field_visit';
}

/**
 * La fila absurda que un CHECK cruzado impide: «lo confirmo y no tengo cómo
 * comprobarlo». Si el método es `cannot_verify`, el veredicto tiene que serlo
 * también.
 */
export function parCoherente(veredicto: VeredictoDeConfirmacion, metodo: MetodoDeVerificacion): boolean {
  if (metodo === 'cannot_verify') return veredicto === 'cannot_verify';
  return veredicto !== 'cannot_verify';
}

/**
 * La proximidad declarada, como CATEGORÍA y nunca como punto.
 *
 * La declara el cliente y **el servidor no la puede atestar**. Se guarda con esa
 * procedencia escrita: sirve para la ficha y para auditar, no para probar nada.
 * Decir lo contrario sería inflar la garantía.
 */
export type Proximidad = 'en_el_lugar' | 'cerca' | 'lejos' | 'sin_declarar';

export const PROXIMIDADES: readonly Proximidad[] = ['en_el_lugar', 'cerca', 'lejos', 'sin_declarar'];

/**
 * ¿Este conjunto de veredictos corrobora?
 *
 * Dos condiciones, y la segunda es la que suele olvidarse: **las correcciones
 * netas bloquean**. Si en la ronda hay tantas correcciones como confirmaciones,
 * la señal no pasa — alguien está diciendo que el dato está mal, y contar sólo
 * los «sí» sería sordera con forma de algoritmo.
 */
export function corrobora(confirmsQueCuentan: number, corrects: number, umbral: number): boolean {
  if (confirmsQueCuentan < umbral) return false;
  return corrects < confirmsQueCuentan;
}
