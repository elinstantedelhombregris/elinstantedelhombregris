import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import { clienteHttp } from './setup/cliente-http.js';

describe.skipIf(!process.env.DATABASE_URL_DESCARTABLE)(
  'Conciliación de nomencladores y catálogo Postgres',
  () => {
    const api = clienteHttp(createApp());
    it('devuelve alcance, versiones, códigos de texto y diferencias sin escribir unidades', async () => {
      const r = await api.get('/api/v1/conciliacion?nivel=province').expect(200);
      expect(r.headers['cache-control']).toBe('no-store');
      expect(r.body.data.total).toBe(24);
      expect(r.body.data.filas[0].codigo).toBe('02');
      expect(r.body.data.fuentes).toHaveLength(4);
      const dept = await api.get('/api/v1/conciliacion?nivel=department&provincia=94').expect(200);
      expect(
        dept.body.data.filas.find((f: { codigo: string }) => f.codigo === '94028').geometria,
      ).toBeNull();
      const residual = await api
        .get('/api/v1/conciliacion?nivel=municipality&provincia=02&diferencias=si')
        .expect(200);
      expect(
        residual.body.data.filas.some(
          (f: { censo: { residual: boolean } | null }) => f.censo?.residual,
        ),
      ).toBe(true);
      const local = await api.get('/api/v1/conciliacion?nivel=locality&provincia=06').expect(200);
      expect(local.body.data.filas).toHaveLength(50);
      expect(local.body.data.siguiente).toBe(1);
      await api.get('/api/v1/conciliacion?nivel=province&provincia=x').expect(400);
    });
  },
);
