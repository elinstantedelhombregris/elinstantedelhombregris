/**
 * El vocabulario de la web — los nueve tipos, las cuatro clases y sus colores.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §2.4 (el color codifica la clase)
 * y §4.6 (los prompts).
 *
 * ## Este archivo reemplaza a `lib/tipos-voz.ts`, que se borró
 *
 * Aquel exportaba seis tipos y su propio comentario los llamaba «una paleta, no
 * un vocabulario»: eran los seis que la web sabía dibujar, no el canon. El
 * canon son nueve en cuatro clases y vive en `@v2/civic-core`. Mientras las dos
 * listas coexistieron, `tipoParaPintar` plegaba con `?? 'valor'` todo lo que no
 * reconocía, y una composición *medida* sobre esa lectura estaba sesgada por
 * construcción. **Acá no hay fallback**: lo que no está en el canon se lee con
 * `leerTipo`, que devuelve una unión discriminada, y quien pinte decide qué
 * hacer con lo que no reconoce.
 *
 * ## Por qué el color es de la clase y no del tipo
 *
 * Nueve colores que se distingan en AA sobre papel **y** sobre fondo oscuro, a
 * seis píxeles de diámetro, no existen. Y no es lo que el mapa tiene que decir
 * de un vistazo: la lectura que importa es la regla 11 —esto se comprueba, esto
 * se delibera—, no «esto es un saber y aquello una práctica», que se lee en el
 * chip. Así que las cinco tablas paralelas `Record<TipoVoz, string>` colapsan
 * en dos de cuatro entradas: una para papel, una para oscuro.
 *
 * Agregar un tipo no toca ninguna tabla de color: hay que clasificarlo, y el
 * `Record<TipoSenal, ClaseSenal>` exhaustivo del núcleo obliga a hacerlo o no
 * compila.
 *
 * `sello` (#C23B22) deja de ser color de tipo y vuelve a lo que su nombre dice:
 * **el color del estado ruidoso** — `desactualizada`, `no_cumplida`, `retirada`.
 */
import {
  CLASES_SENAL,
  TIPOS_SENAL,
  claseDe,
  leerClase,
  leerTipo,
  type ClaseSenal,
  type TipoSenal,
} from '@v2/civic-core';

/**
 * Los lectores del canon se reexportan con el nombre que ya usaba la web, para
 * que migrar un consumidor sea cambiar el import y nada más. Los dos devuelven
 * una unión discriminada y **ninguno tiene sumidero**: «es un basta» y «no sé
 * qué es esto» son dos afirmaciones distintas, y sólo una de las dos se puede
 * contar en una composición.
 */
export { CLASES_SENAL, TIPOS_SENAL, claseDe, leerClase, leerTipo };
export { leerTipo as leerTipoSenal };
export type { ClaseSenal, TipoSenal };

/**
 * Las clases de Tailwind de cada clase de señal, para el chip sobre papel.
 * Los cuatro tokens ya existen en `tailwind.config.ts`: cero tokens nuevos.
 */
export const CLASE_FONDO: Readonly<Record<ClaseSenal, string>> = {
  hecho: 'bg-ambar border-ambar',
  deseo: 'bg-violeta border-violeta',
  acto: 'bg-verde border-verde',
  meta: 'bg-cian border-cian',
};

export const CLASE_TEXTO: Readonly<Record<ClaseSenal, string>> = {
  hecho: 'text-ambar',
  deseo: 'text-violeta',
  acto: 'text-verde',
  meta: 'text-cian',
};

export const CLASE_BORDE: Readonly<Record<ClaseSenal, string>> = {
  hecho: 'border-ambar',
  deseo: 'border-violeta',
  acto: 'border-verde',
  meta: 'border-cian',
};

/**
 * Los mismos cuatro en hexadecimal, para el chrome OSCURO del instrumento.
 *
 * No es la misma tabla y no puede serlo: maplibre pinta en WebGL y no entiende
 * clases de Tailwind, y el violeta normal (#5227CC) se hunde en el fondo
 * #16130E — sobre oscuro necesita su variante clara.
 */
export const CLASE_COLOR_OSCURO: Readonly<Record<ClaseSenal, string>> = {
  hecho: '#A16C00',
  deseo: '#9D85E8',
  acto: '#1A7A4A',
  meta: '#0F6B8A',
};

/** El color del estado ruidoso. No es de ninguna clase. */
export const COLOR_ESTADO_RUIDOSO = '#C23B22';

