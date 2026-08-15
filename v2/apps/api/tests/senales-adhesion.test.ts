/**
 * La adhesión y las respuestas — las dos tablas que existían con cero código.
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

dsuite('Adhesión y respuestas', () => {
  const request = supertest(createApp());
  const creadas: string[] = [];

  const soltar = async (body: Record<string, unknown>, cookie?: string) => {
    const r = request.post(RUTA).send(body);
    if (cookie !== undefined) void r.set('Cookie', cookie);
    const res = await r;
    if (res.status !== 201) {
      throw new Error(`Esperaba 201 y vino ${String(res.status)}: ${JSON.stringify(res.body)}`);
    }
    creadas.push(res.body.data.idPublico);
    return res;
  };

  /** La cookie de actor que devolvió una respuesta, lista para reenviar. */
  const galletaDe = (res: { headers: Record<string, unknown> }): string => {
    const set = (res.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
    return (set.find((c) => c.startsWith('basta_actor=')) ?? '').split(';')[0] ?? '';
  };

  afterAll(async () => {
    if (creadas.length === 0) return;
    const { getDb, inArray, senales } = await import('@v2/db');
    await getDb().delete(senales).where(inArray(senales.idPublico, creadas));
  });

  describe('yo también', () => {
    it('adherir suma, y adherir de nuevo no suma dos veces', async () => {
      const senal = await soltar(cuerpo());
      const id = senal.body.data.idPublico as string;

      const primera = await request.post(`${RUTA}/${id}/adhesion`);
      expect(primera.status).toBe(201);
      expect(primera.body.data.total).toBe(1);
      expect(primera.body.data.esNueva).toBe(true);

      // La MISMA persona apretando dos veces es una sola adhesión. No es un
      // error: es lo que hace un doble tap en un teléfono.
      const otra = await request.post(`${RUTA}/${id}/adhesion`).set('Cookie', galletaDe(primera));
      expect(otra.status).toBe(201);
      expect(otra.body.data.total).toBe(1);
      expect(otra.body.data.esNueva).toBe(false);
    });

    it('dos personas distintas suman dos', async () => {
      const senal = await soltar(cuerpo());
      const id = senal.body.data.idPublico as string;

      // Sin cookie previa cada request estrena actor.
      const a = await request.post(`${RUTA}/${id}/adhesion`);
      const b = await request.post(`${RUTA}/${id}/adhesion`);
      expect(a.body.data.total).toBe(1);
      expect(b.body.data.total).toBe(2);
    });

    it('se puede retirar', async () => {
      const senal = await soltar(cuerpo());
      const id = senal.body.data.idPublico as string;

      const puesta = await request.post(`${RUTA}/${id}/adhesion`);
      const galleta = galletaDe(puesta);
      const sacada = await request.delete(`${RUTA}/${id}/adhesion`).set('Cookie', galleta);
      expect(sacada.status).toBe(200);
      expect(sacada.body.data.total).toBe(0);
    });

    it('adherir a algo que no existe es 404 y no un 500', async () => {
      const res = await request.post(`${RUTA}/${randomUUID()}/adhesion`);
      expect(res.status).toBe(404);
    });
  });

  describe('responder una pregunta', () => {
    it('una pregunta se responde con un hecho', async () => {
      const pregunta = await soltar(cuerpo({ tipo: 'pregunta', texto: '¿Cuándo abre el CAPS?' }));
      const hecho = await soltar(cuerpo({ tipo: 'saber', fuente: 'Lo vi en la puerta.', texto: 'Abre 8 a 14.' }));

      const res = await request
        .post(`${RUTA}/${pregunta.body.data.idPublico as string}/respuesta`)
        .send({ senalId: hecho.body.data.idPublico });

      expect(res.status).toBe(201);
      expect(res.body.data.yaEstaba).toBe(false);
    });

    it('NO se responde con un deseo, y el mensaje lo explica', async () => {
      const pregunta = await soltar(cuerpo({ tipo: 'pregunta', texto: '¿Cuándo abre el CAPS?' }));
      const sueno = await soltar(cuerpo({ tipo: 'sueño', texto: 'Que abra siempre.' }));

      // Un deseo no afirma nada del mundo, así que no contesta nada. Los dos
      // CHECK de la tabla lo amarran; el borde lo dice en castellano.
      const res = await request
        .post(`${RUTA}/${pregunta.body.data.idPublico as string}/respuesta`)
        .send({ senalId: sueno.body.data.idPublico });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('CLASE_INCORRECTA');
    });

    it('responder dos veces lo mismo no duplica', async () => {
      const pregunta = await soltar(cuerpo({ tipo: 'pregunta', texto: '¿Hay agua?' }));
      const hecho = await soltar(cuerpo({ tipo: 'saber', fuente: 'Fui.', texto: 'Sí, hay.' }));
      const url = `${RUTA}/${pregunta.body.data.idPublico as string}/respuesta`;
      const payload = { senalId: hecho.body.data.idPublico };

      await request.post(url).send(payload);
      const otra = await request.post(url).send(payload);
      expect(otra.body.data.yaEstaba).toBe(true);
    });
  });
});

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
    expect(t?.nitidez.fraccion).toBe(0);
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
