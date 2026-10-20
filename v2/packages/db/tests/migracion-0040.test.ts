/**
 * Lo que la migración 0040 (la pila) tiene que dejar cierto en el motor (plan de
 * Mi Argentina ideal, entrega 1, tarea 4).
 *
 * No escribe una sola fila que quede: todo corre adentro de una transacción que
 * termina en ROLLBACK, y cada intento que TIENE que fallar va en su propio
 * savepoint. Corre contra la base descartable (`DATABASE_URL_DESCARTABLE`, que
 * `pnpm test:integration:local` levanta en esta máquina) y se saltea sin ella.
 */
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const DSN = process.env['DATABASE_URL_DESCARTABLE'];
const viva = DSN ? describe : describe.skip;

viva('migración 0040 — respuestas, duelos, reportes y decisiones', () => {
  let cliente: pg.Client;
  let actor = 0;
  let otroActor = 0;
  let a = 0;
  let b = 0;
  let c = 0;
  let provincia = 0;

  /** Corre `sentencia` en un savepoint y devuelve el código de error de Postgres, o `null`. */
  const intentar = async (sentencia: string, valores: unknown[] = []): Promise<string | null> => {
    await cliente.query('savepoint intento');
    try {
      await cliente.query(sentencia, valores);
      await cliente.query('release savepoint intento');
      return null;
    } catch (err) {
      await cliente.query('rollback to savepoint intento');
      return (err as { code?: string }).code ?? 'desconocido';
    }
  };

  const unDeseo = async (): Promise<number> => {
    const r = await cliente.query<{ id: string }>(
      `insert into senales (tipo, clase, origen, id_local, texto)
       values ('sueño', 'deseo', 'web', gen_random_uuid(), 'Que el turno no tarde tres meses.')
       returning id`,
    );
    return Number(r.rows[0]?.id);
  };

  beforeAll(async () => {
    cliente = new pg.Client({ connectionString: DSN });
    await cliente.connect();
    await cliente.query('begin');
    const actores = await cliente.query<{ id: string }>(
      `insert into actores (actor_hash, origen) values (sha256(gen_random_uuid()::text::bytea), 'web'), (sha256(gen_random_uuid()::text::bytea), 'web') returning id`,
    );
    actor = Number(actores.rows[0]?.id);
    otroActor = Number(actores.rows[1]?.id);
    [a, b, c] = [await unDeseo(), await unDeseo(), await unDeseo()];
    if (a > b) [a, b] = [b, a];
    const p = await cliente.query<{ id: number }>(
      `select id from geographic_locations where level = 'province' order by id limit 1`,
    );
    provincia = p.rows[0]?.id ?? 0;
  });

  afterAll(async () => {
    await cliente.query('rollback');
    await cliente.end();
  });

  it('las cuatro tablas existen', async () => {
    const r = await cliente.query<{ n: number }>(
      `select count(*)::int as n from information_schema.tables
       where table_name in ('pila_respuestas', 'pila_duelos', 'pila_reportes', 'pila_decisiones')`,
    );
    expect(r.rows[0]?.n).toBe(4);
  });

  it('una respuesta válida entra, y una mostrada sin contestar también', async () => {
    expect(
      await intentar(
        `insert into pila_respuestas (senal_id, actor_id, valor, respondida_en) values ($1, $2, 'acuerdo', now())`,
        [a, actor],
      ),
    ).toBeNull();
    expect(
      await intentar(`insert into pila_respuestas (senal_id, actor_id) values ($1, $2)`, [
        b,
        actor,
      ]),
    ).toBeNull();
  });

  it('los CHECK rechazan valores fuera del vocabulario', async () => {
    expect(
      await intentar(
        `insert into pila_respuestas (senal_id, actor_id, valor, respondida_en) values ($1, $2, 'quizas', now())`,
        [c, actor],
      ),
    ).toBe('23514');
    expect(
      await intentar(
        `insert into pila_respuestas (senal_id, actor_id, provincia_id, region) values ($1, $2, $3, 'Marte')`,
        [c, actor, provincia],
      ),
    ).toBe('23514');
    expect(
      await intentar(
        `insert into pila_reportes (senal_id, actor_id, motivo, cuenta) values ($1, $2, 'me_aburre', true)`,
        [c, actor],
      ),
    ).toBe('23514');
    expect(
      await intentar(
        `insert into pila_decisiones (senal_id, decision, origen, motivo) values ($1, 'borrar', 'reportes', 'x')`,
        [c],
      ),
    ).toBe('23514');
  });

  it('un valor sin fecha de respuesta, o una fecha sin valor, se rechaza', async () => {
    expect(
      await intentar(
        `insert into pila_respuestas (senal_id, actor_id, valor) values ($1, $2, 'paso')`,
        [c, actor],
      ),
    ).toBe('23514');
    expect(
      await intentar(
        `insert into pila_respuestas (senal_id, actor_id, respondida_en) values ($1, $2, now())`,
        [c, actor],
      ),
    ).toBe('23514');
  });

  it('una región sin provincia se rechaza, y una provincia sin región también', async () => {
    expect(
      await intentar(
        `insert into pila_respuestas (senal_id, actor_id, region) values ($1, $2, 'NOA')`,
        [c, actor],
      ),
    ).toBe('23514');
    expect(
      await intentar(
        `insert into pila_respuestas (senal_id, actor_id, provincia_id) values ($1, $2, $3)`,
        [c, actor, provincia],
      ),
    ).toBe('23514');
  });

  it('un par con a_id ≥ b_id se rechaza', async () => {
    expect(
      await intentar(`insert into pila_duelos (a_id, b_id, actor_id) values ($1, $2, $3)`, [
        b,
        a,
        actor,
      ]),
    ).toBe('23514');
    expect(
      await intentar(`insert into pila_duelos (a_id, b_id, actor_id) values ($1, $1, $2)`, [
        a,
        actor,
      ]),
    ).toBe('23514');
  });

  it('un primero ajeno al par se rechaza; uno del par o «los dos por igual» entran', async () => {
    expect(
      await intentar(
        `insert into pila_duelos (a_id, b_id, actor_id, primero_id) values ($1, $2, $3, $4)`,
        [a, b, actor, c],
      ),
    ).toBe('23514');
    expect(
      await intentar(
        `insert into pila_duelos (a_id, b_id, actor_id, primero_id) values ($1, $2, $3, $2)`,
        [a, b, actor],
      ),
    ).toBeNull();
    expect(
      await intentar(`insert into pila_duelos (a_id, b_id, actor_id) values ($1, $2, $3)`, [
        a,
        b,
        otroActor,
      ]),
    ).toBeNull();
  });

  it('un segundo reporte del mismo actor no entra', async () => {
    expect(
      await intentar(
        `insert into pila_reportes (senal_id, actor_id, motivo, cuenta) values ($1, $2, 'insulta', false)`,
        [c, actor],
      ),
    ).toBeNull();
    expect(
      await intentar(
        `insert into pila_reportes (senal_id, actor_id, motivo, cuenta) values ($1, $2, 'fuera_de_tema', true)`,
        [c, actor],
      ),
    ).toBe('23505');
  });

  it('una decisión de la gestión exige quién la tomó, y una por reportes no lo lleva', async () => {
    expect(
      await intentar(
        `insert into pila_decisiones (senal_id, decision, origen, motivo) values ($1, 'retener', 'gestion', 'x')`,
        [c],
      ),
    ).toBe('23514');
    expect(
      await intentar(
        `insert into pila_decisiones (senal_id, decision, origen, motivo) values ($1, 'retener', 'reportes', 'x')`,
        [c],
      ),
    ).toBeNull();
  });
});