/** Qué se lee de un vistazo: la regla 11 en una línea por clase. */
export const CLASE_GLOSA: Readonly<Record<ClaseSenal, string>> = {
  hecho: 'Se comprueba: pasa por un segundo par de ojos.',
  deseo: 'Se delibera. Por ahora recibe adhesiones.',
  acto: 'Se cumple: tiene fecha y tiene cierre.',
  meta: 'Se responde, o se cuenta.',
};

export const CLASE_ROTULO: Readonly<Record<ClaseSenal, string>> = {
  hecho: 'Lo que hay',
  deseo: 'Lo que querés',
  acto: 'Lo que vas a hacer',
  meta: 'Lo que no sabés',
};

/**
 * Los nueve prompts, **verbatim de la spec §4.6**.
 *
 * Tres de estos ya estaban bien y se conservan sin tocar una coma. El de
 * `basta` sí cambió —era «¿De qué te cansaste? Decilo sin filtro.»— porque
 * `basta` se afiló: es algo que **estaba y se rompió**, y por eso `necesidad`
 * deja de pisarlo. La bronca no es el dato; la cosa rota sí.
 */
export const PROMPT_DE_TIPO: Readonly<Record<TipoSenal, string>> = {
  basta: '¿Qué hay roto donde vivís? Nombrá la cosa, no la bronca.',
  necesidad: '¿Qué falta donde vivís? Nombralo concreto.',
  recurso: '¿Qué sabés hacer, qué tenés para prestar? Ofrecelo.',
  práctica: '¿Qué ya funciona acá? Un comedor, una huerta, una biblioteca: decí dónde y cuándo abre.',
  saber: '¿Qué sabés de este lugar que le sirva a otro? Decilo, y decí cómo lo sabés.',
  sueño: '¿Qué país te imaginás? Escribilo como si ya existiera.',
  propuesta: '¿Qué cambiarías, y qué haría falta para hacerlo? Una sola cosa, bien concreta.',
  compromiso: '¿Qué vas a hacer vos, y para cuándo? Prometé poco, que se pueda ver, y cumplilo.',
  pregunta: '¿Qué necesitás saber de este lugar? Preguntá corto.',
};

/**
 * Cuándo **no** es esto — la columna derecha de la tabla de §4.6.
 *
 * Va en pantalla debajo del prompt y no en una ayuda escondida: los pares que
 * se pisan (`basta`/`necesidad`, `recurso`/`práctica`, `propuesta`/`compromiso`)
 * son la única razón por la que alguien elige mal, y decirlo en el momento de
 * elegir cuesta una línea.
 */
export const CUANDO_NO_ES: Readonly<Record<TipoSenal, string>> = {
  basta: 'Si nunca estuvo, es una necesidad.',
  necesidad: 'Si existía y se rompió, es un ¡basta!',
  recurso: 'Si ya funciona sin vos, es una práctica.',
  práctica: 'Si sos vos quien lo puede prestar, es un recurso.',
  saber: 'Si es lo que te gustaría que pasara, es un sueño.',
  sueño: 'Si es una sola cosa concreta y ejecutable, es una propuesta.',
  propuesta: 'Si lo vas a hacer vos, es un compromiso.',
  compromiso: 'Si esperás que lo haga otro, es una propuesta.',
  pregunta: 'Si ya lo sabés, es un saber.',
};

/** El placeholder del textarea cuando todavía no se eligió tipo. */
export const PROMPT_NEUTRO = 'Elegí arriba de qué estás hablando y te digo qué contar.';

/** Los tipos de cada clase, en el orden canónico, para agrupar el selector. */
export const TIPOS_DE_CLASE: Readonly<Record<ClaseSenal, readonly TipoSenal[]>> = {
  hecho: TIPOS_SENAL.filter((t) => claseDe(t) === 'hecho'),
  deseo: TIPOS_SENAL.filter((t) => claseDe(t) === 'deseo'),
  acto: TIPOS_SENAL.filter((t) => claseDe(t) === 'acto'),
  meta: TIPOS_SENAL.filter((t) => claseDe(t) === 'meta'),
};

/**
 * El color de una categoría que viene de la base, para PINTAR y sólo para eso.
 *
 * Devuelve `null` —y no un color por descarte— cuando no reconoce el tipo. El
 * `?? 'valor'` que vivía en tres archivos hacía indistinguibles «una voz de
 * tipo basta» de «una voz que decía bastta», y eso sesga cualquier cuenta que
 * se haga después. Quien llama decide: pintar gris, no pintar, o contarlo
 * aparte. Lo que no puede es creer que era otra cosa.
 */
export function colorDeClase(clase: string | null): string | null {
  if (clase === null) return null;
  const c = CLASES_SENAL.find((x) => x === clase.trim().toLowerCase().normalize('NFC'));
  return c === undefined ? null : CLASE_COLOR_OSCURO[c];
}
