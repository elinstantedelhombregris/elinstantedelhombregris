/**
 * Tests de integración de `GET /api/v1/civic/radiografia`.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §3.2, §4.5, §11.
 *
 * Lo que cuidan, más allá de que el endpoint conteste:
 * - que el **invariante del conteo** se sostenga contra la base real y no sólo
 *   contra una fuente de mentira: `analizadas + sinVector === total`;
 * - que la respuesta se sirva entera **aunque la migración `0020` todavía no
 *   haya aterrizado** — sin `analisis_vectores` la página no se cae, declara
 *   todo el corpus como esperando análisis (§6);
 * - que **ningún núcleo traiga frase** mientras no exista la columna de cesión
 *   de licencia, y que diga por qué (§4.5.4);
 * - que el borde rechace un umbral fuera de [0,1] en castellano.
 */
import '../src/load-env.js';

import { dreams, eq, getDb } from '@v2/db';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

interface Miembro {
  id: string;
  clase: string;
  x: number;
  y: number;
  z: number;
}

interface Nucleo {
  id: string;
  frase: { id: string; texto: string } | null;
  textoOmitido: string | null;
  senales: number;
  clases: Record<string, number>;
  provincias: number;
  distancia: { a: string; b: string; km: number } | null;
  miembros: Miembro[];
}

interface Radiografia {
  corte: string | null;
  modelo: string | null;
  analizadas: number;
  sinVector: number;
  total: number;
  provinciasSinSenal: number;
  umbral: number;
  nucleos: Nucleo[];
  solas: Miembro[];
  aristas: { a: string; b: string; similitud: number; tipo: string }[];
}

dsuite('Radiografía flows', () => {
  const app = createApp();
  const request = supertest(app);
  const creados: number[] = [];

  beforeAll(async () => {
    const db = getDb();
    const filas = await db
      .insert(dreams)
      .values([
        {
          body: 'TEST radiografia: no llega el agua al barrio',
          category: 'basta',
          status: 'approved',
          lat: '-34.603722',
          lng: '-58.381592',
          precision: 'exact',
          locationRole: 'subject',
          sensitivity: 'low',
        },
        {
          body: 'TEST radiografia: no llega el agua a la casa',
          category: 'necesidad',
          status: 'approved',
          lat: '-34.605000',
          lng: '-58.382900',
          precision: 'exact',
          locationRole: 'subject',
          sensitivity: 'low',
        },
        {
          body: 'TEST radiografia: ojalá vuelva el tren de pasajeros',
          category: 'sueño',
          status: 'approved',
        },
      ])
      .returning({ id: dreams.id });
    creados.push(...filas.map((f) => f.id));
  });

  afterAll(async () => {
    const db = getDb();
    for (const id of creados) await db.delete(dreams).where(eq(dreams.id, id));
  });

  const traer = async (query = ''): Promise<Radiografia> => {
    const res = await request.get(`/api/v1/civic/radiografia${query}`);
    expect(res.status).toBe(200);
    return (res.body as { data: Radiografia }).data;
  };

  it('contesta la forma entera del contrato', async () => {
    const data = await traer();

    expect(data).toMatchObject({
      analizadas: expect.any(Number) as number,
      sinVector: expect.any(Number) as number,
      total: expect.any(Number) as number,
      provinciasSinSenal: expect.any(Number) as number,
      umbral: 0.72,
    });
    expect(Array.isArray(data.nucleos)).toBe(true);
    expect(Array.isArray(data.solas)).toBe(true);
    expect(Array.isArray(data.aristas)).toBe(true);
    // `corte` y `modelo` son la procedencia del análisis: o hay corrida y
    // salen los dos, o no hay y salen los dos en null. Nunca uno solo.
    expect(data.corte === null).toBe(data.modelo === null);
  });

  it('sostiene el invariante del conteo contra la base real', async () => {
    const data = await traer();
    expect(data.analizadas + data.sinVector).toBe(data.total);
    expect(data.total).toBeGreaterThanOrEqual(creados.length);
  });

  it('cuenta las tres voces cargadas aunque no tengan vector todavía', async () => {
    const data = await traer();
    // Sin corrida de análisis, las tres entran por `sinVector` y ninguna se
    // dibuja. Eso no es un error: es el estado que la spec §6 pide declarar.
    const dibujadas =
      data.nucleos.reduce((n, nucleo) => n + nucleo.senales, 0) + data.solas.length;
    expect(dibujadas).toBe(data.analizadas);
  });

  it('ningún núcleo trae frase mientras no exista la cesión de licencia', async () => {
    const data = await traer();
    for (const nucleo of data.nucleos) {
      expect(nucleo.frase).toBeNull();
      expect(nucleo.textoOmitido).toBe('sin cesión de licencia');
    }
  });

  it('el umbral que llega en la query es el que devuelve', async () => {
    const data = await traer('?umbral=0.9&k=5');
    expect(data.umbral).toBe(0.9);
  });

  it('rechaza un umbral fuera de rango, en castellano', async () => {
    const res = await request.get('/api/v1/civic/radiografia?umbral=1.4');
    expect(res.status).toBe(400);
    const cuerpo = res.body as { error: { code: string; issues?: { message: string }[] } };
    expect(cuerpo.error.code).toBe('VALIDATION_ERROR');
    expect(cuerpo.error.issues?.[0]?.message).toContain('umbral');
  });

  it('rechaza una k fuera de rango', async () => {
    await request.get('/api/v1/civic/radiografia?k=99').expect(400);
    await request.get('/api/v1/civic/radiografia?k=0').expect(400);
  });

  it('es cacheable y no pide CSRF: es lectura pública', async () => {
    const res = await request.get('/api/v1/civic/radiografia');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toContain('max-age');
  });
});
