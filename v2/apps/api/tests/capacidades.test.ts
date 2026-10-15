import { randomUUID } from 'node:crypto';
import { getDb, sql } from '@v2/db';
import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import { clienteHttp } from './setup/cliente-http.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

const dia = (desplazamiento: number) =>
  new Date(Date.now() + desplazamiento * 86400000).toISOString().slice(0, 10);
describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Capacidades y reservas acordadas',
  () => {
    const api = clienteHttp(createApp());
    const usuarios: number[] = [];
    let ofrece = '',
      solicita = '',
      ajeno = '',
      senalId = '',
      fichaId = '';
    const post = (ruta: string, cuerpo: object, cookie = ofrece) =>
      api
        .post('/api/v1/capacidades' + ruta)
        .set('Cookie', cookie)
        .set('X-CSRF-Token', 'capacidad')
        .send(cuerpo);
    const leer = (id: string, cookie = '') =>
      api.get('/api/v1/capacidades/' + id).set('Cookie', cookie);
    const oferta = () => ({
      idLocal: randomUUID(),
      senalId,
      titulo: 'Horas de sala accesible',
      tipo: 'espacio',
      unidad: 'horas',
      cantidad: 10,
      desde: dia(0),
      hasta: dia(30),
      territorioId: null,
      zona: 'Área de servicio del espacio',
      restricciones: 'Por la tarde, acordar horarios',
      firma: 'Espacio de prueba',
      autorizoOferta: true,
    });
    const solicitud = () => ({
      idLocal: randomUUID(),
      fichaId,
      cantidad: 6,
      paraFecha: dia(1),
      necesidad: 'Seis horas para apoyo escolar',
      compatibilidad: 'Podemos asistir por la tarde y necesitamos acceso sin escalones.',
      aceptaCondiciones: true,
    });
    const recibos = new Map<string, number>();
    const actuar = async (
      c: string,
      r: string,
      accion: string,
      cookie = ofrece,
      nota = '',
      cantidadEntregada?: number,
    ) => {
      const clave = JSON.stringify({ c, r, accion, cookie, nota, cantidadEntregada });
      const actual = await getDb().execute<{ revision: number }>(
        sql`select revision from reservas_capacidad where id=${r}::uuid`,
      );
      const revisionEsperada = recibos.get(clave) ?? actual.rows[0]?.revision ?? 1;
      const resultado = await post(
        `/${c}/reservas/${r}/estado`,
        {
          accion,
          nota,
          revisionEsperada,
          ...(cantidadEntregada === undefined ? {} : { cantidadEntregada }),
        },
        cookie,
      );
      if (resultado.status === 200) recibos.set(clave, revisionEsperada);
      return resultado;
    };
    const crear = async (cuerpo = oferta()) =>
      (await post('', cuerpo).expect(201)).body.data.id as string;
    const pedir = async (c: string, cuerpo = solicitud()) =>
      (await post(`/${c}/reservas`, cuerpo, solicita).expect(201)).body.data.id as string;
    beforeAll(async () => {
      for (let i = 0; i < 3; i++) {
        const marca = randomUUID();
        const u = await getDb().execute<{ id: number }>(
          sql`insert into users(username,email,name,password_hash,email_verified) values(${marca},${marca + '@test.local'},'Prueba','no-login',true) returning id`,
        );
        if (!u.rows[0]) throw new Error('Falta usuario');
        usuarios.push(u.rows[0].id);
      }
      const cookie = (id: number) =>
        `eihg_access=${signAccessToken({ sub: id, username: 'test', email: 'test@test.local' })}; eihg_csrf=capacidad`;
      ofrece = cookie(usuarios[0]!);
      solicita = cookie(usuarios[1]!);
      ajeno = cookie(usuarios[2]!);
      const s = await getDb().execute<{ id: string }>(
        sql`insert into senales(tipo,clase,texto,origen,id_local,user_id,estado) values('recurso','hecho','Sala para encuentros','web',gen_random_uuid(),${usuarios[0]},'por_verificar') returning id_publico as id`,
      );
      senalId = s.rows[0]!.id;
      const f = await getDb().execute<{ id: string }>(
        sql`insert into fichas_futuro(creador_id,id_local,contenido) values(${usuarios[1]},gen_random_uuid(),'{}'::jsonb) returning id`,
      );
      fichaId = f.rows[0]!.id;
    });
    afterAll(async () => {
      await limpiarFixturesIdeales(getDb(), usuarios);
    });
    it('exige autorización, autoría, fuente válida y fechas; mantiene recibos inmutables', async () => {
      const v = oferta();
      await api.post('/api/v1/capacidades').send(v).expect(403);
      await post('', v, solicita).expect(409);
      await post('', { ...v, autorizoOferta: false }).expect(400);
      await post('', { ...v, cantidad: 0 }).expect(400);
      await post('', { ...v, desde: '2026-02-30' }).expect(400);
      await post('', { ...v, hasta: dia(-1) }).expect(400);
      await post('', { ...v, territorioId: 2147483647 }).expect(409);
      const id = await crear(v);
      expect(await crear(v)).toBe(id);
      await post('', { ...v, cantidad: 20 }).expect(409);
      const publica = await leer(id).expect(200);
      expect(publica.headers['cache-control']).toBe('no-store');
      expect(publica.body.data.capacidad.confirmadaEn).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(publica.body.data.capacidad).toMatchObject({
        disponible: 10,
        reservada: 0,
        entregada: 0,
        esMia: false,
      });
      expect(JSON.stringify(publica.body)).not.toMatch(
        /oferenteId|solicitanteId|huella|idLocal|user_id/,
      );
      await post(`/${id}/estado`, { accion: 'confirmar' }, solicita).expect(409);
      await post(`/${id}/estado`, { accion: 'confirmar' }).expect(200);
      await post(`/${id}/estado`, { accion: 'cerrar' }).expect(200);
      await post(`/${id}/estado`, { accion: 'confirmar' }).expect(409);
      await post(`/${id}/reservas`, solicitud(), solicita).expect(409);
    });
    it('solicita desde una ficha editable y solo muestra detalles a sus dos partes', async () => {
      const c = await crear();
      const v = solicitud();
      await post(`/${c}/reservas`, v).expect(409);
      await post(`/${c}/reservas`, v, ajeno).expect(409);
      await post(`/${c}/reservas`, { ...v, cantidad: null }, solicita).expect(409);
      await post(`/${c}/reservas`, { ...v, paraFecha: dia(31) }, solicita).expect(409);
      const id = await pedir(c, v);
      expect(await pedir(c, v)).toBe(id);
      await post(`/${c}/reservas`, { ...v, cantidad: 3 }, solicita).expect(409);
      expect((await leer(c)).body.data.reservas).toEqual([]);
      expect((await leer(c, ajeno)).body.data.reservas).toEqual([]);
      expect((await leer(c, solicita)).body.data.reservas[0]).toMatchObject({
        id,
        soySolicitante: true,
      });
      expect((await leer(c, ofrece)).body.data.reservas[0]).toMatchObject({
        id,
        soySolicitante: false,
      });
      expect((await leer(c)).body.data.capacidad.disponible).toBe(10);
      expect((await actuar(c, id, 'aceptar', solicita)).status).toBe(409);
      expect((await actuar(c, id, 'aceptar', ajeno)).status).toBe(409);
      expect((await actuar(c, id, 'rechazar')).status).toBe(200);
      expect((await actuar(c, id, 'aceptar')).status).toBe(409);
    });
    it('serializa dos aceptaciones simultáneas, libera al cancelar y no duplica reintentos', async () => {
      const c = await crear();
      const a = await pedir(c),
        b = await pedir(c);
      const resultados = await Promise.all([actuar(c, a, 'aceptar'), actuar(c, b, 'aceptar')]);
      expect(resultados.map((r) => r.status).sort()).toEqual([200, 409]);
      expect((await leer(c)).body.data.capacidad).toMatchObject({
        disponible: 4,
        reservada: 6,
        entregada: 0,
      });
      const ganador = resultados[0]!.status === 200 ? a : b;
      const pendiente = ganador === a ? b : a;
      expect((await actuar(c, ganador, 'aceptar')).status).toBe(200);
      expect((await actuar(c, ganador, 'cancelar', solicita)).status).toBe(200);
      expect((await actuar(c, ganador, 'cancelar', solicita)).status).toBe(200);
      expect((await actuar(c, ganador, 'aceptar')).status).toBe(409);
      expect((await actuar(c, pendiente, 'aceptar')).status).toBe(200);
      expect((await leer(c)).body.data.capacidad.disponible).toBe(4);
    });
    it('distingue entrega declarada, discrepancia y recepción; lo entregado no se libera', async () => {
      const c = await crear(),
        r = await pedir(c, { ...solicitud(), cantidad: 10 });
      expect((await actuar(c, r, 'aceptar')).status).toBe(200);
      expect((await actuar(c, r, 'confirmar_recepcion', solicita)).status).toBe(409);
      expect((await actuar(c, r, 'declarar_entrega')).status).toBe(400);
      expect((await actuar(c, r, 'declarar_entrega', solicita, 'No me corresponde')).status).toBe(
        409,
      );
      expect(
        (
          await actuar(
            c,
            r,
            'declarar_entrega',
            ofrece,
            'Se facilitó la sala en las franjas acordadas',
          )
        ).status,
      ).toBe(200);
      expect((await actuar(c, r, 'cancelar', solicita)).status).toBe(409);
      expect((await actuar(c, r, 'discrepar', solicita, 'Faltaron dos horas')).status).toBe(200);
      expect((await actuar(c, r, 'cancelar', solicita)).status).toBe(409);
      expect((await leer(c)).body.data.capacidad.disponible).toBe(0);
      expect(
        (await actuar(c, r, 'declarar_entrega', ofrece, 'Se completaron las dos horas pendientes'))
          .status,
      ).toBe(200);
      expect((await actuar(c, r, 'confirmar_recepcion')).status).toBe(409);
      const recepcion = await actuar(c, r, 'confirmar_recepcion', solicita);
      expect(recepcion.status, JSON.stringify({ body: recepcion.body, text: recepcion.text })).toBe(
        200,
      );
      expect((await actuar(c, r, 'confirmar_recepcion', solicita)).status).toBe(200);
      expect((await actuar(c, r, 'cancelar')).status).toBe(409);
      expect((await leer(c)).body.data.capacidad).toMatchObject({
        disponible: 0,
        reservada: 0,
        entregada: 10,
      });
    });
    it('una oferta sin cantidad exige evaluación manual y no inventa ceros', async () => {
      const v = oferta();
      const c = (await post('', { ...v, cantidad: null }).expect(201)).body.data.id as string;
      await post(`/${c}/reservas`, solicitud(), solicita).expect(409);
      const r = (
        await post(`/${c}/reservas`, { ...solicitud(), cantidad: null }, solicita).expect(201)
      ).body.data.id as string;
      expect((await actuar(c, r, 'aceptar')).status).toBe(200);
      expect((await leer(c)).body.data.capacidad).toMatchObject({
        cantidad: null,
        disponible: null,
        reservada: null,
        entregada: null,
      });
    });
    it('rechaza solicitudes vencidas y conserva reservas al cerrar o retirar el aporte', async () => {
      const c = await crear(),
        pendiente = await pedir(c),
        aceptada = await pedir(c);
      expect((await actuar(c, aceptada, 'aceptar')).status).toBe(200);
      await getDb().execute(
        sql`update reservas_capacidad set para_fecha=${dia(-1)}::date where capacidad_id=${c}::uuid`,
      );
      expect((await actuar(c, pendiente, 'aceptar')).status).toBe(409);
      await post(`/${c}/estado`, { accion: 'cerrar' }).expect(200);
      await getDb().execute(
        sql`update senales set estado='retirada',texto='' where id_publico=${senalId}::uuid`,
      );
      await leer(c).expect(404);
      await leer(c, ajeno).expect(404);
      expect((await leer(c, solicita)).body.data.capacidad).toMatchObject({
        vigente: false,
        reservada: 6,
      });
      expect(
        (await actuar(c, aceptada, 'declarar_entrega', ofrece, 'Se completó antes del cierre'))
          .status,
      ).toBe(200);
      expect((await actuar(c, aceptada, 'confirmar_recepcion', solicita)).status).toBe(200);
      await getDb().execute(
        sql`update senales set estado='por_verificar',texto='Sala para encuentros' where id_publico=${senalId}::uuid`,
      );
    });
    it('cierra entregas parciales con aceptación de cantidad y rechaza pantallas viejas', async () => {
      const c = await crear(),
        r = await pedir(c, { ...solicitud(), cantidad: 10 });
      expect((await actuar(c, r, 'aceptar')).status).toBe(200);
      expect(
        (await actuar(c, r, 'declarar_entrega', ofrece, 'Declaramos seis horas', 11)).status,
      ).toBe(409);
      expect(
        (await actuar(c, r, 'declarar_entrega', ofrece, 'Declaramos seis horas', 6)).status,
      ).toBe(200);
      const vieja = (await leer(c, solicita)).body.data.reservas[0].revision as number;
      expect((await leer(c)).body.data.capacidad).toMatchObject({
        disponible: 0,
        reservada: 10,
        entregada: 0,
      });
      expect((await actuar(c, r, 'discrepar', solicita, 'Recibimos cuatro horas')).status).toBe(
        200,
      );
      expect((await actuar(c, r, 'cancelar', solicita)).status).toBe(409);
      expect(
        (
          await actuar(
            c,
            r,
            'declarar_entrega',
            ofrece,
            'Acordamos cerrar por cuatro horas recibidas',
            4,
          )
        ).status,
      ).toBe(200);
      await post(
        `/${c}/reservas/${r}/estado`,
        { accion: 'confirmar_recepcion', nota: '', revisionEsperada: vieja },
        solicita,
      ).expect(409);
      expect((await actuar(c, r, 'confirmar_recepcion', solicita)).status).toBe(200);
      expect((await actuar(c, r, 'confirmar_recepcion', solicita)).status).toBe(200);
      expect((await leer(c)).body.data.capacidad).toMatchObject({
        disponible: 6,
        reservada: 0,
        entregada: 4,
      });
      const segunda = await pedir(c);
      expect((await actuar(c, segunda, 'aceptar')).status).toBe(200);
      expect(
        (
          await actuar(
            c,
            segunda,
            'declarar_entrega',
            ofrece,
            'No se prestaron las horas, proponemos cerrar',
            0,
          )
        ).status,
      ).toBe(200);
      expect((await leer(c)).body.data.capacidad.disponible).toBe(0);
      expect((await actuar(c, segunda, 'confirmar_recepcion', solicita)).status).toBe(200);
      expect((await leer(c)).body.data.capacidad).toMatchObject({
        disponible: 6,
        reservada: 0,
        entregada: 4,
      });
    });
    it('pagina ofertas y solicitudes; filtros personales no revelan fichas ajenas', async () => {
      const c = await crear();
      await getDb()
        .execute(sql`insert into reservas_capacidad(capacidad_id,solicitante_id,ficha_id,id_local,huella,cantidad,para_fecha,necesidad,compatibilidad)
        select ${c}::uuid,${usuarios[1]},${fichaId}::uuid,gen_random_uuid(),'fixture',1,${dia(1)}::date,'Encuentro','Horario compatible' from generate_series(1,21)`);
      const primera = (await leer(c, ofrece)).body.data;
      expect(primera.reservas).toHaveLength(20);
      const siguiente: string = primera.siguiente;
      const segunda = (await leer(`${c}?despues=${siguiente}`, ofrece)).body.data;
      expect(segunda.reservas).toHaveLength(1);
      expect(segunda.siguiente).toBeNull();
      await api.get('/api/v1/capacidades?propias=si').expect(401);
      const propias = await api
        .get('/api/v1/capacidades?propias=si')
        .set('Cookie', solicita)
        .expect(200);
      expect(propias.body.data.capacidades.length).toBeGreaterThan(0);
      const ajenas = await api
        .get(`/api/v1/capacidades?fichaId=${fichaId}`)
        .set('Cookie', ajeno)
        .expect(200);
      expect(ajenas.body.data.capacidades).toEqual([]);
      await getDb()
        .execute(sql`insert into capacidades(senal_id,oferente_id,id_local,huella,titulo,tipo,unidad,cantidad,desde,hasta,zona,restricciones,firma)
      select ${senalId}::uuid,${usuarios[0]},gen_random_uuid(),'fixture','Sala','espacio','horas',10,${dia(0)}::date,${dia(30)}::date,'Zona','Horario a acordar','Equipo' from generate_series(1,21)`);
      const lista = await api.get(`/api/v1/capacidades?senalId=${senalId}`).expect(200);
      expect(lista.body.data.capacidades).toHaveLength(20);
      expect(lista.body.data.siguiente).toEqual(expect.any(String));
      await api.get('/api/v1/capacidades?territorioId=no').expect(400);
    });
  },
);
