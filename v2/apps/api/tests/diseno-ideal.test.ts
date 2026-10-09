import { randomUUID } from 'node:crypto';
import { getDb, sql } from '@v2/db';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Diseños, respuestas y pruebas: permisos reales',
  () => {
    const r = supertest(createApp());
    const usuariosFixture: number[] = [];
    let cookie = '';
    let otra = '';
    let ficha = '';
    let frase = '';
    let alternativa = '';
    let prueba = '';
    const post = (path: string, body: object, c = cookie) =>
      r
        .post('/api/v1/fichas' + path)
        .set('Cookie', c)
        .set('X-CSRF-Token', 'diseno')
        .send(body);
    afterAll(async () => {
      await limpiarFixturesIdeales(getDb(), usuariosFixture);
    });
    beforeAll(async () => {
      const marca = randomUUID();
      const users = await getDb().execute<{ id: number }>(
        sql`insert into users(username,email,name,password_hash,email_verified) values(${marca},${marca + '@test.local'},'Diseño','no-login',true),(${marca + 'b'},${marca + 'b@test.local'},'Revisión','no-login',true) returning id`,
      );
      usuariosFixture.push(...users.rows.map((u) => u.id));
      const sesion = (id: number) =>
        `eihg_access=${signAccessToken({ sub: id, username: 'test', email: 'test@test.local' })}; eihg_csrf=diseno`;
      cookie = sesion(users.rows[0]!.id);
      otra = sesion(users.rows[1]!.id);
      const f = await post('', {
        idLocal: randomUUID(),
        aceptaPublicar: true,
        contenido: {
          titulo: 'Aprender sin perder nuestros vínculos',
          territorioId: null,
          temas: ['educación'],
          situacion: 'La distancia dificulta seguir aprendiendo.',
          futuro: 'Aprendemos cerca y compartimos saberes.',
          proximaTarea: 'Entender tiempos y necesidades.',
          vinculos: [],
          condiciones: ['Tiempo para aprender'],
        },
      }).expect(201);
      ficha = f.body.data.id as string;
    });
    it('las afirmaciones se proponen con cuenta y conservan su recibo', async () => {
      const v = {
        idLocal: randomUUID(),
        texto: 'Aprender cerca debe permitir también cuidar a quienes queremos.',
      };
      await r.post(`/api/v1/fichas/${ficha}/afirmaciones`).send(v).expect(403);
      const a = await post(`/${ficha}/afirmaciones`, v).expect(201);
      frase = a.body.data.id as string;
      expect((await post(`/${ficha}/afirmaciones`, v).expect(201)).body.data.id).toBe(frase);
      await post(`/${ficha}/afirmaciones`, {
        ...v,
        texto: 'Otra condición con el mismo identificador.',
      }).expect(409);
    });
    it('ver, pasar y no responder son estados distintos; las respuestas propias quedan privadas', async () => {
      await post(`/afirmaciones/${frase}/exposicion`, {}).expect(200);
      const visible = await r
        .get(`/api/v1/fichas/${ficha}/diseno`)
        .set('Cookie', cookie)
        .expect(200);
      expect(visible.body.data.afirmaciones[0]).toMatchObject({
        miExpuesta: true,
        miRespuesta: null,
        respuestas: 0,
      });
      await post(`/afirmaciones/${frase}/respuesta`, { valor: 'paso' }).expect(200);
      const publico = await r.get(`/api/v1/fichas/${ficha}/diseno`).expect(200);
      expect(publico.body.data.afirmaciones[0]).toMatchObject({
        miExpuesta: false,
        miRespuesta: null,
        respuestas: 1,
        acuerdo: null,
        paso: null,
      });
      await post(`/afirmaciones/${frase}/respuesta`, { valor: 'acuerdo' }).expect(200);
      const mio = await r.get(`/api/v1/fichas/${ficha}/diseno`).set('Cookie', cookie);
      expect(mio.body.data.afirmaciones[0].miRespuesta).toBe('acuerdo');
      expect(mio.body.data.analisisOpiniones.estado).toBe('insuficiente');
    });
    it('alternativas y propuesta de prueba son recuperables y no prometen una ejecución', async () => {
      const v = {
        idLocal: randomUUID(),
        titulo: 'Aula abierta cerca de casa',
        funcionamiento: 'Compartimos dos encuentros por semana en una biblioteca comunitaria.',
        resultado: 'Aprender sin viajes largos y sostener el cuidado.',
        dependencias: 'Una biblioteca y un equipo voluntario.',
        presupuesto: 'A estimar con el equipo.',
        prueba: 'Cuatro encuentros con devolución de quienes participan.',
        criterioPausa: 'Pausar si el espacio no es accesible.',
      };
      alternativa = (await post(`/${ficha}/alternativas`, v).expect(201)).body.data.id as string;
      expect((await post(`/${ficha}/alternativas`, v).expect(201)).body.data.id).toBe(alternativa);
      await post(`/${ficha}/alternativas`, { ...v, titulo: 'Un título diferente' }).expect(409);
      const p = {
        idLocal: randomUUID(),
        alternativaId: alternativa,
        titulo: 'Primer encuentro abierto',
        plazo: '2099-12-20',
        alcance: 'Una prueba pequeña para aprender juntos.',
      };
      prueba = (await post('/pruebas', p).expect(201)).body.data.id as string;
      expect((await post('/pruebas', p).expect(201)).body.data.id).toBe(prueba);
      await post('/pruebas', { ...p, titulo: 'Otra prueba con el mismo envío' }).expect(409);
    });
    it('aceptar exige firma y revisar exige una persona diferente; los reintentos no duplican historia', async () => {
      const paso = (revision: number, estado: string) => ({
        idLocal: randomUUID(),
        revision,
        estado,
        observacion: 'Observación pública del equipo para aprender de esta prueba.',
        evidencia: [],
      });
      await post(`/pruebas/${prueba}/estado`, paso(1, 'aceptada')).expect(409);
      await post(
        `/pruebas/${prueba}/estado`,
        { ...paso(1, 'aceptada'), firma: 'Equipo que acepta' },
        otra,
      ).expect(403);
      const aceptar = { ...paso(1, 'aceptada'), firma: 'Equipo que acepta' };
      await post(`/pruebas/${prueba}/estado`, aceptar).expect(200);
      await post(`/pruebas/${prueba}/estado`, aceptar).expect(200);
      await post(`/pruebas/${prueba}/estado`, paso(1, 'en_curso')).expect(409);
      await post(`/pruebas/${prueba}/estado`, paso(2, 'en_curso')).expect(200);
      await post(`/pruebas/${prueba}/estado`, paso(3, 'implementada')).expect(200);
      await post(`/pruebas/${prueba}/estado`, paso(4, 'resultado_observado')).expect(200);
      await post(`/pruebas/${prueba}/estado`, paso(5, 'resultado_revisado')).expect(403);
      await post(`/pruebas/${prueba}/estado`, paso(5, 'resultado_revisado'), otra).expect(200);
      const d = (await r.get(`/api/v1/fichas/${ficha}/diseno`).expect(200)).body.data;
      expect(d.pruebas[0]).toMatchObject({
        estado: 'resultado_revisado',
        revision: 6,
        responsableNombre: 'Equipo que acepta',
      });
      expect(d.pruebas[0].eventos).toHaveLength(5);
      expect(JSON.stringify(d)).not.toContain('autor_id');
    });
    it('retirar una afirmación bloquea nuevos votos y desaparece de la lectura', async () => {
      await r
        .delete(`/api/v1/fichas/afirmaciones/${frase}`)
        .set('Cookie', otra)
        .set('X-CSRF-Token', 'diseno')
        .expect(403);
      await r
        .delete(`/api/v1/fichas/afirmaciones/${frase}`)
        .set('Cookie', cookie)
        .set('X-CSRF-Token', 'diseno')
        .expect(200);
      await post(`/afirmaciones/${frase}/exposicion`, {}).expect(404);
      await post(`/afirmaciones/${frase}/respuesta`, { valor: 'acuerdo' }).expect(404);
      expect((await r.get(`/api/v1/fichas/${ficha}/diseno`)).body.data.afirmaciones).toHaveLength(
        0,
      );
    });
  },
);
