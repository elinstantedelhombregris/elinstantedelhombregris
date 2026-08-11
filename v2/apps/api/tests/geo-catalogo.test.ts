/**
 * `/api/v1/geo/*` — el callejero del Estado servido desde casa, y el resolvedor
 * de escritura.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §4.1 a §4.6 y §8.4.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 4.
 *
 * El archivo está partido en dos mitades, y la partición no es prolijidad:
 *
 *   - **Sin base.** Todo lo que se puede afirmar sin una fila: los 400 del
 *     borde (que corren ANTES de tocar la base, y por eso se pueden probar
 *     contra la app entera), la forma canónica del texto, a qué paquete resuelve
 *     un asentamiento, el código de olvido y la exención de CSRF. Corren
 *     siempre.
 *   - **Contra Postgres.** Lo que necesita el callejero sembrado. Se saltean
 *     solos —sin `DATABASE_URL`, sin la migración `0013` aplicada, o sin calles
 *     cargadas— porque hoy no se cumple ninguna de las tres y un test que falla
 *     por eso no dice nada sobre este código. **Ninguno escribe una sola fila.**
 */
import '../src/load-env.js';

import { conTechoDeTiempo, getDb, sql } from '@v2/db';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import {
  codigoDeOlvido,
  codigoDeOlvidoValido,
  canonicoDeCalle,
  canonicoDeLugar,
  destinoDelPaquete,
  TABLAS_CON_DIRECCION,
  TECHO_DEL_ROUTER_MS,
} from '../src/features/geo/service.js';
import { resolverUbicacion } from '../src/features/geo/resolver.js';

import { hasDatabaseUrl } from './helpers/index.js';

import type { Ancestros, GeographicLocation } from '@v2/db';

const app = createApp();
const request = supertest(app);

/** Un lugar mínimo, para las pruebas puras de `destinoDelPaquete`. */
const lugar = (level: string, id = 1): GeographicLocation =>
  ({
    id,
    level,
    name: 'Un lugar',
    isoCode: null,
    provinceId: 6,
    parentId: null,
    departmentId: null,
    municipalityId: null,
    georefId: '060070',
    nameNorm: 'UN LUGAR',
    latitude: null,
    longitude: null,
    vigenteHasta: null,
    createdAt: new Date(),
  }) as GeographicLocation;

const ancestros = (over: Partial<Ancestros> & { lugar: GeographicLocation }): Ancestros => ({
  provinciaId: 6,
  departamentoId: null,
  municipioId: null,
  localidadId: null,
  ...over,
});

// ---------------------------------------------------------------------------
// Sin base
// ---------------------------------------------------------------------------

describe('el borde de /calles corta antes de tocar la base', () => {
  it('sin scope no busca: una calle sin dónde no le sirve a nadie', async () => {
    const res = await request.get('/api/v1/geo/calles?q=mor');
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain(
      'Decinos dónde buscar: una localidad, un departamento o una provincia.',
    );
  });

  it('dos ámbitos a la vez tampoco: el scope es uno o no es scope', async () => {
    const res = await request.get('/api/v1/geo/calles?q=mor&localidad=1&provincia=6');
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('Elegí un solo ámbito');
  });

  it('limite=100000 se rechaza: el techo por request no lo pone el limitador de tasa', async () => {
    const res = await request.get('/api/v1/geo/calles?q=mor&localidad=1&limite=100000');
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('50');
  });

  it('un q vacío no llega a la base', async () => {
    const res = await request.get('/api/v1/geo/calles?localidad=1');
    expect(res.status).toBe(400);
  });
});

describe('el borde de /lugares', () => {
  it('sin ningún filtro no lista el país entero', async () => {
    const res = await request.get('/api/v1/geo/lugares');
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('nivel=province');
  });

  it('un nivel que el CHECK no conoce se rechaza (guarda 11)', async () => {
    // `city` es el valor que este repositorio filtraba y que nunca tuvo una
    // sola fila: devolvía cero resultados sin un error a la vista. Que el borde
    // lo rechace es lo que convierte ese silencio en un 400.
    const res = await request.get('/api/v1/geo/lugares?nivel=city');
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('locality');
  });

  it('un q que normaliza a nada se rechaza en vez de devolver la tabla', async () => {
    const res = await request.get('/api/v1/geo/lugares?q=%25%25%25');
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('no queda nada para buscar');
  });
});

