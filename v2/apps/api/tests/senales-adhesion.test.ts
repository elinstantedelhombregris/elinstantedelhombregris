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
    /**
     * En ORDEN, y el orden es la lección: `respuestas` y `adhesiones` tienen FK
     * a `senales` **sin cascade**, así que borrar una señal respondida devuelve
     * `violates foreign key constraint`. No es un defecto del esquema — un
     * archivo público no borra en cascada lo que otro escribió — pero sí
     * significa que la limpieza de un test tiene que ir de las hojas a la raíz.
     */
    const { getDb, inArray, senales, adhesiones, respuestas, sql } = await import('@v2/db');
    const db = getDb();
    const ids = sql.raw(`'{${creadas.join(',')}}'::uuid[]`);
    await db.execute(
      sql`delete from respuestas where senal_id in (select id from senales where id_publico = any(${ids}))
          or pregunta_id in (select id from senales where id_publico = any(${ids}))`,
    );
    await db.execute(
      sql`delete from adhesiones where senal_id in (select id from senales where id_publico = any(${ids}))`,
    );
    void adhesiones;
    void respuestas;
    await db.delete(senales).where(inArray(senales.idPublico, creadas));
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
