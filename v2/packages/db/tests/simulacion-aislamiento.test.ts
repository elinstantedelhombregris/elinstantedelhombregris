/**
 * El aislamiento del esquema `simulacion`, contra un motor de verdad.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §2.10 y §3.9.
 *
 * Las guardas puras viven en `src/__tests__/simulacion-aislamiento.test.ts` y
 * corren siempre. Ésta necesita Postgres porque afirma cosas que sólo el motor
 * puede contestar: que una consulta del corpus real **no encuentra** la tabla
 * sintética, que ningún CHECK es decorativo, y que `DROP SCHEMA … CASCADE` se
 * lleva el ensayo entero sin rozar una fila de `public`.
 *
 * ── A qué base ──────────────────────────────────────────────────────────────
 *
 * A `DATABASE_URL_SIMULACION`, y si no está, a `DATABASE_URL_DESCARTABLE`.
 * **Nunca cae a `DATABASE_URL`**, y la rama por defecto del proyecto Neon está
 * en una lista negra literal aunque alguien la exporte a mano
 * (`src/base-descartable.ts`). Sin una de esas variables, la suite se saltea con
 * el motivo impreso — que se saltee es correcto; que escriba en producción no.
 *
 * Esta suite **crea el esquema, lo llena y lo tira** en cada corrida.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { elegirBaseParaSembrar } from '../src/base-descartable.js';
import { COMANDO_PARA_TIRAR, NOMBRE_DEL_ESQUEMA } from '../src/schema/simulacion-esquema.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const MIGRACION = fileURLToPath(new URL('../migrations/0021_simulacion.sql', import.meta.url));

const VIVAS = [process.env.DATABASE_URL, process.env.DATABASE_URL_UNPOOLED].filter(
  (u): u is string => typeof u === 'string' && u.length > 0,
);

const BASE = elegirBaseParaSembrar(
  process.env.DATABASE_URL_SIMULACION ?? process.env.DATABASE_URL_DESCARTABLE,
  VIVAS,
);

const MOTIVOS: Record<'ausente' | 'es_la_viva' | 'ilegible' | 'rama_por_defecto', string> = {
  ausente: 'faltan DATABASE_URL_SIMULACION y DATABASE_URL_DESCARTABLE',
  es_la_viva: 'el DSN apunta a la MISMA base que sirve el sitio',
  ilegible: 'el DSN no se puede leer como URL',
  rama_por_defecto: 'el DSN apunta a la rama POR DEFECTO del proyecto Neon',
};

if (!BASE.siembra) {
  process.stdout.write(
    `\n[simulacion-aislamiento] La suite que ESCRIBE se saltea: ${MOTIVOS[BASE.motivo]}.\n` +
      '  Crea el esquema `simulacion`, lo llena y lo tira, así que necesita una rama efímera.\n' +
      '  Pedila con `mcp__Neon__create_branch` y exportá DATABASE_URL_SIMULACION con su host.\n\n',
  );
}

const suite = BASE.siembra ? describe : describe.skip;

/** Las sentencias de la 0021, como drizzle-kit las separa. */
function sentenciasDeLa0021(): string[] {
  return readFileSync(MIGRACION, 'utf8')
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

suite('el esquema simulacion, contra Postgres', () => {
  /** `undefined` hasta el `beforeAll`: el `afterAll` corre igual si el arranque se cae. */
  let pool: pg.Pool | undefined;
  /** Cuántas tablas tenía `public` antes de tocar nada. Se compara al final. */
  let tablasPublicAntes = 0;

  /** El pool, o un error que dice qué pasó. Nunca un `pool!` que muera en un `.query` de nadie. */
  const abierto = (): pg.Pool => {
    if (pool === undefined) throw new Error('el pool no se abrió: falló el beforeAll');
    return pool;
  };

  const contar = async (consulta: string, params: unknown[] = []): Promise<number> => {
    const { rows } = await abierto().query<{ n: string }>(consulta, params);
    return Number(rows[0]?.n ?? '0');
  };

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: BASE.siembra ? BASE.url : '', max: 1 });
    // Empezar de cero aunque una corrida anterior se haya caído a la mitad.
    await abierto().query(COMANDO_PARA_TIRAR);
    tablasPublicAntes = await contar(
      `select count(*)::text as n from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r'`,
    );
    for (const sentencia of sentenciasDeLa0021()) await abierto().query(sentencia);
  }, 120_000);

  afterAll(async () => {
    if (pool !== undefined) {
      await abierto().query(COMANDO_PARA_TIRAR);
      await pool.end();
      pool = undefined;
    }
  });

  it('la 0021 crea el esquema y sus once tablas', async () => {
    const tablas = await contar(
      `select count(*)::text as n from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = $1 and c.relkind = 'r'`,
      [NOMBRE_DEL_ESQUEMA],
    );
    expect(tablas).toBe(11);
  });

  it('y no agrega ni quita una sola tabla de `public`', async () => {
    const ahora = await contar(
      `select count(*)::text as n from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r'`,
    );
    expect(ahora).toBe(tablasPublicAntes);
  });

  it('ningún nombre de tabla se repite entre los dos esquemas, en el catálogo vivo', async () => {
    // La guarda pura mira los módulos de Drizzle; ésta mira lo que hay. Son dos
    // preguntas distintas: una tabla puede existir en la base sin estar en el
    // esquema de Drizzle (una migración vieja, un `create table` a mano).
    const { rows } = await abierto().query<{ relname: string }>(
      `select s.relname from pg_class s
         join pg_namespace sn on sn.oid = s.relnamespace and sn.nspname = $1
        where s.relkind = 'r'
          and exists (select 1 from pg_class p
                        join pg_namespace pn on pn.oid = p.relnamespace and pn.nspname = 'public'
                       where p.relname = s.relname and p.relkind = 'r')`,
      [NOMBRE_DEL_ESQUEMA],
    );
    expect(rows.map((r) => r.relname)).toEqual([]);
  });

  it('ninguna clave foránea cruza el borde, en ninguna dirección', async () => {
    const { rows } = await abierto().query<{ conname: string; desde: string; hacia: string }>(
      `select con.conname, dn.nspname as desde, fn.nspname as hacia
         from pg_constraint con
         join pg_class dt on dt.oid = con.conrelid
         join pg_namespace dn on dn.oid = dt.relnamespace
         join pg_class ft on ft.oid = con.confrelid
         join pg_namespace fn on fn.oid = ft.relnamespace
        where con.contype = 'f'
          and ((dn.nspname = $1) <> (fn.nspname = $1))`,
      [NOMBRE_DEL_ESQUEMA],
    );
    expect(rows).toEqual([]);
  });

  describe('con una fila sintética adentro', () => {
    beforeAll(async () => {
      await abierto().query(
        `insert into simulacion.escenarios
           (huella, pais_huella, ahora, forma, ajustes, coeficientes, razon)
         values ('esc-de-prueba-0123456789', 'pais-0123456789', 1786600000000,
                 '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'la guarda de aislamiento')`,
      );
      await abierto().query(
        `insert into simulacion.elencos
           (huella, modelo, digest, temperatura, semilla, corpus_huella, personas, sesgo, fabricado)
         values ('elenco-de-prueba-0123456789', 'fabricado', '', 0, 7, 'corpus-0123456789',
                 2, '{"nota":"fabricado por la guarda"}'::jsonb, true)`,
      );
      await abierto().query(
        `insert into simulacion.funciones (id, escenario_huella, elenco_huella, semilla, rondas)
         values ('fn-de-prueba', 'esc-de-prueba-0123456789', 'elenco-de-prueba-0123456789', 7, 12)`,
      );
      await abierto().query(
        `insert into simulacion.senales_ensayadas
           (funcion_id, id, persona_id, ronda, tipo, clase, estado, tema, tema_origen,
            provincia_id, celda_id, precision, location_role, sensitivity, direccion_estado,
            creada_en_ms)
         values ('fn-de-prueba', 1, null, 1, 'basta', 'hecho', 'enviada', null, 'ninguno',
                 6, 'celda-0', 'province', 'subject', 'low', 'sin_direccion', 1786600000000)`,
      );
    });

    it('la fila está, y se la ve calificando el esquema', async () => {
      expect(await contar(`select count(*)::text as n from simulacion.senales_ensayadas`)).toBe(1);
    });

    it('una consulta del corpus real NO la alcanza: la tabla no existe en `public`', async () => {
      // Ésta es la afirmación entera del §2.10 de la spec, hecha ejecutable. Con
      // una columna `es_simulacion`, este mismo `select` habría devuelto la fila
      // sintética y nadie se habría enterado. Acá el motor da error, que es la
      // única forma de fallar que se puede arreglar.
      await expect(
        abierto().query(`set local search_path to public; select count(*) from senales_ensayadas`),
      ).rejects.toThrow(/does not exist/);

      expect(await contar(`select count(*)::text as n
                             from pg_class c join pg_namespace n on n.oid = c.relnamespace
                            where n.nspname = 'public' and c.relname like '%_ensayadas'`)).toBe(0);
    });

    it('las tablas del corpus real siguen sin una sola fila sintética', async () => {
      // `dreams` es la tabla de voces que el mapa lee hoy. Si la siembra
      // sintética pudiera tocar algo del corpus, tocaría ésta.
      const columnas = await contar(
        `select count(*)::text as n from information_schema.columns
          where table_schema = 'public' and column_name in ('es_simulacion','funcion_id','elenco_huella')`,
      );
      // Ninguna tabla real tiene columnas del ensayo: no hay costura por donde
      // una fila sintética entre a `public`.
      expect(columnas).toBe(0);
    });

    it('el CHECK de tipo/clase rechaza un `sueño` marcado como hecho (regla 11)', async () => {
      await expect(
        abierto().query(
          `insert into simulacion.senales_ensayadas
             (funcion_id, id, ronda, tipo, clase, estado, tema_origen, provincia_id, celda_id,
              precision, location_role, sensitivity, direccion_estado, creada_en_ms)
           values ('fn-de-prueba', 2, 1, 'sueño', 'hecho', 'enviada', 'ninguno', 6, 'c',
                   'province', 'subject', 'low', 'sin_direccion', 1786600000000)`,
        ),
      ).rejects.toThrow(/sim_senales_tipo_clase_chk/);
    });

    it('el CHECK de corroboración rechaza un deseo corroborado (regla 11)', async () => {
      await expect(
        abierto().query(
          `insert into simulacion.senales_ensayadas
             (funcion_id, id, ronda, tipo, clase, estado, tema_origen, provincia_id, celda_id,
              precision, location_role, sensitivity, direccion_estado, creada_en_ms)
           values ('fn-de-prueba', 3, 1, 'sueño', 'deseo', 'corroborada', 'ninguno', 6, 'c',
                   'province', 'subject', 'low', 'sin_direccion', 1786600000000)`,
        ),
      ).rejects.toThrow(/sim_senales_corroborada_solo_verificable_chk/);
    });

    it('el CHECK del techo de dirección rechaza una altura en una `necesidad`', async () => {
      await expect(
        abierto().query(
          `insert into simulacion.senales_ensayadas
             (funcion_id, id, ronda, tipo, clase, estado, tema_origen, provincia_id, celda_id,
              precision, location_role, sensitivity, direccion_estado, altura, creada_en_ms)
           values ('fn-de-prueba', 4, 1, 'necesidad', 'hecho', 'enviada', 'ninguno', 6, 'c',
                   'province', 'subject', 'low', 'calle', 1234, 1786600000000)`,
        ),
      ).rejects.toThrow(/sim_senales_altura_por_tipo_chk/);
    });

    it('una corrida en modo forma no puede llevar sello de modelo (regla 6)', async () => {
      await expect(
        abierto().query(
          `insert into simulacion.corridas
             (escenario_huella, pais_huella, modo, semilla, sello, reproducible,
              resumen, pedido, logrado, cobertura, mandatos, cosecha_huella)
           values ('esc-de-prueba-0123456789', 'pais-0123456789', 'forma', 1,
                   '{"modelo":"inventado"}'::jsonb, true,
                   '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '[]'::jsonb, 'cos-1')`,
        ),
      ).rejects.toThrow(/sim_corridas_sello_solo_en_gente_chk/);
    });

    it('una sugerencia automática es incapaz de mover un estado (regla 6)', async () => {
      await expect(
        abierto().query(
          `insert into simulacion.rastro_funcion
             (funcion_id, ronda, actor_clase, tipo_evento, estado_nuevo)
           values ('fn-de-prueba', 1, 'maquina', 'sugerencia_automatica', 'corroborada')`,
        ),
      ).rejects.toThrow(/rastro_sugerencia_no_mueve_estado_check/);
    });

    it('no existe el actor `ia`, ni el actor `persona`', async () => {
      await expect(
        abierto().query(
          `insert into simulacion.rastro_funcion (funcion_id, ronda, actor_clase, tipo_evento)
           values ('fn-de-prueba', 1, 'ia', 'lo_que_sea')`,
        ),
      ).rejects.toThrow(/sim_rastro_actor_clase_chk/);
    });

    it('se tira entero con una sola sentencia, y `public` queda como estaba', async () => {
      await abierto().query(COMANDO_PARA_TIRAR);

      expect(
        await contar(
          `select count(*)::text as n from information_schema.schemata where schema_name = $1`,
          [NOMBRE_DEL_ESQUEMA],
        ),
      ).toBe(0);

      const publicDespues = await contar(
        `select count(*)::text as n from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relkind = 'r'`,
      );
      expect(publicDespues).toBe(tablasPublicAntes);
    });
  });
});