describe('la forma canónica del texto de búsqueda', () => {
  const CATEGORIAS = ['CALLE', 'AV', 'PJE'];

  it('las tildes y las minúsculas no cambian lo que se busca', () => {
    expect(canonicoDeCalle('josé maría moreno', CATEGORIAS)).toBe('JOSE MARIA MORENO');
  });

  it('los metacaracteres del LIKE desaparecen antes de tocar la consulta', () => {
    // `%` y `_` sobreviven a NFD, a mayúsculas y al colapso de espacios. Lo que
    // los mata es que el normalizador elimine todo lo que no sea alfanumérico.
    expect(canonicoDeCalle('%', CATEGORIAS)).toBe('');
    expect(canonicoDeCalle('_%_', CATEGORIAS)).toBe('');
  });

  it('la forma canónica es un punto fijo, así que el 308 no encadena saltos', () => {
    // El corte de categoría no es idempotente: «AV AV SAN MARTIN» necesita dos
    // pasadas. Si el redirect apuntara a la primera, el edge guardaría un objeto
    // por escalón, que es justo lo que el 308 existe para evitar.
    const canonico = canonicoDeCalle('AV AV SAN MARTIN', CATEGORIAS);
    expect(canonicoDeCalle(canonico, CATEGORIAS)).toBe(canonico);
    expect(canonico).toBe('SAN MARTIN');
  });

  it('el prefijo de categoría no se come una calle que empieza parecido', () => {
    expect(canonicoDeCalle('AVELLANEDA', CATEGORIAS)).toBe('AVELLANEDA');
  });

  it('el canónico de un lugar también es punto fijo', () => {
    const canonico = canonicoDeLugar('Río Negro');
    expect(canonico).toBe('RIO NEGRO');
    expect(canonicoDeLugar(canonico)).toBe(canonico);
  });
});

describe('a qué paquete resuelve un lugar', () => {
  it('una localidad censal tiene paquete propio', () => {
    expect(destinoDelPaquete('localidad', ancestros({ lugar: lugar('locality', 10) }))).toEqual({
      estado: 'propio',
    });
  });

  it('un asentamiento resuelve al paquete de su localidad ancestro', () => {
    expect(
      destinoDelPaquete(
        'localidad',
        ancestros({ lugar: lugar('settlement', 99), localidadId: 10, departamentoId: 5 }),
      ),
    ).toEqual({ estado: 'redirige', ambito: 'localidad', id: 10 });
  });

  it('un asentamiento que BAHRA deja sin localidad resuelve al de su departamento', () => {
    // Y no al de la localidad más cercana: atribuir por cercanía es inventar
    // con cara de dato (§2.7).
    expect(
      destinoDelPaquete(
        'localidad',
        ancestros({ lugar: lugar('settlement', 99), localidadId: null, departamentoId: 5 }),
      ),
    ).toEqual({ estado: 'redirige', ambito: 'departamento', id: 5 });
  });

  it('un asentamiento sin localidad ni departamento no recibe el paquete de un vecino', () => {
    const destino = destinoDelPaquete(
      'localidad',
      ancestros({ lugar: lugar('settlement', 99), localidadId: null, departamentoId: null }),
    );
    expect(destino.estado).toBe('sin_paquete');
  });

  it('una provincia no es una localidad, y se dice en vez de devolver algo', () => {
    const destino = destinoDelPaquete('localidad', ancestros({ lugar: lugar('province', 6) }));
    expect(destino.estado).toBe('sin_paquete');
  });

  it('un departamento tiene paquete propio y una localidad no lo tiene por esa ruta', () => {
    expect(destinoDelPaquete('departamento', ancestros({ lugar: lugar('department', 5) }))).toEqual(
      {
        estado: 'propio',
      },
    );
    expect(
      destinoDelPaquete('departamento', ancestros({ lugar: lugar('locality', 10) })).estado,
    ).toBe('sin_paquete');
  });
});

