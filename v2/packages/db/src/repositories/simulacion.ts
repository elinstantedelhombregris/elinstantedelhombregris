/**
 * El escritor del esquema `simulacion` — la única puerta.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §2.10 y §3.9.
 *
 * ## Por qué existe una puerta y no un montón de `db.insert()` sueltos
 *
 * «No mezclar» no es una intención, es una propiedad que alguien tiene que
 * hacer cumplir. Este archivo la hace cumplir en tres capas, de la más barata a
 * la más difícil de evitar:
 *
 * 1. **El esquema.** Los nombres de tabla no colisionan con `public`, así que
 *    una consulta sin calificar no tiene qué resolver (`simulacion-esquema.ts`).
 * 2. **El barril.** `schema/index.ts` no exporta nada del ensayo, así que el
 *    cliente que sirve la API no puede nombrar estas tablas
 *    (`schema/simulacion.ts`).
 * 3. **Este escritor.** Toda escritura pasa por `insertar()`, que le pregunta a
 *    Drizzle —no a un nombre de cadena, al objeto de tabla— en qué esquema vive
 *    el destino, y **tira** si no es `simulacion`. Un `dreams` pasado por error
 *    no escribe una fila mal: no escribe ninguna.
 *
 * Y antes de todo eso, la base: `abrirEscritorDeSimulacion` exige un DSN que
 * pase `elegirBaseParaSembrar`. La rama por defecto del proyecto Neon está en
 * una lista negra literal, así que no alcanza con tener el `.env` sin cargar
 * para sembrar el sitio.
 *
 * ## Lo que este archivo NO hace
 *
 * No genera personas, no corre dinámicas y no llama a ningún modelo. Recibe
 * filas armadas y las guarda. El generador vive en `scripts/simulacion/` y su
 * único acceso a Postgres es este objeto — que es lo que hace verificable la
 * frase «el generador no escribe fuera de `simulacion`».
 *
 * **Sin transacciones**: `drizzle-orm/neon-http` lanza «No transactions support
 * in neon-http driver». Cada lote es un `INSERT … ON CONFLICT DO NOTHING` que
 * se basta solo, así que una siembra que se corta a la mitad deja lo escrito
 * escrito y se reanuda sin duplicar.
 */
import { getTableConfig } from 'drizzle-orm/pg-core';

import { elegirBaseParaSembrar } from '../base-descartable.js';
import { COMANDO_PARA_TIRAR, NOMBRE_DEL_ESQUEMA } from '../schema/simulacion-esquema.js';

import type { Db } from '../client.js';
import type { PgTable } from 'drizzle-orm/pg-core';

/**
 * Cuántas filas entran en un `INSERT`.
 *
 * El techo real es el tamaño del cuerpo HTTP: `neon-http` manda cada sentencia
 * en su propia petición. Una señal ensayada son 24 columnas chicas, así que
 * quinientas viajan cómodas y dejan la siembra reanudable con grano fino.
 */
export const TAMANO_DE_LOTE = 500;

// ---------------------------------------------------------------------------
// La decisión, sin Postgres
// ---------------------------------------------------------------------------

export type Destino =
  | { readonly permitido: true; readonly tabla: string }
  | {
      readonly permitido: false;
      readonly esquema: string;
      readonly tabla: string;
      readonly motivo: string;
    };

/**
 * ¿A esta tabla se le puede escribir desde acá?
 *
 * Le pregunta a Drizzle por la configuración **del objeto de tabla**, no por un
 * nombre que alguien escribió en una cadena. Es la diferencia entre una guarda
 * y un comentario: una tabla de `public` sigue teniendo `schema === undefined`
 * por más que quien la pase la haya llamado `senalesSinteticas`.
 */
export function destinoDe(tabla: PgTable): Destino {
  const config = getTableConfig(tabla);
  const esquema = config.schema ?? 'public';
  if (esquema !== NOMBRE_DEL_ESQUEMA) {
    return {
      permitido: false,
      esquema,
      tabla: config.name,
      motivo:
        `El escritor de la Simulación sólo escribe en el esquema "${NOMBRE_DEL_ESQUEMA}", ` +
        `y "${esquema}.${config.name}" no está ahí. Una fila sintética en una tabla del ` +
        'corpus real no se distingue después: por eso esto tira en vez de escribir.',
    };
  }
  return { permitido: true, tabla: config.name };
}

/** Lo que se lanza cuando alguien apunta el escritor afuera. Tipada, para que un test la espere. */
export class EscrituraFueraDeSimulacion extends Error {
  readonly esquema: string;
  readonly tabla: string;

  constructor(destino: Extract<Destino, { permitido: false }>) {
    super(destino.motivo);
    this.name = 'EscrituraFueraDeSimulacion';
    this.esquema = destino.esquema;
    this.tabla = destino.tabla;
  }
}

