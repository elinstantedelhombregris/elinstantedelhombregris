import { randomUUID } from 'node:crypto';

/**
 * Integration tests for /api/v1/civic/map/* — el instrumento territorial.
 *
 * Spec: `docs/specs/2026-07-26-mapa-2-la-verdad-de-la-ubicacion.md` §5.
 *
 * Lo que estos tests cuidan, más allá de que el endpoint responda:
 * - que el bbox recorte de verdad y no devuelva el país entero;
 * - que una señal SIN coordenada no se cuele en un recorte por bbox — su
 *   ubicación es la provincia, y el conteo honesto del instrumento la cuenta
 *   aparte (spec 3 §4);
 * - que la precisión y el rol viajen en la respuesta, porque sin ellos el
 *   render honesto no puede dibujar y el conteo no puede separar clases.
 */
import '../src/load-env.js';

import { eq, getDb, senales } from '@v2/db';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

/** Obelisco — dentro del bbox de CABA. */
const CABA = { lat: -34.6037, lng: -58.3816 };
/** Ushuaia — muy afuera de cualquier bbox de CABA. */
const USHUAIA = { lat: -54.8019, lng: -68.3029 };

const BBOX_CABA = '-58.55,-34.75,-58.30,-34.50';

interface SenalRespuesta {
  id: string;
  capa: string;
  texto: string;
  lat: number | null;
  lng: number | null;
  precision: string;
  role: string;
}

dsuite('Civic map flows', () => {
  const app = createApp();
  const request = supertest(app);
  const creados: string[] = [];

  beforeAll(async () => {
    const db = getDb();
    // La capa `voz` salió de `dreams` y ahora sale de `senales`. Lo que este
    // archivo prueba —bbox, capas, conteo— no cambió; sí cambió de dónde lee.
    const base = {
      tipo: 'basta' as const,
      clase: 'hecho' as const,
      origen: 'web' as const,
    };
    const filas = await db
      .insert(senales)
      .values([
        {
          ...base,
          idLocal: randomUUID(),
          texto: 'TEST civic-map: pozo en la esquina',
          lat: String(CABA.lat),
          lng: String(CABA.lng),
          precision: 'exact',
          locationRole: 'capture',
          sensitivity: 'low',
        },
        {
          ...base,
          idLocal: randomUUID(),
          texto: 'TEST civic-map: algo en Ushuaia',
          lat: String(USHUAIA.lat),
          lng: String(USHUAIA.lng),
          precision: 'exact',
          locationRole: 'capture',
          sensitivity: 'low',
        },
        {
          ...base,
          idLocal: randomUUID(),
          texto: 'TEST civic-map: voz vieja sin coordenada',
          // Sin lat/lng — el default deja la precisión en 'province'.
        },
      ])
      .returning({ id: senales.idPublico });
    creados.push(...filas.map((f) => f.id));
  });

  afterAll(async () => {
    const db = getDb();
    for (const id of creados) await db.delete(senales).where(eq(senales.idPublico, id));
  });

  const traer = async (query: string): Promise<SenalRespuesta[]> => {
    const res = await request.get(`/api/v1/civic/map/signals${query}`);
    expect(res.status).toBe(200);
    return (res.body as { data: { signals: SenalRespuesta[] } }).data.signals;
  };

  it('devuelve señales con su precisión y su rol', async () => {
    const senales = await traer('?capas=voz');
    const pozo = senales.find((s) => s.texto.includes('pozo en la esquina'));
    expect(pozo).toBeDefined();
    expect(pozo?.precision).toBe('exact');
    expect(pozo?.role).toBe('capture');
    expect(pozo?.lat).toBeCloseTo(CABA.lat, 4);
    // El id lleva el UUID público y ya no el ordinal: un entero en la URL deja
    // enumerar el corpus entero y emparejar dos señales de la misma sesión.
    expect(pozo?.id).toMatch(/^voz:[0-9a-f-]{36}$/i);
  });

  it('el punto exacto llega exacto — no se corre al pasar por la API', async () => {
    // Es lo que D7 existe para permitir: un pozo a 100 m de distancia no sirve.
    const senales = await traer('?capas=voz');
    const pozo = senales.find((s) => s.texto.includes('pozo en la esquina'));
    expect(pozo?.lat).toBe(CABA.lat);
    expect(pozo?.lng).toBe(CABA.lng);
  });

  it('el bbox recorta: lo de Ushuaia no aparece en un bbox de CABA', async () => {
    const senales = await traer(`?capas=voz&bbox=${BBOX_CABA}`);
    expect(senales.some((s) => s.texto.includes('pozo en la esquina'))).toBe(true);
    expect(senales.some((s) => s.texto.includes('algo en Ushuaia'))).toBe(false);
  });

  it('una señal sin coordenada no se cuela en un recorte por bbox', async () => {
    const senales = await traer(`?capas=voz&bbox=${BBOX_CABA}`);
    expect(senales.some((s) => s.texto.includes('sin coordenada'))).toBe(false);
  });

  it('sin bbox, la señal sin coordenada sí aparece, con precisión de provincia', async () => {
    const senales = await traer('?capas=voz');
    const vieja = senales.find((s) => s.texto.includes('sin coordenada'));
    expect(vieja).toBeDefined();
    expect(vieja?.precision).toBe('province');
    expect(vieja?.lat).toBeNull();
  });

  it('filtra por capa: pidiendo pulso no vienen voces', async () => {
    const senales = await traer('?capas=pulso');
    expect(senales.every((s) => s.capa === 'pulso')).toBe(true);
  });

  it('sin parámetro de capas trae todas', async () => {
    const senales = await traer('');
    expect(senales.some((s) => s.capa === 'voz')).toBe(true);
  });

  it('rechaza un bbox invertido en vez de devolver cero en silencio', async () => {
    const res = await request.get('/api/v1/civic/map/signals?bbox=-58.30,-34.50,-58.55,-34.75');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rechaza un bbox que no son cuatro números', async () => {
    const res = await request.get('/api/v1/civic/map/signals?bbox=-58.3,-34.5');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('/map/layers cuenta las cuatro capas', async () => {
    const res = await request.get('/api/v1/civic/map/layers');
    expect(res.status).toBe(200);
    const { layers } = (res.body as { data: { layers: Record<string, number> } }).data;
    expect(Object.keys(layers).sort()).toEqual(['mandato', 'propuesta', 'pulso', 'voz']);
    expect(layers['voz']).toBeGreaterThanOrEqual(3);
  });
});
