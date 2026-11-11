/**
 * La función de Vercel contra la app real y una base real.
 *
 * D-156: en producción, las rutas que validan la consulta con un esquema
 * estricto contestaban 400 por `__ruta`, el parámetro con el que el rewrite de
 * `vercel.json` le pasa la ruta original a la función. Ninguna suite lo veía
 * porque todas llaman a `createApp()` directo, y el defecto vivía en el tramo
 * que va de Vercel a la app. Estos tests recorren ese tramo: el pedido llega
 * como lo deja el rewrite y con la `req.query` que cuelga el runtime
 * (`helpers/como-vercel.ts`).
 *
 * El mecanismo, sin base, está en `src/vercel/__tests__/handler.test.ts`.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { servidorComoVercel } from './helpers/como-vercel.js';
import { hasDatabaseUrl } from './helpers/index.js';

import type { Server } from 'node:http';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

/** El pedido tal como lo entrega el rewrite `/api/(.*)` → `/api/index?__ruta=$1`. */
const reescrito = (ruta: string, consulta = ''): string =>
  `/api/index?__ruta=${ruta}${consulta ? `&${consulta}` : ''}`;

dsuite('la función de Vercel, con la app real', () => {
  let servidor: Server;

  beforeAll(async () => {
    // Import tardío: el módulo arma la app al cargarse, y sin base no debe cargarse.
    const { default: handler } = await import('../src/vercel/handler.js');
    servidor = servidorComoVercel(handler);
  });

  it('La Radiografía contesta por el camino de producción', async () => {
    const r = await supertest(servidor).get(reescrito('v1/civic/radiografia'));
    expect(r.status).toBe(200);
    const data = (r.body as { data: Record<string, unknown> }).data;
    expect(data).toHaveProperty('corpus');
    expect(data).toHaveProperty('analizadas');
    expect(data).toHaveProperty('sinVector');
  });

  it('La Radiografía recibe sus propios parámetros', async () => {
    const r = await supertest(servidor).get(reescrito('v1/civic/radiografia', 'umbral=0.5&k=3'));
    expect(r.status).toBe(200);
  });

  it('un umbral inválido se rechaza por el umbral, no por el rewrite', async () => {
    const r = await supertest(servidor).get(reescrito('v1/civic/radiografia', 'umbral=7'));
    expect(r.status).toBe(400);
    expect(JSON.stringify(r.body)).toContain('umbral');
    expect(JSON.stringify(r.body)).not.toContain('__ruta');
  });

  it('un parámetro que sobra se sigue rechazando por su nombre', async () => {
    const r = await supertest(servidor).get(reescrito('v1/civic/radiografia', 'inventado=1'));
    expect(r.status).toBe(400);
    expect(JSON.stringify(r.body)).toContain('inventado');
    expect(JSON.stringify(r.body)).not.toContain('__ruta');
  });

  // Las otras rutas públicas que el mismo defecto tenía caídas en producción.
  it.each([
    'v1/exportaciones/publica',
    'v1/exportaciones/contexto',
    'iniciativas/tareas-disponibles',
    'iniciativas/escuchas',
  ])('%s deja de rechazar el parámetro del rewrite', async (ruta) => {
    const r = await supertest(servidor).get(reescrito(ruta));
    expect(JSON.stringify(r.body)).not.toContain('__ruta');
    expect(r.status).toBeLessThan(500);
  });
});
