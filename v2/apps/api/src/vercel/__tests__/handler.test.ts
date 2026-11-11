/**
 * La función de Vercel, probada como la llama Vercel.
 *
 * D-156: La Radiografía y otras siete rutas públicas contestaban 400 en
 * producción con «Unrecognized key(s) in object: '__ruta'». El handler ya
 * sacaba `__ruta` de `req.url`, pero el runtime de Vercel deja `req.query`
 * calculada desde la URL original antes de llamar a la función, y Express no
 * la recalcula si ya existe. En desarrollo y en el resto de los tests no hay
 * rewrite ni runtime, así que nada lo veía.
 *
 * La app de acá es de mentira a propósito —un eco y una ruta con esquema
 * estricto—: lo que se prueba es qué recibe Express, no qué hace cada feature.
 * La ruta real contra la base está en `tests/vercel-handler.test.ts`.
 */
import supertest from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { servidorComoVercel } from '../../../tests/helpers/como-vercel';
import handler from '../handler';

vi.mock('../../app.js', async () => {
  const { default: express } = await import('express');
  const { z } = await import('zod');
  const estricta = z.object({ umbral: z.string().optional() }).strict();
  return {
    createApp: () => {
      const app = express();
      app.get('/api/eco/*', (req, res) => {
        res.json({ url: req.url, query: req.query });
      });
      app.get('/api/estricta', (req, res) => {
        const leida = estricta.safeParse(req.query);
        res.status(leida.success ? 200 : 400).json(leida.success ? leida.data : leida.error.issues);
      });
      return app;
    },
  };
});

interface Eco {
  url: string;
  query: Record<string, unknown>;
}

const comoVercel = () => supertest(servidorComoVercel(handler));

describe('la función de Vercel', () => {
  it('le devuelve a Express la ruta original, con sus segmentos', async () => {
    const r = await comoVercel().get('/api/index?__ruta=eco/uno/dos');
    expect(r.status).toBe(200);
    expect((r.body as Eco).url).toBe('/api/eco/uno/dos');
  });

  it('Express no ve el parámetro interno del rewrite en la consulta (D-156)', async () => {
    const r = await comoVercel().get('/api/index?__ruta=eco/x&umbral=0.5&tema=agua');
    expect((r.body as Eco).query).toEqual({ umbral: '0.5', tema: 'agua' });
  });

  it('una ruta con esquema estricto acepta el pedido que llega por el rewrite (D-156)', async () => {
    const sola = await comoVercel().get('/api/index?__ruta=estricta');
    expect(sola.status).toBe(200);
    const conParametro = await comoVercel().get('/api/index?__ruta=estricta&umbral=0.5');
    expect(conParametro.status).toBe(200);
    expect(conParametro.body).toEqual({ umbral: '0.5' });
  });

  it('el esquema estricto sigue rechazando lo que de verdad sobra', async () => {
    const r = await comoVercel().get('/api/index?__ruta=estricta&otra=1');
    expect(r.status).toBe(400);
    expect(JSON.stringify(r.body)).toContain('otra');
    expect(JSON.stringify(r.body)).not.toContain('__ruta');
  });

  it('la consulta la parsea Express: lo mismo que ve en desarrollo, sin Vercel en el medio', async () => {
    const consulta = 'tipo=sue%C3%B1o&tipo=basta&filtro[lugar]=06&q=san+mart%C3%ADn';
    const porVercel = await comoVercel().get(`/api/index?__ruta=eco/x&${consulta}`);
    const directo = await supertest(handler).get(`/api/eco/x?${consulta}`);
    expect((porVercel.body as Eco).query).toEqual((directo.body as Eco).query);
    expect((directo.body as Eco).query).toEqual({
      tipo: ['sueño', 'basta'],
      filtro: { lugar: '06' },
      q: 'san martín',
    });
  });

  it('sin rewrite deja pasar el pedido como llegó', async () => {
    const r = await comoVercel().get('/api/eco/x?a=1');
    expect(r.body).toEqual({ url: '/api/eco/x?a=1', query: { a: '1' } });
  });
});
