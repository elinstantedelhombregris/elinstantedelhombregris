/**
 * Lo que la API manda en lugar del texto de un aporte cuya autoría no cedió la licencia.
 *
 * Es una frase y no `null` a propósito: el aporte existe, se cuenta, y quien lo mira tiene que
 * saber que su texto está reservado y no que se perdió. Pero el cliente necesita reconocerla
 * para no mostrarla como si fuera una cita de alguien. Lo escribe la base
 * (`textoDeSenalPublica`, en `@v2/db`) y lo comparan la cinta de aportes de la Home y el
 * detalle del mapa; los tres leen esta constante, así que no hay una frase que cambiar en
 * tres lados. No cambia la forma de ninguna respuesta de la API.
 */
export const TEXTO_RESERVADO = 'Texto reservado por su autoría.';
