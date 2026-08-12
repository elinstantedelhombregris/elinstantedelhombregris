/**
 * «Re-sembrar sin cambios escribe cero filas», contra Postgres.
 *
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 5, Step 8.
 *
 * ── POR QUÉ ESTE ARCHIVO NO CORRE CONTRA `DATABASE_URL` ────────────────────
 *
 * **Escribe filas.** Necesita `DATABASE_URL_DESCARTABLE`, una variable propia
 * que nadie tiene puesta por accidente, y se saltea con un mensaje cuando no
 * está. Es el mismo criterio que la tercera suite de `migracion-0013.test.ts`:
 * que se saltee es correcto; que escriba en producción no.
 *
 * ── QUÉ AFIRMA, Y POR QUÉ NO SE PUEDE AFIRMAR SIN BASE ─────────────────────
 *
 * La idempotencia del seed **no es una propiedad del código TypeScript**: es
 * una propiedad del `WHERE` del `DO UPDATE`, que corre adentro del motor. El
 * único lugar donde se puede ver es preguntándole a Postgres cuántas filas
 * devolvió el `RETURNING` de la segunda corrida — y tiene que ser cero.
 *
 * Sin ese `WHERE`, cada re-siembra reescribe 326.832 filas: 326.832 tuplas
 * muertas, el WAL duplicado y el bloat que se los come, en una base con techo
 * duro de 512 MB. Por eso esta afirmación tiene su propio archivo.
 *
 * Se mide con lo que devuelve `upsertLote` —`escritas` sale del `RETURNING`, o
 * sea de las filas que el motor tocó de verdad— y no con
 * `pg_stat_user_tables`, que el recolector de estadísticas actualiza de forma
 * asincrónica: un contador que a veces llega tarde convertiría una afirmación
 * exacta en un test que falla una vez cada veinte corridas.
 *
 *   DATABASE_URL_DESCARTABLE=... pnpm --filter @v2/db test:integration
 */
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { and, eq, like, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { GeoCallesRepository } from '../src/repositories/geo-calles.js';
import { geoCalles } from '../src/schema/geo-calles.js';
import { geographicLocations } from '../src/schema/geographic.js';
import * as schema from '../src/schema/index.js';

import type { Db } from '../src/client.js';
import type { CalleParaSembrar } from '../src/repositories/geo-calles.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const url = process.env.DATABASE_URL_DESCARTABLE;
const dsuite = url ? describe : describe.skip;

if (!url) {
  process.stdout.write(
    '\n[seed-callejero-idempotencia] Se saltea: falta DATABASE_URL_DESCARTABLE.\n' +
      '  Este archivo ESCRIBE filas y por eso no corre contra DATABASE_URL. Poné el DSN de\n' +
      '  una rama efímera de Neon (con las migraciones aplicadas) para que hable.\n\n',
  );
}

/**
 * Los georef_id de prueba viven arriba del espacio del Estado (empiezan en 9) y
 * con 13 dígitos, para pasar el CHECK `^[0-9]{13}$`. Así el `afterAll` puede
 * borrar exactamente lo suyo y nada más, aunque la rama tenga el país entero.
 */
const PREFIJO = '9999999';
const CALLE = (sufijo: string): string => `${PREFIJO}${sufijo.padStart(6, '0')}`;

dsuite('el seed del callejero es idempotente', () => {
  let db: Db;
  let repo: GeoCallesRepository;
  let provinciaId = 0;
  let departamentoId = 0;
  let localidadId = 0;
  let otraLocalidadId = 0;

  const calle = (sufijo: string, sobre: Partial<CalleParaSembrar> = {}): CalleParaSembrar => ({
    georefId: CALLE(sufijo),
    localidadId,
    departamentoId,
    provinciaId,
    nombre: `CALLE DE PRUEBA ${sufijo}`,
    nombreNorm: `DE PRUEBA ${sufijo}`,
    nombreClase: 'nominada',
    categoria: 'CALLE',
    rango: { tipo: 'completo', desde: 100, hasta: 900 },
    ...sobre,
  });

  beforeAll(async () => {
    db = drizzle(neon(url ?? ''), { schema });
    repo = new GeoCallesRepository(db);

    // Una provincia de prueba con la sentencia de `nextval`: `province_id` es
    // NOT NULL sin default y una provincia es su propio padre.
    const { rows } = await db.execute<{ id: number }>(sql`
      WITH nuevo AS (SELECT nextval('geographic_locations_id_seq')::int AS id)
      INSERT INTO geographic_locations (id, province_id, level, name, georef_id, name_norm)
      SELECT nuevo.id, nuevo.id, 'province', 'Provincia de prueba', ${`${PREFIJO}0`}, 'PROVINCIA DE PRUEBA'
        FROM nuevo
      ON CONFLICT (georef_id) DO UPDATE SET name_norm = EXCLUDED.name_norm
      RETURNING id`);
    provinciaId = rows[0]?.id ?? 0;
    expect(provinciaId).toBeGreaterThan(0);

    const crear = async (nivel: string, nombre: string, georefId: string): Promise<number> => {
      const [fila] = await db
        .insert(geographicLocations)
        .values({
          level: nivel,
          name: nombre,
          nameNorm: nombre.toUpperCase(),
          provinceId: provinciaId,
          parentId: provinciaId,
          georefId,
        })
        .onConflictDoUpdate({
          target: geographicLocations.georefId,
          set: { name: sql`excluded.name` },
        })
        .returning({ id: geographicLocations.id });
      return fila?.id ?? 0;
    };

    departamentoId = await crear('department', 'Departamento de prueba', `${PREFIJO}1`);
    localidadId = await crear('locality', 'Localidad de prueba', `${PREFIJO}2`);
    otraLocalidadId = await crear('locality', 'Otra localidad', `${PREFIJO}3`);
  });

  afterAll(async () => {
    if (provinciaId === 0) return;
    await db.delete(geoCalles).where(like(geoCalles.georefId, `${PREFIJO}%`));
    await db.delete(geographicLocations).where(like(geographicLocations.georefId, `${PREFIJO}%`));
  });

  it('la primera corrida escribe, la segunda escribe CERO filas', async () => {
    const lote = [calle('1'), calle('2'), calle('3')];

    const primera = await repo.upsertLote(lote);
    expect(primera.escritas).toBe(3);

    // ESTA es la afirmación. Sin el `WHERE` del `DO UPDATE`, acá dice 3.
    const segunda = await repo.upsertLote(lote);
    expect(segunda.escritas).toBe(0);
    expect(segunda.sinCambios).toBe(3);
  });

  it('un solo campo distinto sí se escribe, y sólo esa fila', async () => {
    const lote = [calle('1'), calle('2'), calle('3')];
    await repo.upsertLote(lote);

    const cambiado = [calle('1'), { ...calle('2'), categoria: 'AV' }, calle('3')];
    const resultado = await repo.upsertLote(cambiado);
    expect(resultado.escritas).toBe(1);
    expect(resultado.sinCambios).toBe(2);
  });

  it('una recodificación no muta la calle en su lugar: se detecta y se reporta', async () => {
    // La identidad de una calle es su `georef_id` MÁS su localidad. Si un id que
    // existía pasa a nombrar una calle de OTRA localidad, `calle_id` de N
    // señales apuntaría a otra calle en silencio, y eso no se reconstruye dos
    // años después.
    await repo.upsertLote([calle('4')]);
    const [antes] = await db
      .select({ id: geoCalles.id, localidadId: geoCalles.localidadId })
      .from(geoCalles)
      .where(eq(geoCalles.georefId, CALLE('4')));

    const resultado = await repo.upsertLote([calle('4', { localidadId: otraLocalidadId })]);
    expect(resultado.recodificaciones).toContain(CALLE('4'));
    expect(resultado.escritas).toBe(0);

    const [despues] = await db
      .select({ id: geoCalles.id, localidadId: geoCalles.localidadId })
      .from(geoCalles)
      .where(eq(geoCalles.georefId, CALLE('4')));
    expect(despues?.id).toBe(antes?.id);
    expect(despues?.localidadId).toBe(antes?.localidadId);
  });

  it('el cero de georef no puede entrar como altura, ni por este camino', async () => {
    await expect(
      db.insert(geoCalles).values({
        georefId: CALLE('9'),
        localidadId,
        departamentoId,
        provinciaId,
        nombre: 'X',
        nombreNorm: 'X',
        nombreClase: 'nominada',
        categoria: 'CALLE',
        alturaDesde: 0,
      }),
    ).rejects.toThrow();
  });

  it('una calle retirada sigue existiendo, con su id', async () => {
    await repo.upsertLote([calle('5')]);
    const [original] = await db
      .select({ id: geoCalles.id })
      .from(geoCalles)
      .where(eq(geoCalles.georefId, CALLE('5')));

    await db
      .update(geoCalles)
      .set({ vigenteHasta: new Date() })
      .where(eq(geoCalles.georefId, CALLE('5')));

    // Y volver a verla en la fuente la revive sin crear una calle nueva: que el
    // Estado la haya dejado de listar un mes no la borró.
    const revivida = await repo.upsertLote([calle('5')]);
    expect(revivida.escritas).toBe(1);
    const [ahora] = await db
      .select({ id: geoCalles.id, vigenteHasta: geoCalles.vigenteHasta })
      .from(geoCalles)
      .where(and(eq(geoCalles.georefId, CALLE('5'))));
    expect(ahora?.id).toBe(original?.id);
    expect(ahora?.vigenteHasta).toBe(null);
  });
});
