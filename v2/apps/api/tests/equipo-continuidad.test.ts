import { randomUUID } from 'node:crypto';
import { getDb, sql } from '@v2/db';
import supertest from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { signAccessToken } from '../src/features/auth/tokens';
import { hashPassword } from '../src/features/auth/password';
describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])('Equipo, revisión y cuenta', () => {
  const r = supertest(createApp());
  let cuenta = '';
  let otra = '';
  let uid = 0;
  let campana = '';
  let ficha = '';
  let invitacion = '';
  let codigo = '';
  let revision = '';
  const password = 'una-frase-larga-para-pruebas-ideal';
  const enviar = (
    method: 'post' | 'put' | 'delete',
    url: string,
    body: object = {},
    cookie = cuenta,
  ) => r[method](url).set('Cookie', cookie).set('X-CSRF-Token', 'equipo').send(body);
  beforeAll(async () => {
    const m = randomUUID(),
      h = await hashPassword(password);
    const us = await getDb().execute<{ id: number }>(
      sql`insert into users(username,email,name,password_hash,email_verified) values(${m},${m + '@test.local'},'Cuenta',${h},true),(${m + 'b'},${m + 'b@test.local'},'Editor',${h},true) returning id`,
    );
    uid = us.rows[0]!.id;
    const cookie = (id: number) =>
      `eihg_access=${signAccessToken({ sub: id, username: 'equipo', email: 'equipo@test.local' })}; eihg_csrf=equipo`;
    cuenta = cookie(uid);
    otra = cookie(us.rows[1]!.id);
    const f = await enviar('post', '/api/v1/fichas', {
      idLocal: randomUUID(),
      aceptaPublicar: true,
      contenido: {
        titulo: 'El tiempo de aprender juntos',
        territorioId: null,
        temas: [],
        situacion: '',
        futuro: 'Una vida con tiempo para aprender.',
        proximaTarea: '',
        vinculos: [],
      },
    }).expect(201);
    ficha = f.body.data.id as string;
    const contrato = {
      titulo: 'Conversación de prueba ideal',
      pregunta: '¿Qué vida queremos poder vivir?',
      proposito: 'Escuchar experiencias para imaginar condiciones compartidas.',
      territorios: [],
      temas: ['educación'],
      participantes: 'Quienes quieran participar en esta prueba.',
      canales: ['web'],
      responsable: 'Equipo de pruebas',
      devolucion: 'Una lectura pública revisable por quienes participaron.',
      fechaDevolucion: '2099-12-20',
      efecto: 'Ejercicio sin compromiso institucional.',
      fases: [
        { nombre: 'Imaginar', salida: 'Relatos revisados por sus autores.', fecha: '2099-12-01' },
      ],
    };
    campana = (
      await enviar('post', '/api/v1/campanas', { idLocal: randomUUID(), contrato }).expect(201)
    ).body.data.id as string;
    await enviar('post', `/api/v1/campanas/${campana}/estado`, {
      revision: 1,
      estado: 'abierta',
      motivo: 'Abrimos para probar el recorrido.',
    }).expect(200);
    await enviar('post', '/api/v1/contribuciones', {
      senal: {
        contrato: 'basta-senal/v1',
        idLocal: randomUUID(),
        tipo: 'sueño',
        texto: 'En el país que imagino podría seguir aprendiendo cerca de casa.',
        casa: 'no',
        cedeLicencia: true,
      },
      campanaId: campana,
      edicion: 2,
      fragmentos: [],
      interpretacionConfirmada: true,
      aceptaPublicar: true,
    }).expect(201);
  });
  it('la invitación solo la crea y consulta el propietario; el código no se publica', async () => {
    await enviar(
      'post',
      '/api/v1/equipo/invitaciones',
      { tipo: 'ficha', objeto: ficha, rol: 'editor' },
      otra,
    ).expect(403);
    const i = await enviar('post', '/api/v1/equipo/invitaciones', {
      tipo: 'ficha',
      objeto: ficha,
      rol: 'editor',
    }).expect(201);
    codigo = i.body.data.codigo as string;
    invitacion = i.body.data.id as string;
    const lista = await r
      .get(`/api/v1/equipo/invitaciones?tipo=ficha&objeto=${ficha}`)
      .set('Cookie', cuenta)
      .expect(200);
    expect(JSON.stringify(lista.body)).not.toContain(codigo);
    await r
      .get(`/api/v1/equipo/invitaciones?tipo=ficha&objeto=${ficha}`)
      .set('Cookie', otra)
      .expect(403);
  });
  it('aceptar habilita edición con CAS; revocar retira el permiso en el UPDATE', async () => {
    await enviar('post', '/api/v1/equipo/invitaciones/leer', { codigo }, otra).expect(200);
    await enviar('post', '/api/v1/equipo/invitaciones/aceptar', { codigo }, otra).expect(200);
    await enviar('post', '/api/v1/equipo/invitaciones/aceptar', { codigo }, otra).expect(200);
    const f = (await r.get(`/api/v1/fichas/${ficha}`).set('Cookie', otra)).body.data;
    expect(f.puedoEditar).toBe(true);
    await enviar(
      'put',
      `/api/v1/fichas/${ficha}`,
      {
        revisionEsperada: f.revision,
        contenido: { ...f.contenido, futuro: 'Aprendemos sin perder el tiempo de cuidar.' },
      },
      otra,
    ).expect(200);
    await enviar('delete', '/api/v1/equipo/invitaciones/' + invitacion, {}, otra).expect(403);
    await enviar('delete', '/api/v1/equipo/invitaciones/' + invitacion).expect(200);
    await enviar(
      'put',
      `/api/v1/fichas/${ficha}`,
      { revisionEsperada: 2, contenido: f.contenido },
      otra,
    ).expect(403);
  });
  it('una revisión requiere participación asociada y la respuesta corresponde al responsable', async () => {
    const v = {
      idLocal: randomUUID(),
      texto: 'Falta señalar que aprender cerca también necesita horarios compatibles.',
      aceptaPublicar: true,
    };
    await enviar('post', `/api/v1/equipo/campanas/${campana}/revisiones`, v, otra).expect(403);
    revision = (
      await enviar('post', `/api/v1/equipo/campanas/${campana}/revisiones`, v).expect(201)
    ).body.data.id as string;
    expect(
      (await enviar('post', `/api/v1/equipo/campanas/${campana}/revisiones`, v).expect(201)).body
        .data.id,
    ).toBe(revision);
    await enviar(
      'post',
      `/api/v1/equipo/campanas/${campana}/revisiones/${revision}/respuesta`,
      { texto: 'Incorporamos esta condición para comparar diseños.' },
      otra,
    ).expect(403);
    await enviar('post', `/api/v1/equipo/campanas/${campana}/revisiones/${revision}/respuesta`, {
      texto: 'Incorporamos esta condición para comparar diseños.',
    }).expect(200);
    const lectura = await r.get(`/api/v1/equipo/campanas/${campana}/revisiones`).expect(200);
    expect(lectura.body.data[0].respuesta).toContain('Incorporamos');
    expect(JSON.stringify(lectura.body)).not.toContain('autorId');
  });
  it('silenciar respeta seguimientos y evita nuevos avisos', async () => {
    await enviar('post', '/api/v1/mi-espacio/seguimientos', {
      tipo: 'campana',
      objeto: campana,
    }).expect(201);
    expect(
      (await r.get('/api/v1/mi-espacio/preferencias').set('Cookie', cuenta).expect(200)).body.data
        .avisos,
    ).toBe(true);
    await enviar('put', '/api/v1/mi-espacio/preferencias', { avisos: false }).expect(200);
    await enviar('post', `/api/v1/campanas/${campana}/estado`, {
      revision: 2,
      estado: 'pausada',
      motivo: 'Pausamos esta prueba de avisos.',
    }).expect(200);
    expect((await r.get('/api/v1/mi-espacio/avisos').set('Cookie', cuenta)).body.data).toHaveLength(
      0,
    );
  });
  it('cerrar verifica contraseña, limpia identidad privada y revoca incluso el acceso anterior', async () => {
    await enviar('post', '/api/v1/mi-espacio/cerrar-cuenta', {
      password: 'equivocada',
      confirma: 'CERRAR MI CUENTA',
    }).expect(403);
    await enviar('post', `/api/v1/campanas/${campana}/estado`, {
      revision: 3,
      estado: 'abierta',
      motivo: 'Abrimos para comprobar el cierre responsable.',
    }).expect(200);
    await enviar('post', '/api/v1/mi-espacio/cerrar-cuenta', {
      password,
      confirma: 'CERRAR MI CUENTA',
    }).expect(200);
    await r.get('/api/v1/mi-espacio/mis-datos').set('Cookie', cuenta).expect(401);
    await r.get('/api/auth/me').set('Cookie', cuenta).expect(401);
    const [u] = (
      await getDb().execute<{ name: string; is_active: boolean }>(
        sql`select name,is_active from users where id=${uid}`,
      )
    ).rows;
    expect(u).toMatchObject({ name: 'Cuenta cerrada', is_active: false });
    const publico = await r.get(`/api/v1/fichas/${ficha}`).expect(200);
    expect(publico.body.data.contenido.titulo).toContain('aprender');
  });
});