/** Parte una lista en lotes. Pura, y con su propio test: un lote de 0 sería un bucle infinito. */
export function enLotes<T>(filas: readonly T[], tamano: number = TAMANO_DE_LOTE): T[][] {
  if (!Number.isInteger(tamano) || tamano <= 0) {
    throw new RangeError(`el tamaño de lote tiene que ser un entero positivo, y llegó ${tamano}`);
  }
  const lotes: T[][] = [];
  for (let i = 0; i < filas.length; i += tamano) lotes.push(filas.slice(i, i + tamano));
  return lotes;
}

// ---------------------------------------------------------------------------
// El escritor
// ---------------------------------------------------------------------------

export interface OpcionesDelEscritor {
  /** El DSN al que se va a sembrar. Se valida antes de abrir nada. */
  readonly url: string | undefined;
  /** Las bases vivas contra las que se compara. Normalmente las dos del `.env`. */
  readonly vivas: readonly string[];
}

const MOTIVOS: Record<'ausente' | 'es_la_viva' | 'ilegible' | 'rama_por_defecto', string> = {
  ausente:
    'no hay DSN. La siembra sintética no cae a DATABASE_URL a propósito: el default de ' +
    '«¿puedo escribir acá?» es que no.',
  es_la_viva:
    'el DSN apunta a la MISMA base que sirve el sitio. El endpoint pooled y el directo de ' +
    'Neon son la misma base y se diferencian sólo por el sufijo "-pooler".',
  ilegible: 'el DSN no se puede leer como URL, y lo que no se puede comparar no se declara seguro.',
  rama_por_defecto:
    'el DSN apunta a la rama POR DEFECTO del proyecto Neon. Ahí no se siembra ni con permiso: ' +
    'pedí una rama efímera y apuntá el escritor a su host.',
};

/**
 * Lo que se lanza cuando la base no habilita la siembra. Dice el comando que
 * falta, no sólo el problema.
 */
export class BaseNoHabilitada extends Error {
  constructor(motivo: keyof typeof MOTIVOS) {
    super(
      `No se puede sembrar el esquema "${NOMBRE_DEL_ESQUEMA}": ${MOTIVOS[motivo]}\n` +
        '  Una rama efímera se pide con `mcp__Neon__create_branch` (o desde la consola de Neon)\n' +
        '  y se apunta con DATABASE_URL_SIMULACION. Verificá el host antes de escribir una fila.',
    );
    this.name = 'BaseNoHabilitada';
  }
}

/**
 * El escritor.
 *
 * Se construye con un `Db` **ya apuntado** a la base habilitada. La validación
 * del DSN es de `abrirEscritorDeSimulacion`, que es la fábrica: separarlas deja
 * que un test construya el escritor con un doble sin tener que inventar un DSN
 * que pase la lista negra.
 */
export class EscritorDeSimulacion {
  constructor(private readonly db: Db) {}

  /**
   * Inserta filas en una tabla del ensayo, en lotes, sin pisar lo que ya está.
   *
   * `onConflictDoNothing` y no `DO UPDATE`: una siembra es contenido
   * direccionado por huella, así que una fila que ya está es la misma fila. Un
   * `UPDATE` acá escondería el caso en que dos elencos distintos colisionan de
   * huella, que es un error y tiene que verse.
   */
  async insertar<T extends PgTable>(
    tabla: T,
    filas: readonly T['$inferInsert'][],
    tamano: number = TAMANO_DE_LOTE,
  ): Promise<number> {
    const destino = destinoDe(tabla);
    if (!destino.permitido) throw new EscrituraFueraDeSimulacion(destino);
    if (filas.length === 0) return 0;

    let escritas = 0;
    for (const lote of enLotes(filas, tamano)) {
      await this.db.insert(tabla).values(lote).onConflictDoNothing();
      escritas += lote.length;
    }
    return escritas;
  }

  /**
   * Tira el esquema entero.
   *
   * Una sola sentencia se lleva el país inventado y no toca una fila del real.
   * Eso es lo que una columna `es_simulacion` nunca puede prometer: para
   * deshacerla hay que confiar en que el `where` de un `DELETE` esté bien.
   */
  async tirarTodo(): Promise<void> {
    await this.db.execute(COMANDO_PARA_TIRAR);
  }
}

/**
 * Abre el escritor, o explica por qué no.
 *
 * `armarDb` se inyecta para que el test no tenga que abrir una conexión: la
 * decisión que este archivo defiende —a qué base se le permite escribir— es
 * anterior a que exista un cliente, y se prueba sin uno.
 */
export function abrirEscritorDeSimulacion(
  opciones: OpcionesDelEscritor,
  armarDb: (url: string) => Db,
): EscritorDeSimulacion {
  const elegida = elegirBaseParaSembrar(opciones.url, opciones.vivas);
  if (!elegida.siembra) throw new BaseNoHabilitada(elegida.motivo);
  return new EscritorDeSimulacion(armarDb(elegida.url));
}
