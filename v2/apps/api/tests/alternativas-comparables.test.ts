import { randomUUID } from 'node:crypto';
import { getDb, sql } from '@v2/db';
import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Alternativas comparables y sus revisiones',
  () => {
    const api = supertest(createApp());
    const usuarios: number[] = [];
    let cookie = '',
      fichaId = '',
      otraFicha = '',
      objecionId = '';
    const propuesta = () => ({
      idLocal: randomUUID(),
      titulo: 'Sala abierta por las tardes',
      funcionamiento: 'Coordinar dos encuentros semanales con acceso sin escalones.',
      resultado: 'Estudiar cerca de casa',
      dependencias: 'Coordinar horarios del espacio',
      presupuesto: 'Verificar tiempo del equipo',
      prueba: 'Probar con un grupo durante dos semanas',
      criterioPausa: 'Detener si el horario excluye a las familias',
    });
    const detalle = {
      beneficiarios: 'Quienes necesitan apoyo escolar',
      afectados: 'Quienes cuidan por la tarde',
      capacidades: 'Seis horas de sala accesible',
      costo: 0,
      costoUnidad: 'ARS por semana de préstamo de sala',
      fuenteCosto: 'https://example.org/acuerdo',
      plazo: '2099-01-01',
      efectosAdversos: 'Desplazar otras actividades',
      incertidumbre: 'Falta consultar horarios',
      situacionActual: false,
      referencias: ['https://example.org/plan'],
    };
    const post = (f: string, cuerpo: object) =>
      api
        .post(`/api/v1/fichas/${f}/alternativas`)
        .set('Cookie', cookie)
        .set('X-CSRF-Token', 'alternativa')
        .send(cuerpo);
    beforeAll(async () => {
      const marca = randomUUID();
      const u = await getDb().execute<{ id: number }>(
        sql`insert into users(username,email,name,password_hash) values(${marca},${marca + '@test.local'},'Prueba','no-login') returning id`,
      );
      const uid = u.rows[0]!.id;
      usuarios.push(uid);
      cookie = `eihg_access=${signAccessToken({ sub: uid, username: 'test', email: 'test@test.local' })}; eihg_csrf=alternativa`;
      const contenido = {
        titulo: 'Aprender cerca de casa',
        territorioId: null,
        temas: [],
        situacion: '',
        futuro: 'Aprender con horarios accesibles',
        proximaTarea: 'Consultar horarios',
        vinculos: [],
      };
      const fichas = await getDb().execute<{ id: string }>(
        sql`insert into fichas_futuro(creador_id,id_local,contenido) select ${uid},gen_random_uuid(),${JSON.stringify(contenido)}::jsonb from generate_series(1,2) returning id`,
      );
      fichaId = fichas.rows[0]!.id;
      otraFicha = fichas.rows[1]!.id;
      const objecion = await getDb().execute<{ id: string }>(
        sql`insert into ficha_argumentos(ficha_id,autor_id,id_local,tipo,texto,firma,fuente_ids,huella) values(${fichaId}::uuid,${uid},gen_random_uuid(),'objecion','El horario no contempla a quienes cuidan.','Equipo','[]'::jsonb,'fixture') returning id`,
      );
      objecionId = objecion.rows[0]!.id;
    });
    afterAll(async () => {
      await limpiarFixturesIdeales(getDb(), usuarios);
    });
    it('conserva alternativas anteriores y exige fuente para costos, incluso cero', async () => {
      const v = propuesta();
      const original = (await post(fichaId, v).expect(201)).body.data.id as string;
      expect((await post(fichaId, v).expect(201)).body.data.id).toBe(original);
      await post(fichaId, { ...propuesta(), detalle: { ...detalle, fuenteCosto: null } }).expect(
        400,
      );
      await post(fichaId, {
        ...propuesta(),
        detalle: { ...detalle, referencias: ['javascript:alert(1)'] },
      }).expect(400);
      const nueva = {
        ...propuesta(),
        detalle,
        revisionDe: {
          anteriorId: original,
          objecionId,
          motivo: 'Agregamos una franja compatible con responsabilidades de cuidado.',
        },
      };
      await post(otraFicha, nueva).expect(409);
      await post(fichaId, {
        ...nueva,
        revisionDe: { ...nueva.revisionDe, objecionId: randomUUID() },
      }).expect(409);
      const revision = (await post(fichaId, nueva).expect(201)).body.data.id as string;
      expect((await post(fichaId, nueva).expect(201)).body.data.id).toBe(revision);
      await post(fichaId, { ...nueva, titulo: 'Cambio con el mismo recibo' }).expect(409);
      const lectura = await api.get(`/api/v1/fichas/${fichaId}/diseno`).expect(200);
      expect(
        lectura.body.data.alternativas.find((a: { id: string }) => a.id === original),
      ).toMatchObject({ titulo: v.titulo, funcionamiento: v.funcionamiento });
      expect(
        lectura.body.data.alternativas.find((a: { id: string }) => a.id === revision),
      ).toMatchObject({ detalle: { costo: 0 }, revisionDe: nueva.revisionDe });
      expect(JSON.stringify(lectura.body)).not.toContain('idLocal');
      await getDb().execute(
        sql`update ficha_argumentos set retirada_en=now(),texto='',firma='',fuente_ids='[]'::jsonb where id=${objecionId}::uuid`,
      );
      const retirada = await api.get(`/api/v1/fichas/${fichaId}/diseno`).expect(200);
      expect(
        retirada.body.data.alternativas.find((a: { id: string }) => a.id === revision),
      ).toMatchObject({ revisionPendiente: true, revisionDe: { motivo: '' } });
      expect(JSON.stringify(retirada.body)).not.toContain(nueva.revisionDe.motivo);
      await post(fichaId, { ...nueva, idLocal: randomUUID() }).expect(409);
    });
  },
);
