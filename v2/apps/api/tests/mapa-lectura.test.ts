import { randomUUID } from 'node:crypto';

import { getDb } from '@v2/db';
import { postgresLocalDePrueba } from '@v2/db/testing';
import express from 'express';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { civicRouter } from '../src/features/civic-map/routes.js';
import { errorHandler } from '../src/middleware/error-handler.js';

vi.hoisted(() => {
  process.env.DATABASE_URL = 'postgresql://test@127.0.0.1:55439/basta_mapa_test';
  process.env.JWT_SECRET = 'mapa-test-secret-with-at-least-32-characters';
  process.env.SESSION_SECRET = 'mapa-session-test-with-at-least-32-characters';
});

vi.mock('@v2/db', async (original) => ({
  ...(await original<typeof import('@v2/db')>()),
  getDb: vi.fn(),
}));

interface Pagina {
  signals: { id: string; texto: string; lat: number | null; precision: string }[];
  metadata: {
    total: number;
    entregados: number;
    completa: boolean;
    siguiente: string | null;
    sinPunto: number;
    porProvincia: { provinceId: number | null; total: number }[];
  };
}

// No usa el DSN de la aplicación: los datos sintéticos viven solo en Postgres local.
describe.skipIf(!process.env.MAPA_TEST_DATABASE_URL)('Lectura HTTP del mapa sobre Postgres', () => {
  if (!process.env.MAPA_TEST_DATABASE_URL) return;
  const local = postgresLocalDePrueba();
  const origen = `test-${randomUUID()}`;
  const retirada = randomUUID();
  const provincia = 990001;
  const app = express();
  app.use('/api/v1/civic', civicRouter);
  app.use(errorHandler());
  const request = supertest(app);
  const query = { desde: '2039-01-01', hasta: '2039-02-01', capas: 'voz', limite: '500' };

  beforeAll(async () => {
    vi.mocked(getDb).mockReturnValue(local.db);
    await local.pool.query(
      `insert into geographic_locations(id, level, name, province_id, georef_id)
      values ($1, 'province', 'Provincia de prueba', $1, $2)`,
      [provincia, origen],
    );
    await local.pool.query(
      `insert into senales(tipo, clase, origen, id_local, texto, cesion_licencia, cesion_en, cesion_version, province_id, ubicacion_origen, creada_en)
      select 'basta', 'hecho', 'web', gen_random_uuid(), $1 || i, i <> 1, case when i <> 1 then now() else null end, case when i <> 1 then 1 else null end, case when i <= 1200 then $2::integer else null end, 'declarada',
        '2039-01-15T00:00:00.123456Z'::timestamptz from generate_series(1,1201) as i`,
      [origen, provincia],
    );
    await local.pool.query(
      `insert into senales(tipo, clase, origen, id_local, texto, estado, creada_en, id_publico)
      values ('basta', 'hecho', 'web', gen_random_uuid(), '', 'retirada', '2039-01-15', $1)`,
      [retirada],
    );
  });
  afterAll(async () => {
    await local.pool.query('delete from senales where id_publico = $1', [retirada]);
    await local.pool.query('delete from senales where texto like $1', [origen + '%']);
    await local.pool.query('delete from dreams where body like $1', [origen + '%']);
    await local.pool.query('delete from geographic_locations where id = $1', [provincia]);
    await local.pool.end();
  });
  async function leer(extra: Record<string, string> = {}): Promise<Pagina> {
    const res = await request.get('/api/v1/civic/map/lectura').query({ ...query, ...extra });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    return res.body.data as Pagina;
  }
  it('cuenta 1.201; pagina 500/500/201 sin repetir ni perder fechas iguales; excluye retiradas', async () => {
    const uno = await leer();
    expect(uno.metadata).toMatchObject({
      total: 1201,
      entregados: 500,
      completa: false,
      sinPunto: 1201,
    });
    expect(uno.metadata.porProvincia).toEqual(
      expect.arrayContaining([
        { provinceId: provincia, total: 1200, tipos: [{ tipo: 'basta', total: 1200 }] },
        { provinceId: null, total: 1, tipos: [{ tipo: 'basta', total: 1 }] },
      ]),
    );
    const dos = await leer({ cursor: uno.metadata.siguiente ?? '' });
    const tres = await leer({ cursor: dos.metadata.siguiente ?? '' });
    expect(dos.signals).toHaveLength(500);
    expect(tres.signals).toHaveLength(201);
    expect(tres.metadata.siguiente).toBeNull();
    const conjunto = [...uno.signals, ...dos.signals, ...tres.signals];
    expect(new Set(conjunto.map((s) => s.id)).size).toBe(1201);
    expect(conjunto.filter((s) => s.texto === 'Texto reservado por su autoría.')).toHaveLength(1);
  });
  it('aplica el mismo ámbito a agregados y registros; un bbox no inventa puntos', async () => {
    const provinciaLectura = await leer({ lugarId: String(provincia), tipo: 'basta' });
    expect(provinciaLectura.metadata.total).toBe(1200);
    const bbox = await leer({ bbox: '-59,-35,-58,-34' });
    expect(bbox.metadata).toMatchObject({ total: 0, entregados: 0, completa: true });
    expect(bbox.signals).toEqual([]);
  });
  it('rechaza fechas invertidas, cursor roto y reutilizar continuación con otros filtros', async () => {
    await request
      .get('/api/v1/civic/map/lectura')
      .query({ desde: '2040-01-01', hasta: '2039-01-01' })
      .expect(400);
    await request.get('/api/v1/civic/map/lectura').query({ cursor: 'no-es-un-cursor' }).expect(400);
    const uno = await leer();
    await request
      .get('/api/v1/civic/map/lectura')
      .query({ ...query, tipo: 'sueño', cursor: uno.metadata.siguiente })
      .expect(400);
  });
  it('mantiene identificables orígenes anteriores sin deduplicar por semejanza textual', async () => {
    await local.pool.query(
      `insert into dreams(body, category, created_at)
      select $1 || i, 'basta', '2039-01-15'::timestamptz from generate_series(1,502) as i`,
      [origen],
    );
    const lectura = await leer({ limite: '2000' });
    expect(lectura.metadata).toMatchObject({ total: 1703, entregados: 1703, completa: true });
    expect(lectura.signals.filter((s) => s.id.startsWith('voz-v1:'))).toHaveLength(502);
  });
});
