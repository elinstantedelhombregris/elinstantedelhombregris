#!/usr/bin/env tsx
/**
 * El callejero del Estado, espejado: 17.986 lugares y 326.832 calles.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §4.7.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 5.
 *
 *   pnpm --filter @v2/db geo:seed-callejero              # en seco
 *   pnpm --filter @v2/db geo:seed-callejero --aplicar    # escribe
 *
 * ── Tres capas, y la separación es lo que lo hace reanudable ───────────────
 *
 *   `callejero/fuente.ts`     TRAER      — puro respecto de la base
 *   `callejero/normalizar.ts` NORMALIZAR — puro del todo: sin red, sin base
 *   `callejero/escribir.ts`   ESCRIBIR   — lo único con efectos
 *   `callejero/corrida.ts`    las decisiones que se toman antes de tocar nada
 *   `callejero/fases.ts`      las seis fases, en el orden que las FK imponen
 *
 * Este archivo es la línea de comandos, el preflight y el reporte. La lógica
 * está en los cinco módulos de arriba, y los que se pueden afirmar sin base ni
 * internet están afirmados en `tests/seed-callejero.test.ts`.
 *
 * ── Las cuatro propiedades, y qué las sostiene ─────────────────────────────
 *
 * **Reanudable.** `geo_seed_progreso` con la corrida adentro de la clave. La
 * unidad es la partición —529 departamentos más 5 de jerarquía—, así que matar
 * el proceso en la 300 cuesta una partición y no una corrida.
 *
 * **Idempotente.** El `ON CONFLICT (georef_id) DO UPDATE … WHERE` de
 * `upsertLote`: una re-siembra sin cambios escribe **cero filas**. Sin ese
 * `WHERE`, cada re-corrida duplicaría el WAL y con él el almacenamiento, que en
 * una base con techo duro de 512 MB no es higiene sino presupuesto.
 *
 * **Auditable.** «Completa» no significa «el script terminó»: significa que la
 * suma cierra contra el conteo de la propia fuente,
 *
 *     entraron + duplicados + huérfanas = total que declaró la fuente
 *
 * y que el verificador vuelve a hacer esa cuenta **con `count(*)` de la tabla en
 * lugar de `entraron`**. Los dos lados tienen que ser independientes o no es una
 * verificación: comparar dos contadores que salieron los dos de leer la fuente
 * pasa en verde con el 4% del país faltando.
 *
 * **Falla cerrado.** Una partición que toca el techo de 15.000 filas de la API
 * corta la corrida entera; una fila que la fuente entregó y que no pudo entrar
 * deja la partición sin cerrar hasta que alguien la arregle o pase
 * `--tolerar-huerfanas` —que la cierra **dejándola contada**, nunca
 * escondida—; y el catálogo nuevo se marca vigente al final —nunca al
 * empezar—, así que hasta que termine los endpoints siguen sirviendo el
 * anterior.
 *
 * ── NO CORRE SOLO ──────────────────────────────────────────────────────────
 *
 * Escribe ~347.000 filas. Correr **primero completo contra una rama efímera de
 * Neon** y medir el pico con las consultas del Step 6 del plan; recién después
 * contra la base real. Es un paso humano y por eso el modo seco es el default.
 */
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import { GeoCallesRepository } from '../src/repositories/geo-calles.js';
import { GeographicRepository } from '../src/repositories/geographic.js';
import { geoSeedProgreso } from '../src/schema/geo-seed.js';
import * as schema from '../src/schema/index.js';

import {
  AVISO_DE_DESTINO,
  AYUDA,
  conMiles,
  decidirPublicacion,
  duracion,
  elegirCorrida,
  elegirDestino,
  evaluarCompletitud,
  faltante,
  fechaDeCorrida,
  leerOpciones,
  particionesDeCalles,
} from './callejero/corrida.js';
import {
  asegurarIndices,
  bajarIndices,
  callesVigentesPorDepartamento,
  cargarIndice,
  coberturaDelCatalogo,
  completitudDeLaCorrida,
  corridaVigente,
  corridasPublicadas,
  cuantasCalles,
  faltantesDeIndices,
  huellasDe,
  indicesPresentes,
  INDICES_DE_CALLES,
  publicarCategorias,
  publicarVersion,
  RegistroDeProgreso,
  totalesDelCatalogo,
} from './callejero/escribir.js';
import {
  auditarProvincias,
  ErrorDeTecho,
  sembrarCallesDeDepartamento,
  provinciasDelIndice,
  sembrarNivel,
} from './callejero/fases.js';
import { BASE_GEOREF, FuenteGeoref, planDePaginas, TECHO_DE_LA_API } from './callejero/fuente.js';
import { claveDeProvincia } from './clave-de-provincia.js';
import { sembrarProvincias, AVISO_A_MEDIAS } from './seed-provinces.js';

