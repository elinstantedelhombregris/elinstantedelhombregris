/**
 * La pila contra Postgres de verdad (plan de Mi Argentina ideal, entrega 1, tarea 5).
 *
 * **Este archivo ESCRIBE filas.** Corre sólo con `DATABASE_URL_DESCARTABLE` —la
 * base local que levanta `pnpm test:integration:local`— y borra lo suyo al
 * terminar, de las hojas a la raíz. Cada caso arma su propia campaña, así los
 * conteos de un caso no se mezclan con los de otro.
 */
import { neon } from '@neondatabase/serverless';
import { sql, type SQL } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ImpulsoRepository } from '../src/repositories/impulso.js';
import { PilaGestionRepository } from '../src/repositories/pila-gestion.js';
import { PilaRepository } from '../src/repositories/pila.js';
import * as schema from '../src/schema/index.js';

import type { Db } from '../src/client.js';

const DSN = process.env['DATABASE_URL_DESCARTABLE'];
const viva = DSN ? describe : describe.skip;

viva('PilaRepository', () => {
  let db: Db;
  let pila: PilaRepository;
  let gestion: PilaGestionRepository;
  const senalesCreadas: number[] = [];
  const actoresCreados: number[] = [];
  const campanasCreadas: string[] = [];
  const usuariosCreados: number[] = [];
  let creador = 0;
  let cuenta = 0;
  let salta = 0; // AR-A, NOA
  let jujuy = 0; // AR-Y, NOA
  let caba = 0; // AR-C, Buenos Aires
  let orden = 0;

  const filas = async <T extends Record<string, unknown>>(consulta: SQL) =>
    (await db.execute<T>(consulta)).rows;

  const actores = async (n: number): Promise<number[]> => {
    const r = await filas<{ id: number }>(sql`
      insert into actores (actor_hash, origen)
      select sha256(gen_random_uuid()::text::bytea), 'web' from generate_series(1, ${n})
      returning id::int as id`);
    const ids = r.map((f) => f.id);
    actoresCreados.push(...ids);
    return ids;
  };

  const nuevaCampana = async (): Promise<string> => {
    const [f] = await filas<{ id: string }>(sql`
      insert into campanas (creador_id, id_local, slug, contrato, estado)
      values (${creador}, gen_random_uuid(), ${'pila-prueba-' + crypto.randomUUID()},
        ${JSON.stringify({ titulo: 'Prueba de la pila' })}::jsonb, 'abierta')
      returning id`);
    campanasCreadas.push(f!.id);
    return f!.id;
  };

  interface Aporte {
    id: number;
    idPublico: string;
  }
  const aporte = async (
    campana: string | null,
    o: {
      texto?: string;
      cede?: boolean;
      actorId?: number | null;
      userId?: number | null;
      provinciaId?: number | null;
      tipo?: 'sueño' | 'basta';
      estado?: string;
      fragmentos?: { pregunta: string; respuesta: string }[];
    } = {},
  ): Promise<Aporte> => {
    const cede = o.cede ?? true;
    const tipo = o.tipo ?? 'sueño';
    orden += 1;
    const [f] = await filas<{ id: number; id_publico: string }>(sql`
      insert into senales (tipo, clase, origen, id_local, texto, cesion_licencia, cesion_en,
        cesion_version, actor_id, user_id, province_id, ubicacion_origen, estado, publicada_en)
      values (${tipo}, ${tipo === 'sueño' ? 'deseo' : 'hecho'}, 'web', gen_random_uuid(),
        ${o.texto ?? 'Que el turno en la salita no tarde tres meses.'}, ${cede},
        ${cede ? sql`now()` : sql`null`}, ${cede ? 1 : null}, ${o.actorId ?? null}::bigint,
        ${o.userId ?? null}::int, ${o.provinciaId ?? null}::int,
        ${o.provinciaId ? 'declarada' : 'ninguna'}, ${o.estado ?? 'enviada'},
        now() - make_interval(secs => ${10_000 - orden}))
      returning id::int as id, id_publico`);
    senalesCreadas.push(f!.id);
    if (campana !== null)
      await db.execute(sql`
        insert into contribuciones (huella, senal_id, campana_id, edicion, fragmentos)
        values ('prueba', ${f!.id_publico}::uuid, ${campana}::uuid, 1,
          ${JSON.stringify(o.fragmentos ?? [])}::jsonb)`);
    return { id: f!.id, idPublico: f!.id_publico };
  };

  /** Una respuesta escrita directo en la base, como la dejaría `opinar`. */
  const responder = async (
    s: Aporte,
    actorId: number,
    valor: 'acuerdo' | 'desacuerdo' | 'paso',
    lugar: { provinciaId: number; region: string } | null = null,
  ) => {
    await db.execute(sql`
      insert into pila_respuestas (senal_id, actor_id, valor, provincia_id, region, respondida_en)
      values (${s.id}, ${actorId}::bigint, ${valor}, ${lugar?.provinciaId ?? null}::int,
        ${lugar?.region ?? null}::text, now())`);
  };

  const ids = (c: { id: string }[]) => c.map((x) => x.id);

  beforeAll(async () => {
    db = drizzle(neon(DSN ?? ''), { schema }) as unknown as Db;
    pila = new PilaRepository(db);
    gestion = new PilaGestionRepository(db);
    const marca = crypto.randomUUID();
    const us = await filas<{ id: number }>(sql`
      insert into users (username, email, name, password_hash)
      values (${'pila-c-' + marca.slice(0, 20)}, ${marca + '-c@test.local'}, 'Creadora', 'x'),
             (${'pila-u-' + marca.slice(0, 20)}, ${marca + '-u@test.local'}, 'Cuenta', 'x')
      returning id`);
    creador = us[0]!.id;
    cuenta = us[1]!.id;
    usuariosCreados.push(creador, cuenta);
    const prov = await filas<{ id: number; iso: string }>(sql`
      select id, iso_code as iso from geographic_locations
      where level = 'province' and iso_code in ('AR-A', 'AR-Y', 'AR-C')`);
    salta = prov.find((p) => p.iso === 'AR-A')?.id ?? 0;
    jujuy = prov.find((p) => p.iso === 'AR-Y')?.id ?? 0;
    caba = prov.find((p) => p.iso === 'AR-C')?.id ?? 0;
    expect([salta, jujuy, caba].every((p) => p > 0)).toBe(true);
  });

  afterAll(async () => {
    const lista = (xs: readonly (number | string)[], tipo: string) =>
      sql.raw(`'{${xs.join(',')}}'::${tipo}[]`);
    // Las filas de la pila y las contribuciones caen en cascada con su aporte.
    if (senalesCreadas.length)
      await db.execute(sql`delete from senales where id = any(${lista(senalesCreadas, 'bigint')})`);
    if (actoresCreados.length)
      await db.execute(sql`delete from actores where id = any(${lista(actoresCreados, 'bigint')})`);
    if (campanasCreadas.length)
      await db.execute(sql`delete from campanas where id = any(${lista(campanasCreadas, 'uuid')})`);
    if (usuariosCreados.length)
      await db.execute(sql`delete from users where id = any(${lista(usuariosCreados, 'int')})`);
  });

  describe('la tanda', () => {
    it('no trae los propios, ni los contestados, ni los reportados por quien mira', async () => {
      const campana = await nuevaCampana();
      const [yo, otra] = await actores(2);
      const propio = await aporte(campana, { actorId: yo! });
      const dePropiaCuenta = await aporte(campana, { userId: cuenta });
      const contestado = await aporte(campana, { actorId: otra! });
      const reportado = await aporte(campana, { actorId: otra! });
      const libre = await aporte(campana, { actorId: otra! });
      await responder(contestado, yo!, 'paso');
      await db.execute(sql`insert into pila_reportes (senal_id, actor_id, motivo, cuenta)
        values (${reportado.id}, ${yo!}::bigint, 'insulta', false)`);
      // Mostrado y sin contestar vuelve: no se contestó.
      await pila.registrarExposicion([libre.idPublico], yo!, null);
      const c = await pila.candidatos({
        campanaId: campana,
        actorId: yo!,
        userId: cuenta,
        region: null,
      });
      expect(ids(c)).toEqual([libre.idPublico]);
      expect(ids(c)).not.toContain(propio.idPublico);
      expect(ids(c)).not.toContain(dePropiaCuenta.idPublico);
    });

    it('no trae aportes sin cesión, retirados, retenidos, largos, hechos ni de otra campaña', async () => {
      const campana = await nuevaCampana();
      const otraCampana = await nuevaCampana();
      const [yo, autor] = await actores(2);
      const bueno = await aporte(campana, { actorId: autor! });
      await aporte(campana, { actorId: autor!, cede: false });
      await aporte(campana, { actorId: autor!, estado: 'retirada', texto: '' });
      const retenido = await aporte(campana, { actorId: autor! });
      await db.execute(sql`update senales set retenida_en = now() where id = ${retenido.id}`);
      await aporte(campana, { actorId: autor!, texto: 'a'.repeat(141) });
      await aporte(campana, { actorId: autor!, tipo: 'basta', estado: 'enviada' });
      await aporte(otraCampana, { actorId: autor! });
      await aporte(null, { actorId: autor! });
      const c = await pila.candidatos({
        campanaId: campana,
        actorId: yo!,
        userId: null,
        region: null,
      });
      expect(ids(c)).toEqual([bueno.idPublico]);
    });

    it('primero donde la región de quien mira no llega a cinco; sin región, menos respuestas', async () => {
      const campana = await nuevaCampana();
      const [yo, autor, ...otros] = await actores(8);
      const noa = { provinciaId: salta, region: 'NOA' };
      // `lleno` tiene cinco opiniones del NOA y ninguna respuesta más; `falta` tiene
      // seis respuestas, pero de Buenos Aires.
      const lleno = await aporte(campana, { actorId: autor! });
      const falta = await aporte(campana, { actorId: autor! });
      for (const a of otros.slice(0, 5)) await responder(lleno, a, 'acuerdo', noa);
      for (const a of otros.slice(0, 6))
        await responder(falta, a, 'desacuerdo', { provinciaId: caba, region: 'Buenos Aires' });
      const conRegion = await pila.candidatos({
        campanaId: campana,
        actorId: yo!,
        userId: null,
        region: 'NOA',
      });
      expect(ids(conRegion)).toEqual([falta.idPublico, lleno.idPublico]);
      expect(conRegion[0]?.opinionesDeMiRegion).toBe(0);
      expect(conRegion[1]?.opinionesDeMiRegion).toBe(5);
      const sinRegion = await pila.candidatos({
        campanaId: campana,
        actorId: yo!,
        userId: null,
        region: null,
      });
      expect(ids(sinRegion)).toEqual([lleno.idPublico, falta.idPublico]);
      expect(sinRegion[0]?.opinionesDeMiRegion).toBe(0);
    });

    it('trae lo que escribió completo sólo si es la respuesta a la pregunta y difiere de la línea', async () => {
      const campana = await nuevaCampana();
      const [yo] = await actores(1);
      const { PREGUNTA_MI_ARGENTINA_IDEAL } = await import('@v2/shared');
      const largo = await aporte(campana, {
        fragmentos: [
          { pregunta: PREGUNTA_MI_ARGENTINA_IDEAL, respuesta: 'Todo lo que escribí, más largo.' },
        ],
      });
      const c = await pila.candidatos({
        campanaId: campana,
        actorId: yo!,
        userId: null,
        region: null,
      });
      expect(c.find((x) => x.id === largo.idPublico)?.origen).toBe(
        'Todo lo que escribí, más largo.',
      );
    });
  });

  describe('opinar', () => {
    it('opinar dos veces cambia la opinión y no la duplica', async () => {
      const campana = await nuevaCampana();
      const [yo, otra] = await actores(2);
      const s = await aporte(campana);
      await responder(s, otra!, 'desacuerdo');
      const base = {
        idPublico: s.idPublico,
        actorId: yo!,
        userId: null,
        provinciaId: null,
        region: null,
      };
      expect(await pila.opinar({ ...base, valor: 'acuerdo' })).toMatchObject({ coinciden: 0 });
      expect(await pila.opinar({ ...base, valor: 'desacuerdo' })).toMatchObject({ coinciden: 1 });
      expect(await pila.opinar({ ...base, valor: 'paso' })).toMatchObject({ coinciden: null });
      const [n] = await filas<{ n: number; valor: string }>(sql`
        select count(*)::int as n, max(valor) as valor from pila_respuestas
        where senal_id = ${s.id} and actor_id = ${yo!}::bigint`);
      expect(n).toEqual({ n: 1, valor: 'paso' });
    });

    it('una cuenta en dos actores no opina doble', async () => {
      const campana = await nuevaCampana();
      const [chrome, telefono] = await actores(2);
      const s = await aporte(campana);
      const base = { idPublico: s.idPublico, userId: cuenta, provinciaId: null, region: null };
      await pila.opinar({ ...base, actorId: chrome!, valor: 'acuerdo' });
      await pila.opinar({ ...base, actorId: telefono!, valor: 'desacuerdo' });
      const r = await filas<{ valor: string }>(sql`
        select valor from pila_respuestas where senal_id = ${s.id}`);
      expect(r).toEqual([{ valor: 'desacuerdo' }]);
      // Y desde la cuenta, el aporte ya contestado no vuelve a la tanda en ningún navegador.
      const c = await pila.candidatos({
        campanaId: campana,
        actorId: telefono!,
        userId: cuenta,
        region: null,
      });
      expect(ids(c)).not.toContain(s.idPublico);
    });

    it('regionCompleta vale verdadero sólo con la quinta opinión de la región', async () => {
      const campana = await nuevaCampana();
      const opinantes = await actores(6);
      const s = await aporte(campana);
      const resultados: boolean[] = [];
      for (const a of opinantes) {
        const r = await pila.opinar({
          idPublico: s.idPublico,
          actorId: a,
          userId: null,
          valor: 'acuerdo',
          provinciaId: jujuy,
          region: 'NOA',
        });
        resultados.push(r?.regionCompleta ?? false);
      }
      expect(resultados).toEqual([false, false, false, false, true, false]);
      // Cambiar la quinta no vuelve a completar la región.
      const cambio = await pila.opinar({
        idPublico: s.idPublico,
        actorId: opinantes[4]!,
        userId: null,
        valor: 'desacuerdo',
        provinciaId: jujuy,
        region: 'NOA',
      });
      expect(cambio?.regionCompleta).toBe(false);
    });

    it('no se opina sobre lo propio ni sobre lo que no está en Mirar', async () => {
      const campana = await nuevaCampana();
      const [yo] = await actores(1);
      const propio = await aporte(campana, { actorId: yo! });
      const fuera = await aporte(null);
      for (const s of [propio, fuera])
        expect(
          await pila.opinar({
            idPublico: s.idPublico,
            actorId: yo!,
            userId: null,
            valor: 'acuerdo',
            provinciaId: null,
            region: null,
          }),
        ).toBeNull();
    });
  });

  describe('comparar', () => {
    it('sin «yo también» a los dos, no hay duelo', async () => {
      const campana = await nuevaCampana();
      const [yo] = await actores(1);
      const a = await aporte(campana);
      const b = await aporte(campana);
      await responder(a, yo!, 'acuerdo');
      await responder(b, yo!, 'desacuerdo');
      expect(
        await pila.comparar({
          a: a.idPublico,
          b: b.idPublico,
          primero: null,
          actorId: yo!,
          userId: null,
        }),
      ).toBe(false);
    });

    it('el par se guarda una vez sin importar el orden, y se puede cambiar', async () => {
      const campana = await nuevaCampana();
      const [yo] = await actores(1);
      const a = await aporte(campana);
      const b = await aporte(campana);
      await responder(a, yo!, 'acuerdo', { provinciaId: salta, region: 'NOA' });
      await responder(b, yo!, 'acuerdo', { provinciaId: salta, region: 'NOA' });
      const e = { actorId: yo!, userId: null };
      expect(
        await pila.comparar({ ...e, a: a.idPublico, b: b.idPublico, primero: a.idPublico }),
      ).toBe(true);
      expect(
        await pila.comparar({ ...e, a: b.idPublico, b: a.idPublico, primero: b.idPublico }),
      ).toBe(true);
      const r = await filas<{ primero: number; region: string; a_id: number }>(sql`
        select primero_id::int as primero, region, a_id::int as a_id from pila_duelos
        where actor_id = ${yo!}::bigint`);
      expect(r).toEqual([{ primero: b.id, region: 'NOA', a_id: Math.min(a.id, b.id) }]);
      const estado = await pila.estadoDelActor(campana, yo!, null);
      const { clavePar } = await import('@v2/civic-core');
      expect(estado.paresComparados).toEqual([clavePar(a.idPublico, b.idPublico)]);
      expect(estado.acuerdos).toEqual([a.idPublico, b.idPublico]);
    });
  });

  describe('estado de quien mira', () => {
    it('la provincia sale de la última respuesta con provincia, y si no, del aporte propio', async () => {
      const campana = await nuevaCampana();
      const [yo] = await actores(1);
      const nuevo = await pila.estadoDelActor(campana, yo!, null);
      expect(nuevo).toMatchObject({
        provincia: null,
        yaPregunto: false,
        yaAporto: false,
        respuestasDadas: 0,
      });
      await aporte(campana, { actorId: yo!, provinciaId: caba });
      const conAporte = await pila.estadoDelActor(campana, yo!, null);
      expect(conAporte.provincia?.id).toBe(caba);
      expect(conAporte.yaAporto).toBe(true);
      await responder(await aporte(campana), yo!, 'paso', { provinciaId: salta, region: 'NOA' });
      const conRespuesta = await pila.estadoDelActor(campana, yo!, null);
      expect(conRespuesta).toMatchObject({ yaPregunto: true, respuestasDadas: 1 });
      expect(conRespuesta.provincia).toMatchObject({ id: salta, iso: 'AR-A' });
    });

    it('opinionDe dice si el aporte está en Mirar y qué contestó quien mira', async () => {
      const campana = await nuevaCampana();
      const [yo] = await actores(1);
      const s = await aporte(campana);
      expect(await pila.opinionDe(s.idPublico, yo!, null)).toEqual({
        enMirar: true,
        miOpinion: null,
      });
      await responder(s, yo!, 'desacuerdo');
      expect(await pila.opinionDe(s.idPublico, yo!, null)).toEqual({
        enMirar: true,
        miOpinion: 'desacuerdo',
      });
      const fuera = await aporte(null);
      expect(await pila.opinionDe(fuera.idPublico, null, null)).toEqual({
        enMirar: false,
        miOpinion: null,
      });
    });
  });

  describe('reportes', () => {
    /** Actores que ya contestaron `n` aportes de la campaña. */
    const habiles = async (campana: string, cuantos: number, n = 5) => {
      const gente = await actores(cuantos);
      const base = await Promise.all(Array.from({ length: n }, () => aporte(campana)));
      for (const a of gente) for (const s of base) await responder(s, a, 'paso');
      return gente;
    };

    it('el reporte de quien contestó cuatro aportes no cuenta', async () => {
      const campana = await nuevaCampana();
      const [novato] = await habiles(campana, 1, 4);
      const s = await aporte(campana);
      expect(
        await gestion.reportar({
          idPublico: s.idPublico,
          actorId: novato!,
          userId: null,
          motivo: 'insulta',
        }),
      ).toEqual({ retenido: false, primerReporteDeDatos: false });
      const [r] = await filas<{ cuenta: boolean }>(
        sql`select cuenta from pila_reportes where senal_id = ${s.id}`,
      );
      expect(r?.cuenta).toBe(false);
    });

    it('el reporte 12 que cuenta no retiene, el 13 sí, y después de devolver hacen falta 13 nuevos', async () => {
      const campana = await nuevaCampana();
      const gente = await habiles(campana, 27);
      const s = await aporte(campana);
      const reportar = (a: number) =>
        gestion.reportar({
          idPublico: s.idPublico,
          actorId: a,
          userId: null,
          motivo: 'fuera_de_tema',
        });
      for (const a of gente.slice(0, 12)) expect((await reportar(a))?.retenido).toBe(false);
      // El mismo actor reporta de nuevo: no suma.
      expect((await reportar(gente[0]!))?.retenido).toBe(false);
      expect((await reportar(gente[12]!))?.retenido).toBe(true);
      expect(await reportar(gente[13]!)).toBeNull(); // ya no está en Mirar
      const [retenida] = await filas<{ motivo: string; decisiones: number }>(sql`
        select retenida_motivo as motivo,
          (select count(*)::int from pila_decisiones where senal_id = ${s.id} and origen = 'reportes') as decisiones
        from senales where id = ${s.id}`);
      expect(retenida).toEqual({ motivo: 'reportes', decisiones: 1 });

      expect(await gestion.devolver(s.idPublico, creador, 'Revisado: no insulta a nadie.')).toBe(
        'ok',
      );
      for (const a of gente.slice(13, 25)) expect((await reportar(a))?.retenido).toBe(false);
      expect((await reportar(gente[25]!))?.retenido).toBe(true);
    });

    it('no se puede reportar lo propio, y el primer reporte por datos personales se avisa una vez', async () => {
      const campana = await nuevaCampana();
      const [autor, x, y] = await actores(3);
      const s = await aporte(campana, { actorId: autor! });
      expect(
        await gestion.reportar({
          idPublico: s.idPublico,
          actorId: autor!,
          userId: null,
          motivo: 'insulta',
        }),
      ).toBeNull();
      const datos = (a: number) =>
        gestion.reportar({
          idPublico: s.idPublico,
          actorId: a,
          userId: null,
          motivo: 'datos_personales',
        });
      expect((await datos(x!))?.primerReporteDeDatos).toBe(true);
      expect((await datos(y!))?.primerReporteDeDatos).toBe(false);
      const impulso = new ImpulsoRepository(db);
      for (let i = 0; i < 2; i++)
        await impulso.avisar(
          [creador],
          `pila:datos:${s.idPublico}`,
          'Reportaron datos personales en un aporte',
          '/gestion/pila',
        );
      const [avisos] = await filas<{ n: number }>(sql`
        select count(*)::int as n from eventos_civicos where user_id = ${creador} and clave = ${'pila:datos:' + s.idPublico}`);
      expect(avisos?.n).toBe(1);
    });
  });

  describe('gestión', () => {
    it('retener y devolver dejan la decisión con quien la tomó, y la gestión lo lista', async () => {
      const campana = await nuevaCampana();
      const [yo, autor] = await actores(2);
      const s = await aporte(campana, {
        actorId: autor!,
        cede: false,
        texto: 'Texto reservado entero.',
      });
      const conCesion = await aporte(campana, { actorId: autor! });
      expect(await gestion.retener(conCesion.idPublico, creador, 'Tiene un nombre propio.')).toBe(
        'ok',
      );
      expect(await gestion.retener(conCesion.idPublico, creador, 'Otra vez.')).toBe('sin_cambio');
      expect(await gestion.retener(crypto.randomUUID(), creador, 'No existe.')).toBe('no_esta');
      const fuera = await pila.candidatos({
        campanaId: campana,
        actorId: yo!,
        userId: null,
        region: null,
      });
      expect(ids(fuera)).not.toContain(conCesion.idPublico);

      await gestion.retener(s.idPublico, creador, 'Probando con texto reservado.');
      const lista = await gestion.paraGestion({ campanaId: campana });
      const reservado = lista.aportes.find((a) => a.id === s.idPublico);
      expect(reservado?.texto).toBe('Texto reservado entero.');
      expect(reservado?.retenido).toMatchObject({
        origen: 'gestion',
        motivo: 'Probando con texto reservado.',
      });

      expect(await gestion.devolver(conCesion.idPublico, creador, 'Ya lo corrigió.')).toBe('ok');
      expect(await gestion.devolver(conCesion.idPublico, creador, 'Otra vez.')).toBe('sin_cambio');
      const vuelta = await pila.candidatos({
        campanaId: campana,
        actorId: yo!,
        userId: null,
        region: null,
      });
      expect(ids(vuelta)).toContain(conCesion.idPublico);
      const decisiones = await filas<{ decision: string; admin: number }>(sql`
        select decision, admin_id as admin from pila_decisiones where senal_id = ${conCesion.id} order by creada_en`);
      expect(decisiones).toEqual([
        { decision: 'retener', admin: creador },
        { decision: 'devolver', admin: creador },
      ]);
    });
  });

  it('cuenta la actividad reciente de un actor para los techos', async () => {
    const campana = await nuevaCampana();
    const [yo] = await actores(1);
    const a = await aporte(campana);
    const b = await aporte(campana);
    await pila.registrarExposicion([a.idPublico, b.idPublico], yo!, null);
    await responder(await aporte(campana), yo!, 'acuerdo');
    // La opinión que no vino de una tanda (la de `/senal/:id`) no cuenta como tanda.
    expect(await pila.actividadReciente(yo!)).toEqual({ opiniones: 1, tandas: 1, reportes: 0 });
  });
});
