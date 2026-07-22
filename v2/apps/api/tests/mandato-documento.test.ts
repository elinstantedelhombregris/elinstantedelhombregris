/**
 * Integration test for GET /api/mandato/documento — the aggregate feed
 * behind the El mandato document page (spec 2.3).
 *
 * FK-safe cleanup: dreams/pulse_signals userId are onDelete:'set null',
 * so deleting users does NOT delete rows — every inserted id is collected
 * and deleted explicitly in afterAll (gamification-hooks pattern).
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { dreams, eq, getDb, proposals, proposalVotes, pulseSignals, PulsoRepository } from '@v2/db';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

interface DocumentoBody {
  data: {
    generadoEl: string;
    voces: { total: number; porTipo: { tipo: string | null; total: number }[] };
    recursos: { total: number; porProvincia: { provincia: string | null; total: number }[] };
    brechas: { provincia: string; piden: number; ofrecen: number }[];
    senales: {
      total: number;
      clasificadas: number;
      temas: {
        tema: string;
        total: number;
        ultima: { id: number; texto: string; provincia: string | null; fecha: string } | null;
      }[];
    };
    propuestas: { id: number; titulo: string; resumen: string; estado: string; votos: number; apoyo: number }[];
  };
}

dsuite('GET /api/mandato/documento', () => {
  const app = createApp();
  const request = supertest(app);
  const db = getDb();
  const marca = `mandato-doc-test-${String(Date.now())}`;
  const insertedDreamIds: number[] = [];
  const insertedSignalIds: number[] = [];
  const insertedProposalIds: number[] = [];
  let provinceId: number;

  beforeAll(async () => {
    // Provincia real del seed para el join de nombres.
    const provRes = await request.get('/api/open-data/provinces');
    const cordoba = (provRes.body.data.provinces as { id: number; name: string }[]).find(
      (p) => p.name === 'Córdoba',
    );
    if (!cordoba) throw new Error('Seed de provincias ausente en el branch de test');
    provinceId = cordoba.id;

    // Voces del mapa: 2 necesidades + 1 recurso en Córdoba → brecha 'alta'.
    const seedDreams = [
      { body: `Falta pediatra de guardia (${marca})`, category: 'necesidad', provinceId, status: 'approved' },
      { body: `Falta transporte nocturno (${marca})`, category: 'necesidad', provinceId, status: 'approved' },
      { body: `Ofrezco taller de oficios (${marca})`, category: 'recurso', provinceId, status: 'approved' },
    ];
    for (const d of seedDreams) {
      const [row] = await db.insert(dreams).values(d).returning();
      if (row) insertedDreamIds.push(row.id);
    }

    // Señal clasificada → tema del diagnóstico con cita.
    const [signal] = await db
      .insert(pulseSignals)
      .values({ body: `Seis meses para un turno (${marca})`, theme: 'salud_publica', sentiment: -0.6, provinceId, source: 'mandato_form' })
      .returning();
    if (signal) insertedSignalIds.push(signal.id);

    // Propuesta en votación → acciones.
    const repo = new PulsoRepository(db);
    const proposal = await repo.createProposal({
      title: `Red de turnos comunitarios (${marca})`,
      summary: 'Lista de espera paralela y auditable.',
      status: 'voting',
    });
    insertedProposalIds.push(proposal.id);
  });

  afterAll(async () => {
    // FK-safe, hijo → padre, ids explícitos (nunca deletes por rango).
    for (const id of insertedProposalIds) {
      await db.delete(proposalVotes).where(eq(proposalVotes.proposalId, id));
      await db.delete(proposals).where(eq(proposals.id, id));
    }
    for (const id of insertedSignalIds) {
      await db.delete(pulseSignals).where(eq(pulseSignals.id, id));
    }
    for (const id of insertedDreamIds) {
      await db.delete(dreams).where(eq(dreams.id, id));
    }
  });

  it('devuelve el agregado completo con los datos sembrados visibles', async () => {
    const res = await request.get('/api/mandato/documento');
    expect(res.status).toBe(200);
    const { data } = res.body as DocumentoBody;

    expect(new Date(data.generadoEl).getTime()).not.toBeNaN();

    // Registro por tipo (≥, hay datos de otras suites en el branch).
    expect(data.voces.total).toBeGreaterThanOrEqual(3);
    const necesidad = data.voces.porTipo.find((t) => t.tipo === 'necesidad');
    expect(necesidad?.total).toBeGreaterThanOrEqual(2);

    // Recursos con nombre de provincia resuelto.
    expect(data.recursos.total).toBeGreaterThanOrEqual(1);
    expect(data.recursos.porProvincia.some((r) => r.provincia === 'Córdoba')).toBe(true);

    // Brecha de Córdoba: piden ≥ 2, ofrecen ≥ 1.
    const brecha = data.brechas.find((b) => b.provincia === 'Córdoba');
    expect(brecha).toBeDefined();
    expect(brecha?.piden).toBeGreaterThanOrEqual(2);
    expect(brecha?.ofrecen).toBeGreaterThanOrEqual(1);

    // Diagnóstico: el tema sembrado aparece con su última señal citable.
    const tema = data.senales.temas.find((t) => t.tema === 'salud_publica');
    expect(tema).toBeDefined();
    expect(tema?.total).toBeGreaterThanOrEqual(1);
    expect(tema?.ultima).not.toBeNull();
    expect(data.senales.clasificadas).toBeGreaterThanOrEqual(1);

    // Acciones: la propuesta sembrada, con votos/apoyo numéricos.
    const accion = data.propuestas.find((p) => p.id === insertedProposalIds[0]);
    expect(accion).toMatchObject({ estado: 'voting', votos: 0, apoyo: 0 });
  });

  it('excluye sin_clasificar del diagnóstico y respeta los topes (temas ≤ 8, propuestas ≤ 5)', async () => {
    const res = await request.get('/api/mandato/documento');
    const { data } = res.body as DocumentoBody;
    expect(data.senales.temas.some((t) => t.tema === 'sin_clasificar')).toBe(false);
    expect(data.senales.temas.length).toBeLessThanOrEqual(8);
    expect(data.propuestas.length).toBeLessThanOrEqual(5);
    expect(data.propuestas.every((p) => p.estado === 'voting')).toBe(true);
  });
});