import type { TotalesDelCatalogo } from './callejero/escribir.js';
import type { Contexto, ResumenDeParticion } from './callejero/fases.js';
import type { Recurso } from './callejero/fuente.js';
import type { Db } from '../src/client.js';
import type { NivelDeLugar } from '../src/repositories/geographic.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const escribir = (texto: string): void => void process.stdout.write(texto);
const error = (texto: string): void => void process.stderr.write(texto);

/** La fuente citada en `geo_catalogo_version.fuente` y en `/api/v1/geo/version`. */
const FUENTE_DEL_CATALOGO = 'georef/api';

/**
 * Los cuatro niveles de jerarquía que sí se traen del payload de georef.
 *
 * **`porProvincia` no es una preferencia: es el techo de la fuente.** La API
 * entrega 10.000 filas por combinación de filtros (`max + inicio <= 10000`,
 * medido), y los asentamientos son 14.673. Sin partir, la fase pide
 * `inicio=10000` y come un 400 después de bajar 10.000 filas. Los otros tres
 * niveles entran holgados en una consulta: 529, 2.082 y 4.027.
 */
const NIVELES: readonly {
  recurso: Recurso;
  nivel: NivelDeLugar;
  porProvincia: boolean;
}[] = [
  { recurso: 'departamentos', nivel: 'department', porProvincia: false },
  { recurso: 'municipios', nivel: 'municipality', porProvincia: false },
  { recurso: 'localidades_censales', nivel: 'locality', porProvincia: false },
  { recurso: 'asentamientos', nivel: 'settlement', porProvincia: true },
];

/**
 * Lo que el ENSAYO del 2026-08-11 midió contra el corpus completo. **No es una
 * expectativa que decida nada** —la completitud se decide contra `total` de la
 * propia fuente— pero sí es contra lo que se compara el resultado al final: un
 * país que de golpe tiene 200 departamentos menos es algo que hay que ver en la
 * misma pantalla donde terminó la corrida.
 */
/**
 * Los seis totales, enumerados a mano y no con `Object.entries`.
 *
 * No es purismo: `Object.entries` sobre una interfaz devuelve `[string, any][]`
 * —el tipo de la clave se pierde y con él el del valor— y un `any` que entra por
 * la puerta de atrás en el único lugar donde se comparan conteos es exactamente
 * donde no se quiere. Además fija el ORDEN, que es el de las FK.
 */
const enumerarTotales = (t: TotalesDelCatalogo): readonly (readonly [string, number])[] => [
  ['provincias', t.provincias],
  ['departamentos', t.departamentos],
  ['municipios', t.municipios],
  ['localidades', t.localidades],
  ['asentamientos', t.asentamientos],
  ['calles', t.calles],
];

const MEDIDO_2026_08_11 = {
  provincias: 24,
  departamentos: 529,
  municipios: 2_082,
  localidades: 4_027,
  asentamientos: 11_324,
  calles: 326_832,
} as const;

// ---------------------------------------------------------------------------
// Preflight
// ---------------------------------------------------------------------------

type Preflight =
  | { estado: 'listo'; provinciasCompletas: number }
  | { estado: 'sin_migracion'; faltan: readonly string[] }
  | { estado: 'provincias_a_medias'; aMedias: number };

async function preflight(db: Db): Promise<Preflight> {
  // Sin esto, el error sería un «relation "geo_calles" does not exist» a mitad
  // de la fase 6, cuatro minutos después de empezar.
  const { rows } = await db.execute<{ tabla: string; presente: boolean }>(sql`
    select t.tabla, to_regclass('public.' || t.tabla) is not null as presente
      from (values ('geo_calles'), ('geo_calle_categorias'),
                   ('geo_seed_progreso'), ('geo_catalogo_version')) as t(tabla)`);
  const faltan = rows.filter((f) => !f.presente).map((f) => f.tabla);
  if (faltan.length > 0) return { estado: 'sin_migracion', faltan };

  const { rows: provincias } = await db.execute<{ completas: number; a_medias: number }>(sql`
    select count(*) filter (where georef_id is not null and name_norm is not null)::int as completas,
           count(*) filter (where georef_id is null or name_norm is null)::int          as a_medias
      from geographic_locations where level = 'province'`);
  const fila = provincias[0];
  const aMedias = fila?.a_medias ?? 0;
  if (aMedias > 0) return { estado: 'provincias_a_medias', aMedias };

  return { estado: 'listo', provinciasCompletas: fila?.completas ?? 0 };
}

// ---------------------------------------------------------------------------
// El simulacro
// ---------------------------------------------------------------------------

/**
 * En seco **no se bajan las 534 particiones**: se piden los seis `total` con
 * `max=1` y se dice qué haría la corrida. Un simulacro que tarda cuatro minutos
 * y castiga a la API del Estado para no escribir nada no lo corre nadie, y un
 * modo seco que nadie corre es lo mismo que no tenerlo.
 */
