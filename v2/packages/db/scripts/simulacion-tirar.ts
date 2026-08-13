#!/usr/bin/env tsx
/**
 * Tirar el esquema `simulacion` entero.
 *
 *     pnpm --filter @v2/db simulacion:tirar            # dice qué haría y no lo hace
 *     pnpm --filter @v2/db simulacion:tirar --aplicar  # lo hace
 *
 * Y a mano, contra cualquier `psql`, que es el punto entero de haber elegido un
 * esquema y no una columna:
 *
 *     DROP SCHEMA simulacion CASCADE;
 *
 * ── Por qué esto se puede correr en cualquier base, incluida la viva ─────────
 *
 * Es la única operación del módulo que no tiene lado peligroso. `DROP SCHEMA
 * simulacion CASCADE` no puede alcanzar una fila de `public` —el `CASCADE`
 * arrastra sólo lo que depende de objetos del esquema que se tira, y la regla 2
 * del aislamiento prohíbe que algo de `public` dependa de acá—. O sea que el
 * peor caso de correr esto por error es perder un país inventado que se vuelve
 * a generar con la misma semilla.
 *
 * Ésa es exactamente la asimetría que hace que un esquema aparte sea mejor que
 * una columna `es_simulacion`: para deshacer la columna hay que confiar en el
 * `where` de un `DELETE`, y ese `where` es la misma cosa que ya falló cuando
 * alguien lo olvidó en un `SELECT`.
 *
 * ── Qué imprime antes ────────────────────────────────────────────────────────
 *
 * El host, la base, y el inventario: cuántas tablas y cuántas filas se va a
 * llevar. Un `DROP` que no dice qué había adentro es un `DROP` que nadie va a
 * poder auditar después.
 */
import { config } from 'dotenv';
import pg from 'pg';

import { esRamaProhibida } from '../src/base-descartable.js';
import { COMANDO_PARA_TIRAR, NOMBRE_DEL_ESQUEMA } from '../src/schema/simulacion-esquema.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const escribir = (texto: string): void => void process.stdout.write(texto);

const url =
  process.env.DATABASE_URL_SIMULACION ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL;

if (url === undefined || url.length === 0) {
  escribir(
    'No hay a qué base preguntarle. Poné DATABASE_URL_SIMULACION (la rama efímera donde\n' +
      'vive el ensayo) o, si lo que querés es limpiar la base principal, DATABASE_URL.\n',
  );
  process.exit(1);
}

const aplicar = process.argv.includes('--aplicar');
const host = ((): string => {
  try {
    return new URL(url).host;
  } catch {
    return '(host ilegible)';
  }
})();

const pool = new pg.Pool({ connectionString: url, max: 1 });

try {
  const { rows: existe } = await pool.query<{ n: string }>(
    `select count(*)::text as n from information_schema.schemata where schema_name = $1`,
    [NOMBRE_DEL_ESQUEMA],
  );
  escribir(`\nBase: ${host}\n`);

  if ((existe[0]?.n ?? '0') === '0') {
    escribir(`El esquema "${NOMBRE_DEL_ESQUEMA}" no existe acá. Nada que tirar.\n\n`);
    process.exit(0);
  }

  const { rows: inventario } = await pool.query<{ tabla: string; filas: string }>(
    `select c.relname as tabla, coalesce(c.reltuples, 0)::bigint::text as filas
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = $1 and c.relkind = 'r'
      order by c.relname`,
    [NOMBRE_DEL_ESQUEMA],
  );

  escribir(`Esquema "${NOMBRE_DEL_ESQUEMA}": ${String(inventario.length)} tablas.\n`);
  for (const fila of inventario) {
    // `reltuples` es la estimación del planificador, no un conteo — y desde
    // PostgreSQL 14 vale **-1** cuando la tabla nunca se analizó. Imprimir ese
    // -1 como si fuera una cantidad sería exactamente el pecado que este módulo
    // existe para no cometer: un número que dice «no sé» disfrazado de dato.
    const estimado = Number(fila.filas);
    const cuantas = estimado < 0 ? 'sin estimación (nunca se analizó)' : `~${fila.filas} filas`;
    escribir(`  ${fila.tabla.padEnd(28)} ${cuantas}\n`);
  }

  // Que dependa de `public` es imposible por diseño, y esto lo verifica en vez
  // de confiar: si alguna vez alguien agrega una FK que cruza el borde, el
  // `CASCADE` dejaría de ser inocuo y hay que enterarse ANTES de correrlo.
  const { rows: cruces } = await pool.query<{ conname: string; desde: string }>(
    `select con.conname, dn.nspname as desde
       from pg_constraint con
       join pg_class dt on dt.oid = con.conrelid
       join pg_namespace dn on dn.oid = dt.relnamespace
       join pg_class ft on ft.oid = con.confrelid
       join pg_namespace fn on fn.oid = ft.relnamespace
      where con.contype = 'f' and fn.nspname = $1 and dn.nspname <> $1`,
    [NOMBRE_DEL_ESQUEMA],
  );

  if (cruces.length > 0) {
    escribir(
      `\n  ✗  HAY ${String(cruces.length)} clave(s) foránea(s) de OTRO esquema hacia "${NOMBRE_DEL_ESQUEMA}".\n` +
        '     Eso rompe la regla 2 del aislamiento y hace que el CASCADE deje de ser inocuo.\n' +
        '     No se tira nada hasta que esas referencias no existan:\n' +
        cruces.map((c) => `       ${c.desde}: ${c.conname}\n`).join(''),
    );
    process.exit(1);
  }

  if (!aplicar) {
    escribir(
      `\nSimulacro: nada se tiró. El comando sería\n    ${COMANDO_PARA_TIRAR};\n` +
        'Volvé a correr con --aplicar.\n\n',
    );
    process.exit(0);
  }

  if (esRamaProhibida(url)) {
    // Tirar acá es seguro (no toca `public`), pero conviene que quede dicho en
    // la salida: nadie debería estar sembrando en esta base, así que si hay
    // algo que tirar es porque algo se aplicó donde no correspondía.
    escribir(
      '\n  !  Esta es la rama POR DEFECTO del proyecto. Tirar es seguro —el CASCADE no\n' +
        '     alcanza `public`—, pero que haya algo que tirar acá significa que la\n' +
        '     migración se aplicó donde el escritor tiene prohibido escribir.\n',
    );
  }

  await pool.query(COMANDO_PARA_TIRAR);
  escribir(`\n  ✓  ${COMANDO_PARA_TIRAR}\n     Listo. El país inventado ya no está.\n\n`);
} finally {
  await pool.end();
}
