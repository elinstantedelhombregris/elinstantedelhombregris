/**
 * Integration tests for /api/semillas — el compromiso de tres frases (spec 2.5).
 *
 * FK-safe cleanup: semillas.userId es onDelete:'set null' — cada id insertado
 * se junta y se borra explícito en afterAll (patrón gamification-hooks).
 * Aserciones relativas: otras suites escriben en paralelo en el mismo branch.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { eq, getDb, semillas, SemillasRepository, sql } from '@v2/db';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Semillas flows', () => {
  const app = createApp();
  const request = supertest(app);
  const insertedIds: number[] = [];

  afterAll(async () => {
    const db = getDb();
    for (const id of insertedIds) {
      await db.delete(semillas).where(eq(semillas.id, id));
    }
  });

  describe('POST /api/semillas', () => {
    it('planta una semilla anónima — 201 con id y createdAt reales, nace aprobada', async () => {
      const stamp = String(Date.now());
      const res = await request.post('/api/semillas').send({
        basta: `Basta de prueba ${stamp}`,
        sueno: `Sueño de prueba ${stamp}`,
        compromiso: `Compromiso de prueba ${stamp}`,
      });
      expect(res.status).toBe(201);
      const { id, createdAt } = res.body.data as { id: number; createdAt: string };
      expect(Number.isInteger(id)).toBe(true);
      insertedIds.push(id);
      expect(new Date(createdAt).getTime()).not.toBeNaN();

      const [row] = await getDb().select().from(semillas).where(eq(semillas.id, id));
      expect(row?.status).toBe('approved');
      expect(row?.userId).toBeNull();
      expect(row?.basta).toBe(`Basta de prueba ${stamp}`);
    });

    it('trimmea las frases al guardar', async () => {
      const stamp = String(Date.now());
      const res = await request.post('/api/semillas').send({
        basta: `  con espacios ${stamp}  `,
        sueno: 'sueño',
        compromiso: 'compromiso',
      });
      expect(res.status).toBe(201);
      const id = res.body.data.id as number;
      insertedIds.push(id);
      const [row] = await getDb().select().from(semillas).where(eq(semillas.id, id));
      expect(row?.basta).toBe(`con espacios ${stamp}`);
    });

    it('rechaza frases vacías o pasadas de 280 — 400 VALIDATION_ERROR', async () => {
      const [vacia, larga] = await Promise.all([
        request.post('/api/semillas').send({ basta: '   ', sueno: 'x', compromiso: 'x' }),
        request.post('/api/semillas').send({ basta: 'x', sueno: 'y'.repeat(281), compromiso: 'x' }),
      ]);
      expect(vacia.status).toBe(400);
      expect(vacia.body.error.code).toBe('VALIDATION_ERROR');
      expect(larga.status).toBe(400);
      expect(larga.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/semillas/count', () => {
    it('cuenta solo aprobadas — pending excluida, aserción relativa', async () => {
      const repo = new SemillasRepository(getDb());
      const stamp = String(Date.now());
      const aprobada = await repo.create({
        basta: `b ${stamp}`, sueno: `s ${stamp}`, compromiso: `c ${stamp}`,
      });
      insertedIds.push(aprobada.id);
      const pendiente = await repo.create({
        basta: `b2 ${stamp}`, sueno: `s2 ${stamp}`, compromiso: `c2 ${stamp}`, status: 'pending',
      });
      insertedIds.push(pendiente.id);

      const [res, approvedTotal] = await Promise.all([
        request.get('/api/semillas/count'),
        repo.countApproved(),
      ]);
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(approvedTotal);
      expect(res.body.data.total as number).toBeGreaterThanOrEqual(1);

      // Prueba de exclusión en UN statement (snapshot único, inmune a suites paralelas).
      const [snapshot] = await getDb()
        .select({
          all: sql<number>`count(*)::int`,
          approved: sql<number>`count(*) filter (where ${semillas.status} = 'approved')::int`,
        })
        .from(semillas);
      expect((snapshot?.all ?? 0) - (snapshot?.approved ?? 0)).toBeGreaterThanOrEqual(1);
    });
  });
});