async function simulacro(
  db: Db,
  fuente: FuenteGeoref,
  provinciaId: number | undefined,
): Promise<void> {
  const indice = await cargarIndice(db);
  const particiones = particionesDeCalles(indice, {
    ...(provinciaId !== undefined && { provinciaId }),
  });
  const vigente = await corridaVigente(db);
  const calles = await cuantasCalles(db);

  escribir('\nLo que hay hoy en la base\n');
  const totales = await totalesDelCatalogo(db);
  for (const [clave, valor] of enumerarTotales(totales)) {
    escribir(`  ${clave.padEnd(16)} ${conMiles(valor).padStart(9)}\n`);
  }
  escribir(`  corrida vigente  ${vigente ?? '(ninguna: nunca se sembró)'}\n`);

  escribir('\nLo que declara la fuente\n');
  const recursos: readonly Recurso[] = [
    'provincias',
    'departamentos',
    'municipios',
    'localidades_censales',
    'asentamientos',
    'calles',
  ];
  let llamadasDeJerarquia = 0;
  for (const recurso of recursos) {
    const leido = await fuente.total(recurso);
    if (leido.estado === 'ilegible') {
      escribir(`  ${recurso.padEnd(22)} no se pudo leer: ${leido.motivo}\n`);
      continue;
    }
    // Las calles se piden partidas por departamento, así que su plan de páginas
    // como consulta única no significa nada: se cuenta aparte.
    const paginas = recurso === 'calles' ? 0 : planDePaginas(leido.total, 0).length;
    llamadasDeJerarquia += paginas;
    const aviso =
      leido.total >= TECHO_DE_LA_API
        ? '  ← no entra en una sola consulta'
        : paginas > 0
          ? `  ${String(paginas)} ${paginas === 1 ? 'página' : 'páginas'}`
          : '';
    escribir(`  ${recurso.padEnd(22)} ${conMiles(leido.total).padStart(9)}${aviso}\n`);
  }

  escribir(
    `\nLa corrida haría:\n` +
      `  · 1 fase de provincias (auditoría contra la fuente, sin escribir el payload)\n` +
      `  · 4 fases de jerarquía, ${String(llamadasDeJerarquia)} llamadas\n` +
      `  · ${conMiles(particiones.length)} particiones de calles, una por departamento\n` +
      '  · los tres btree compuestos SE BAJAN y se reponen al final —siempre, haya o no\n' +
      `    calles cargadas (hoy hay ${conMiles(calles)})—; --conservar-indices los deja en pie\n`,
  );

  const presentes = await indicesPresentes(db);
  const ausentes = faltantesDeIndices(presentes);
  if (ausentes.length > 0) {
    escribir(
      `\nATENCIÓN: faltan ${String(ausentes.length)} índices de \`geo_calles\`: ` +
        `${ausentes.map((i) => i.nombre).join(', ')}.\n` +
        '  Una corrida anterior murió con los índices bajados (un SIGKILL no ejecuta el\n' +
        '  `finally` que los repone). Corré con --aplicar y los rehace.\n',
    );
  }

  escribir('\nSimulacro: no se escribió nada. Volvé a correr con --aplicar.\n');
}

// ---------------------------------------------------------------------------
// El reporte
// ---------------------------------------------------------------------------

