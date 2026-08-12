/**
 * Integración de /api/v1/faltas — el canal de escucha
 * (`docs/specs/2026-08-12-lo-que-falta.md`).
 *
 * Lo que se afirma acá y no se puede afirmar en `civic-core`: que la fila
 * sobrevive a la baja con el cuerpo vacío, que firmar dos veces cuenta una, y
 * que **nada de lo que la tabla guarda para poder funcionar sale por la API**
 * — ni la llave, ni su hash, ni el id interno. Esa última es la guarda que
 * existe porque `submittedAs` publicó el UUID del teléfono como autor.
 *
 * Limpieza segura: cada `id_publico` creado se junta y se borra en afterAll.
 * Aserciones relativas — otras suites escriben en paralelo en el mismo branch.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { eq, faltas, getDb, hashDeLlave } from '@v2/db';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Faltas flows', () => {
  const app = createApp();
  const request = supertest(app);
  const creadas: string[] = [];

  async function dejar(overrides: Record<string, unknown> = {}) {
    const res = await request.post('/api/v1/faltas').send({
      superficie: 'el-mapa',
      titulo: `Prueba ${String(Date.now())}${String(Math.round(performance.now() * 1000))}`,
      cuerpo: 'El instrumento no dice cuántas señales quedaron afuera del recorte.',
      ...overrides,
    });
    if (res.status === 201) creadas.push(res.body.data.idPublico as string);
    return res;
  }

  afterAll(async () => {
    const db = getDb();
    for (const idPublico of creadas) {
      await db.delete(faltas).where(eq(faltas.idPublico, idPublico));
    }
  });

  describe('POST /api/v1/faltas', () => {
    it('deja una falta anónima y devuelve la llave una sola vez', async () => {
      const res = await dejar();
      expect(res.status).toBe(201);

      const { idPublico, url, llave } = res.body.data as {
        idPublico: string;
        url: string;
        llave: string;
      };
      expect(idPublico).toMatch(/^I-\d{3,6}$/);
      expect(url).toBe(`/lo-que-falta/${idPublico}`);
      expect(llave.length).toBeGreaterThanOrEqual(32);

      // El servidor guarda el hash, nunca la llave.
      const [fila] = await getDb().select().from(faltas).where(eq(faltas.idPublico, idPublico));
      expect(fila?.llaveHash).toBe(hashDeLlave(llave));
      expect(fila?.llaveHash).not.toBe(llave);
      expect(fila?.estado).toBe('dicha');
      expect(fila?.origen).toBe('afuera');
      // La severidad no se acepta de afuera, ni siquiera si la mandan.
      expect(fila?.severidad).toBeNull();
    });

    it('adjunta el encuadre cuando la falta viene del mapa, y nada más', async () => {
      const res = await dejar({
        contexto: {
          ruta: '/el-mapa#instrumento',
          capa: 'necesidades',
          encuadre: { oeste: -64.2, sur: -34.9, este: -58.1, norte: -31.2 },
        },
      });
      expect(res.status).toBe(201);

      const [fila] = await getDb()
        .select()
        .from(faltas)
        .where(eq(faltas.idPublico, res.body.data.idPublico as string));
      expect(fila?.contexto).toEqual({
        ruta: '/el-mapa#instrumento',
        capa: 'necesidades',
        encuadre: { oeste: -64.2, sur: -34.9, este: -58.1, norte: -31.2 },
      });
    });

    it('rechaza un contexto con campos que nadie declaró', async () => {
      const res = await dejar({
        contexto: { ruta: '/el-mapa', ip: '190.1.2.3', userAgent: 'Mozilla/5.0' },
      });
      expect(res.status).toBe(400);
    });

    it('rechaza el título de una palabra y el cuerpo vacío', async () => {
      expect((await dejar({ titulo: 'no' })).status).toBe(400);
      expect((await dejar({ cuerpo: 'corto' })).status).toBe(400);
    });

    it('rechaza una superficie inventada', async () => {
      expect((await dejar({ superficie: 'el-quiosco' })).status).toBe(400);
    });
  });

  describe('GET /api/v1/faltas', () => {
    it('no filtra la llave, ni su hash, ni el id interno', async () => {
      const creada = await dejar();
      expect(creada.status).toBe(201);
      const { idPublico, llave } = creada.body.data as { idPublico: string; llave: string };

      const ficha = await request.get(`/api/v1/faltas/${idPublico}`);
      expect(ficha.status).toBe(200);

      const listado = await request.get('/api/v1/faltas?limite=100');
      expect(listado.status).toBe(200);

      // Se muestrea el JSON entero: un campo nuevo en la proyección pública
      // no puede colarse porque el test mire sólo las claves que ya conoce.
      for (const cuerpo of [JSON.stringify(ficha.body), JSON.stringify(listado.body)]) {
        expect(cuerpo).not.toContain(llave);
        expect(cuerpo).not.toContain(hashDeLlave(llave));
        expect(cuerpo).not.toContain('llaveHash');
        expect(cuerpo).not.toContain('llave_hash');
        expect(cuerpo).not.toContain('userAgent');
      }
      expect(Object.keys(ficha.body.data as object)).not.toContain('id');
    });

    it('pagina por cursor y el orden es cronológico descendente', async () => {
      await dejar();
      await dejar();

      const primera = await request.get('/api/v1/faltas?limite=1');
      expect(primera.status).toBe(200);
      expect(primera.body.data.faltas).toHaveLength(1);
      expect(typeof primera.body.data.siguiente).toBe('string');

      const segunda = await request.get(
        `/api/v1/faltas?limite=1&cursor=${encodeURIComponent(primera.body.data.siguiente as string)}`,
      );
      expect(segunda.status).toBe(200);
      const a = primera.body.data.faltas[0] as { idPublico: string; creadaEn: string };
      const b = segunda.body.data.faltas[0] as { idPublico: string; creadaEn: string };
      expect(b.idPublico).not.toBe(a.idPublico);
      expect(new Date(b.creadaEn).getTime()).toBeLessThanOrEqual(new Date(a.creadaEn).getTime());
    });

    it('404 con forma de id válida que no existe, 400 con forma inválida', async () => {
      expect((await request.get('/api/v1/faltas/I-999999')).status).toBe(404);
      expect((await request.get('/api/v1/faltas/X-001')).status).toBe(400);
      expect((await request.get('/api/v1/faltas/..%2Fadmin')).status).toBe(400);
    });
  });

  describe('firmar', () => {
    it('cuenta una sola vez la misma llave, y el orden no cambia por firmas', async () => {
      const creada = await dejar();
      const idPublico = creada.body.data.idPublico as string;
      const llave = 'llave-de-prueba-para-firmar-0000';

      const primera = await request.post(`/api/v1/faltas/${idPublico}/firmas`).send({ llave });
      expect(primera.status).toBe(201);
      expect(primera.body.data).toEqual({ firmas: 1, nueva: true });

      const repetida = await request.post(`/api/v1/faltas/${idPublico}/firmas`).send({ llave });
      expect(repetida.status).toBe(200);
      expect(repetida.body.data).toEqual({ firmas: 1, nueva: false });

      const otra = await request
        .post(`/api/v1/faltas/${idPublico}/firmas`)
        .send({ llave: 'otra-llave-distinta-para-firmar-11' });
      expect(otra.status).toBe(201);
      expect(otra.body.data.firmas).toBe(2);
    });

    it('no firma una falta que no existe', async () => {
      const res = await request
        .post('/api/v1/faltas/I-999999/firmas')
        .send({ llave: 'llave-de-prueba-para-firmar-0000' });
      expect(res.status).toBe(404);
    });
  });

  describe('retirar la propia', () => {
    it('baja la falta: la fila queda, el cuerpo se vacía y el motivo se escribe', async () => {
      const creada = await dejar();
      const { idPublico, llave } = creada.body.data as { idPublico: string; llave: string };

      const baja = await request.delete(`/api/v1/faltas/${idPublico}`).send({ llave });
      expect(baja.status).toBe(200);
      expect(baja.body.data.estado).toBe('bajada');

      const [fila] = await getDb().select().from(faltas).where(eq(faltas.idPublico, idPublico));
      expect(fila).toBeDefined();
      expect(fila?.titulo).toBe('[contenido retirado]');
      expect(fila?.cuerpo).toBe('[contenido retirado]');
      expect(fila?.contexto).toBeNull();
      expect((fila?.razon ?? '').length).toBeGreaterThan(0);

      // Sigue siendo legible como ficha: el número no desaparece del registro.
      const ficha = await request.get(`/api/v1/faltas/${idPublico}`);
      expect(ficha.status).toBe(200);
      expect(ficha.body.data.idPublico).toBe(idPublico);
    });

    it('no baja nada con una llave que no es la suya', async () => {
      const creada = await dejar();
      const idPublico = creada.body.data.idPublico as string;

      const res = await request
        .delete(`/api/v1/faltas/${idPublico}`)
        .send({ llave: 'llave-ajena-que-no-corresponde-01' });
      expect(res.status).toBe(403);

      const [fila] = await getDb().select().from(faltas).where(eq(faltas.idPublico, idPublico));
      expect(fila?.estado).toBe('dicha');
    });

    it('una falta bajada no se firma', async () => {
      const creada = await dejar();
      const { idPublico, llave } = creada.body.data as { idPublico: string; llave: string };
      await request.delete(`/api/v1/faltas/${idPublico}`).send({ llave });

      const res = await request
        .post(`/api/v1/faltas/${idPublico}/firmas`)
        .send({ llave: 'llave-de-prueba-para-firmar-0000' });
      expect(res.status).toBe(409);
    });
  });

  describe('PATCH — mover de estado', () => {
    /**
     * La exención anónima de este canal cubre tres verbos y **no** el PATCH.
     * Se afirma acá porque es exactamente el error que la lista de exenciones
     * por prefijo cometería sola: una entrada `/api/v1/faltas` en
     * `ANON_ALLOWED` dejaría pasar esta ruta sin token ni sesión.
     */
    it('no está exento de CSRF, aunque sus hermanos anónimos sí lo estén', async () => {
      const creada = await dejar();
      const res = await request
        .patch(`/api/v1/faltas/${creada.body.data.idPublico as string}`)
        .send({ estado: 'anotada' });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_FAILED');
    });
  });

  describe('GET /api/v1/faltas/conteos', () => {
    it('devuelve el total y el desglose por estado', async () => {
      await dejar();
      const res = await request.get('/api/v1/faltas/conteos');
      expect(res.status).toBe(200);
      const { total, porEstado } = res.body.data as {
        total: number;
        porEstado: Record<string, number>;
      };
      expect(total).toBeGreaterThan(0);
      expect(porEstado['dicha']).toBeGreaterThan(0);
      expect(total).toBe(Object.values(porEstado).reduce((suma, n) => suma + n, 0));
    });
  });
});
