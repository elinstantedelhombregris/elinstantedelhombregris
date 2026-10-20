import express from 'express';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetConfig } from '../../lib/config';
import { corsMiddleware } from '../security';

import type { ErrorRequestHandler } from 'express';

/** Una API mínima con el mismo `trust proxy` que la real y un error que dice el código. */
function montar() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(corsMiddleware());
  app.post('/api/algo', (_req, res) => {
    res.status(201).json({ ok: true });
  });
  const alError: ErrorRequestHandler = (_err, _req, res, _next) => {
    res.status(500).json({ error: 'rechazado' });
  };
  app.use(alError);
  return supertest(app);
}

describe('CORS', () => {
  // Lo obligatorio de la configuración, de mentira: la prueba nunca abre la base.
  beforeEach(() => {
    vi.stubEnv('DATABASE_URL', 'postgresql://nadie@127.0.0.1:1/nada');
    vi.stubEnv('JWT_SECRET', 'x'.repeat(32));
    vi.stubEnv('SESSION_SECRET', 'y'.repeat(32));
    resetConfig();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    resetConfig();
  });

  it('acepta el propio sitio detrás del proxy aunque CORS_ORIGINS no lo nombre', async () => {
    vi.stubEnv('CORS_ORIGINS', '');
    resetConfig();
    const r = await montar()
      .post('/api/algo')
      .set('Host', 'elinstantedelhombregris.com')
      .set('X-Forwarded-Proto', 'https')
      .set('Origin', 'https://elinstantedelhombregris.com');
    expect(r.status).toBe(201);
    expect(r.headers['access-control-allow-origin']).toBe('https://elinstantedelhombregris.com');
  });

  it('el mismo host con otro esquema no es el mismo origen', async () => {
    const r = await montar()
      .post('/api/algo')
      .set('Host', 'elinstantedelhombregris.com')
      .set('X-Forwarded-Proto', 'https')
      .set('Origin', 'http://elinstantedelhombregris.com');
    expect(r.status).toBe(500);
  });

  it('rechaza un sitio ajeno y no le devuelve permiso', async () => {
    const r = await montar()
      .post('/api/algo')
      .set('Host', 'elinstantedelhombregris.com')
      .set('X-Forwarded-Proto', 'https')
      .set('Origin', 'https://otro-sitio.example');
    expect(r.status).toBe(500);
    expect(r.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('sigue aceptando lo que nombra CORS_ORIGINS, y lo que llega sin Origin', async () => {
    vi.stubEnv('CORS_ORIGINS', 'https://app.example');
    resetConfig();
    const nombrado = await montar().post('/api/algo').set('Origin', 'https://app.example');
    expect(nombrado.status).toBe(201);
    const sinOrigen = await montar().post('/api/algo');
    expect(sinOrigen.status).toBe(201);
  });
});
