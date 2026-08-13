/**
 * El vocabulario canónico de una señal — nueve tipos en cuatro clases.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §2.6 y §8.6.
 *
 * Hasta hoy los nueve tipos vivían en un solo lugar del repo y a medias:
 * `direcciones.ts` los tenía como claves de `TECHO_POR_TIPO`, con un TODO
 * escrito pidiendo tiparlas contra un `TipoDeSenal` que no existía. Existe
 * acá. Las cuatro clases no existían en `civic-core` en absoluto: vivían en la
 * capa de queries de una página de la web.
 *
 * Dos ausencias deliberadas:
 *
 * - **`valor` no está.** Salió del mapa (un valor no tiene coordenada) y no se
 *   traduce a ningún tipo nuevo. Migrar un escenario viejo que lo tuviera
 *   reparte su peso y lo dice; no lo pliega en silencio.
 * - **No hay fallback.** `leerTipo` devuelve una unión discriminada y nunca un
 *   tipo por descarte. El `?? 'valor'` que todavía vive en tres archivos de la
 *   web es exactamente el sumidero que esto existe para no tener: mientras
 *   viva, la composición *medida* está sesgada por construcción.
 */

/** Los nueve tipos del canon. Cerrado: un décimo tipo se agrega acá o no existe. */
export type TipoSenal =
  | 'basta'
  | 'necesidad'
  | 'recurso'
  | 'práctica'
  | 'saber'
  | 'sueño'
  | 'propuesta'
  | 'compromiso'
  | 'pregunta';

/**
 * Las cuatro clases, y cada una es una máquina distinta:
 *
 * - `hecho` se corrobora — pasa por un segundo par de ojos;
 * - `deseo` se delibera — y la deliberación **no está construida** (spec §8.3),
 *   así que hoy un deseo recibe adhesiones y nada más;
 * - `acto` se cumple — tiene fecha y cierre;
 * - `meta` se cuenta o se responde.
 *
 * Regla 11 de la Constitución de producto: los hechos se corroboran, los
 * sueños y propuestas se deliberan, y nunca se confunden.
 */
export type ClaseSenal = 'hecho' | 'deseo' | 'acto' | 'meta';

/**
 * La tabla que clasifica. Es exhaustiva por tipo: un tipo nuevo sin clase no
 * compila, que es la única forma de que la clasificación no se olvide.
 */
export const CLASE_DE_TIPO: Readonly<Record<TipoSenal, ClaseSenal>> = {
  basta: 'hecho',
  necesidad: 'hecho',
  recurso: 'hecho',
  práctica: 'hecho',
  saber: 'hecho',
  sueño: 'deseo',
  propuesta: 'deseo',
  compromiso: 'acto',
  pregunta: 'meta',
};

/** Los nueve, en orden canónico. Sale de la tabla: no puede desincronizarse. */
export const TIPOS_SENAL = Object.keys(CLASE_DE_TIPO) as readonly TipoSenal[];

/** Las cuatro, en orden canónico. Escrito a mano a propósito: fija el orden. */
export const CLASES_SENAL: readonly ClaseSenal[] = ['hecho', 'deseo', 'acto', 'meta'];

export const claseDe = (tipo: TipoSenal): ClaseSenal => CLASE_DE_TIPO[tipo];

/** Los tipos de cada clase, para repartir una composición declarada. */
export const TIPOS_POR_CLASE: Readonly<Record<ClaseSenal, readonly TipoSenal[]>> = {
  hecho: TIPOS_SENAL.filter((t) => CLASE_DE_TIPO[t] === 'hecho'),
  deseo: TIPOS_SENAL.filter((t) => CLASE_DE_TIPO[t] === 'deseo'),
  acto: TIPOS_SENAL.filter((t) => CLASE_DE_TIPO[t] === 'acto'),
  meta: TIPOS_SENAL.filter((t) => CLASE_DE_TIPO[t] === 'meta'),
};

/**
 * Qué clases corren la máquina de corroboración.
 *
 * De acá sale la respuesta a la pregunta abierta del pedido —«cuánto de lo que
 * se dice es comprobable»—: es `composicion.hecho + composicion.acto`, que es
 * literalmente el multiplicador del denominador de la nitidez. Un `deseo` no
 * se corrobora nunca; una `meta` se responde, que es otra cosa.
 */
export const esVerificable = (clase: ClaseSenal): boolean =>
  clase === 'hecho' || clase === 'acto';

/**
 * Leer un tipo que viene de afuera, sin sumidero.
 *
 * Normaliza a NFC porque `'práctica'` con la `á` precompuesta (un code point)
 * y con la tilde combinante (dos) son la misma palabra en pantalla y dos
 * strings distintos para JavaScript — un cliente iOS manda la segunda sin
 * querer. Misma disciplina que `techoDeTipo` en `direcciones.ts`.
 */
export type LecturaDeTipo =
  | { reconocido: true; tipo: TipoSenal }
  | { reconocido: false; crudo: string };

const POR_NOMBRE: ReadonlyMap<string, TipoSenal> = new Map(
  TIPOS_SENAL.map((t) => [t.normalize('NFC'), t]),
);

export function leerTipo(crudo: string): LecturaDeTipo {
  const tipo = POR_NOMBRE.get(crudo.trim().toLowerCase().normalize('NFC'));
  return tipo === undefined ? { reconocido: false, crudo } : { reconocido: true, tipo };
}

/**
 * El tema de una señal.
 *
 * El canon lo define como un catálogo cerrado de once, y ese catálogo **no
 * existe todavía en código**: vive en la tabla `temas`, que no está ni en la
 * base ni en `packages/db/src/schema/` (spec §8.6 — este módulo no construye el
 * canon). Hasta que exista, el tema es una clave de texto y se dice así en vez
 * de fingir una unión de once literales que nadie escribió.
 */
export type TemaClave = string;

export type LecturaDeClase =
  | { reconocido: true; clase: ClaseSenal }
  | { reconocido: false; crudo: string };

export function leerClase(crudo: string): LecturaDeClase {
  const normal = crudo.trim().toLowerCase().normalize('NFC');
  const clase = CLASES_SENAL.find((c) => c === normal);
  return clase === undefined ? { reconocido: false, crudo } : { reconocido: true, clase };
}
