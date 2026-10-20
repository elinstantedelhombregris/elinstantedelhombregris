/**
 * Campañas que propone cualquiera, con un paso previo (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §11), de punta a punta contra Postgres.
 *
 * Una cuenta con el correo verificado propone y presenta; la campaña junta gente con
 * la marca de llegada («Sumate») y el primer aporte de cada persona nueva; al llegar a
 * `UMBRAL_IMPULSO` pasa sola a revisión, y la administración la abre o la devuelve.
 *
 * **Cómo se llega a las 50 personas.** Las 48 del medio se escriben directo en
 * `campana_impulsos`: `POST /api/v1/contribuciones` tiene un techo de 30 envíos por hora y
 * por IP (`anonSubmitRateLimit`), y la quinta opinión es de la ruta de Mirar. La primera y
 * la quincuagésima sí llegan por la API, con su cookie, y la que cruza el umbral es real.
 */
import { randomUUID } from 'node:crypto';

import { getDb, sql } from '@v2/db';
import { CONTRATO_SENAL, COOKIE_IMPULSO, DIAS_DE_IMPULSO, UMBRAL_IMPULSO } from '@v2/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';
import { resetConfig } from '../src/lib/config.js';

import { clienteHttp } from './setup/cliente-http.js';

import type { CampanaEnCatalogo, CampanaPublica, ContratoCampana } from '@v2/shared';

const contrato: ContratoCampana = {
  titulo: 'Una biblioteca abierta en cada barrio',
  pregunta: '¿Qué tendría que poder hacerse en la biblioteca de tu barrio?',
  proposito: 'Juntar lo que cada barrio imagina para su biblioteca y devolverlo ordenado.',
  territorios: [],
  temas: ['educación'],
  participantes: 'Vecinas y vecinos de cualquier barrio del país.',
  canales: ['web'],
  responsable: 'Red de bibliotecas de prueba',
  devolucion: 'Una lectura pública revisable por quienes participaron.',
  fechaDevolucion: '2099-12-20',
  efecto: 'Ejercicio sin compromiso institucional.',
  usoDatos: 'Leeremos los aportes autorizados, respetando los permisos de cada persona.',
  metodoLectura: 'Contrastaremos las fuentes y publicaremos una lectura corregible.',
  institucion: '',
  fases: [
    { nombre: 'Imaginar', salida: 'Aportes revisados por sus autores.', fecha: '2099-12-01' },
  ],
};
const CSRF = 'propuestas-prueba';

describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Campañas propuestas por cualquiera: el paso previo',
  () => {
    const request = clienteHttp(createApp());
    const previo = process.env['ADMIN_USERNAMES'];
    const marcaAdmin = randomUUID();
    const marcaImpulsora = randomUUID();
    const marcaOtra = randomUUID();
    const usuarios: number[] = [];
    const idLocales: string[] = [];
    const actoresDirectos: number[] = [];
    let admin = 0;
    let impulsora = 0;
    let cookieAdmin = '';
    let cookieImpulsora = '';
    let cookieSinVerificar = '';
    let cookieOtra = '';
    let abierta = { id: '', revision: 0 };
    const propuesta = { id: '', slug: '' };
    let segunda = '';
    let primerAporte = { id: '', actor: '' };

    const sesion = (id: number) =>
      `eihg_access=${signAccessToken({ sub: id, username: 'token', email: 'prueba@test.local' })}; eihg_csrf=${CSRF}`;
    const enviar = (cookie: string, ruta: string, cuerpo: object) =>
      request.post(ruta).set('Cookie', cookie).set('X-CSRF-Token', CSRF).send(cuerpo);
    const estado = async (id: string) =>
      (
        await getDb().execute<{ estado: string; revision: number }>(
          sql`select estado, revision from campanas where id = ${id}::uuid`,
        )
      ).rows[0] ?? { estado: '', revision: 0 };
    const cambiar = async (cookie: string, id: string, hacia: string, motivo: string) =>
      enviar(cookie, `/api/v1/campanas/${id}/estado`, {
        revision: (await estado(id)).revision,
        estado: hacia,
        motivo,
      });
    const personas = async () =>
      ((await request.get(`/api/v1/campanas/${propuesta.slug}`)).body.data as CampanaPublica)
        .impulso?.personas;
    /** Un aporte a la campaña abierta, con las cookies que traiga el navegador. */
    const aportar = async (cookies: string[]) => {
      const idLocal = randomUUID();
      idLocales.push(idLocal);
      const r = await request
        .post('/api/v1/contribuciones')
        .set('Cookie', [`eihg_csrf=${CSRF}`, ...cookies].join('; '))
        .set('X-CSRF-Token', CSRF)
        .send({
          senal: {
            contrato: CONTRATO_SENAL,
            idLocal,
            tipo: 'sueño',
            texto: 'Que la biblioteca del barrio abra también los sábados.',
            cedeLicencia: true,
            casa: 'no',
          },
          campanaId: abierta.id,
          edicion: abierta.revision,
          fragmentos: [],
          interpretacionConfirmada: true,
          aceptaPublicar: true,
        });
      expect(r.status).toBe(201);
      const set = (r.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
      const actor = (set.find((c) => c.startsWith('basta_actor=')) ?? '').split(';')[0] ?? '';
      return { id: r.body.data.idPublico as string, actor };
    };
    const llegar = async () => {
      const r = await request
        .post(`/api/v1/campanas/${propuesta.slug}/llegada`)
        .set('Cookie', `eihg_csrf=${CSRF}`)
        .set('X-CSRF-Token', CSRF);
      expect(r.status).toBe(204);
      const set = (r.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
      return set.find((c) => c.startsWith(`${COOKIE_IMPULSO}=`)) ?? '';
    };
    const contadasDirecto = async (n: number) => {
      for (let i = 0; i < n; i++) {
        const r = await getDb().execute<{ id: number }>(
          sql`insert into actores (actor_hash, origen) values (decode(md5(random()::text) || md5(random()::text), 'hex'), 'web') returning id`,
        );
        const actorId = Number(r.rows[0]?.id);
        actoresDirectos.push(actorId);
        await getDb().execute(
          sql`insert into campana_impulsos (actor_id, campana_id, como) values (${actorId}, ${propuesta.id}::uuid, 'opiniones')`,
        );
      }
    };
    const avisos = async (userId: number, prefijo: string) =>
      (
        await getDb().execute<{ clave: string }>(
          sql`select clave from eventos_civicos where user_id = ${userId} and clave like ${prefijo + '%'}`,
        )
      ).rows.map((f) => f.clave);

    beforeAll(async () => {
      const r = await getDb().execute<{ id: number }>(sql`
        insert into users (username, email, name, password_hash, email_verified) values
          (${marcaAdmin}, ${marcaAdmin + '@test.local'}, 'Admin', 'no-login', true),
          (${marcaImpulsora}, ${marcaImpulsora + '@test.local'}, 'Impulsora', 'no-login', true),
          (${marcaImpulsora + 'b'}, ${marcaImpulsora + 'b@test.local'}, 'Sin verificar', 'no-login', false),
          (${marcaOtra}, ${marcaOtra + '@test.local'}, 'Otra', 'no-login', true)
        returning id`);
      usuarios.push(...r.rows.map((u) => u.id));
      const [a, b, c, d] = usuarios;
      admin = a ?? 0;
      impulsora = b ?? 0;
      cookieAdmin = sesion(admin);
      cookieImpulsora = sesion(impulsora);
      cookieSinVerificar = sesion(c ?? 0);
      cookieOtra = sesion(d ?? 0);
      process.env['ADMIN_USERNAMES'] = marcaAdmin;
      resetConfig();
      // La campaña abierta que recibe los aportes: hace de la nacional en esta base.
      const creada = await enviar(cookieAdmin, '/api/v1/campanas', {
        idLocal: randomUUID(),
        contrato: { ...contrato, titulo: 'La campaña abierta de esta prueba' },
      });
      abierta = { id: creada.body.data.id as string, revision: 1 };
      await cambiar(cookieAdmin, abierta.id, 'abierta', 'Abrimos la campaña de la prueba.');
      abierta.revision = (await estado(abierta.id)).revision;
    });

    afterAll(async () => {
      if (previo === undefined) delete process.env['ADMIN_USERNAMES'];
      else process.env['ADMIN_USERNAMES'] = previo;
      resetConfig();
      await limpiarFixturesIdeales(getDb(), usuarios, idLocales);
      await getDb().execute(
        sql`delete from actores where id in (select u::bigint from jsonb_array_elements_text(${JSON.stringify(actoresDirectos)}::jsonb) u)`,
      );
    });

    it('una cuenta sin el correo verificado no propone, y no queda nada creado', async () => {
      const r = await enviar(cookieSinVerificar, '/api/v1/campanas', {
        idLocal: randomUUID(),
        contrato,
      });
      expect(r.status).toBe(403);
      expect(r.body.error.code).toBe('EMAIL_PENDIENTE');
      expect(r.body.error.message).toMatch(/^Verificá tu correo/);
      const filas = await getDb().execute<{ n: number }>(
        sql`select count(*)::int n from campanas where creador_id = ${usuarios[2] ?? 0}`,
      );
      expect(filas.rows[0]?.n).toBe(0);
    });

    it('una cuenta verificada propone en borrador, no la abre, y la presenta', async () => {
      const r = await enviar(cookieImpulsora, '/api/v1/campanas', {
        idLocal: randomUUID(),
        contrato,
      });
      expect(r.status).toBe(201);
      propuesta.id = r.body.data.id as string;
      const otra = await enviar(cookieImpulsora, '/api/v1/campanas', {
        idLocal: randomUUID(),
        contrato: { ...contrato, titulo: 'Otra propuesta de la misma cuenta' },
      });
      expect(otra.status).toBe(201);
      segunda = otra.body.data.id as string;
      expect(await estado(propuesta.id)).toMatchObject({ estado: 'borrador' });

      for (const hacia of ['abierta', 'programada']) {
        const abrir = await cambiar(
          cookieImpulsora,
          propuesta.id,
          hacia,
          'Intento de abrirla sin revisión.',
        );
        expect(abrir.status).toBe(403);
        expect(abrir.body.error.code).toBe('NOT_ADMIN');
      }
      const ajena = await cambiar(
        cookieOtra,
        propuesta.id,
        'reuniendo',
        'Presentar una campaña ajena.',
      );
      expect(ajena.status).toBe(403);
      expect(ajena.body.error.code).toBe('SIN_PERMISO');

      await cambiar(
        cookieImpulsora,
        propuesta.id,
        'reuniendo',
        'La presento para juntar gente.',
      ).then((p) => expect(p.status).toBe(200));
      expect(await estado(propuesta.id)).toMatchObject({ estado: 'reuniendo' });
      propuesta.slug = (
        (await request.get(`/api/v1/campanas/${propuesta.id}`)).body.data as CampanaPublica
      ).slug;
    });

    it('una segunda propuesta activa se rechaza, al presentarla y al proponerla', async () => {
      const presentar = await cambiar(
        cookieImpulsora,
        segunda,
        'reuniendo',
        'Presento la segunda también.',
      );
      expect(presentar.status).toBe(409);
      expect(presentar.body.error.code).toBe('CAMPANA_ACTIVA');
      const proponer = await enviar(cookieImpulsora, '/api/v1/campanas', {
        idLocal: randomUUID(),
        contrato: { ...contrato, titulo: 'Una tercera propuesta de la misma cuenta' },
      });
      expect(proponer.status).toBe(409);
      expect(proponer.body.error.code).toBe('CAMPANA_ACTIVA');
      expect(await estado(segunda)).toMatchObject({ estado: 'borrador' });
    });

    it('nadie pide a mano el paso a revisión: lo da el sistema al llegar al umbral', async () => {
      for (const cookie of [cookieImpulsora, cookieAdmin]) {
        const r = await cambiar(cookie, propuesta.id, 'por_revisar', 'Forzar el paso a revisión.');
        expect(r.status).toBe(409);
        expect(r.body.error.code).toBe('FASE_INVALIDA');
      }
      expect(await estado(propuesta.id)).toMatchObject({ estado: 'reuniendo' });
    });

    it('la que junta gente es pública con su barra; el borrador sigue siendo de su equipo', async () => {
      const catalogo = (await request.get('/api/v1/campanas').expect(200)).body
        .data as CampanaEnCatalogo[];
      const enLista = catalogo.find((c) => c.id === propuesta.id);
      expect(enLista).toMatchObject({
        estado: 'reuniendo',
        impulso: { personas: 0, umbral: UMBRAL_IMPULSO },
        impulsadaPorMi: false,
      });
      expect(catalogo.some((c) => c.id === segunda)).toBe(false);
      expect(catalogo.find((c) => c.id === abierta.id)?.impulso).toBeNull();

      const publica = (await request.get(`/api/v1/campanas/${propuesta.slug}`).expect(200)).body
        .data as CampanaPublica;
      expect(publica).toMatchObject({
        estado: 'reuniendo',
        impulso: { personas: 0, umbral: UMBRAL_IMPULSO },
        impulsadaPorMi: false,
      });
      const propia = (
        await request.get(`/api/v1/campanas/${propuesta.slug}`).set('Cookie', cookieImpulsora)
      ).body.data as CampanaPublica;
      expect(propia.impulsadaPorMi).toBe(true);
      await request.get(`/api/v1/campanas/${segunda}`).expect(404);

      const mias = (
        await request.get('/api/v1/campanas?mias=1').set('Cookie', cookieImpulsora).expect(200)
      ).body.data as CampanaEnCatalogo[];
      expect(mias.find((c) => c.id === propuesta.id)).toMatchObject({
        impulso: { personas: 0, umbral: UMBRAL_IMPULSO },
        impulsadaPorMi: true,
        motivo: 'La presento para juntar gente.',
      });
      expect(mias.find((c) => c.id === segunda)).toMatchObject({
        estado: 'borrador',
        impulso: null,
      });
    });

    it('«Sumate» pone la marca de llegada y no escribe nada en la base', async () => {
      const antes = await personas();
      const cookie = await llegar();
      expect(cookie).toMatch(new RegExp(`^${COOKIE_IMPULSO}=${propuesta.id};`));
      expect(cookie).toMatch(/HttpOnly/);
      expect(cookie).toMatch(/SameSite=Lax/);
      expect(cookie).toMatch(new RegExp(`Max-Age=${String(DIAS_DE_IMPULSO * 86400)}`));
      expect(await personas()).toBe(antes);

      await request
        .post(`/api/v1/campanas/${propuesta.slug}/llegada`)
        .set('Cookie', `eihg_csrf=${CSRF}`)
        .expect(403);
      const cerrada = await enviar(
        `eihg_csrf=${CSRF}`,
        `/api/v1/campanas/${abierta.id}/llegada`,
        {},
      );
      expect(cerrada.status).toBe(409);
      expect(cerrada.body.error.code).toBe('CAMPANA_SIN_IMPULSO');
      await enviar(`eihg_csrf=${CSRF}`, `/api/v1/campanas/${segunda}/llegada`, {}).expect(404);
      await enviar(`eihg_csrf=${CSRF}`, '/api/v1/campanas/no-existe/llegada', {}).expect(404);
    });

    it('una persona nueva que llega y publica su primer aporte suma 1, y una sola vez', async () => {
      const marca = (await llegar()).split(';')[0] ?? '';
      primerAporte = await aportar([marca]);
      expect(primerAporte.actor).not.toBe('');
      expect(await personas()).toBe(1);
      await aportar([marca, primerAporte.actor]);
      expect(await personas()).toBe(1);
    });

    it('quien ya había publicado un aporte no suma aunque llegue desde la campaña', async () => {
      const veterana = await aportar([]);
      const marca = (await llegar()).split(';')[0] ?? '';
      await aportar([marca, veterana.actor]);
      expect(await personas()).toBe(1);
    });

    it('al llegar al umbral pasa sola a revisión, con su rastro y sus avisos', async () => {
      await contadasDirecto(UMBRAL_IMPULSO - 2);
      expect(await personas()).toBe(UMBRAL_IMPULSO - 1);
      expect(await estado(propuesta.id)).toMatchObject({ estado: 'reuniendo' });

      const marca = (await llegar()).split(';')[0] ?? '';
      await aportar([marca]);
      expect(await estado(propuesta.id)).toMatchObject({ estado: 'por_revisar' });
      expect(await personas()).toBe(UMBRAL_IMPULSO);
      const historia = await getDb().execute<{ estado: string; motivo: string }>(
        sql`select estado, motivo from campana_ediciones where campana_id = ${propuesta.id}::uuid order by revision desc limit 1`,
      );
      expect(historia.rows[0]).toEqual({
        estado: 'por_revisar',
        motivo: `Trajo ${String(UMBRAL_IMPULSO)} personas nuevas: pasa a revisión.`,
      });
      expect(await avisos(admin, 'impulso:revisar:')).toEqual([`impulso:revisar:${propuesta.id}`]);
      expect(await avisos(impulsora, 'impulso:lista:')).toEqual([`impulso:lista:${propuesta.id}`]);
    });

    it('la administración ve la lista para revisar con lo que escribieron; nadie más', async () => {
      await request.get('/api/v1/campanas/revision').expect(401);
      const comun = await request.get('/api/v1/campanas/revision').set('Cookie', cookieImpulsora);
      expect(comun.status).toBe(403);
      expect(comun.body.error.code).toBe('NOT_ADMIN');
      const r = await request
        .get('/api/v1/campanas/revision')
        .set('Cookie', cookieAdmin)
        .expect(200);
      const fila = (
        r.body.data as {
          id: string;
          personas: number;
          aportesTraidos: { id: string; texto: string }[];
        }[]
      ).find((c) => c.id === propuesta.id);
      expect(fila?.personas).toBe(UMBRAL_IMPULSO);
      expect(fila?.aportesTraidos).toHaveLength(2);
      expect(fila?.aportesTraidos[0]).toEqual({
        id: primerAporte.id,
        texto: 'Que la biblioteca del barrio abra también los sábados.',
        provincia: null,
      });
    });

    it('un aporte retirado deja de contar', async () => {
      await request
        .delete(`/api/v1/civic/senales/${primerAporte.id}`)
        .set('Cookie', [`eihg_csrf=${CSRF}`, primerAporte.actor].join('; '))
        .set('X-CSRF-Token', CSRF)
        .expect(200);
      expect(await personas()).toBe(UMBRAL_IMPULSO - 1);
    });

    it('en revisión, quien la impulsa no la abre ni le cambia las reglas', async () => {
      const abrir = await cambiar(cookieImpulsora, propuesta.id, 'abierta', 'Abrirla sin esperar.');
      expect(abrir.status).toBe(403);
      expect(abrir.body.error.code).toBe('NOT_ADMIN');
      const editar = await request
        .put(`/api/v1/campanas/${propuesta.id}`)
        .set('Cookie', cookieImpulsora)
        .set('X-CSRF-Token', CSRF)
        .send({ revision: (await estado(propuesta.id)).revision, contrato });
      expect(editar.status).toBe(409);
      expect(editar.body.error.code).toBe('EN_REVISION');
    });

    it('la administración devuelve una campaña ajena con un motivo que quien la impulsa lee', async () => {
      const motivo = 'La fecha de devolución es muy lejana: acercala y volvé a presentarla.';
      expect((await cambiar(cookieAdmin, propuesta.id, 'reuniendo', motivo)).status).toBe(200);
      const { revision } = await estado(propuesta.id);
      expect(await estado(propuesta.id)).toMatchObject({ estado: 'reuniendo' });
      const vista = (
        await request.get(`/api/v1/campanas/${propuesta.slug}`).set('Cookie', cookieImpulsora)
      ).body.data as CampanaPublica;
      expect(vista.historial[0]).toMatchObject({ revision, estado: 'reuniendo', motivo });
      expect(await avisos(impulsora, 'impulso:reuniendo:')).toEqual([
        `impulso:reuniendo:${propuesta.id}:${String(revision)}`,
      ]);
    });

    it('retirada para corregir deja de ser pública; presentada con la gente ya contada, vuelve a revisión', async () => {
      await cambiar(
        cookieImpulsora,
        propuesta.id,
        'borrador',
        'La retiro para corregir la fecha.',
      ).then((r) => expect(r.status).toBe(200));
      await request.get(`/api/v1/campanas/${propuesta.slug}`).expect(404);
      const catalogo = (await request.get('/api/v1/campanas')).body.data as CampanaEnCatalogo[];
      expect(catalogo.some((c) => c.id === propuesta.id)).toBe(false);

      await contadasDirecto(1);
      await cambiar(
        cookieImpulsora,
        propuesta.id,
        'reuniendo',
        'La vuelvo a presentar corregida.',
      ).then((r) => expect(r.status).toBe(200));
      expect(await estado(propuesta.id)).toMatchObject({ estado: 'por_revisar' });
    });

    it('la administración la abre, y desde ahí quien la impulsa la coordina', async () => {
      const ajena = await cambiar(cookieOtra, propuesta.id, 'abierta', 'Abrir una campaña ajena.');
      expect(ajena.status).toBe(403);
      expect(
        (await cambiar(cookieAdmin, propuesta.id, 'abierta', 'Las reglas se cumplen: abre.'))
          .status,
      ).toBe(200);
      const { revision } = await estado(propuesta.id);
      expect(await estado(propuesta.id)).toMatchObject({ estado: 'abierta' });
      expect(await avisos(impulsora, 'impulso:abierta:')).toEqual([
        `impulso:abierta:${propuesta.id}:${String(revision)}`,
      ]);
      const abiertaPublica = (await request.get(`/api/v1/campanas/${propuesta.slug}`)).body
        .data as CampanaPublica;
      expect(abiertaPublica.impulso).toBeNull();

      const pausarAjena = await cambiar(
        cookieAdmin,
        propuesta.id,
        'pausada',
        'Pausar una campaña ajena.',
      );
      expect(pausarAjena.status).toBe(403);
      expect(pausarAjena.body.error.code).toBe('SIN_PERMISO');
      expect(
        (await cambiar(cookieImpulsora, propuesta.id, 'pausada', 'Una pausa para ordenar.')).status,
      ).toBe(200);
      expect(
        (await cambiar(cookieImpulsora, propuesta.id, 'abierta', 'Volvemos a recibir aportes.'))
          .status,
      ).toBe(200);
      expect(
        (await cambiar(cookieImpulsora, propuesta.id, 'en_devolucion', 'Cerramos la recepción.'))
          .status,
      ).toBe(200);
      const cerrar = await cambiar(
        cookieImpulsora,
        propuesta.id,
        'cerrada',
        'Cerrar sin devolución.',
      );
      expect(cerrar.status).toBe(409);
      expect(cerrar.body.error.code).toBe('DEVOLUCION_PENDIENTE');
      const reabrir = await cambiar(
        cookieImpulsora,
        propuesta.id,
        'abierta',
        'Reabrir sin la coordinación.',
      );
      expect(reabrir.status).toBe(403);
      expect(reabrir.body.error.code).toBe('NOT_ADMIN');

      // Con la devolución publicada, quien la impulsa la cierra.
      await enviar(cookieImpulsora, `/api/v1/campanas/${propuesta.id}/devoluciones`, {
        idLocal: randomUUID(),
        revision: (await estado(propuesta.id)).revision,
        texto:
          'Leímos los aportes que llegaron y ordenamos lo que cada barrio pidió para su biblioteca.',
        limites: 'Llegaron pocos aportes del interior.',
        senales: [],
      }).expect(201);
      expect(
        (await cambiar(cookieImpulsora, propuesta.id, 'cerrada', 'Publicamos la devolución.'))
          .status,
      ).toBe(200);
      expect(await estado(propuesta.id)).toMatchObject({ estado: 'cerrada' });
    });
  },
);
