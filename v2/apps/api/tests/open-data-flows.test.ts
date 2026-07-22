/**
 * Integration tests for /api/open-data/* — provinces, dreams, aggregates.
 *
 * Public endpoints; anonymous dream submission is allowed.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { dreams, eq, getDb } from '@v2/db';

import { createApp } from '../src/app.js';

import { createTestUser, hasDatabaseUrl, deleteTestUsers } from './helpers/index.js';

import type { TestUser } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Open data flows', () => {
  const app = createApp();
  const request = supertest(app);
  const insertedDreamIds: number[] = [];
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser('opendata');
  });

  afterAll(async () => {
    if (insertedDreamIds.length > 0) {
      const db = getDb();
      for (const id of insertedDreamIds) {
        await db.delete(dreams).where(eq(dreams.id, id));
      }
    }
    await deleteTestUsers([user.email]);
  });

  describe('GET /api/open-data/provinces', () => {
    it('returns the seeded list of Argentine provinces', async () => {
      const res = await request.get('/api/open-data/provinces');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.provinces)).toBe(true);
      expect(res.body.data.provinces.length).toBeGreaterThanOrEqual(20);
      const names = res.body.data.provinces.map((p: { name: string }) => p.name);
      expect(names).toContain('Buenos Aires');
    });
  });

  describe('POST /api/open-data/dreams', () => {
    it('accepts an anonymous dream submission', async () => {
      const res = await request
        .post('/api/open-data/dreams')
        .send({ body: 'Quiero un país justo y sereno.', submittedAs: 'Anónimo' });
      expect(res.status).toBe(201);
      expect(typeof res.body.data.id).toBe('number');
      insertedDreamIds.push(res.body.data.id as number);
    });

    it('rejects an empty body with 400', async () => {
      const res = await request.post('/api/open-data/dreams').send({ body: '' });
      expect(res.status).toBe(400);
    });

    it('normalizes provinceName → provinceId', async () => {
      const res = await request
        .post('/api/open-data/dreams')
        .send({
          body: 'Sueño porteño.',
          provinceName: 'Ciudad de Buenos Aires',
        });
      expect(res.status).toBe(201);
      insertedDreamIds.push(res.body.data.id as number);
    });
  });

  describe('GET /api/open-data/dreams', () => {
    it('returns recently submitted dreams', async () => {
      const res = await request.get('/api/open-data/dreams?limit=10');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/open-data/dreams/by-province', () => {
    it('returns counts grouped by province', async () => {
      const res = await request.get('/api/open-data/dreams/by-province');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.byProvince)).toBe(true);
    });
  });

  describe('Contrato de El mapa (página 2.2) — la voz soltada aparece con tipo y provincia', () => {
    it('POST con category + provinceName llega a la lista con provinceId resuelto y cuenta en los agregados', async () => {
      const provRes = await request.get('/api/open-data/provinces');
      expect(provRes.status).toBe(200);
      const cordoba = (
        provRes.body.data.provinces as { id: number; name: string }[]
      ).find((p) => p.name === 'Córdoba');
      expect(cordoba).toBeDefined();
      if (!cordoba) return;

      const marca = `voz-mapa-test-${String(Date.now())}`;
      const creado = await request
        .post('/api/open-data/dreams')
        .send({ body: `Quiero ver este punto en el mapa (${marca}).`, category: 'sueño', provinceName: 'Córdoba' });
      expect(creado.status).toBe(201);
      const id = creado.body.data.id as number;
      insertedDreamIds.push(id);

      // Round-trip: la lista pública la devuelve con el tipo y la provincia resueltos.
      const lista = await request.get('/api/open-data/dreams?limit=30');
      expect(lista.status).toBe(200);
      const voz = (
        lista.body.data as { id: number; category: string | null; provinceId: number | null }[]
      ).find((d) => d.id === id);
      expect(voz).toMatchObject({ category: 'sueño', provinceId: cordoba.id });

      // Agregado por provincia (los clusters numerados del mapa).
      const porProvincia = await request.get('/api/open-data/dreams/by-province');
      const fila = (
        porProvincia.body.data.byProvince as { provinceId: number | null; count: number }[]
      ).find((r) => r.provinceId === cordoba.id);
      expect(fila).toBeDefined();
      expect(fila?.count).toBeGreaterThanOrEqual(1);

      // La cifra pública la cuenta (aprobada al instante — status 'approved' fijo).
      // Nota: sin asertar delta exacto — otras suites insertan/borran dreams en paralelo
      // contra el mismo branch de test.
      const conteo = await request.get('/api/analytics/voces-count');
      expect(conteo.status).toBe(200);
      expect(conteo.body.data.total).toBeGreaterThanOrEqual(1);
    });
  });
});
