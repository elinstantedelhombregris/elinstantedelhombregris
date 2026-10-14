import { randomUUID } from 'node:crypto';
import { getDb, sql } from '@v2/db';
import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

const proceso = {
  pregunta: 'Cómo conseguir turnos sin perder la mañana',
  ambito: 'Acceso cercano y sin exclusión digital',
  convocatoria: 'Invitación presencial y digital abierta',
  facilitacion: 'Equipo de prueba',
  inicio: '2020-01-01',
  cierre: '2099-12-31',
  reglas: 'Discutir razones sin publicar datos personales',
  metodoCierre: 'Preparar una síntesis que puedan revisar participantes',
  moderacion: 'Retirar datos personales y agresiones con motivo público',
  apelacion: 'Solicitar revisión al equipo por el canal acordado',
};
const contenido = {
  titulo: 'Turnos cerca de casa',
  territorioId: null,
  temas: [],
  situacion: '',
  futuro: 'Acceder sin perder la jornada de trabajo o cuidados',
  proximaTarea: 'Relevar tiempos y canales de acceso',
  vinculos: [],
  proceso,
};
const fuenteId = randomUUID();
const fuente = {
  id: fuenteId,
  titulo: 'Espera relevada',
  institucion: 'Equipo local',
  url: 'https://example.org/datos',
  referencia: '2026-10-01',
  obtenida: '2026-10-02',
  unidad: 'minutos',
  universo: 'Consultas del período',
  territorioId: null,
  metodo: 'Registro anónimo de tiempos',
  licencia: 'CC BY 4.0',
  frecuencia: 'Mensual',
  limites: 'No representa otros horarios',
  estado: 'disponible',
  valor: 0,
};
const objetivo = {
  id: randomUUID(),
  titulo: 'Acceso oportuno',
  resultado: 'Conseguir turnos con canales accesibles',
  horizonte: '2027-03-01',
  territorios: [],
  ambito: 'Quienes solicitan atención',
  indicador: 'Tiempo de espera',
  unidad: 'minutos',
  lineaBase: 0,
  fechaBase: '2026-10-01',
  meta: 0,
  tareaPendiente: '',
  fuenteIds: [fuenteId],
  metodo: 'Medir el mismo universo y horario',
  escala: 'municipal',
  institucionPropuesta: '',
  competencia: 'por_validar',
  fuenteCompetencia: null,
  principios: '',
  gravedad: '',
  desigualdad: '',
  viabilidad: '',
};

describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Evidencia, conversación y visión entre fichas',
  () => {
    const r = supertest(createApp());
    const usuarios: number[] = [];
    let cookie = '',
      otra = '',
      ficha = '',
      destino = '';
    const post = (path: string, body: object, c = cookie) =>
      r
        .post('/api/v1/fichas' + path)
        .set('Cookie', c)
        .set('X-CSRF-Token', 'deliberar')
        .send(body);
    const put = (revisionEsperada: number, cuerpo: object, c = cookie) =>
      r
        .put(`/api/v1/fichas/${ficha}`)
        .set('Cookie', c)
        .set('X-CSRF-Token', 'deliberar')
        .send({ revisionEsperada, contenido: cuerpo });
    const argumento = (
      texto = 'Mantengamos un canal presencial para evitar exclusión digital.',
    ) => ({
      idLocal: randomUUID(),
      tipo: 'argumento',
      texto,
      firma: 'Participante de prueba',
      respondeA: null,
      alternativaId: null,
      fuenteIds: [],
    });
    beforeAll(async () => {
      const marca = randomUUID();
      const u = await getDb().execute<{ id: number }>(
        sql`insert into users(username,email,name,password_hash,email_verified) values(${marca},${marca + '@test.local'},'Equipo','no-login',true),(${marca + 'b'},${marca + 'b@test.local'},'Participante','no-login',true) returning id`,
      );
      usuarios.push(...u.rows.map((fila) => fila.id));
      const a = u.rows[0],
        b = u.rows[1];
      if (!a || !b) throw new Error('Faltan usuarios de prueba');
      const sesion = (id: number) =>
        `eihg_access=${signAccessToken({ sub: id, username: 'test', email: 'test@test.local' })}; eihg_csrf=deliberar`;
      cookie = sesion(a.id);
      otra = sesion(b.id);
      ficha = (
        await post('', { contenido, idLocal: randomUUID(), aceptaPublicar: true }).expect(201)
      ).body.data.id as string;
      destino = (
        await post(
          '',
          {
            contenido: { ...contenido, titulo: 'Viajar para llegar a tiempo' },
            idLocal: randomUUID(),
            aceptaPublicar: true,
          },
          otra,
        ).expect(201)
      ).body.data.id as string;
    });
    afterAll(async () => {
      await limpiarFixturesIdeales(getDb(), usuarios);
    });
    it('publica evidencia con cero y evita sobrescribir revisiones ajenas', async () => {
      const actualizado = { ...contenido, cuaderno: { fuentes: [fuente], objetivos: [objetivo] } };
      await put(1, actualizado, otra).expect(403);
      await put(1, actualizado).expect(200);
      await put(1, { ...actualizado, titulo: 'Cambio concurrente' }).expect(409);
      const lectura = await r.get(`/api/v1/fichas/${ficha}`).expect(200);
      expect(lectura.body.data.contenido.cuaderno.fuentes[0].valor).toBe(0);
      await put(2, { ...actualizado, cuaderno: { fuentes: [], objetivos: [objetivo] } }).expect(
        400,
      );
      await put(2, {
        ...actualizado,
        cuaderno: { fuentes: [{ ...fuente, territorioId: 2147483647 }], objetivos: [objetivo] },
      }).expect(400);
    });
    it('valida referencias, permisos y reintentos sin duplicar intervenciones', async () => {
      const v = argumento();
      await r.post(`/api/v1/fichas/${ficha}/argumentos`).send(v).expect(403);
      const id = (await post(`/${ficha}/argumentos`, v, otra).expect(201)).body.data.id as string;
      expect((await post(`/${ficha}/argumentos`, v, otra).expect(201)).body.data.id).toBe(id);
      await post(
        `/${ficha}/argumentos`,
        { ...v, texto: 'Otra intervención con la misma clave.' },
        otra,
      ).expect(409);
      await post(`/${destino}/argumentos`, {
        ...argumento(),
        tipo: 'respuesta',
        respondeA: id,
      }).expect(409);
      await post(`/${ficha}/argumentos`, { ...argumento(), fuenteIds: [randomUUID()] }).expect(409);
      await post(`/${ficha}/argumentos`, {
        ...argumento(),
        tipo: 'evidencia',
        fuenteIds: [fuenteId],
      }).expect(201);
      await post(`/${ficha}/argumentos`, {
        ...argumento(),
        tipo: 'respuesta',
        respondeA: id,
      }).expect(201);
      const lectura = (await r.get(`/api/v1/fichas/${ficha}/argumentos`).expect(200)).body.data;
      expect(lectura).toMatchObject({ total: 3, participantes: 2, completa: true });
      expect(
        lectura.argumentos.every(
          (a: { puedoRetirar: boolean; esMio: boolean }) => !a.puedoRetirar && !a.esMio,
        ),
      ).toBe(true);
      expect(JSON.stringify(lectura)).not.toMatch(/autorId|autor_id|huella|moderadorId/);
      await r.get(`/api/v1/fichas/${ficha}/argumentos?despues=invalid`).expect(400);
    });
    it('una intervención retirada oculta la síntesis que la cita, también en la visión conjunta', async () => {
      const v = argumento(
        'Una objeción que debe poder retirarse sin seguir expuesta en una síntesis.',
      );
      const id = (await post(`/${ficha}/argumentos`, v, otra).expect(201)).body.data.id as string;
      const actual = (await r.get(`/api/v1/fichas/${ficha}`)).body.data;
      const sintesis = {
        estado: 'publicada',
        firma: 'Equipo facilitador',
        alcance: 'Acuerdo limitado al canal de acceso',
        participacion: 'Dos cuentas participaron de la conversación',
        ausencias: 'Faltan personas que no usan la web',
        acuerdos: [{ texto: v.texto, argumentoIds: [id] }],
        disensos: 'Queda pendiente evaluar los horarios',
        proximaRevision: '2027-01-01',
      };
      await put(actual.revision, { ...actual.contenido, sintesis }).expect(200);
      await post(`/argumentos/${id}/retiro`, { motivo: 'autoria' }).expect(403);
      await post(`/argumentos/${id}/retiro`, { motivo: 'datos_personales' }, otra).expect(403);
      await post(`/argumentos/${id}/retiro`, { motivo: 'autoria' }, otra).expect(200);
      await post(`/argumentos/${id}/retiro`, { motivo: 'autoria' }, otra).expect(200);
      await post(`/${ficha}/argumentos`, v, otra).expect(201);
      const publica = (await r.get(`/api/v1/fichas/${ficha}`).expect(200)).body.data;
      expect(publica.sintesisRevisar).toBe(true);
      expect(publica.contenido.sintesis).toBeUndefined();
      expect(JSON.stringify(publica)).not.toContain(v.texto);
      const conversacion = (await r.get(`/api/v1/fichas/${ficha}/argumentos`).expect(200)).body
        .data;
      expect(conversacion.argumentos.find((a: { id: string }) => a.id === id)).toMatchObject({
        retirado: true,
        texto: null,
        firma: null,
        fuenteIds: [],
      });
      const vision = (await r.get('/api/v1/fichas/vision').expect(200)).body.data;
      expect(vision.fichas.find((f: { id: string }) => f.id === ficha)).toMatchObject({
        sintesis: 'requiere_revision',
        objetivos: [{ titulo: 'Acceso oportuno' }],
      });
      expect(vision.objetivos).toBeGreaterThanOrEqual(1);
      await put(publica.revision, { ...publica.contenido, sintesis }).expect(400);
      await put(publica.revision, publica.contenido).expect(200);
      expect((await r.get(`/api/v1/fichas/${ficha}`)).body.data.historial[0].campos).toContain(
        'sintesis',
      );
    });
    it('permite moderación al equipo con motivo visible y bloquea intervenciones fuera de fecha', async () => {
      const id = (await post(`/${ficha}/argumentos`, argumento(), otra).expect(201)).body.data
        .id as string;
      await post(`/argumentos/${id}/retiro`, { motivo: 'fuera_de_alcance' }).expect(200);
      const actual = (await r.get(`/api/v1/fichas/${ficha}`)).body.data;
      await put(actual.revision, {
        ...actual.contenido,
        proceso: { ...proceso, cierre: '2020-01-02' },
      }).expect(200);
      await post(`/${ficha}/argumentos`, argumento()).expect(409);
      expect(
        (await r.get(`/api/v1/fichas/${ficha}/argumentos`)).body.data.argumentos.find(
          (a: { id: string }) => a.id === id,
        ),
      ).toMatchObject({ motivo: 'fuera_de_alcance', texto: null });
    });
    it('conecta fichas con dirección, exige fuente para causalidad y permite retirar solo al editor de origen', async () => {
      const v = {
        idLocal: randomUUID(),
        destinoId: destino,
        tipo: 'depende',
        justificacion: 'Llegar a un turno depende de los horarios del transporte.',
        fuente: null,
      };
      await post(`/${ficha}/relaciones`, v, otra).expect(403);
      await post(`/${ficha}/relaciones`, { ...v, destinoId: ficha }).expect(409);
      await post(`/${ficha}/relaciones`, { ...v, tipo: 'hipotesis_causal' }).expect(400);
      const id = (await post(`/${ficha}/relaciones`, v).expect(201)).body.data.id as string;
      expect((await post(`/${ficha}/relaciones`, v).expect(201)).body.data.id).toBe(id);
      const listado = await r.get(`/api/v1/fichas/${destino}/relaciones`).expect(200);
      expect(listado.headers['cache-control']).toBe('no-store');
      expect(listado.body.data.relaciones[0]).toMatchObject({
        id,
        origenId: ficha,
        destinoId: destino,
        tipo: 'depende',
        puedoRetirar: false,
      });
      const retirar = (c: string) =>
        r
          .delete(`/api/v1/fichas/relaciones/${id}`)
          .set('Cookie', c)
          .set('X-CSRF-Token', 'deliberar');
      await retirar(otra).expect(403);
      await retirar(cookie).expect(200);
      expect(
        (await r.get(`/api/v1/fichas/${destino}/relaciones`)).body.data.relaciones,
      ).toHaveLength(0);
      await post(`/${ficha}/relaciones`, v).expect(409);
    });
    it('la visión admite cursor y no convierte parámetros inválidos en una lectura nacional', async () => {
      await r.get('/api/v1/fichas/vision?territorioId=oops').expect(400);
      const vacia = await r
        .get('/api/v1/fichas/vision?despues=ffffffff-ffff-4fff-bfff-ffffffffffff')
        .expect(200);
      expect(vacia.body.data.fichas).toEqual([]);
      expect(vacia.body.data.total).toBeGreaterThanOrEqual(2);
    });
    it('pagina conversaciones y visión sin confundir páginas con totales', async () => {
      const uid = usuarios[0];
      if (!uid) throw new Error('Falta la cuenta de prueba');
      const id = (
        await post('', { contenido, idLocal: randomUUID(), aceptaPublicar: true }).expect(201)
      ).body.data.id as string;
      await getDb().execute(
        sql`insert into ficha_argumentos(ficha_id,autor_id,id_local,tipo,texto,firma,fuente_ids,huella,creada_en) select ${id}::uuid,${uid},gen_random_uuid(),'argumento','Intervención de prueba para recorrer páginas','Equipo de prueba','[]'::jsonb,'fixture',now()+n*interval '1 millisecond' from generate_series(1,205) n`,
      );
      const primera = (await r.get(`/api/v1/fichas/${id}/argumentos`).expect(200)).body.data;
      expect(primera).toMatchObject({ completa: false, total: 205, participantes: 1 });
      expect(primera.argumentos).toHaveLength(200);
      const cursor: unknown = primera.argumentos[199]?.id;
      if (typeof cursor !== 'string') throw new Error('Falta el cursor');
      const segunda = (await r.get(`/api/v1/fichas/${id}/argumentos?despues=${cursor}`).expect(200))
        .body.data;
      expect(segunda).toMatchObject({ completa: true, total: 205 });
      expect(segunda.argumentos).toHaveLength(5);
      const ids = [...primera.argumentos, ...segunda.argumentos].map((a: { id: string }) => a.id);
      expect(new Set(ids).size).toBe(205);
      await getDb().execute(
        sql`insert into fichas_futuro(creador_id,id_local,contenido) select ${uid},gen_random_uuid(),${JSON.stringify(contenido)}::jsonb from generate_series(1,21)`,
      );
      const vision = (await r.get('/api/v1/fichas/vision').expect(200)).body.data;
      expect(vision.fichas).toHaveLength(20);
      const siguiente: unknown = vision.siguiente;
      if (typeof siguiente !== 'string') throw new Error('Falta página siguiente');
      const resto = (await r.get(`/api/v1/fichas/vision?despues=${siguiente}`).expect(200)).body
        .data;
      expect(resto.total).toBe(vision.total);
      expect(
        new Set([...vision.fichas, ...resto.fichas].map((f: { id: string }) => f.id)).size,
      ).toBe(vision.total);
    });
  },
);
