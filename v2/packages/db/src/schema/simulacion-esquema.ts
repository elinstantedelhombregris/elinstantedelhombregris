/**
 * El esquema `simulacion` — dónde vive todo lo que ningún ser humano dijo.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §2.10 y §3.9.
 *
 * ## Por qué un esquema aparte y no una columna `es_simulacion`
 *
 * Es la decisión del dueño, y tiene el argumento a favor. Una columna
 * `es_simulacion` falla la primera vez que alguien escribe una consulta y se
 * olvida el `where`, y falla **en silencio**: la página muestra un país que
 * nadie habitó y nada se pone rojo. Un esquema aparte falla ruidoso — la
 * consulta da `relation "senales_ensayadas" does not exist` en vez de mentir.
 *
 * Es la lección de `D-002`: doce filas de demo que invalidaron todo juicio
 * visual sobre el mapa durante meses. Hoy la base cívica está en cero absoluto,
 * así que éste es el momento más barato de la historia del proyecto para no
 * equivocarse.
 *
 * ## Las tres reglas de aislamiento, y cómo se hacen cumplir
 *
 * 1. **Ningún nombre de tabla se repite entre `simulacion` y `public`.** Es lo
 *    que vuelve estructuralmente imposible que una consulta sin calificar
 *    alcance una fila sintética por el `search_path`: no hay a qué resolver.
 *    Por eso las tablas del ensayo se llaman `senales_ensayadas` y no
 *    `senales`. Hay guarda: `simulacion-aislamiento.test.ts`.
 * 2. **Ninguna clave foránea cruza el borde**, en ninguna de las dos
 *    direcciones. Los ids territoriales viven acá como enteros pelados, no como
 *    referencias a `public.geographic_locations` — a propósito, y aunque eso
 *    cueste la integridad referencial. Una FK de `public` hacia acá haría que
 *    `drop schema simulacion cascade` se lleve puesto dato real; una FK de acá
 *    hacia `public` haría que el ensayo no se pueda tirar sin permiso de la
 *    tabla real. Las dos convierten el borde en una charnela. Hay guarda.
 * 3. **El barril `schema/index.ts` NO exporta nada de acá.** El cliente que
 *    sirve la API se construye con ese barril, así que las tablas del ensayo
 *    no existen para el código que atiende a una persona. Quien quiera
 *    escribirlas tiene que importar `schema/simulacion.js` con todas las
 *    letras, y el único que lo hace es el escritor de `repositories/`. Hay
 *    guarda.
 *
 * ## Cómo se tira entero
 *
 * ```sh
 * pnpm --filter @v2/db simulacion:tirar            # dice qué haría y no lo hace
 * pnpm --filter @v2/db simulacion:tirar --aplicar  # lo hace
 * ```
 *
 * Y a mano, contra un `psql` cualquiera, que es el punto entero de tener un
 * esquema y no una columna:
 *
 * ```sql
 * DROP SCHEMA simulacion CASCADE;
 * ```
 *
 * Una sola sentencia se lleva el país inventado y no toca una fila del real.
 * Eso es lo que una columna `es_simulacion` nunca puede prometer: para
 * deshacerla hay que confiar en que el `where` de un `DELETE` esté bien.
 *
 * ## Sin transacciones
 *
 * `drizzle-orm/neon-http` lanza «No transactions support in neon-http driver».
 * Toda escritura que tenga que ser atómica va en una sola sentencia. Es la
 * misma restricción que el resto del repo, y acá pesa más porque una siembra
 * son miles de filas: se escribe por lotes idempotentes, no por transacción.
 */
import { sql } from 'drizzle-orm';
import { pgSchema } from 'drizzle-orm/pg-core';