function reportar(resumenes: readonly ResumenDeParticion[]): { fallidas: number } {
  const porRecurso = new Map<string, ResumenDeParticion[]>();
  for (const r of resumenes) {
    const previas = porRecurso.get(r.recurso) ?? [];
    previas.push(r);
    porRecurso.set(r.recurso, previas);
  }

  escribir('\n── El diff de la corrida ────────────────────────────────────────────\n');
  escribir(
    `${'recurso'.padEnd(22)}${'declara'.padStart(9)}${'contab.'.padStart(9)}` +
      `${'escritas'.padStart(9)}${'igual'.padStart(9)}${'retiros'.padStart(8)}\n`,
  );

  let fallidas = 0;
  for (const [recurso, filas] of porRecurso) {
    const suma = (f: (r: ResumenDeParticion) => number): number =>
      filas.reduce((acc, r) => acc + f(r), 0);
    const declara = filas.reduce((acc, r) => acc + (r.totalDeclarado ?? 0), 0);
    escribir(
      `${recurso.padEnd(22)}${conMiles(declara).padStart(9)}` +
        conMiles(suma((r) => r.contabilizadas)).padStart(9) +
        conMiles(suma((r) => r.escritas)).padStart(9) +
        conMiles(suma((r) => r.sinCambios)).padStart(9) +
        `${conMiles(suma((r) => r.retiradas)).padStart(8)}\n`,
    );
    fallidas += filas.filter((r) => r.estado !== 'completa').length;
  }

  const duplicadasDeJerarquia = resumenes
    .filter((r) => r.recurso !== 'calles')
    .reduce((a, r) => a + r.duplicadas, 0);
  if (duplicadasDeJerarquia > 0) {
    escribir(
      `\n${conMiles(duplicadasDeJerarquia)} lugares deduplicados: el mismo \`georef_id\` ya había entrado por\n` +
        '  otro recurso. Son el mismo lugar listado en dos niveles (§Task 1, Step 3), y por eso\n' +
        `  \`settlement\` cierra en ${conMiles(MEDIDO_2026_08_11.asentamientos)} y no en las 14.673 que declara la fuente.\n`,
    );
  }

  /**
   * Éstas son OTRA cosa: la fuente entregó dos veces el mismo `georef_id` DENTRO
   * de la misma partición de calles. No pasó el 2026-08-11 y por eso vale
   * decirlo fuerte el día que pase: sin deduplicar, las dos filas entran al
   * mismo `INSERT … ON CONFLICT DO UPDATE` y Postgres corta la corrida entera
   * con el error 21000.
   */
  const callesRepetidas = resumenes
    .filter((r) => r.recurso === 'calles')
    .reduce((a, r) => a + r.duplicadas, 0);
  if (callesRepetidas > 0) {
    escribir(
      `\n${conMiles(callesRepetidas)} CALLES REPETIDAS en la fuente: el mismo \`georef_id\` entregado dos\n` +
        '  veces adentro de la misma partición. Entró una sola vez; las repeticiones quedan\n' +
        '  contadas en `geo_seed_progreso` como `<particion>:duplicados` para que la suma del\n' +
        '  verificador cierre. Vale mirarlas: la fuente no las entregaba el 2026-08-11.\n',
    );
  }

  const invertidos = resumenes.reduce((a, r) => a + r.rangosInvertidos, 0);
  if (invertidos > 0) {
    escribir(
      `\n${conMiles(invertidos)} calles con el rango invertido (desde > hasta). Entraron SIN rango:\n` +
        '  la fuente se contradice y no hay forma de saber cuál de los dos números está mal.\n' +
        '  La calle entra igual — sin rango sigue sirviendo para elegirla por nombre.\n',
    );
  }

  const recodificaciones = resumenes.flatMap((r) => r.recodificaciones);
  if (recodificaciones.length > 0) {
    escribir(
      `\n${conMiles(recodificaciones.length)} RECODIFICACIONES: un \`georef_id\` que existía ahora nombra una calle\n` +
        '  de OTRA localidad. NO se escribieron: la identidad de una calle es su id del Estado\n' +
        '  MÁS su localidad, así que esto es un retiro más un alta y no una modificación.\n' +
        '  Mientras `geo_calles_georef_unique` sea un unique total no se puede expresar, y\n' +
        '  mudarle las señales a otra calle en silencio es el desenlace que hay que evitar.\n' +
        `  ${recodificaciones.slice(0, 10).join(', ')}${recodificaciones.length > 10 ? '…' : ''}\n`,
    );
  }

  const conProblemas = resumenes.filter((r) => r.problemas.length > 0);
  if (conProblemas.length > 0) {
    escribir(`\n${String(conProblemas.length)} particiones con filas que NO pudieron entrar:\n`);
    for (const r of conProblemas.slice(0, 20)) {
      escribir(`  · ${r.recurso}/${r.particion} «${r.etiqueta}»\n`);
      for (const problema of r.problemas.slice(0, 5)) escribir(`      ${problema}\n`);
      if (r.problemas.length > 5) {
        escribir(`      … y ${String(r.problemas.length - 5)} más\n`);
      }
    }
  }

  // ── Las huérfanas, y la salida que antes no había ──────────────────────
  const huerfanas = resumenes.reduce((a, r) => a + r.huerfanas, 0);
  if (huerfanas > 0) {
    const toleradas = resumenes.filter((r) => r.estado === 'completa' && r.huerfanas > 0);
    const bloqueadas = resumenes.filter((r) => r.estado !== 'completa' && r.huerfanas > 0);
    escribir(
      `\n${conMiles(huerfanas)} filas que la fuente entregó y que NO están en la tabla.\n` +
        `  ${conMiles(toleradas.reduce((a, r) => a + r.huerfanas, 0))} en ${String(toleradas.length)} particiones CERRADAS con --tolerar-huerfanas.\n` +
        `  ${conMiles(bloqueadas.reduce((a, r) => a + r.huerfanas, 0))} en ${String(bloqueadas.length)} particiones que por eso NO cerraron.\n` +
        '  Las dos quedan anotadas en `geo_seed_progreso` como `<particion>:huerfanas`, y el\n' +
        '  verificador las suma: `count(*) + duplicados + huérfanas = total declarado`.\n' +
        '  (Este conteo es el de LO QUE ESTA CORRIDA MIRÓ: una corrida que retomó no vuelve\n' +
        '  a mirar las particiones que ya habían cerrado. El número completo lo da el\n' +
        '  verificador, que lee las anotaciones de la base y no la memoria de este proceso.)\n',
    );
    if (bloqueadas.length > 0) {
      escribir(
        '\n  Para que la corrida pueda publicar hay DOS caminos y ninguno es editar el código:\n' +
          '    1. arreglar lo que les falta (casi siempre un ancestro de la jerarquía que no\n' +
          '       entró) y volver a correr el mismo comando: retoma donde quedó;\n' +
          '    2. correr con --tolerar-huerfanas, que las cierra dejándolas contadas.\n',
      );
    }
  }

  const alFilo = resumenes.filter((r) => r.alFilo);
  if (alFilo.length > 0) {
    escribir(
      `\n${String(alFilo.length)} particiones a menos del 10% del techo de ${conMiles(TECHO_DE_LA_API)} filas.\n` +
        '  Todavía entran enteras. El día que no entren, el seed aborta — pero conviene\n' +
        '  partirlas más fino antes de ese día:\n' +
        `  ${alFilo.map((r) => `${r.etiqueta} (${conMiles(r.totalDeclarado ?? 0)})`).join(', ')}\n`,
    );
  }

  return { fallidas };
}

