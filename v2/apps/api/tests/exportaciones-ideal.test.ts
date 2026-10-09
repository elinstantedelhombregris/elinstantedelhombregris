import { randomUUID } from 'node:crypto';
import { getDb, sql } from '@v2/db';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Exportación completa y cobertura visible',
  () => {
    const r = supertest(createApp());
    const ids = Array.from({ length: 510 }, () => randomUUID());
    const desde = new Date().toISOString();
    let corte = '';
    beforeAll(async () => {
      await getDb().execute(
        sql`insert into senales(tipo,clase,origen,id_local,texto,estado,cesion_licencia,cesion_en,cesion_version) select 'sueño','deseo','web',u::uuid,'No quiero perder tiempo para aprender.','enviada',false,null,null from jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb) u`,
      );
    });
    afterAll(async () => {
      await getDb().execute(
        sql`delete from senales where id_local in(select u::uuid from jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb) u)`,
      );
    });
    it('el catálogo no promete archivos inexistentes ni licencia CC0', async () => {
      const c = await r.get('/api/v1/exportaciones/catalogo').expect(200);
      expect(JSON.stringify(c.body)).not.toContain('CC0');
      expect(c.body.data.conjuntos.map((x: { id: string }) => x.id)).toContain('senales');
    });
    it('recorre más de 500 sin publicar texto reservado, cuenta ni actor', async () => {
      let cursor = '';
      let n = 0;
      const vistos = new Set<string>();
      do {
        const p = await r
          .get('/api/v1/exportaciones/publica')
          .query({ desde, limite: 100, ...(cursor ? { cursor } : {}), ...(corte ? { corte } : {}) })
          .expect(200);
        corte = p.body.data.manifiesto.corte as string;
        expect(p.body.data.manifiesto.conteos.elegibles).toBeGreaterThanOrEqual(510);
        for (const x of p.body.data.registros as {
          id: string;
          texto: null;
          textoOmitido: string;
        }[]) {
          expect(x.texto).toBeNull();
          expect(x.textoOmitido).toBeTruthy();
          expect(vistos.has(x.id)).toBe(false);
          vistos.add(x.id);
          n++;
        }
        cursor = (p.body.data.siguiente as string | null) ?? '';
        expect(JSON.stringify(p.body)).not.toMatch(/userId|actorId|idLocal|codigo_hash/);
      } while (cursor);
      expect(n).toBeGreaterThanOrEqual(510);
    });
    it('Radiografía declara el recorte y comparte filtros del registro', async () => {
      const p = await r.get('/api/v1/civic/radiografia').query({ desde }).expect(200);
      expect(p.body.data.total).toBe(500);
      expect(p.body.data.cobertura).toMatchObject({ completo: false, limite: 500 });
      expect(p.body.data.cobertura.elegibles).toBeGreaterThanOrEqual(510);
      const nada = await r
        .get('/api/v1/civic/radiografia')
        .query({ desde, tipo: 'compromiso' })
        .expect(200);
      expect(nada.body.data.total).toBe(0);
    });
    it('el contexto es metadato con corte, sin contratos libres ni propietario', async () => {
      const p = await r.get('/api/v1/exportaciones/contexto').query({ corte }).expect(200);
      expect(p.body.data.corte).toBe(corte);
      expect(JSON.stringify(p.body)).not.toMatch(/creadorId|contrato|password|codigo/);
      await r
        .get('/api/v1/exportaciones/publica')
        .query({ corte: '2999-01-01T00:00:00.000Z' })
        .expect(400);
    });
    it('una consulta territorial puede reconstruir su ámbito por identificador', async () => {
      const ps = await getDb().execute<{ id: number }>(
        sql`select id from geographic_locations where level='province' limit 1`,
      );
      const id = ps.rows[0]!.id;
      const lugar = await r.get('/api/v1/geo/lugares/' + id).expect(200);
      expect(lugar.body.data).toMatchObject({ id, level: 'province', provinceId: id });
      await r.get('/api/v1/geo/lugares/2147483647').expect(404);
    });
    it('la interpretación externa exige permiso y un proveedor efectivo', async () => {
      await r
        .post('/api/v1/contribuciones/interpretar')
        .send({ texto: 'Lo que quisiera imaginar' })
        .expect(403);
      const c = await r.get('/api/v1/contribuciones/contexto');
      const token = c.body.data.csrfToken as string;
      await r
        .post('/api/v1/contribuciones/interpretar')
        .set('Cookie', `eihg_csrf=${token}`)
        .set('X-CSRF-Token', token)
        .send({ texto: 'No quiero renunciar a estudiar y cuidar.', autorizaProveedor: false })
        .expect(400);
      await r
        .post('/api/v1/contribuciones/interpretar')
        .set('Cookie', `eihg_csrf=${token}`)
        .set('X-CSRF-Token', token)
        .send({ texto: 'No quiero renunciar a estudiar y cuidar.', autorizaProveedor: true })
        .expect(503);
    });
  },
);