describe('el código que revoca una dirección', () => {
  it('el código de una fila no sirve para otra fila', () => {
    const codigo = codigoDeOlvido('senales', 'abc123');
    expect(codigoDeOlvidoValido('senales', 'abc123', codigo)).toBe(true);
    expect(codigoDeOlvidoValido('senales', 'abc124', codigo)).toBe(false);
  });

  it('el código de una tabla no sirve para otra tabla', () => {
    // Si el HMAC cubriera sólo el id, el código de la fila 5 de una tabla
    // serviría para la fila 5 de cualquier otra.
    const codigo = codigoDeOlvido('senales', 'abc123');
    expect(codigoDeOlvidoValido('otras', 'abc123', codigo)).toBe(false);
  });

  it('un código de otro largo se descarta sin tirar', () => {
    expect(codigoDeOlvidoValido('senales', 'abc123', 'x')).toBe(false);
    expect(codigoDeOlvidoValido('senales', 'abc123', '')).toBe(false);
  });

  it('todavía no hay ninguna tabla con dirección, y por eso la ruta no borra nada', () => {
    // Las cinco columnas de dirección y sus nueve CHECK los aplica la migración
    // `0015` sobre `senales` (rebanada 3). Que esto sea un test y no un
    // comentario es lo que hace que la lista se llene en la Task 13 y no se
    // olvide.
    expect(TABLAS_CON_DIRECCION.size).toBe(0);
  });
});

describe('la exención de CSRF va por patrón exacto y no por prefijo', () => {
  it('el DELETE del olvido pasa sin cookie: su autenticación es el código del recibo', async () => {
    const codigo = codigoDeOlvido('senales', 'abc123');
    const res = await request.delete(`/api/v1/geo/direccion/senales/abc123?c=${codigo}`);
    // No hay cookie ni header de CSRF y aun así no es un 403 de CSRF: llega
    // hasta la ruta, que hoy contesta 404 porque no hay tabla registrada.
    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).not.toContain('CSRF_FAILED');
  });

  it('un código ajeno da 403 del código, no del token', async () => {
    const res = await request.delete('/api/v1/geo/direccion/senales/abc123?c=cualquiera');
    expect(res.status).toBe(403);
    expect(JSON.stringify(res.body)).toContain('CODIGO_INVALIDO');
  });

  it('un POST hermano NO queda exento: eso es lo que la exención por prefijo regalaba', async () => {
    // Si la entrada fuera `{ method: 'DELETE', path: '/api/v1/geo/direccion' }`
    // la rama `startsWith(`${p}/`)` del middleware eximiría toda subruta. Este
    // test es la guarda de que no se hizo así.
    const res = await request.post('/api/v1/geo/direccion/senales/abc123').send({});
    expect(res.status).toBe(403);
    expect(JSON.stringify(res.body)).toContain('CSRF_FAILED');
  });
});

describe('resolverUbicacion: la vía que no consulta nada', () => {
  it('sin calle, sin localidad, sin provincia y sin punto dice por qué, y no pone cero', async () => {
    const resuelta = await resolverUbicacion(getDb(), { punto: null });
    expect(resuelta.origen).toBe('ninguna');
    if (resuelta.origen !== 'ninguna') throw new Error('inalcanzable');
    expect(resuelta.razon).toContain('No llegó ni calle');
  });

  it('NO GUARDA NINGÚN CENTROIDE: la unión no tiene dónde poner una coordenada', async () => {
    // La tentación es la localidad más cercana. En la provincia de Buenos Aires
    // el centroide más cercano puede estar a 40 km y en otro partido.
    const resuelta = await resolverUbicacion(getDb(), { punto: null });
    const claves = Object.keys(resuelta).join(' ').toLowerCase();
    for (const prohibida of ['lat', 'lng', 'latitud', 'longitud', 'centroide', 'coord']) {
      expect(claves).not.toContain(prohibida);
    }
  });
});

