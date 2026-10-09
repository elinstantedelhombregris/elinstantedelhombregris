import { randomUUID } from 'node:crypto';

import { getDb, sql } from '@v2/db';
import { USO_DATOS_CONTRATO_ANTERIOR, METODO_LECTURA_CONTRATO_ANTERIOR } from '@v2/shared';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

import type {
  CampanaPublica,
  ContratoCampana,
  EspacioPersonal,
  DevolucionCampanaInput,
} from '@v2/shared';

const habilitada = Boolean(process.env.DATABASE_URL_DESCARTABLE);
describe.skipIf(!habilitada)(
  'Diseñar juntos: campañas, publicación y continuidad con Postgres',
  () => {
    const app = createApp();
    const request = supertest(app);
    const marca = randomUUID();
    let usuario = 0;
    let otro = 0;
    const usuariosFixture: number[] = [];
    const idLocalesFixture = new Set<string>();
    let cookie = '';
    let cookieAjena = '';
    let invitado = '';
    let csrf = '';
    let campana = '';
    let revision = 1;
    let aporte = '';
    let aporteRevision = '';
    let seguimiento = '';
    let analisis = '';
    const devolucionId = randomUUID();
    let devolucionCuerpo: DevolucionCampanaInput;
    const contrato: ContratoCampana = {
      titulo: 'La vida que queremos poder vivir',
      pregunta: '¿Qué sería posible en nuestra comunidad ideal?',
      proposito:
        'Imaginar juntos y encontrar condiciones de vida que merezcan un diseño compartido.',
      territorios: [],
      temas: ['educación', 'cuidados'],
      participantes: 'Todas las personas que quieran imaginar con otros.',
      canales: ['web', 'encuentro'],
      responsable: 'Equipo de prueba autorizado',
      devolucion: 'Una lectura pública para revisar lo que entendimos y lo que sigue abierto.',
      fechaDevolucion: '2099-12-20',
      efecto: 'Futuros en elaboración; todavía sin compromiso institucional.',
      usoDatos:
        'Leeremos aportes autorizados para formular condiciones de vida, respetando sus permisos.',
      metodoLectura:
        'El equipo contrastará las fuentes y publicará diferencias, ausencias y una lectura corregible.',
      institucion: '',
      fases: [
        {
          nombre: 'Imaginar',
          salida: 'Relatos revisados por quienes participaron.',
          fecha: '2099-12-01',
        },
      ],
    };
    const cuerpo = (idLocal = randomUUID()) => {
      idLocalesFixture.add(idLocal);
      return {
        senal: {
          contrato: 'basta-senal/v1',
          idLocal,
          tipo: 'sueño',
          texto: 'Podría aprender cerca de mi familia sin renunciar a mis oportunidades.',
          cedeLicencia: true,
          casa: 'no',
        },
        campanaId: campana,
        edicion: revision,
        fragmentos: [
          { pregunta: '¿Qué sería posible?', respuesta: 'Aprender cerca de quienes quiero.' },
        ],
        interpretacionConfirmada: true,
        aceptaPublicar: true,
      };
    };
    const conCuenta = (metodo: 'post' | 'put' | 'delete' | 'patch', ruta: string, ajena = false) =>
      request[metodo](ruta)
        .set('Cookie', ajena ? cookieAjena : cookie)
        .set('X-CSRF-Token', 'ideal-prueba');
    beforeAll(async () => {
      const r = await getDb().execute<{ id: number }>(
        sql`insert into users(username,email,name,password_hash,email_verified) values (${marca},${marca + '@test.local'},'Prueba','no-login',true),(${marca + 'b'},${marca + 'b@test.local'},'Otra','no-login',true) returning id`,
      );
      usuariosFixture.push(...r.rows.map((u) => u.id));
      usuario = r.rows[0]!.id;
      otro = r.rows[1]!.id;
      const sesion = (id: number) =>
        `eihg_access=${signAccessToken({ sub: id, username: 'prueba', email: 'prueba@test.local' })}; eihg_csrf=ideal-prueba`;
      cookie = sesion(usuario);
      cookieAjena = sesion(otro);
      const context = await request.get('/api/v1/contribuciones/contexto').expect(200);
      csrf = context.body.data.csrfToken as string;
      invitado = `eihg_csrf=${csrf}`;
    });
    afterAll(async () => {
      await limpiarFixturesIdeales(getDb(), usuariosFixture, [...idLocalesFixture]);
    });
    it('la cuenta abre un borrador y nadie más puede verlo ni editarlo', async () => {
      const idLocal = randomUUID();
      const r = await conCuenta('post', '/api/v1/campanas').send({ idLocal, contrato }).expect(201);
      campana = r.body.data.id as string;
      await conCuenta('post', '/api/v1/campanas')
        .send({
          idLocal,
          contrato: { ...contrato, titulo: 'Un cambio de título antes de recuperar el recibo' },
        })
        .expect(409);
      await request.get(`/api/v1/campanas/${campana}`).expect(404);
      await request.get(`/api/v1/campanas/${campana}`).set('Cookie', cookie).expect(200);
      await conCuenta('put', `/api/v1/campanas/${campana}`, true)
        .send({ revision, contrato })
        .expect(403);
      await request.get('/api/v1/campanas?mias=1').expect(401);
      const propias = await request
        .get('/api/v1/campanas?mias=1')
        .set('Cookie', cookie)
        .expect(200);
      expect(propias.body.data.some((c: { id: string }) => c.id === campana)).toBe(true);
    });
    it('publicar exige CSRF, permiso, contrato y fecha vigente', async () => {
      await request
        .post(`/api/v1/campanas/${campana}/estado`)
        .set('Cookie', cookie)
        .send({ revision, estado: 'abierta', motivo: 'Abrimos el ejercicio para escuchar.' })
        .expect(403);
      await conCuenta('post', `/api/v1/campanas/${campana}/estado`, true)
        .send({ revision, estado: 'abierta', motivo: 'Abrimos el ejercicio para escuchar.' })
        .expect(403);
      await conCuenta('post', `/api/v1/campanas/${campana}/estado`)
        .send({ revision, estado: 'abierta', motivo: 'Abrimos el ejercicio para escuchar.' })
        .expect(200);
      revision++;
      const c = await request.get(`/api/v1/campanas/${campana}`).expect(200);
      expect((c.body.data as CampanaPublica).estado).toBe('abierta');
    });
    it('el aporte invitado tiene recibo, un reintento idéntico no duplica y uno distinto falla', async () => {
      const v = cuerpo();
      await request.post('/api/v1/contribuciones').send(v).expect(403);
      const r = await request
        .post('/api/v1/contribuciones')
        .set('Cookie', invitado)
        .set('X-CSRF-Token', csrf)
        .send(v)
        .expect(201);
      aporte = r.body.data.idPublico as string;
      await request.get(`/api/v1/contribuciones/${aporte}/privado`).expect(403);
      const actor = ((r.headers['set-cookie'] as unknown as string[]) ?? [])
        .find((c) => c.startsWith('basta_actor='))
        ?.split(';')[0];
      invitado += `; ${actor ?? ''}`;
      const retry = await request
        .post('/api/v1/contribuciones')
        .set('Cookie', invitado)
        .set('X-CSRF-Token', csrf)
        .send(v)
        .expect(201);
      expect(retry.body.data.idPublico).toBe(aporte);
      expect(retry.body.data.yaExistia).toBe(true);
      const privada = await request
        .get(`/api/v1/contribuciones/${aporte}/privado`)
        .set('Cookie', invitado)
        .expect(200);
      expect(privada.body.data.texto).toContain('mi familia');
      expect(privada.headers['cache-control']).toBe('no-store');
      await request
        .post('/api/v1/contribuciones')
        .set('Cookie', invitado)
        .set('X-CSRF-Token', csrf)
        .send({ ...v, senal: { ...v.senal, texto: 'Ahora envío algo completamente distinto.' } })
        .expect(409);
      const c = await request.get(`/api/v1/campanas/${campana}`);
      expect(c.body.data.aportes).toBe(1);
    });
    it('el envío asistido necesita revisión de su autor y un cambio de cuenta exige revisar de nuevo', async () => {
      const v = cuerpo();
      await conCuenta('post', '/api/v1/contribuciones')
        .send({ ...v, modo: 'asistido', autorConfirmo: false })
        .expect(400);
      await conCuenta('post', '/api/v1/contribuciones')
        .send({ ...v, cuentaEsperada: null })
        .expect(409);
      await conCuenta('post', '/api/v1/contribuciones')
        .send({ ...v, senal: { ...v.senal, tema: 'tema-que-no-existe' } })
        .expect(400);
    });
    it('asociar a cuenta exige control y selección, y la firma no se vuelve identidad pública', async () => {
      await conCuenta('post', '/api/v1/mi-espacio/vincular', true)
        .send({ senales: [aporte], confirmaControl: true })
        .expect(403);
      const candidatos = await request
        .get('/api/v1/mi-espacio/recuperables')
        .set('Cookie', cookie + '; ' + invitado)
        .expect(200);
      expect(candidatos.body.data.map((x: { id: string }) => x.id)).toContain(aporte);
      await request
        .post('/api/v1/mi-espacio/vincular')
        .set('Cookie', cookie + '; ' + invitado)
        .set('X-CSRF-Token', 'ideal-prueba')
        .send({ senales: [aporte], confirmaControl: true })
        .expect(200);
      await request
        .post('/api/v1/mi-espacio/vincular')
        .set('Cookie', cookie + '; ' + invitado)
        .set('X-CSRF-Token', 'ideal-prueba')
        .send({ senales: [aporte], confirmaControl: true })
        .expect(200);
      const mio = await request.get('/api/v1/mi-espacio').set('Cookie', cookie).expect(200);
      const datos = mio.body.data as EspacioPersonal;
      const propio = datos.aportes.find((a) => a.id === aporte)!;
      aporteRevision = propio.revision;
      expect(propio.texto).toContain('mi familia');
      const ajeno = await request.get('/api/v1/mi-espacio').set('Cookie', cookieAjena).expect(200);
      expect(ajeno.body.data.aportes).toHaveLength(0);
      const publico = await request.get(`/api/v1/civic/senales/${aporte}`);
      expect(JSON.stringify(publico.body)).not.toContain(marca + '@test.local');
    });
    it('la corrección verifica revisión y titularidad en la escritura', async () => {
      const cambio = {
        revision: aporteRevision,
        texto: 'Podría estudiar y cuidar, con tiempo para vivir.',
        cedeLicencia: true,
        aceptaPublicar: true,
      };
      await request
        .get(`/api/v1/contribuciones/${aporte}/privado`)
        .set('Cookie', cookieAjena)
        .expect(403);
      await conCuenta('patch', `/api/v1/contribuciones/${aporte}`, true).send(cambio).expect(403);
      await conCuenta('patch', `/api/v1/contribuciones/${aporte}`).send(cambio).expect(200);
      await conCuenta('patch', `/api/v1/contribuciones/${aporte}`).send(cambio).expect(409);
    });
    it('seguir no suma apoyo y puede deshacerse; guardar análisis no guarda texto privado', async () => {
      await conCuenta('post', '/api/v1/mi-espacio/seguimientos')
        .send({ tipo: 'campana', objeto: campana })
        .expect(201);
      await conCuenta('post', '/api/v1/mi-espacio/seguimientos')
        .send({ tipo: 'campana', objeto: campana })
        .expect(201);
      const r = await request.get('/api/v1/mi-espacio').set('Cookie', cookie);
      expect(r.body.data.seguimientos).toHaveLength(1);
      seguimiento = r.body.data.seguimientos[0].id as string;
      const guardado = await conCuenta('post', '/api/v1/mi-espacio/analisis')
        .send({ nombre: 'Nuestra pregunta', consulta: { campana }, corte: null })
        .expect(201);
      analisis = guardado.body.data.id as string;
      await conCuenta('post', '/api/v1/mi-espacio/analisis')
        .send({
          nombre: 'Privado',
          consulta: { texto: 'Lo que no autoricé publicar' },
          corte: null,
        })
        .expect(400);
    });
    it('las fases generan avisos persistidos y cerrar exige devolución', async () => {
      await conCuenta('post', `/api/v1/campanas/${campana}/estado`)
        .send({ revision, estado: 'en_devolucion', motivo: 'Vamos a devolver lo que escuchamos.' })
        .expect(200);
      revision++;
      await conCuenta('post', `/api/v1/campanas/${campana}/estado`)
        .send({ revision, estado: 'cerrada', motivo: 'Cerramos esta ronda con una devolución.' })
        .expect(409);
      devolucionCuerpo = {
        idLocal: devolucionId,
        revision,
        texto:
          'Escuchamos el deseo de aprender cerca y conservar los vínculos. El diseño sigue abierto a otras miradas.',
        limites: 'Esta ronda es de prueba. No representa a una localidad ni al país.',
        senales: [aporte],
      };
      const simultaneas = await Promise.all(
        [1, 2].map(() =>
          conCuenta('post', `/api/v1/campanas/${campana}/devoluciones`)
            .send(devolucionCuerpo)
            .expect(201),
        ),
      );
      expect(simultaneas.map((r) => r.body.data.id)).toEqual([devolucionId, devolucionId]);
      await conCuenta('post', `/api/v1/campanas/${campana}/devoluciones`)
        .send({
          ...devolucionCuerpo,
          texto: 'Otro contenido que no corresponde al mismo intento de devolución.',
        })
        .expect(409);
      await conCuenta('post', `/api/v1/campanas/${campana}/devoluciones`, true)
        .send(devolucionCuerpo)
        .expect(403);
      const cuenta = await getDb().execute<{ n: number; avisos: number }>(
        sql`select (select count(*)::int from campana_devoluciones where id=${devolucionId}::uuid) n, (select count(*)::int from eventos_civicos where user_id=${usuario} and clave=${'devolucion:' + devolucionId}) avisos`,
      );
      expect(cuenta.rows[0]).toEqual({ n: 1, avisos: 1 });
      const avisos = await request
        .get('/api/v1/mi-espacio/avisos')
        .set('Cookie', cookie)
        .expect(200);
      expect(avisos.body.data.length).toBeGreaterThan(0);
      await conCuenta(
        'post',
        `/api/v1/mi-espacio/avisos/${avisos.body.data[0].id as string}/leido`,
      ).expect(200);
      await conCuenta('post', `/api/v1/campanas/${campana}/estado`)
        .send({
          revision,
          estado: 'cerrada',
          motivo: 'La devolución está publicada y abierta a revisión.',
        })
        .expect(200);
      revision++;
      await conCuenta('post', `/api/v1/campanas/${campana}/devoluciones`)
        .send(devolucionCuerpo)
        .expect(201);
      await request
        .post('/api/v1/contribuciones')
        .set('Cookie', invitado)
        .set('X-CSRF-Token', csrf)
        .send(cuerpo())
        .expect(409);
    });
    it('editar una nueva ronda conserva el contrato publicado y permite revisar su edición', async () => {
      const nuevo = { ...contrato, titulo: 'La nueva pregunta aún en preparación' };
      await conCuenta('put', `/api/v1/campanas/${campana}`)
        .send({ revision, contrato: nuevo })
        .expect(200);
      const publico = await request.get(`/api/v1/campanas/${campana}`).expect(200);
      expect(publico.body.data.contrato.titulo).toBe(contrato.titulo);
      expect(publico.body.data.estado).toBe('pausada');
      const catalogo = await request.get('/api/v1/campanas').expect(200);
      expect(catalogo.body.data.find((c: { id: string }) => c.id === campana).contrato.titulo).toBe(
        contrato.titulo,
      );
      const historico = await request.get(`/api/v1/campanas/${campana}?edicion=2`).expect(200);
      expect(historico.body.data.contrato.titulo).toBe(contrato.titulo);
      await request.get(`/api/v1/campanas/${campana}?edicion=${revision + 1}`).expect(404);
      const propio = await request
        .get(`/api/v1/campanas/${campana}`)
        .set('Cookie', cookie)
        .expect(200);
      expect(propio.body.data.contrato.titulo).toBe(nuevo.titulo);
      await conCuenta('post', `/api/v1/campanas/${campana}/devoluciones`)
        .send(devolucionCuerpo)
        .expect(201);
    });
    it('descargar datos propios y gestionar preferencias no permite leer o retirar lo ajeno', async () => {
      await request.get('/api/v1/mi-espacio/aportes').expect(401);
      const pagina = await request
        .get('/api/v1/mi-espacio/aportes?offset=0')
        .set('Cookie', cookie)
        .expect(200);
      expect(pagina.body.data.aportes.some((a: { id: string }) => a.id === aporte)).toBe(true);
      const otraPagina = await request
        .get('/api/v1/mi-espacio/aportes?offset=0')
        .set('Cookie', cookieAjena)
        .expect(200);
      expect(otraPagina.body.data.aportes).toHaveLength(0);
      await request.get('/api/v1/mi-espacio/mis-datos').expect(401);
      const datos = await request
        .get('/api/v1/mi-espacio/mis-datos')
        .set('Cookie', cookie)
        .expect(200);
      expect(datos.body.aportes.some((a: { id: string }) => a.id === aporte)).toBe(true);
      await conCuenta('delete', `/api/v1/mi-espacio/seguimientos/${seguimiento}`).expect(200);
      await conCuenta('delete', `/api/v1/mi-espacio/analisis/${analisis}`).expect(200);
      await conCuenta('delete', `/api/v1/contribuciones/${aporte}`, true).expect(403);
      await conCuenta('delete', `/api/v1/contribuciones/${aporte}`).expect(200);
      const c = await request.get(`/api/v1/campanas/${campana}`);
      expect(c.body.data.aportes).toBe(0);
      const fuente = await request.get(`/api/v1/civic/senales/${aporte}`);
      expect(fuente.body.data.senal.texto).toBe('');
    });
    it('un contrato histórico recibe aclaraciones honestas sin reescribir su edición y recupera su reintento', async () => {
      const idLocal = randomUUID();
      const anterior: Partial<ContratoCampana> = { ...contrato };
      delete anterior.usoDatos;
      delete anterior.metodoLectura;
      delete anterior.institucion;
      const r = await getDb().execute<{ id: string }>(sql`with c as (
        insert into campanas(creador_id,id_local,slug,contrato) values (${usuario},${idLocal}::uuid,${'anterior-' + idLocal},${JSON.stringify(anterior)}::jsonb) returning *
      ), h as (insert into campana_ediciones(campana_id,revision,contrato,estado,motivo) select id,revision,contrato,estado,'Contrato anterior al nuevo formulario.' from c returning id)
      select id from c`);
      const id = r.rows[0]!.id;
      const recuperado = await conCuenta('post', '/api/v1/campanas')
        .send({ idLocal, contrato: anterior })
        .expect(201);
      expect(recuperado.body.data.id).toBe(id);
      await conCuenta('post', '/api/v1/campanas').send({ idLocal, contrato }).expect(409);
      await conCuenta('post', `/api/v1/campanas/${id}/estado`)
        .send({ revision: 1, estado: 'abierta', motivo: 'Abrimos la pregunta de prueba.' })
        .expect(200);
      const publico = await request.get(`/api/v1/campanas/${id}`).expect(200);
      expect(publico.body.data.contrato.usoDatos).toBe(USO_DATOS_CONTRATO_ANTERIOR);
      expect(publico.body.data.contrato.metodoLectura).toBe(METODO_LECTURA_CONTRATO_ANTERIOR);
      expect(publico.body.data.contrato.institucion).toBe('');
      const catalogo = await request.get('/api/v1/campanas').expect(200);
      expect(catalogo.body.data.find((c: { id: string }) => c.id === id).contrato.usoDatos).toBe(
        USO_DATOS_CONTRATO_ANTERIOR,
      );
      const almacenado = await getDb().execute<{ uso: boolean }>(
        sql`select contrato ? 'usoDatos' as uso from campana_ediciones where campana_id=${id}::uuid and revision=1`,
      );
      expect(almacenado.rows[0]?.uso).toBe(false);
      await conCuenta('post', `/api/v1/campanas/${id}/devoluciones`)
        .send({ ...devolucionCuerpo, revision: 2, senales: [] })
        .expect(409);
    });
  },
);
