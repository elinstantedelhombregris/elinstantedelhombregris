import { createHash, randomUUID } from 'node:crypto';
import { ExportacionesRepository, getDb, sql } from '@v2/db';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { prepararExportaciones } from '../src/features/exportaciones/worker.js';
import cron from '../src/vercel/cron-exportaciones.js';
import type { IncomingMessage, ServerResponse } from 'node:http';

function abrirZip(zip: Buffer) {
  const archivos: Record<string, Buffer> = {};
  let posicion = zip.readUInt32LE(zip.length - 6);
  const cantidad = zip.readUInt16LE(zip.length - 12);
  for (let i = 0; i < cantidad; i++) {
    expect(zip.readUInt32LE(posicion)).toBe(0x02014b50);
    const largo = zip.readUInt32LE(posicion + 24);
    const nombreLargo = zip.readUInt16LE(posicion + 28);
    const nombre = zip.subarray(posicion + 46, posicion + 46 + nombreLargo).toString('utf8');
    expect(archivos[nombre]).toBeUndefined();
    const local = zip.readUInt32LE(posicion + 42);
    const inicio = local + 30 + zip.readUInt16LE(local + 26);
    archivos[nombre] = zip.subarray(inicio, inicio + largo);
    let crc = 0xffffffff;
    for (const b of archivos[nombre]) {
      crc ^= b;
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    expect((crc ^ 0xffffffff) >>> 0).toBe(zip.readUInt32LE(posicion + 16));
    posicion += 46 + nombreLargo;
  }
  return archivos;
}
describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Trabajos públicos, persistentes y paginados de exportación',
  () => {
    const r = supertest(createApp());
    const ids = Array.from({ length: 510 }, () => randomUUID());
    const desde = new Date().toISOString();
    let csrf = '';
    const trabajos: string[] = [];
    const cookie = () => `eihg_csrf=${csrf}`;
    const pedir = async (formato = 'jsonl', analisis?: { umbral: number; k: number }) => {
      const idSolicitud = randomUUID();
      const cuerpo = {
        idSolicitud,
        formato,
        filtros: { desde },
        ...(analisis ? { analisis } : {}),
      };
      const p = await r
        .post('/api/v1/exportaciones/trabajos')
        .set('Cookie', cookie())
        .set('X-CSRF-Token', csrf)
        .send(cuerpo)
        .expect(202);
      const id = p.body.data.id as string;
      trabajos.push(id);
      return { id, idSolicitud, cuerpo };
    };
    const descargar = (id: string) =>
      r
        .get(`/api/v1/exportaciones/trabajos/${id}/archivo`)
        .buffer(true)
        .parse((respuesta, callback) => {
          const partes: Buffer[] = [];
          respuesta.on('data', (c: Buffer) => partes.push(c));
          respuesta.on('end', () => callback(null, Buffer.concat(partes)));
          respuesta.on('error', callback);
        });
    beforeAll(async () => {
      await getDb()
        .execute(sql`insert into senales(tipo,clase,origen,id_local,texto,estado,cesion_licencia,cesion_en,cesion_version)
      select 'sueño','deseo','web',u::uuid,case when ord=1 then '=2+2' else 'Texto reservado para esta prueba' end,
      'enviada',ord=1,case when ord=1 then now() end,case when ord=1 then 1::smallint end
      from jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb) with ordinality t(u,ord)`);
      csrf = (await r.get('/api/v1/contribuciones/contexto')).body.data.csrfToken as string;
    });
    afterAll(async () => {
      await getDb().execute(
        sql`delete from exportaciones where id in(select u::uuid from jsonb_array_elements_text(${JSON.stringify(trabajos)}::jsonb) u)`,
      );
      await getDb().execute(
        sql`delete from senales where id_local in(select u::uuid from jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb) u)`,
      );
    });
    it('exige CSRF, mantiene reintentos y no revela el control ni el pedido interno', async () => {
      await r.post('/api/v1/exportaciones/trabajos').send({}).expect(403);
      const t = await pedir();
      const repetido = await r
        .post('/api/v1/exportaciones/trabajos')
        .set('Cookie', cookie())
        .set('X-CSRF-Token', csrf)
        .send(t.cuerpo)
        .expect(202);
      expect(repetido.body.data.id).toBe(t.id);
      const estado = await r.get(`/api/v1/exportaciones/trabajos/${t.id}`).expect(200);
      expect(estado.body.data.estado).toBe('solicitado');
      expect(JSON.stringify(estado.body)).not.toMatch(/idSolicitud|huella|lease|userId|actorId/);
      await r
        .post('/api/v1/exportaciones/trabajos')
        .set('Cookie', cookie())
        .set('X-CSRF-Token', csrf)
        .send({ ...t.cuerpo, formato: 'csv' })
        .expect(409);
    });
    it('prepara más de 500 en lotes reanudables y entrega ZIP íntegro, permisos y sumas verificables', async () => {
      const id = trabajos[0]!;
      await prepararExportaciones({ maxPasos: 3 });
      const parcial = await r.get(`/api/v1/exportaciones/trabajos/${id}`).expect(200);
      expect(parcial.body.data).toMatchObject({
        estado: 'preparando',
        registros: 200,
        total: 510,
        archivoUrl: null,
      });
      await r.get(`/api/v1/exportaciones/trabajos/${id}/archivo`).expect(409);
      await prepararExportaciones();
      const completo = await r.get(`/api/v1/exportaciones/trabajos/${id}`).expect(200);
      expect(completo.body.data).toMatchObject({ estado: 'disponible', registros: 510 });
      const zip = await descargar(id)
        .expect(200)
        .expect('Content-Type', /application\/zip/);
      expect(zip.headers['cache-control']).toContain('no-store');
      const archivos = abrirZip(zip.body as Buffer);
      expect(Object.keys(archivos)).toEqual([
        'senales.jsonl',
        'procesos.json',
        'manifest.json',
        'LEEME.txt',
      ]);
      const filas = archivos['senales.jsonl']!.toString()
        .trim()
        .split('\n')
        .map((s) => JSON.parse(s) as { texto: string | null; textoOmitido: string | null });
      expect(filas).toHaveLength(510);
      expect(filas.filter((f) => f.texto === null)).toHaveLength(509);
      expect(archivos['senales.jsonl']!.toString()).not.toContain('Texto reservado');
      const manifiesto = JSON.parse(archivos['manifest.json']!.toString()) as {
        completo: boolean;
        sha256: string;
        fragmentos: { archivo: string; bytes: number; sha256: string }[];
      };
      expect(manifiesto.completo).toBe(true);
      expect(manifiesto.sha256).toBe(
        createHash('sha256').update(JSON.stringify(manifiesto.fragmentos)).digest('hex'),
      );
      const posiciones: Record<string, number> = {};
      for (const f of manifiesto.fragmentos) {
        const inicio = posiciones[f.archivo] ?? 0;
        expect(
          createHash('sha256')
            .update(archivos[f.archivo]!.subarray(inicio, inicio + f.bytes))
            .digest('hex'),
        ).toBe(f.sha256);
        posiciones[f.archivo] = inicio + f.bytes;
      }
      expect(JSON.parse(archivos['procesos.json']!.toString())).toHaveProperty('campanas');
    });
    it('una corrección o cambio de permiso impide abrir un paquete ya preparado', async () => {
      await getDb().execute(
        sql`update senales set cesion_licencia=false,cesion_en=null,cesion_version=null where id_local=${ids[0]}::uuid`,
      );
      await r.get(`/api/v1/exportaciones/trabajos/${trabajos[0]}/archivo`).expect(409);
      const estado = await r.get(`/api/v1/exportaciones/trabajos/${trabajos[0]}`).expect(200);
      expect(estado.body.data.estado).toBe('fallido');
      const partes = await getDb().execute<{ n: number }>(
        sql`select count(*)::int n from exportacion_partes where trabajo_id=${trabajos[0]}::uuid`,
      );
      expect(partes.rows[0]?.n).toBe(0);
      await getDb().execute(
        sql`update senales set cesion_licencia=true,cesion_en=now(),cesion_version=1 where id_local=${ids[0]}::uuid`,
      );
    });
    it('cancelar requiere el control original, nunca sólo el ID público', async () => {
      const t = await pedir();
      const ruta = `/api/v1/exportaciones/trabajos/${t.id}/cancelar`;
      await r.post(ruta).send({ idSolicitud: t.idSolicitud }).expect(403);
      await r
        .post(ruta)
        .set('Cookie', cookie())
        .set('X-CSRF-Token', csrf)
        .send({ idSolicitud: randomUUID() })
        .expect(403);
      const cancelado = await r
        .post(ruta)
        .set('Cookie', cookie())
        .set('X-CSRF-Token', csrf)
        .send({ idSolicitud: t.idSolicitud })
        .expect(200);
      expect(cancelado.body.data.estado).toBe('fallido');
    });
    it('vence, limpia partes y rechaza entregar una copia vencida', async () => {
      const t = await pedir();
      await prepararExportaciones({ maxPasos: 2 });
      await getDb().execute(
        sql`update exportaciones set vence_en=now()-interval '1 second' where id=${t.id}::uuid`,
      );
      const estado = await r.get(`/api/v1/exportaciones/trabajos/${t.id}`).expect(200);
      expect(estado.body.data.estado).toBe('vencido');
      await r.get(`/api/v1/exportaciones/trabajos/${t.id}/archivo`).expect(409);
    });
    it('recupera un lease muerto, conserva CSV seguro y GeoJSON con punto protegido', async () => {
      const csv = await pedir('csv');
      await getDb().execute(
        sql`update exportaciones set estado='preparando',lease=${randomUUID()}::uuid,lease_hasta=now()-interval '1 second' where id=${csv.id}::uuid`,
      );
      await prepararExportaciones();
      const c = abrirZip((await descargar(csv.id).expect(200)).body as Buffer);
      expect(c['senales.csv']!.toString()).toContain('"\'=2+2"');
      const geo = await pedir('geojson');
      await prepararExportaciones();
      const g = abrirZip((await descargar(geo.id).expect(200)).body as Buffer);
      const features = (
        JSON.parse(g['senales.geojson']!.toString()) as { features: { geometry: null }[] }
      ).features;
      expect(features).toHaveLength(510);
      expect(features.every((f) => f.geometry === null)).toBe(true);
    });
    it('un límite de memoria falla con explicación y nunca anuncia un paquete parcial completo', async () => {
      const t = await pedir();
      await getDb().execute(sql`update exportaciones set bytes=268435456 where id=${t.id}::uuid`);
      await prepararExportaciones();
      const e = await r.get(`/api/v1/exportaciones/trabajos/${t.id}`).expect(200);
      expect(e.body.data).toMatchObject({ estado: 'fallido', archivoUrl: null });
      expect(e.body.data.mensaje).toContain('256 MB');
    });
    it('los aportes posteriores al corte no frenan el archivo; una fuente anterior incorporada tarde sí lo invalida', async () => {
      const t = await pedir();
      const inicial = await r.get(`/api/v1/exportaciones/trabajos/${t.id}`);
      const corte = inicial.body.data.corte as string;
      const nuevo = randomUUID();
      ids.push(nuevo);
      await getDb()
        .execute(sql`insert into senales(tipo,clase,origen,id_local,texto,estado,cesion_licencia,creada_en)
      values('sueño','deseo','web',${nuevo}::uuid,'Aporte posterior al corte','enviada',false,${new Date(new Date(corte).getTime() + 1).toISOString()}::timestamptz)`);
      expect((await r.get(`/api/v1/exportaciones/trabajos/${t.id}`)).body.data.estado).toBe(
        'solicitado',
      );
      await prepararExportaciones();
      expect((await r.get(`/api/v1/exportaciones/trabajos/${t.id}`)).body.data).toMatchObject({
        estado: 'disponible',
        registros: 510,
      });
      const otro = await pedir();
      const anterior = randomUUID();
      ids.push(anterior);
      await getDb()
        .execute(sql`insert into senales(tipo,clase,origen,id_local,texto,estado,cesion_licencia,creada_en)
      values('sueño','deseo','web',${anterior}::uuid,'Fuente incorporada tarde','enviada',false,${corte}::timestamptz)`);
      expect((await r.get(`/api/v1/exportaciones/trabajos/${otro.id}`)).body.data.estado).toBe(
        'fallido',
      );
    });
    it('el cron no ejecuta trabajos sin secreto configurado y válido', async () => {
      let codigo = 0;
      let cuerpo = '';
      const respuesta = {
        setHeader() {},
        set statusCode(v: number) {
          codigo = v;
        },
        end(v: string) {
          cuerpo = v;
        },
      } as unknown as ServerResponse;
      await cron({ headers: {} } as IncomingMessage, respuesta);
      expect(codigo).toBe(401);
      expect(cuerpo).toContain('UNAUTHORIZED');
    });
    it('incluye la lectura acotada y corta el flujo si una fuente retira permiso durante la entrega', async () => {
      const t = await pedir('jsonl', { umbral: 0.72, k: 12 });
      await prepararExportaciones();
      const a = abrirZip((await descargar(t.id).expect(200)).body as Buffer);
      expect(a['analisis.json']).toBeDefined();
      const analisis = JSON.parse(a['analisis.json']!.toString()) as {
        cobertura: { completo: boolean };
      };
      expect(analisis.cobertura.completo).toBe(false);
      expect(a['analisis.json']!.toString()).not.toMatch(/Texto reservado|userId|actorId|idLocal/);
      const repo = new ExportacionesRepository(getDb());
      const fila = await repo.porId(t.id);
      const flujo = repo.leer(t.id, fila!.revisionPublica);
      expect((await flujo.next()).done).toBe(false);
      await getDb().execute(
        sql`update senales set cesion_licencia=false,cesion_en=null,cesion_version=null where id_local=${ids[0]}::uuid`,
      );
      await expect(flujo.next()).rejects.toThrow('ARCHIVO_INVALIDADO');
      await getDb().execute(
        sql`update senales set cesion_licencia=true,cesion_en=now(),cesion_version=1 where id_local=${ids[0]}::uuid`,
      );
    });
    it('el cron autorizado realiza el trabajo durable y deja el paquete disponible', async () => {
      const t = await pedir();
      const anterior = process.env['CRON_SECRET'];
      const secreto = 'secreto-de-cron-solo-para-esta-prueba';
      process.env['CRON_SECRET'] = secreto;
      let codigo = 0;
      let cuerpo = '';
      const respuesta = {
        setHeader() {},
        set statusCode(v: number) {
          codigo = v;
        },
        end(v: string) {
          cuerpo = v;
        },
      } as unknown as ServerResponse;
      try {
        await cron(
          { headers: { authorization: `Bearer ${secreto}` } } as IncomingMessage,
          respuesta,
        );
        expect(codigo).toBe(200);
        expect(cuerpo).toContain(t.id);
        expect((await r.get(`/api/v1/exportaciones/trabajos/${t.id}`)).body.data.estado).toBe(
          'disponible',
        );
      } finally {
        if (anterior === undefined) delete process.env['CRON_SECRET'];
        else process.env['CRON_SECRET'] = anterior;
      }
    });
  },
);
