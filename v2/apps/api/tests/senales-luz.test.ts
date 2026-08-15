/**
 * Brillo y nitidez por provincia — el endpoint que la web no tenía.
 *
 * Archivo aparte del de adhesión por el techo de `anonSubmitRateLimit`: son 30
 * POST por hora por IP y el router es un singleton de módulo, así que dos
 * suites que cargan señales en el mismo archivo se pisan. Vitest aísla por
 * archivo.
 *
 * **Escribe filas.** Exige `DATABASE_URL_DESCARTABLE`, igual que el resto de
 * las suites que escriben, y por la misma razón: sin ella, las filas de prueba
 * quedarían en la base real.
 */
import { randomUUID } from 'node:crypto';

import '../src/load-env.js';

const DESCARTABLE = process.env['DATABASE_URL_DESCARTABLE'];
if (DESCARTABLE !== undefined && DESCARTABLE !== '') {
  process.env['DATABASE_URL'] = DESCARTABLE;
}

import { CONTRATO_SENAL } from '@v2/shared';
import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite =
  DESCARTABLE !== undefined && DESCARTABLE !== '' && hasDatabaseUrl ? describe : describe.skip;

const RUTA = '/api/v1/civic/senales';

function cuerpo(over: Record<string, unknown> = {}) {
  return {
    contrato: CONTRATO_SENAL,
    idLocal: randomUUID(),
    tipo: 'basta',
    texto: 'El semáforo de la esquina no anda hace tres meses.',
    cedeLicencia: true,
    casa: 'no',
    ...over,
  };
}

dsuite('La luz del país', () => {
  const request = supertest(createApp());
  const creadas: string[] = [];

  const soltar = async (body: Record<string, unknown>) => {
    const res = await request.post(RUTA).send(body);
    if (res.status !== 201) {
      throw new Error(`Esperaba 201 y vino ${String(res.status)}: ${JSON.stringify(res.body)}`);
    }
    creadas.push(res.body.data.idPublico);
    return res;
  };

  afterAll(async () => {
    if (creadas.length === 0) return;
    const { getDb, inArray, senales } = await import('@v2/db');
    await getDb().delete(senales).where(inArray(senales.idPublico, creadas));
  });

  interface Territorio {
    provinceId: number;
    provincia: string | null;
    vocesDistintas: number;
    verificables: number;
    confirmaciones: number;
    brillo: { tipo: string; participacion?: number };
    nitidez: { tipo: string; fraccion?: number };
    intensidad: number | null;
    foco: number;
  }

  const luzDe = async (provinceId: number): Promise<Territorio | undefined> => {
    const res = await request.get('/api/v1/civic/map/luz');
    expect(res.status).toBe(200);
    return (res.body.data.territorios as Territorio[]).find((t) => t.provinceId === provinceId);
  };

  it('un hecho enciende su provincia y la deja pendiente de comprobar', async () => {
    await soltar(cuerpo({ tipo: 'basta', provinceId: 6 }));
    const t = await luzDe(6);

    expect(t).toBeDefined();
    expect(t?.vocesDistintas).toBeGreaterThan(0);
    // Está publicada y sin confirmar: entra al denominador y no al numerador.
    expect(t?.verificables).toBeGreaterThan(0);
    expect(t?.nitidez.tipo).toBe('valor');
    /**
     * Una FRACCIÓN entre 0 y 1, no un valor exacto: otras suites corroboran
     * señales de esta misma provincia sobre la misma rama, así que clavar el
     * cero acá hace que el test dependa del orden en que corren los archivos.
     * Lo que este test cuida es que la nitidez sea calculable y esté acotada,
     * no cuánto vale hoy.
     */
    expect(t?.nitidez.fraccion).toBeGreaterThanOrEqual(0);
    expect(t?.nitidez.fraccion).toBeLessThanOrEqual(1);
    expect(t?.confirmaciones).toBeLessThanOrEqual(t?.verificables ?? 0);
  });

  it('el brillo sale de habitantes reales, no de un cero', async () => {
    const t = await luzDe(6);
    expect(t?.brillo.tipo).toBe('valor');
    // Una voz entre millones es un número chiquísimo, y tiene que serlo.
    expect(t?.brillo.participacion).toBeGreaterThan(0);
    expect(t?.brillo.participacion).toBeLessThan(0.001);
    expect(t?.intensidad).not.toBeNull();
  });

  it('una provincia de puros deseos se dibuja encendida y NÍTIDA', async () => {
    await soltar(cuerpo({ tipo: 'sueño', provinceId: 22, texto: 'Que haya tren de nuevo.' }));
    const t = await luzDe(22);

    expect(t).toBeDefined();
    expect(t?.vocesDistintas).toBeGreaterThan(0);
    // Cero verificables no es nitidez cero: cero significa «hay hechos sin
    // comprobar», y acá no hay ningún hecho pendiente. La ausencia de pregunta
    // no se pinta como mala respuesta.
    expect(t?.verificables).toBe(0);
    expect(t?.nitidez.tipo).toBe('inaplicable');
    expect(t?.foco).toBe(1);
  });
});
