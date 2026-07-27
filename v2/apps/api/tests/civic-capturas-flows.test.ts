/**
 * Integration tests for POST /api/v1/civic/capturas — la ingesta de campo.
 *
 * Spec: `docs/specs/2026-07-26-mapa-4-el-campo.md` §4 y §7.
 *
 * Los dos que importan:
 * - que el punto exacto llegue exacto (es lo que D7 existe para permitir: un
 *   pozo a 100 m de distancia no sirve);
 * - que el servidor NO le crea al cliente la precisión declarada, así un
 *   cliente modificado no puede publicar una necesidad sensible en la puerta
 *   de una casa.
 */
import '../src/load-env.js';

import { dreams, eq, getDb, ilike } from '@v2/db';
import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

const ESQUINA = { lat: -34.6037, lng: -58.3816 };

/** UUIDs fijos: el test tiene que poder reenviar la MISMA captura. */
const UUID_POZO = '11111111-1111-4111-8111-111111111111';
const UUID_NECESIDAD = '22222222-2222-4222-8222-222222222222';
const UUID_RECURSO = '33333333-3333-4333-8333-333333333333';

interface Recibo {
  idLocal: string;
  idPublico: string;
  precisionPublicada: string;
  engrosado: string | null;
  url: string;
  yaExistia: boolean;
}

dsuite('Civic capturas flows', () => {
  const app = createApp();
  const request = supertest(app);

  afterAll(async () => {
    const db = getDb();
    await db.delete(dreams).where(ilike(dreams.submittedAs, 'captura:%'));
  });

  const enviar = (body: object) => request.post('/api/v1/civic/capturas').send(body);

  const captura = (over: Record<string, unknown>) => ({
    contrato: 'basta-civic-captura/v1',
    texto: 'TEST captura de campo',
    punto: ESQUINA,
    precisionPedida: 'exact',
    sensitivity: 'low',
    ...over,
  });

  it('un pozo observado se publica en su punto exacto, sin correrse', () => {
    return enviar(captura({ idLocal: UUID_POZO, tipo: 'observation' })).then(async (res) => {
      expect(res.status).toBe(201);
      const { recibo } = (res.body as { data: { recibo: Recibo } }).data;
      expect(recibo.precisionPublicada).toBe('exact');
      expect(recibo.engrosado).toBeNull();

      const id = Number(recibo.idPublico.replace('voz:', ''));
      const [fila] = await getDb().select().from(dreams).where(eq(dreams.id, id));
      expect(Number(fila?.lat)).toBe(ESQUINA.lat);
      expect(Number(fila?.lng)).toBe(ESQUINA.lng);
      expect(fila?.locationRole).toBe('capture');
    });
  });

  it('reenviar la misma captura no duplica — el outbox reintenta', async () => {
    const primera = await enviar(captura({ idLocal: UUID_POZO, tipo: 'observation' }));
    const segunda = await enviar(captura({ idLocal: UUID_POZO, tipo: 'observation' }));

    expect(primera.status).toBe(200);
    expect(segunda.status).toBe(200);
    const r1 = (primera.body as { data: { recibo: Recibo } }).data.recibo;
    const r2 = (segunda.body as { data: { recibo: Recibo } }).data.recibo;
    expect(r1.idPublico).toBe(r2.idPublico);
    expect(r1.yaExistia).toBe(true);

    const filas = await getDb()
      .select()
      .from(dreams)
      .where(eq(dreams.submittedAs, `captura:${UUID_POZO}`));
    expect(filas).toHaveLength(1);
  });

  it('el servidor no le cree al cliente: una necesidad sensible se engrosa', async () => {
    const res = await enviar(
      captura({
        idLocal: UUID_NECESIDAD,
        tipo: 'need',
        sensitivity: 'high',
        precisionPedida: 'exact',
        texto: 'TEST captura: necesito pañales',
      }),
    );
    expect(res.status).toBe(201);
    const { recibo } = (res.body as { data: { recibo: Recibo } }).data;

    // El cliente pidió exact; la política devuelve 500m y lo explica.
    expect(recibo.precisionPublicada).toBe('500m');
    expect(recibo.engrosado).toMatch(/persona/);

    const id = Number(recibo.idPublico.replace('voz:', ''));
    const [fila] = await getDb().select().from(dreams).where(eq(dreams.id, id));
    expect(Number(fila?.lat)).not.toBe(ESQUINA.lat);
  });

  it('un punto de reparto se publica exacto aunque sea sensible', async () => {
    // Sin exactitud el recurso no se puede usar: manda el rol, no la etiqueta.
    const res = await enviar(
      captura({
        idLocal: UUID_RECURSO,
        tipo: 'resource',
        sensitivity: 'high',
        texto: 'TEST captura: acá se reparte agua',
      }),
    );
    const { recibo } = (res.body as { data: { recibo: Recibo } }).data;
    expect(recibo.precisionPublicada).toBe('exact');
    expect(recibo.engrosado).toBeNull();
  });

  it('la captura aparece en el mapa y el lazo la puede agarrar', async () => {
    const res = await request.get(
      '/api/v1/civic/map/signals?capas=voz&bbox=-58.55,-34.75,-58.30,-34.50',
    );
    expect(res.status).toBe(200);
    const { signals } = (res.body as { data: { signals: { texto: string }[] } }).data;
    expect(signals.some((s) => s.texto.includes('acá se reparte agua'))).toBe(true);
  });

  it('rechaza un contrato que no conoce en vez de adivinar', async () => {
    const res = await enviar(
      captura({ contrato: 'otra-cosa/v9', idLocal: UUID_POZO, tipo: 'observation' }),
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rechaza un idLocal que no es UUID — la idempotencia depende de él', async () => {
    const res = await enviar(captura({ idLocal: 'pepe', tipo: 'observation' }));
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rechaza una captura vacía', async () => {
    const res = await enviar(
      captura({ idLocal: '44444444-4444-4444-8444-444444444444', tipo: 'observation', texto: '  ' }),
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
