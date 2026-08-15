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

import { randomUUID } from 'node:crypto';

// Antes de que `@v2/db` cachee el pool con lo que encuentre.
const DESCARTABLE = process.env['DATABASE_URL_DESCARTABLE'];
if (DESCARTABLE !== undefined && DESCARTABLE !== '') {
  process.env['DATABASE_URL'] = DESCARTABLE;
}

import { eq, getDb, senales } from '@v2/db';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

/**
 * **Escribe filas en `senales`**, así que exige la rama descartable — el mismo
 * patrón de D-065: un archivo que escribe no puede decidir su destino por «hay
 * una URL», tiene que pedir la base descartable por nombre.
 */
const dsuite =
  DESCARTABLE !== undefined && DESCARTABLE !== '' && hasDatabaseUrl ? describe : describe.skip;

interface DocumentoBody {
  data: {
    generadoEl: string;
    voces: {
      total: number;
      porTipo: { tipo: string | null; total: number }[];
      porClase: { clase: string; total: number }[];
    };
    recursos: { total: number; porProvincia: { provincia: string | null; total: number }[] };
    brechas: { provincia: string; piden: number; ofrecen: number }[];
    senales: {
      total: number;
      clasificadas: number;
      temas: {
        tema: string;
        total: number;
        ultima: { id: string; texto: string; provincia: string | null; fecha: string } | null;
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
  let provinceId: number;
  const insertadas: number[] = [];

  beforeAll(async () => {
    // Provincia real del seed para el join de nombres.
    const provRes = await request.get('/api/open-data/provinces');
    const cordoba = (provRes.body.data.provinces as { id: number; name: string }[]).find(
      (p) => p.name === 'Córdoba',
    );
    if (!cordoba) throw new Error('Seed de provincias ausente en el branch de test');
    provinceId = cordoba.id;

    /**
     * Todo se siembra en `senales`, que es de donde el documento lee desde que
     * se tendió el puente. Antes esto sembraba `dreams`, `pulse_signals` y
     * `proposals` — las tres tablas retiradas — y el test pasaba mientras el
     * documento devolvía ceros para lo que la gente cargaba de verdad.
     */
    // `ubicacion_origen` NO puede quedarse en `'ninguna'` con provincia: el CHECK
    // `senales_origen_provincia_chk` exige declarar de dónde salió la jerarquía.
    // El default de la columna no sirve como valor — es el mismo principio que
    // `procedencia` en la Simulación: un dato sin origen no se puede auditar.
    const base = { origen: 'web' as const, provinceId, ubicacionOrigen: 'declarada' };
    const aSembrar = [
      { ...base, tipo: 'necesidad', clase: 'hecho', texto: `Falta pediatra de guardia (${marca})`, tema: 'salud', temaOrigen: 'declarado' },
      { ...base, tipo: 'necesidad', clase: 'hecho', texto: `Falta transporte nocturno (${marca})` },
      { ...base, tipo: 'recurso', clase: 'hecho', texto: `Ofrezco taller de oficios (${marca})` },
      { ...base, tipo: 'sueño', clase: 'deseo', texto: `Que haya turnos en el día (${marca})` },
      { ...base, tipo: 'propuesta', clase: 'deseo', titulo: `Red de turnos comunitarios (${marca})`, texto: 'Lista de espera paralela y auditable.' },
    ];

    for (const fila of aSembrar) {
      const [row] = await db
        .insert(senales)
        .values({ ...fila, idLocal: randomUUID() })
        .returning({ id: senales.id });
      if (row) insertadas.push(row.id);
    }
  });

  afterAll(async () => {
    for (const id of insertadas) {
      await db.delete(senales).where(eq(senales.id, id));
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

    // La composición por clase: lo que se comprueba contra lo que se delibera.
    // Un documento que dice «300 voces» sin esto no distingue 300 hechos de 300
    // sueños, y son dos países distintos.
    const hecho = data.voces.porClase.find((c) => c.clase === 'hecho');
    const deseo = data.voces.porClase.find((c) => c.clase === 'deseo');
    expect(hecho?.total).toBeGreaterThanOrEqual(3);
    expect(deseo?.total).toBeGreaterThanOrEqual(2);
    // Las CUATRO siempre, aunque estén en cero: una clase ausente se lee como
    // «no aplica» y una en cero como «nadie dijo nada de eso».
    expect(data.voces.porClase).toHaveLength(4);

    // Diagnóstico: el tema sembrado aparece con su última señal citable.
    const tema = data.senales.temas.find((t) => t.tema === 'salud');
    expect(tema).toBeDefined();
    expect(tema?.total).toBeGreaterThanOrEqual(1);
    expect(tema?.ultima).not.toBeNull();
    expect(data.senales.clasificadas).toBeGreaterThanOrEqual(1);

    // La propuesta sembrada. SIN votos ni apoyo: no hay votación, y un
    // contador que se lea como resultado es lo que la regla 11 prohíbe.
    const accion = data.propuestas.find((p) => p.titulo.includes(marca));
    expect(accion).toBeDefined();
    expect(accion).not.toHaveProperty('votos');
    expect(accion).not.toHaveProperty('apoyo');
  });

  it('respeta los topes: temas ≤ 8, propuestas ≤ 5', async () => {
    /**
     * `sin_clasificar` ya no existe como valor: era el sumidero de la tabla
     * vieja. En `senales` el tema sale del catálogo cerrado de once o es NULL,
     * y NULL se cuenta aparte en vez de plegarse a «otros» — por eso este test
     * dejó de necesitar sembrar una señal con ese tema para probar que se
     * excluye. No hay nada que excluir.
     */
    const res = await request.get('/api/mandato/documento');
    const { data } = res.body as DocumentoBody;
    expect(data.senales.temas.every((t) => t.tema !== null)).toBe(true);
    expect(data.senales.temas.length).toBeLessThanOrEqual(8);
    expect(data.propuestas.length).toBeLessThanOrEqual(5);
  });
});
