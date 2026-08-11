/**
 * ¿La `0013` ya está aplicada en la base contra la que estos tests hablan?
 *
 * No es un test: es la pregunta que los tests de `tests/` tienen que poder
 * hacerse antes de afirmar nada. Se llama `_migracion-0013.ts` con guion bajo y
 * sin `.test.` para que el `include` de vitest no lo levante como suite.
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 *
 * La `0013` está escrita y **no** aplicada, a propósito: aplicarla hoy deja las
 * 24 provincias vivas con `name_norm` y `georef_id` en NULL y rompe la
 * resolución territorial. Mientras tanto, ocho tests que afirman cosas sobre el
 * esquema NUEVO corren contra el esquema VIEJO y revientan con «column
 * "parent_id" does not exist». Un rojo así no dice «la migración está mal»:
 * dice «todavía no corriste la migración», que es un estado correcto.
 *
 * Saltearse es la respuesta a **una** de las tres formas de no estar aplicada, y
 * sólo a una:
 *
 * - `aplicada`     → los tests corren. Es lo único que los habilita a afirmar.
 * - `sin_aplicar`  → se saltean, con la razón impresa. Ninguna pieza está.
 * - `a_medias`     → **corren igual, y se ponen rojos.** Media migración es un
 *                    estado que nadie diseñó, y taparlo con un salteo sería
 *                    exactamente el fallo abierto que este repo no admite: una
 *                    suite verde que no probó nada sobre una base rota.
 * - `sin_base`     → se saltean: sin DSN no hay a qué preguntarle.
 *
 * El defecto que esta distinción caza es el de un `pnpm db:migrate` que muere a
 * la mitad —la 0013 son treinta y pico de sentencias— y deja la tabla con
 * `parent_id` pero sin el CHECK de niveles.
 */
import { config } from 'dotenv';
import pg from 'pg';

config({ path: new URL('../../../.env', import.meta.url).pathname });

// ---------------------------------------------------------------------------
// La decisión, sin Postgres
// ---------------------------------------------------------------------------

/** Una pieza que la `0013` deja en la base, y si está o no. */
export interface PiezaDe0013 {
  readonly nombre: string;
  readonly presente: boolean;
}

export type EstadoDe0013 =
  | { readonly estado: 'aplicada' }
  | { readonly estado: 'sin_aplicar' }
  | {
      readonly estado: 'a_medias';
      readonly presentes: readonly string[];
      readonly ausentes: readonly string[];
    }
  | { readonly estado: 'sin_base' };

/**
 * Todas presentes → aplicada. Todas ausentes → sin aplicar. Cualquier mezcla es
 * media migración y se llama por su nombre.
 */
export function clasificar0013(piezas: readonly PiezaDe0013[]): EstadoDe0013 {
  // Sobre una lista vacía, «están todas» y «no está ninguna» son las dos
  // verdaderas, y la que se elige sola es la permisiva: diría `aplicada` sin
  // haber mirado nada. No mirar nada no es una respuesta.
  if (piezas.length === 0) return { estado: 'a_medias', presentes: [], ausentes: [] };

  const presentes = piezas.filter((p) => p.presente).map((p) => p.nombre);
  const ausentes = piezas.filter((p) => !p.presente).map((p) => p.nombre);
  if (ausentes.length === 0) return { estado: 'aplicada' };
  if (presentes.length === 0) return { estado: 'sin_aplicar' };
  return { estado: 'a_medias', presentes, ausentes };
}

/**
 * Si los tests que dependen de la `0013` se saltean.
 *
 * **`a_medias` devuelve `false` a propósito.** Un salteo se lee como «acá no
 * había nada que probar»; media migración es lo contrario.
 */
export function saltea0013(estado: EstadoDe0013): boolean {
  return estado.estado === 'sin_aplicar' || estado.estado === 'sin_base';
}

