import { neonConfig } from '@neondatabase/serverless';
import pg from 'pg';

/**
 * El puente entre el driver `neon-http` y un Postgres local.
 *
 * La app habla con Neon por HTTP (`drizzle-orm/neon-http`), así que un
 * Postgres de verdad —el de la máquina, o el contenedor del CI— no le sirve tal
 * cual. Acá se reemplaza `neonConfig.fetchFunction` por una función que recibe
 * el pedido HTTP que armaría el driver, lo corre contra `pg` y devuelve la
 * respuesta con la forma que el driver espera: filas en modo arreglo y los
 * valores crudos como texto, para que los parsers de Neon hagan lo suyo.
 * Los lotes (`queries`) van en una transacción, igual que en Neon.
 *
 * Es de tests y de scripts locales, nunca de la app: por eso vive en
 * `tests/helpers/` y se exporta como `@v2/db/testing`.
 */

const HOSTS_LOCALES = new Set(['127.0.0.1', 'localhost', '::1']);

/** `true` si la URL apunta a una base de esta máquina o del contenedor del CI. */
export function esBaseLocal(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return HOSTS_LOCALES.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

interface PedidoNeon {
  query?: string;
  params?: unknown[];
  queries?: { query: string; params: unknown[] }[];
}

/** Instala el puente. Devuelve la función que cierra el pool. */
export function puentearNeonAPostgresLocal(url: string): () => Promise<void> {
  if (!esBaseLocal(url)) {
    throw new Error(
      `El puente a Postgres local sólo acepta bases locales, no ${new URL(url).hostname}.`,
    );
  }
  const pool = new pg.Pool({ connectionString: url, max: 4 });
  const crudo = { getTypeParser: () => (valor: string) => valor };

  neonConfig.fetchFunction = async (_endpoint: string, opciones?: { body?: unknown }) => {
    const pedido = JSON.parse(String(opciones?.body)) as PedidoNeon;
    const cliente = await pool.connect();
    const enLote = pedido.queries !== undefined;
    try {
      if (enLote) await cliente.query('begin');
      const resultados = [];
      for (const q of pedido.queries ?? [
        { query: pedido.query ?? '', params: pedido.params ?? [] },
      ]) {
        const r = await cliente.query({
          text: q.query,
          values: q.params,
          rowMode: 'array',
          types: crudo,
        });
        resultados.push({
          fields: r.fields,
          rows: r.rows,
          rowCount: r.rowCount,
          command: r.command,
        });
      }
      if (enLote) await cliente.query('commit');
      const cuerpo = enLote ? { results: resultados } : resultados[0];
      return new Response(JSON.stringify(cuerpo), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      if (enLote) await cliente.query('rollback');
      const e = err as { message?: string; code?: string; constraint?: string };
      return new Response(
        JSON.stringify({
          message: e.message ?? 'Error de Postgres local',
          code: e.code,
          constraint: e.constraint,
        }),
        { status: 400 },
      );
    } finally {
      cliente.release();
    }
  };

  return () => pool.end();
}

/**
 * La guardia de D-014: un test de integración nunca escribe en una base
 * remota por accidente.
 *
 * `v2/.env` apunta a producción (es lo que usa el servidor de desarrollo), y
 * los tests de integración cargan ese `.env`. Hasta el 22/9/2026 alcanzaba con
 * correr `vitest` en `apps/api` para insertar filas de prueba en la base que
 * sirve el sitio. Ahora: si la base es local, se instala el puente; si es
 * remota, el test no arranca, salvo que se lo pida a propósito con
 * `PERMITIR_BASE_REMOTA_EN_TESTS=1`.
 */
export function prepararBaseDeIntegracion(): void {
  const candidatas = ['DATABASE_URL_DESCARTABLE', 'DATABASE_URL'] as const;
  for (const nombre of candidatas) {
    const url = process.env[nombre];
    if (url && !esBaseLocal(url) && process.env['PERMITIR_BASE_REMOTA_EN_TESTS'] !== '1') {
      throw new Error(
        `${nombre} apunta a una base remota (${new URL(url).hostname}). Los tests de integración ` +
          'sólo corren contra Postgres local: usá `pnpm test:integration:local`, o definí ' +
          'PERMITIR_BASE_REMOTA_EN_TESTS=1 si de verdad querés escribir ahí (D-014).',
      );
    }
  }
  const local = process.env['DATABASE_URL_DESCARTABLE'] || process.env['DATABASE_URL'];
  if (local && esBaseLocal(local)) puentearNeonAPostgresLocal(local);
}