function compararConLoMedido(totales: Record<string, number>): void {
  escribir('\n── Contra lo medido el 2026-08-11 ──────────────────────────────────\n');
  for (const [clave, esperado] of Object.entries(MEDIDO_2026_08_11)) {
    const hay = totales[clave] ?? 0;
    const delta = hay - esperado;
    const marca = delta === 0 ? '=' : delta > 0 ? '+' : '';
    escribir(
      `  ${clave.padEnd(16)}${conMiles(hay).padStart(9)}  (medido ${conMiles(esperado)}` +
        `${delta === 0 ? '' : `, ${marca}${conMiles(delta)}`})\n`,
    );
  }
  escribir(
    '  Una diferencia acá no es un error: el país cambia y la fuente también. Es un\n' +
      '  número para mirar, no una condición para fallar — la completitud se decide\n' +
      '  contra `total` de la propia fuente, partición por partición.\n',
  );
}

/**
 * La última vez que ALGUNA partición de esta corrida se tocó. Es el respaldo de
 * `fecha_de_corte` cuando el nombre de la corrida no lleva su propia fecha.
 *
 * Si la corrida no dejó ni una fila —imposible acá, porque publicar exige
 * particiones cerradas— cae a `now()`, que es la única fecha real que queda.
 */
async function ultimaActividad(db: Db, corrida: string): Promise<Date> {
  const [fila] = await db
    .select({ ultima: sql<Date | null>`max(${geoSeedProgreso.actualizadoEn})` })
    .from(geoSeedProgreso)
    .where(eq(geoSeedProgreso.corrida, corrida));
  return fila?.ultima ?? new Date();
}

// ---------------------------------------------------------------------------
// La corrida
// ---------------------------------------------------------------------------