import type { SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

/** El nombre del esquema, escrito una sola vez. Lo leen las guardas y el script que lo tira. */
export const NOMBRE_DEL_ESQUEMA = 'simulacion';

/** El comando que se lleva todo. Vive acá para que el doc y el script no puedan divergir. */
export const COMANDO_PARA_TIRAR = `DROP SCHEMA IF EXISTS ${NOMBRE_DEL_ESQUEMA} CASCADE`;

export const simulacion = pgSchema(NOMBRE_DEL_ESQUEMA);

// ---------------------------------------------------------------------------
// El vocabulario del canon, en la forma en que un CHECK lo puede exigir
// ---------------------------------------------------------------------------

/**
 * Los nueve tipos y su clase, en NFC.
 *
 * Es la misma tabla que `TECHO_POR_TIPO` de `civic-core/src/direcciones.ts:610`
 * mirada desde el otro eje, y la duplicación es deliberada y acotada: un CHECK
 * de Postgres no puede importar TypeScript. Cuando exista
 * `civic-core/src/senal/vocabulario.ts` (rebanada 2 de la spec), esta constante
 * se deriva de ahí y la guarda de exhaustividad se muda con ella.
 *
 * **NFC no es cosmética.** `'práctica'` con la `á` precompuesta y `'práctica'`
 * con la tilde combinante son dos strings distintos para Postgres igual que
 * para JavaScript. El CHECK exige la forma NFC, así que un generador que emita
 * NFD choca contra el motor en vez de sembrar un tipo que nunca va a matchear.
 */
export const CLASE_POR_TIPO = {
  basta: 'hecho',
  necesidad: 'hecho',
  recurso: 'hecho',
  práctica: 'hecho',
  saber: 'hecho',
  sueño: 'deseo',
  propuesta: 'deseo',
  compromiso: 'acto',
  pregunta: 'meta',
} as const;

export type TipoEnsayado = keyof typeof CLASE_POR_TIPO;
export type ClaseEnsayada = (typeof CLASE_POR_TIPO)[TipoEnsayado];

export const TIPOS_ENSAYADOS = Object.keys(CLASE_POR_TIPO).map((t) =>
  t.normalize('NFC'),
) as readonly string[];

export const CLASES_ENSAYADAS: readonly string[] = ['hecho', 'deseo', 'acto', 'meta'];

/**
 * Los tipos que admiten altura, copiados de `TECHO_POR_TIPO` (`completa`).
 * El resto llega hasta la calle. El tipo que da nombre a la métrica norte
 * —`necesidad`— es justamente uno de los que nunca lleva altura.
 */
export const TIPOS_CON_ALTURA: readonly string[] = ['basta', 'recurso', 'práctica', 'compromiso']
  .map((t) => t.normalize('NFC'));

/** `LocationPrecision` de `civic-core/src/types.ts:18`. */
export const PRECISIONES: readonly string[] = [
  'exact',
  '100m',
  '500m',
  'neighborhood',
  'city',
  'province',
];

/** `LocationRole` de `civic-core/src/types.ts:35`. */
export const ROLES_DE_UBICACION: readonly string[] = [
  'subject',
  'capture',
  'service_area',
  'meeting_point',
];

/** `CivicSensitivity` de `civic-core/src/types.ts:41`. */
export const SENSIBILIDADES: readonly string[] = ['low', 'moderate', 'high'];

/** `DireccionEstado` de `civic-core/src/direcciones.ts:231`. */
export const ESTADOS_DE_DIRECCION: readonly string[] = [
  'sin_direccion',
  'calle',
  'altura_en_rango',
  'altura_sin_rango',
  'altura_fuera_de_rango',
  'texto_libre',
];

/**
 * Los estados de una señal ensayada.
 *
 * **Es vocabulario propio del ensayo, no el canon**, porque el canon todavía no
 * tiene casa: `public.estados_senal` no existe ni en la base ni en
 * `packages/db/src/schema/`. Cuando exista, este CHECK se reconcilia contra él
 * en el mismo movimiento — y que la reconciliación duela es preferible a que un
 * `text` sin CHECK deje entrar cualquier cosa hasta que alguien mire.
 */
export const ESTADOS_ENSAYADOS: readonly string[] = [
  'enviada',
  'corroborada',
  'desactualizada',
  'resuelta',
];

/** El desenlace de un acto. Sólo un acto lo tiene, y siempre lo tiene. */
export const DESENLACES: readonly string[] = ['abierto', 'cumplido', 'vencido', 'no_cumplido'];

/** De dónde salió el tema. `sugerido` es lo único que una máquina puede escribir (regla 6). */
export const ORIGENES_DE_TEMA: readonly string[] = ['declarado', 'sugerido', 'ninguno'];

/** El radio de atención de una persona sintética (`Conducta.radioAtencion`, §3.8). */
export const RADIOS_DE_ATENCION: readonly string[] = [
  'cuadra',
  'barrio',
  'municipio',
  'provincia',
  'pais',
];

/** Los dos modos del módulo. `sello` sólo existe en `gente`, y hay CHECK. */
export const MODOS: readonly string[] = ['forma', 'gente'];

// ---------------------------------------------------------------------------
// Construir un CHECK de lista cerrada sin pasar por parámetros
// ---------------------------------------------------------------------------

/** Escapa una comilla simple. La entrada son constantes de este módulo, nunca dato. */
function literal(valor: string): string {
  return `'${valor.replace(/'/g, "''")}'`;
}

/**
 * `columna in ('a', 'b', ...)` con los valores **inlineados**.
 *
 * Van como literales y no como parámetros a propósito: un CHECK vive en el
 * catálogo del motor, donde no hay quién ate un `$1`. Interpolar acá es seguro
 * porque lo único que entra son las constantes de arriba — nunca algo que
 * venga de una fila, de una request o de un modelo.
 */
export function enLista(columna: AnyPgColumn, valores: readonly string[]): SQL {
  return sql`${columna} in ${sql.raw(`(${valores.map(literal).join(', ')})`)}`;
}

/**
 * `(tipo, clase) in (('basta','hecho'), ...)` — la coherencia del par, hecha motor.
 *
 * La clase se **deriva** del tipo (`claseDe`), así que guardarla es una
 * denormalización: existe para que la consulta por clase no tenga que traducir.
 * Y una denormalización sin CHECK es una segunda fuente de verdad esperando a
 * discrepar. Un `sueño` marcado `hecho` es exactamente la confusión que la
 * regla 11 prohíbe, y acá el motor lo rechaza antes de que llegue a un mapa.
 */
export function paresDeTipoYClase(tipo: AnyPgColumn, clase: AnyPgColumn): SQL {
  const pares = Object.entries(CLASE_POR_TIPO)
    .map(([t, c]) => `(${literal(t.normalize('NFC'))}, ${literal(c)})`)
    .join(', ');
  return sql`(${tipo}, ${clase}) in ${sql.raw(`(${pares})`)}`;
}