/** Qué imprimir cuando el estado no es `aplicada`, y `null` cuando lo es. */
export function avisoDe0013(estado: EstadoDe0013, archivo: string): string | null {
  switch (estado.estado) {
    case 'aplicada':
      return null;
    case 'sin_base':
      return (
        `\n[${archivo}] Los tests que necesitan la 0013 se saltean: no hay DATABASE_URL.\n` +
        '  Sin DSN no hay base a la que preguntarle qué esquema tiene.\n\n'
      );
    case 'sin_aplicar':
      return (
        `\n[${archivo}] Los tests que necesitan la 0013 se saltean: la migración NO está aplicada.\n` +
        '  Es el estado correcto de hoy: la 0013 está escrita y sin aplicar a propósito, porque\n' +
        '  aplicarla deja las 24 provincias vivas con `name_norm` y `georef_id` en NULL. Para\n' +
        '  que estos tests hablen, la secuencia entera es:\n' +
        '    pnpm --filter @v2/db db:migrate\n' +
        '    pnpm --filter @v2/db db:seed-provinces\n' +
        '    pnpm --filter @v2/db geo:rellenar-provincias --aplicar\n\n'
      );
    case 'a_medias':
      return (
        `\n[${archivo}] La 0013 está A MEDIAS, y por eso estos tests NO se saltean: van a ponerse rojos.\n` +
        `  Presentes: ${estado.presentes.join(', ')}\n` +
        `  Ausentes:  ${estado.ausentes.join(', ')}\n` +
        '  Media migración es un estado que nadie diseñó. Saltearlo sería una suite verde\n' +
        '  sobre una base rota.\n\n'
      );
  }
}

// ---------------------------------------------------------------------------
// La pregunta, contra Postgres
// ---------------------------------------------------------------------------

/**
 * Las piezas que se miran, y por qué esas.
 *
 * Son las que los ocho tests rotos necesitan, una por cada forma en que la
 * migración se puede haber quedado a mitad de camino. La última está invertida
 * porque la `0013` no crea la secuencia: la **tira**.
 */
const PIEZAS: readonly { readonly nombre: string; readonly sql: string }[] = [
  {
    nombre: 'geographic_locations.parent_id',
    sql: columnaExiste('geographic_locations', 'parent_id'),
  },
  {
    nombre: 'geographic_locations.name_norm',
    sql: columnaExiste('geographic_locations', 'name_norm'),
  },
  {
    nombre: 'geographic_locations.georef_id',
    sql: columnaExiste('geographic_locations', 'georef_id'),
  },
  {
    nombre: 'geographic_locations_level_chk',
    sql: `exists (select 1 from pg_constraint where conname = 'geographic_locations_level_chk')`,
  },
  { nombre: 'tabla geo_calles', sql: `to_regclass('public.geo_calles') is not null` },
  {
    nombre: 'geographic_locations_province_id_seq (tiene que NO estar)',
    sql: `to_regclass('public.geographic_locations_province_id_seq') is null`,
  },
];

function columnaExiste(tabla: string, columna: string): string {
  return (
    `exists (select 1 from information_schema.columns` +
    ` where table_schema = 'public' and table_name = '${tabla}' and column_name = '${columna}')`
  );
}

/**
 * Le pregunta a la base viva en qué estado está la `0013`.
 *
 * Abre su propia conexión `pg` y la cierra: los dos archivos que la usan hablan
 * por drivers distintos (uno por `neon-http`, otro por `pg`) y esta pregunta
 * tiene que ser la misma para los dos.
 *
 * Un error de conexión **se propaga**. Que la base no conteste no es un motivo
 * para saltearse: es un problema, y taparlo dejaría verde una corrida que nunca
 * llegó a Postgres.
 */
export async function estadoDe0013(): Promise<EstadoDe0013> {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (url === undefined || url.length === 0) return { estado: 'sin_base' };

  const pool = new pg.Pool({ connectionString: url, max: 1 });
  try {
    const seleccion = PIEZAS.map((p, i) => `(${p.sql}) as "p${String(i)}"`).join(', ');
    const { rows } = await pool.query<Record<string, boolean>>(`select ${seleccion}`);
    const fila = rows[0];
    if (fila === undefined) {
      throw new Error('la consulta de estado de la 0013 no devolvió ninguna fila');
    }
    return clasificar0013(
      PIEZAS.map((p, i) => ({ nombre: p.nombre, presente: fila[`p${String(i)}`] === true })),
    );
  } finally {
    await pool.end();
  }
}