async function correr(db: Db, opciones: ReturnType<typeof leerOpciones>): Promise<number> {
  const arranque = Date.now();
  const fuente = new FuenteGeoref({
    ...(opciones.base !== undefined && { base: opciones.base }),
    ...(opciones.pausaMs !== undefined && { pausaMs: opciones.pausaMs }),
  });

  // ── Fase 1a: las 24 provincias, desde la lista canónica ─────────────────
  const provincias = await sembrarProvincias(db);
  escribir(
    `\nfase 1 · provincias: ${String(provincias.insertadas)} insertadas, ` +
      `${String(provincias.salteadas)} ya estaban\n`,
  );
  if (provincias.aMedias > 0) {
    error(AVISO_A_MEDIAS(provincias.aMedias));
    return 1;
  }

  // ── Elegir la corrida ───────────────────────────────────────────────────
  const vigente = await corridaVigente(db);
  const progresos = await db
    .select({
      corrida: geoSeedProgreso.corrida,
      estado: geoSeedProgreso.estado,
      actualizadoEn: geoSeedProgreso.actualizadoEn,
    })
    .from(geoSeedProgreso);
  const eleccion = elegirCorrida({
    progresos,
    // TODAS las publicadas, no sólo la vigente: una corrida que ya salió a
    // servirse conserva sus particiones en `completa`, y reanudarla es tomar
    // 535 atajos `ya_completa` y reportar éxito sin mirar la tabla.
    publicadas: await corridasPublicadas(db),
    pedida: opciones.corrida,
    ahora: new Date(),
  });
  if (eleccion.tipo === 'nueva') {
    escribir(`corrida nueva: ${eleccion.corrida}\n`);
    if (eleccion.abandonada !== null) {
      escribir(
        `  la corrida ${eleccion.abandonada.corrida} quedó abierta ` +
          `${
            eleccion.abandonada.ultimaActividad === null
              ? 'sin fecha de última actividad'
              : `el ${eleccion.abandonada.ultimaActividad.toISOString()}`
          } y NO se reanuda:\n` +
          '  describe un país de esa fecha, y reanudarla publicaría ese país fechado hoy.\n' +
          `  Queda donde está; --corrida=${eleccion.abandonada.corrida} la retoma igual si es lo que querés.\n`,
      );
    }
  } else {
    escribir(
      `reanuda la corrida ${eleccion.corrida} ` +
        `(${String(eleccion.pendientes)} particiones sin cerrar, última actividad ` +
        `${eleccion.ultimaActividad?.toISOString() ?? 'desconocida'})\n`,
    );
  }

  const registro = new RegistroDeProgreso(db, eleccion.corrida);
  const ctx: Contexto = {
    db,
    fuente,
    registro,
    indice: await cargarIndice(db),
    lugares: new GeographicRepository(db),
    calles: new GeoCallesRepository(db),
    huellasPrevias: vigente === undefined ? new Map() : await huellasDe(db, vigente),
    hechas: await registro.cargar(),
    habiaCalles: (await cuantasCalles(db)) > 0,
    // Medido ANTES de escribir una sola fila: es la mitad de la base del salteo
    // por huella, y medido después no diría nada.
    callesPorDepartamento: await callesVigentesPorDepartamento(db),
    tolerarHuerfanas: opciones.tolerarHuerfanas,
  };

  const resumenes: ResumenDeParticion[] = [];

  if (!opciones.soloCalles) {
    resumenes.push(await auditarProvincias(ctx, claveDeProvincia));
    const provinciasAuditadas = resumenes[0];
    if (provinciasAuditadas !== undefined && provinciasAuditadas.problemas.length > 0) {
      for (const problema of provinciasAuditadas.problemas) error(`  ! ${problema}\n`);
    }

    // ── Fases 2 a 5: la jerarquía ─────────────────────────────────────────
    for (const { recurso, nivel, porProvincia } of NIVELES) {
      const desde = Date.now();
      const particiones = porProvincia ? provinciasDelIndice(ctx.indice) : [undefined];
      const delNivel: ResumenDeParticion[] = [];
      for (const provincia of particiones) {
        const parte = await sembrarNivel(ctx, recurso, nivel, provincia);
        delNivel.push(parte);
        resumenes.push(parte);
        // Una fase partida imprime su avance: 24 particiones en silencio son
        // diez minutos sin saber si el proceso está vivo o colgado.
        if (provincia !== undefined) {
          escribir(
            `    ${provincia.georefId} ${provincia.nombre.slice(0, 26).padEnd(26)} ` +
              `${conMiles(parte.contabilizadas).padStart(6)}/${conMiles(parte.totalDeclarado ?? 0).padStart(6)} · ` +
              `${conMiles(parte.escritas).padStart(6)} escritas` +
              (parte.salteada === 'no' ? '' : ' · sin cambios') +
              `${parte.estado === 'completa' ? '' : '  ← INCOMPLETA'}\n`,
          );
        }
      }

      const suma = (leer: (r: ResumenDeParticion) => number): number =>
        delNivel.reduce((acumulado, r) => acumulado + leer(r), 0);
      const fallidas = delNivel.filter((r) => r.estado !== 'completa');
      const etiqueta = recurso.replaceAll('_', ' ');
      escribir(
        `fase · ${etiqueta.padEnd(22)} ` +
          `${conMiles(suma((r) => r.contabilizadas)).padStart(7)}/${conMiles(suma((r) => r.totalDeclarado ?? 0))} ` +
          `· ${conMiles(suma((r) => r.escritas))} escritas · ${duracion(Date.now() - desde)}` +
          (porProvincia ? ` · ${String(particiones.length)} particiones` : '') +
          `${fallidas.length === 0 ? '' : '  ← INCOMPLETA'}\n`,
      );
      if (fallidas.length > 0) {
        for (const rota of fallidas) {
          for (const problema of rota.problemas.slice(0, 5)) error(`  ! ${rota.particion}: ${problema}\n`);
        }
        error(
          `\nLa fase de ${etiqueta} no cerró y las que siguen dependen de ella.\n` +
            'No se sigue: una localidad sin su departamento entra sin jerarquía o no entra.\n',
        );
        return 1;
      }
    }
  }

  // ── Fase 6: el callejero ────────────────────────────────────────────────
  try {
    if (!opciones.soloJerarquia) {
      const particiones = particionesDeCalles(ctx.indice, {
        ...(opciones.provinciaId !== undefined && { provinciaId: opciones.provinciaId }),
      });
      escribir(`\nfase 6 · calles: ${conMiles(particiones.length)} particiones\n`);

      /**
       * **Los tres btree compuestos se bajan SIEMPRE.**
       *
       * Antes esto estaba condicionado a que la tabla estuviera vacía, y esa
       * condición se apagaba sola: ensayar una provincia con `--provincia=<id>`
       * —que es lo que el propio script recomienda hacer— deja filas, así que en
       * la corrida de verdad los índices quedaban en pie y las 326.832 entraban
       * manteniéndolos fila por fila, **fuera del único escenario donde el pico
       * se midió**. Lo mismo después de cualquier corrida cortada.
       *
       * El camino recomendado es el default y es el que respeta el presupuesto.
       * `--conservar-indices` es la salida para la re-siembra sobre datos vivos,
       * y dice en pantalla lo que cuesta.
       */
      if (opciones.conservarIndices) {
        escribir(
          '  índices: los tres btree QUEDAN EN PIE (--conservar-indices).\n' +
            '    El autocompletado sigue respondiendo durante la carga, y el motor los\n' +
            '    mantiene fila por fila: el pico de WAL y de memoria sube por encima del\n' +
            '    medido. Sin la bandera, se bajan y se reponen al terminar.\n',
        );
      } else {
        const bajados = await bajarIndices(db);
        escribir(
          bajados.length > 0
            ? `  índices bajados para la carga: ${bajados.join(', ')}\n` +
                '    (el autocompletado corre en seq scan hasta que se repongan, al final)\n'
            : '  índices: los tres btree ya estaban bajados; se reponen al terminar.\n',
        );
      }

      // El GIN de trigramas es de la Task 7 y va en SU PROPIA corrida, después
      // de esta. Si ya está puesto, la carga lo mantiene fila por fila y el pico
      // de memoria deja de ser el que se midió. No se baja desde acá —su
      // definición vive en la migración `0014` y copiarla sería tenerla dos
      // veces— pero sí se avisa, porque el número del presupuesto cambia.
      const presentes = await indicesPresentes(db);
      if (presentes.has('geo_calles_nombre_trgm')) {
        escribir(
          '\n  ATENCIÓN: `geo_calles_nombre_trgm` (el GIN de la 0014) ya está creado. El plan\n' +
            '  lo quiere DESPUÉS de esta carga: mantenerlo mientras entran 326.832 filas sube\n' +
            '  el pico por encima de lo medido. Lo barato es `DROP INDEX\n' +
            '  geo_calles_nombre_trgm`, sembrar, y volver a aplicar la 0014.\n\n',
        );
      }

      const desdeCalles = Date.now();
      let hechas = 0;
      for (const particion of particiones) {
        const resumen = await sembrarCallesDeDepartamento(ctx, particion);
        resumenes.push(resumen);
        hechas++;
        const transcurrido = Date.now() - desdeCalles;
        escribir(
          `  [${String(hechas).padStart(3)}/${String(particiones.length)}] ` +
            `${particion.georefId} ${resumen.etiqueta.slice(0, 28).padEnd(28)} ` +
            `${conMiles(resumen.contabilizadas).padStart(6)} filas · ` +
            `${conMiles(resumen.escritas).padStart(6)} escritas · ` +
            faltante(hechas, particiones.length, transcurrido).padStart(10) +
            (resumen.salteada === 'no' ? '' : ' · sin cambios') +
            `${resumen.estado === 'completa' ? '' : '  ← INCOMPLETA'}\n`,
        );
      }
    }
  } finally {
    // Pase lo que pase, los índices vuelven. Un proceso muerto con los índices
    // bajados deja el callejero sirviendo seq scans y nadie se entera hasta que
    // alguien mide una búsqueda. Un SIGKILL no ejecuta esto: por eso el
    // verificador mira `pg_indexes` y no le cree a este `finally`.
    const rehechos = await asegurarIndices(db);
    escribir(
      rehechos.length > 0
        ? `\níndices rehechos: ${rehechos.join(', ')}\n`
        : `\níndices: los ${String(INDICES_DE_CALLES.length)} btree ya estaban en pie, no hubo nada que rehacer.\n`,
    );
  }

  // ── El cierre ───────────────────────────────────────────────────────────
  const { fallidas } = reportar(resumenes);
  const totales = await totalesDelCatalogo(db);
  compararConLoMedido({ ...totales });

  if (fallidas > 0) {
    error(
      `\n${String(fallidas)} particiones no cerraron. La corrida ${eleccion.corrida} NO se marca vigente:\n` +
        '  los endpoints siguen sirviendo el catálogo anterior, que es lo correcto.\n' +
        '  Volvé a correr el mismo comando: retoma donde quedó.\n',
    );
    return 1;
  }

  if (opciones.soloJerarquia || opciones.soloCalles || opciones.provinciaId !== undefined) {
    escribir(
      '\nCorrida PARCIAL (--solo-… o --provincia): no se marca vigente ninguna versión.\n' +
        '  Una versión vigente afirma que el catálogo entero está sembrado con esa corrida.\n',
    );
    return 0;
  }

  /**
   * **EL GATE, y lo decide `count(*)` de la tabla.**
   *
   * `fallidas`, arriba, sale de la contabilidad de la FUENTE: `cerrarParticion`
   * suma lo PLANIFICADO. Si las filas nunca llegaron a la tabla esa suma cierra
   * igual —el 2026-08-11 declaró 326.832 completas sobre una tabla de 323.865, y
   * publicó—. Esto vuelve a hacer la cuenta contra la tabla, que es el único
   * lado que el seed no escribió, y **publicar depende de ella**.
   */
  const decision = decidirPublicacion(
    evaluarCompletitud(await completitudDeLaCorrida(db, eleccion.corrida)),
    eleccion.corrida,
  );
  if (decision.tipo === 'no_publica') {
    error(decision.aviso);
    return decision.codigoDeSalida;
  }

  const categorias = await publicarCategorias(db, eleccion.corrida);
  const cobertura = await coberturaDelCatalogo(db);

  /**
   * **`fecha_de_corte` es cuándo se LEYÓ la fuente, no cuándo corrió este
   * `INSERT`.** Con `new Date()`, una corrida que quedó a medias, se reanuda,
   * no encuentra nada pendiente y publica, sale fechada hoy sobre datos de otro
   * día. El nombre de la corrida ya lleva el instante en que empezó; cuando no
   * es uno de los nuestros —`--corrida=ensayo-3`— se cae a la última actividad
   * registrada en `geo_seed_progreso`, que también es una fecha real.
   */
  const fechaDeCorte = fechaDeCorrida(eleccion.corrida) ?? (await ultimaActividad(db, eleccion.corrida));
  await publicarVersion(db, {
    corrida: eleccion.corrida,
    fuente: FUENTE_DEL_CATALOGO,
    fechaDeCorte,
    totales,
    cobertura,
  });
  escribir(`\n  fecha de corte publicada: ${fechaDeCorte.toISOString()}\n`);

  escribir(
    `\n── La cobertura, que se publica y no se esconde ─────────────────────\n` +
      `  ${conMiles(cobertura.sinNombre)} calles sin nombre ` +
      `(${((cobertura.sinNombre / Math.max(totales.calles, 1)) * 100).toFixed(1)}% del país)\n` +
      `  ${conMiles(cobertura.conRango)} con algún rango de altura ` +
      `(${((cobertura.conRango / Math.max(totales.calles, 1)) * 100).toFixed(1)}%)\n` +
      '  O sea que «la altura cae en rango» es la rama MINORITARIA de la unión, no el caso\n' +
      '  normal, y la frase que ve la mayoría de la gente es la de `altura_sin_rango`.\n' +
      `  ${String(categorias)} categorías de calle publicadas en \`geo_calle_categorias\`.\n`,
  );

  escribir(
    `\nCorrida ${eleccion.corrida} VIGENTE. ${duracion(Date.now() - arranque)}.\n` +
      'Ahora corré la verificación del Step 6 del plan, que es la que decide de verdad.\n',
  );
  return 0;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const opciones = leerOpciones(process.argv.slice(2));

  if (opciones.ayuda) {
    escribir(AYUDA);
    return;
  }
  if (opciones.desconocidas.length > 0) {
    // Un `--aplicarr` mal tipeado que corriera igual haría un simulacro de
    // cuatro minutos que alguien va a leer como una siembra hecha.
    error(`Opciones que no existen: ${opciones.desconocidas.join(', ')}\n${AYUDA}`);
    process.exitCode = 1;
    return;
  }
  if (opciones.soloJerarquia && opciones.soloCalles) {
    error('--solo-jerarquia y --solo-calles se excluyen.\n');
    process.exitCode = 1;
    return;
  }

  const destino = elegirDestino(process.env);
  if (destino === null) {
    error('DATABASE_URL_UNPOOLED (o DATABASE_URL) es obligatoria.\n');
    process.exitCode = 1;
    return;
  }
  escribir(`\n${AVISO_DE_DESTINO(destino)}`);

  const db: Db = drizzle(neon(destino.url), { schema });

  const listo = await preflight(db);
  if (listo.estado === 'sin_migracion') {
    error(
      `La migración 0013 no está aplicada: faltan ${listo.faltan.join(', ')}.\n` +
        '  pnpm --filter @v2/db db:migrate\n',
    );
    process.exitCode = 1;
    return;
  }
  if (listo.estado === 'provincias_a_medias') {
    error(AVISO_A_MEDIAS(listo.aMedias));
    process.exitCode = 1;
    return;
  }

  escribir(
    `\nEl callejero · base ${opciones.base ?? BASE_GEOREF}\n` +
      `${String(listo.provinciasCompletas)} provincias con \`georef_id\` y \`name_norm\`\n`,
  );

  if (!opciones.aplicar) {
    const fuente = new FuenteGeoref({
      ...(opciones.base !== undefined && { base: opciones.base }),
      ...(opciones.pausaMs !== undefined && { pausaMs: opciones.pausaMs }),
    });
    await simulacro(db, fuente, opciones.provinciaId);
    return;
  }

  try {
    process.exitCode = await correr(db, opciones);
  } catch (err) {
    if (err instanceof ErrorDeTecho) {
      error(
        `\nEL TECHO DE LA API. ${err.message}\n\n` +
          `La API entrega ${conMiles(TECHO_DE_LA_API)} filas por combinación de filtros y esta\n` +
          'partición no entra. Hay filas que esta consulta no va a devolver NUNCA, y `total`\n' +
          'viene truncado en la misma respuesta: sin este aborto, `filas_escritas =\n' +
          'total_declarado` cerraría igual sobre un país incompleto.\n\n' +
          'Hay que partir más fino: agregar `localidad_censal` al filtro de esa partición.\n' +
          'La corrida NO se marcó vigente; el catálogo anterior sigue sirviéndose.\n',
      );
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

await main();