// ---------------------------------------------------------------------------
// Contra Postgres
// ---------------------------------------------------------------------------

const dsuite = hasDatabaseUrl ? describe : describe.skip;

interface EstadoDeLaTierra {
  jerarquiaReparada: boolean;
  calles: number;
  corrida: string | null;
  localidadConCalles: number | null;
  provinciaConCalles: number | null;
}

let tierra: EstadoDeLaTierra = {
  jerarquiaReparada: false,
  calles: 0,
  corrida: null,
  localidadConCalles: null,
  provinciaConCalles: null,
};

dsuite('el callejero contra la base', () => {
  beforeAll(async () => {
    const db = getDb();
    const { rows } = await db.execute<{ reparada: boolean; hay_calles: boolean }>(sql`
      select
        exists (select 1 from information_schema.columns
                 where table_name = 'geographic_locations' and column_name = 'parent_id') as reparada,
        to_regclass('public.geo_calles') is not null as hay_calles
    `);
    const estado = rows[0];
    tierra.jerarquiaReparada = estado?.reparada === true;
    if (estado?.hay_calles !== true) return;

    const conteo = await db.execute<{ n: number }>(sql`select count(*)::int as n from geo_calles`);
    tierra.calles = conteo.rows[0]?.n ?? 0;
    if (tierra.calles === 0) return;

    const version = await db.execute<{ corrida: string }>(
      sql`select corrida from geo_catalogo_version where vigente limit 1`,
    );
    tierra.corrida = version.rows[0]?.corrida ?? null;

    const territorio = await db.execute<{ localidad_id: number; provincia_id: number }>(sql`
      select localidad_id, provincia_id from geo_calles
       where nombre_clase = 'nominada' and vigente_hasta is null limit 1
    `);
    tierra.localidadConCalles = territorio.rows[0]?.localidad_id ?? null;
    tierra.provinciaConCalles = territorio.rows[0]?.provincia_id ?? null;
  });

  afterAll(() => {
    tierra = {
      jerarquiaReparada: false,
      calles: 0,
      corrida: null,
      localidadConCalles: null,
      provinciaConCalles: null,
    };
  });

  it('el techo del router lo hace cumplir el MOTOR, no una promesa abandonada', async () => {
    // Es la única forma que tiene este driver: `neon-http` manda cada consulta
    // en su propia petición, así que no hay sesión donde poner un `SET`, y
    // `?options=-c statement_timeout=…` en el DSN el proxy lo descarta en
    // silencio (medido). Lo que queda es el batch, y esto prueba que muerde.
    expect(TECHO_DEL_ROUTER_MS).toBe(2000);
    const db = getDb();
    await expect(conTechoDeTiempo(db, 100, db.execute(sql`select pg_sleep(2)`))).rejects.toThrow(
      /statement timeout/i,
    );
  });

  it('/version responde no-cache SIEMPRE, incluso cuando la consulta falla', async () => {
    // El `no-cache` es lo que hace verdadera la promesa del paquete `immutable`:
    // es por acá que el teléfono se entera de que su catálogo quedó viejo. Un
    // fallo cacheado justo acá se pega solo, así que la cabecera va antes de
    // consultar. Hoy, sin la `0013` aplicada, esta ruta responde 500 — y aun así
    // responde `no-cache`, que es lo que este test afirma.
    const res = await request.get('/api/v1/geo/version');
    expect(res.headers['cache-control']).toBe('no-cache');
  });

  it('/version dice si hay catálogo o si no lo hay, sin inventar un total en cero', async ({
    skip,
  }) => {
    if (!tierra.jerarquiaReparada) skip();
    const res = await request.get('/api/v1/geo/version');
    expect(res.status).toBe(200);
    const catalogo = (res.body as { data: { catalogo: { estado: string } } }).data.catalogo;
    expect(['vigente', 'sin_catalogo']).toContain(catalogo.estado);
  });

  it('/version trae la cobertura por provincia y no un total pelado', async ({ skip }) => {
    if (tierra.corrida === null) skip();
    const res = await request.get('/api/v1/geo/version');
    const catalogo = (
      res.body as {
        data: { catalogo: { cobertura?: { rangoDeAltura?: unknown[]; sinNombre?: number } } };
      }
    ).data.catalogo;
    // Sin esto, alguien lee «en Córdoba nadie confirma alturas» como un dato
    // sobre Córdoba, cuando es un dato sobre el INDEC.
    expect(Array.isArray(catalogo.cobertura?.rangoDeAltura)).toBe(true);
    expect(typeof catalogo.cobertura?.sinNombre).toBe('number');
  });

  it('/lugares devuelve las 24 provincias con su caché de un día', async ({ skip }) => {
    if (!tierra.jerarquiaReparada) skip();
    const res = await request.get('/api/v1/geo/lugares?nivel=province&limite=50');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=86400');
    expect((res.body as { data: { lugares: unknown[] } }).data.lugares).toHaveLength(24);
  });

  it('un q que no venía canónico redirige 308 a la URL canónica', async ({ skip }) => {
    if (!tierra.jerarquiaReparada) skip();
    const res = await request.get('/api/v1/geo/lugares?nivel=province&q=c%C3%B3rdoba');
    expect(res.status).toBe(308);
    expect(res.headers['location']).toContain('q=CORDOBA');
    expect(res.headers['location']).toContain('nivel=province');
  });

  it('el scope de localidad busca con un solo carácter', async ({ skip }) => {
    if (tierra.localidadConCalles === null) skip();
    const res = await request.get(
      `/api/v1/geo/calles?localidad=${String(tierra.localidadConCalles)}&q=a`,
    );
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=300');
    expect((res.body as { data: { estado: string } }).data.estado).toBe('buscada');
  });

  it('el scope de provincia pide tres, y con dos dice que no miró', async ({ skip }) => {
    if (tierra.provinciaConCalles === null) skip();
    const corto = await request.get(
      `/api/v1/geo/calles?provincia=${String(tierra.provinciaConCalles)}&q=mo`,
    );
    expect(corto.status).toBe(200);
    // No es un array vacío: «no miramos» y «miramos y no hay» son distintas.
    expect((corto.body as { data: { estado: string } }).data.estado).toBe('consulta_corta');

    const largo = await request.get(
      `/api/v1/geo/calles?provincia=${String(tierra.provinciaConCalles)}&q=mor`,
    );
    expect(largo.status).toBe(200);
    expect((largo.body as { data: { estado: string } }).data.estado).toBe('buscada');
  });

  it('q=% no devuelve la localidad entera', async ({ skip }) => {
    if (tierra.localidadConCalles === null) skip();
    const res = await request.get(
      `/api/v1/geo/calles?localidad=${String(tierra.localidadConCalles)}&q=%25`,
    );
    expect(res.status).toBe(200);
    const data = res.body as { data: { estado: string; calles?: unknown[] } };
    expect(data.data.estado).toBe('consulta_corta');
    expect(data.data.calles).toBeUndefined();
  });

  it('una calle sin nombre no aparece en la búsqueda y sí sale por su id, con su marca', async ({
    skip,
  }) => {
    if (tierra.calles === 0) skip();
    const db = getDb();
    const { rows } = await db.execute<{ id: number; localidad_id: number; nombre: string }>(sql`
      select id, localidad_id, nombre from geo_calles where nombre_clase = 'sin_nombre' limit 1
    `);
    const sinNombre = rows[0];
    if (sinNombre === undefined) {
      skip();
      return;
    }

    const porId = await request.get(`/api/v1/geo/calles/${String(sinNombre.id)}`);
    expect(porId.status).toBe(200);
    // Sale con su marca, para que una señal vieja pueda seguir mostrando la
    // dirección que tenía. Por eso el catálogo marca y no borra.
    expect(
      (porId.body as { data: { calle: { nombreClase: string } } }).data.calle.nombreClase,
    ).toBe('sin_nombre');

    const buscada = await request.get(
      `/api/v1/geo/calles?localidad=${String(sinNombre.localidad_id)}&q=${encodeURIComponent(
        sinNombre.nombre,
      )}`,
    );
    const cuerpo = buscada.body as { data: { estado: string; calles?: { id: number }[] } };
    if (cuerpo.data.estado === 'buscada') {
      expect(cuerpo.data.calles?.some((c) => c.id === sinNombre.id)).toBe(false);
    }
  });

  it('el paquete de una localidad sale immutable y con ETag', async ({ skip }) => {
    if (tierra.corrida === null || tierra.localidadConCalles === null) skip();
    const res = await request.get(
      `/api/v1/geo/paquete/${String(tierra.corrida)}/localidad/${String(tierra.localidadConCalles)}`,
    );
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(res.headers['etag']).toBeTruthy();
    const paquete = (res.body as { data: { paquete: { corrida: string; columnas: string[] } } })
      .data.paquete;
    expect(paquete.corrida).toBe(tierra.corrida);
    // El orden de columnas viaja adentro: un cliente viejo sigue leyendo por
    // posición declarada el día que se agregue una columna.
    expect(paquete.columnas[0]).toBe('id');
  });

  it('una corrida que no es la vigente da 404 y no el catálogo de hoy con la etiqueta de ayer', async ({
    skip,
  }) => {
    if (tierra.corrida === null || tierra.localidadConCalles === null) skip();
    const res = await request.get(
      `/api/v1/geo/paquete/corrida-que-no-existe/localidad/${String(tierra.localidadConCalles)}`,
    );
    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).toContain('CORRIDA_VIEJA');
  });

  it('un settlement resuelve al paquete de su localidad ancestro', async ({ skip }) => {
    if (tierra.corrida === null) skip();
    const db = getDb();
    const { rows } = await db.execute<{ id: number; parent_id: number }>(sql`
      select g.id, g.parent_id from geographic_locations g
       join geographic_locations p on p.id = g.parent_id
       where g.level = 'settlement' and p.level = 'locality' limit 1
    `);
    const asentamiento = rows[0];
    if (asentamiento === undefined) {
      skip();
      return;
    }

    const res = await request.get(
      `/api/v1/geo/paquete/${String(tierra.corrida)}/localidad/${String(asentamiento.id)}`,
    );
    expect(res.status).toBe(308);
    expect(res.headers['location']).toContain(`/localidad/${String(asentamiento.parent_id)}`);
  });

  it('un settlement sin localidad resuelve al paquete de su departamento', async ({ skip }) => {
    if (tierra.corrida === null) skip();
    const db = getDb();
    const { rows } = await db.execute<{ id: number; department_id: number }>(sql`
      select g.id, g.department_id from geographic_locations g
       left join geographic_locations p on p.id = g.parent_id
       where g.level = 'settlement' and g.department_id is not null
         and (p.id is null or p.level <> 'locality') limit 1
    `);
    const asentamiento = rows[0];
    if (asentamiento === undefined) {
      skip();
      return;
    }

    const res = await request.get(
      `/api/v1/geo/paquete/${String(tierra.corrida)}/localidad/${String(asentamiento.id)}`,
    );
    expect(res.status).toBe(308);
    expect(res.headers['location']).toContain(
      `/departamento/${String(asentamiento.department_id)}`,
    );
  });
});

dsuite('resolverUbicacion contra la base', () => {
  it('vía 4: un punto resuelve a provincia y deja dicho que puede errar', async ({ skip }) => {
    if (!tierra.jerarquiaReparada) skip();
    // Obelisco.
    const resuelta = await resolverUbicacion(getDb(), { punto: { lat: -34.6037, lng: -58.3816 } });
    expect(resuelta.origen).toBe('punto');
    if (resuelta.origen !== 'punto') throw new Error('inalcanzable');
    expect(resuelta.advertencia).toContain('polígono simplificado');
  });

  it('vía 5: un punto en el Atlántico no inventa una provincia', async ({ skip }) => {
    if (!tierra.jerarquiaReparada) skip();
    const resuelta = await resolverUbicacion(getDb(), { punto: { lat: -40, lng: -50 } });
    expect(resuelta.origen).toBe('ninguna');
    if (resuelta.origen !== 'ninguna') throw new Error('inalcanzable');
    expect(resuelta.razon).toContain('no cae en ninguna provincia');
  });

  it('vía 3: una provincia declarada que no existe da 400 en castellano, no 500', async ({
    skip,
  }) => {
    if (!tierra.jerarquiaReparada) skip();
    await expect(
      resolverUbicacion(getDb(), { provinciaId: 99999999, punto: null }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('vía 1: un calleId inexistente da 400 en castellano, no una violación de FK', async ({
    skip,
  }) => {
    if (tierra.calles === 0) skip();
    // Es la diferencia entre un error que la persona entiende y un 500 que sale
    // de la clave foránea después de que el INSERT ya empezó.
    await expect(
      resolverUbicacion(getDb(), { calleId: 999999999, punto: null }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('vía 1: la calle gana la jerarquía, y el punto que la contradice queda dicho', async ({
    skip,
  }) => {
    if (tierra.calles === 0) skip();
    const db = getDb();
    const { rows } = await db.execute<{ id: number; provincia_id: number }>(sql`
      select c.id, c.provincia_id from geo_calles c
       join geographic_locations p on p.id = c.provincia_id
       where c.nombre_clase = 'nominada' and p.name <> 'Tierra del Fuego' limit 1
    `);
    const calle = rows[0];
    if (calle === undefined) {
      skip();
      return;
    }

    // Ushuaia: lejos de cualquier provincia que no sea Tierra del Fuego.
    const resuelta = await resolverUbicacion(db, {
      calleId: calle.id,
      punto: { lat: -54.8019, lng: -68.3029 },
    });
    expect(resuelta.origen).toBe('catalogo');
    if (resuelta.origen !== 'catalogo') throw new Error('inalcanzable');
    // Gana la calle para la jerarquía y el punto sigue siendo el punto: son dos
    // hechos y no compiten. Lo que no se hace es tirar la contradicción.
    expect(resuelta.provinciaId).toBe(calle.provincia_id);
    expect(resuelta.discrepancia).toContain('no cae en la provincia de esa calle');
  });

  it('vía 2: una localidad elegida sube su jerarquía sin perder el departamento', async ({
    skip,
  }) => {
    if (!tierra.jerarquiaReparada) skip();
    const db = getDb();
    const { rows } = await db.execute<{ id: number; province_id: number }>(sql`
      select id, province_id from geographic_locations where level = 'locality' limit 1
    `);
    const localidad = rows[0];
    if (localidad === undefined) {
      skip();
      return;
    }

    const resuelta = await resolverUbicacion(db, { localidadId: localidad.id, punto: null });
    expect(resuelta.origen).toBe('declarada');
    if (resuelta.origen !== 'declarada') throw new Error('inalcanzable');
    expect(resuelta.provinciaId).toBe(localidad.province_id);
    expect(resuelta.localidadId).toBe(localidad.id);
  });

  it('la precedencia manda: con calle Y localidad Y provincia gana la calle', async ({ skip }) => {
    if (tierra.calles === 0) skip();
    const db = getDb();
    const { rows } = await db.execute<{ id: number; localidad_id: number; provincia_id: number }>(
      sql`select id, localidad_id, provincia_id from geo_calles where nombre_clase = 'nominada' limit 1`,
    );
    const calle = rows[0];
    if (calle === undefined) {
      skip();
      return;
    }

    const resuelta = await resolverUbicacion(db, {
      calleId: calle.id,
      localidadId: 1,
      provinciaId: 1,
      punto: null,
    });
    expect(resuelta.origen).toBe('catalogo');
  });
});
