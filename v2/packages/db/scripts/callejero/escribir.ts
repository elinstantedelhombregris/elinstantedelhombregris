/**
 * CAPA 3 — ESCRIBIR. Lo único de las tres capas que no es puro.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §3.5, §4.7.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 5, Steps 3 y 4.
 *
 * ── EL DESVÍO DEL PLAN, CON SU ARGUMENTO ───────────────────────────────────
 *
 * El plan pide, textual: «`TRUNCATE geo_calles_stage`, `COPY` adentro de una
 * staging **UNLOGGED**, y después `INSERT INTO geo_calles SELECT * FROM
 * geo_calles_stage ON CONFLICT (georef_id) DO UPDATE SET … WHERE (algo
 * cambió)`». Acá **no hay staging y no hay `COPY`**, y la razón es que la
 * staging sin `COPY` no compra nada y cuesta el doble:
 *
 *  1. **`COPY` no está disponible por este camino.** La base habla por
 *     `neon-http` (un POST por sentencia) y ni el driver HTTP ni `pg` sin
 *     `pg-copy-streams` —que no es dependencia de este repo y agregarla pide
 *     ADR— pueden abrir un stream de `COPY`. Lo que sí se puede es un INSERT
 *     multi-fila parametrizado, que es lo que hace `upsertLote`.
 *  2. **Sin `COPY`, la staging escribe cada fila dos veces**: una al llenar la
 *     staging y otra al `INSERT … SELECT`. La staging existía para que `COPY`
 *     —que no acepta `ON CONFLICT`— pudiera convivir con el upsert. Sin `COPY`
 *     de por medio, la staging es trabajo extra, no ahorro.
 *  3. **La sentencia que el plan pide ya está escrita, y una sola vez.**
 *     `GeoCallesRepository.upsertLote` (Task 3) es exactamente ese `ON CONFLICT
 *     (georef_id) DO UPDATE … WHERE`, con la regla de identidad —`georef_id` +
 *     localidad— adentro. Reescribirla acá en SQL crudo sería tener dos
 *     definiciones de qué es «la misma calle», que es la clase de duplicación
 *     que este repo trata como defecto y no como estilo.
 *
 * **Lo que SÍ se conserva es lo que el presupuesto medido necesita**, que es la
 * otra mitad del Step 3: el `WHERE` del `DO UPDATE` (una re-siembra sin cambios
 * escribe cero filas), los tres btree compuestos abajo durante la carga, el GIN
 * en otra corrida (Task 7), y ninguna transacción larga.
 *
 * ── LOS ÍNDICES ────────────────────────────────────────────────────────────
 *
 * La `0013` YA creó los tres btree compuestos, así que «se construyen después
 * de la carga» sólo se puede cumplir bajándolos primero. **Se bajan siempre**, y
 * `--conservar-indices` es la salida para quien prefiera pagar el pico antes que
 * cinco minutos de autocompletado en seq scan.
 *
 * Antes esto estaba condicionado a que la tabla estuviera vacía, y esa condición
 * era el defecto: ensayar una provincia con `--provincia=<id>` deja filas, así
 * que en la corrida real la tabla ya no estaba vacía, los tres btree NO se
 * bajaban, y las 326.832 entraban manteniéndolos fila por fila —fuera del único
 * escenario donde el pico se midió—. Lo mismo pasaba después de cualquier
 * corrida cortada. Un default que se apaga solo cuando alguien ensayó es un
 * default que no protege nada.
 *
 * `asegurarIndices` corre siempre en el `finally`, así que un proceso muerto a
 * la mitad no deja el callejero sin índices — salvo un SIGKILL, que no ejecuta
 * el `finally`, y por eso el verificador mira `pg_indexes` y no confía en esto.
 */
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';

import { geoCalleCategorias, geoCalles } from '../../src/schema/geo-calles.js';
import { geoCatalogoVersion, geoSeedProgreso } from '../../src/schema/geo-seed.js';
import { geographicLocations } from '../../src/schema/geographic.js';

import type { CompletitudDeParticion } from './corrida.js';
import type { IndiceDeLugares, LugarEnBase } from './normalizar.js';
import type { Db } from '../../src/client.js';
import type { GeoSeedProgreso } from '../../src/schema/geo-seed.js';

/** Cuántas filas por sentencia. 500 × 10 columnas queda lejos del tope de parámetros. */
export const LOTE_DE_CALLES = 500;

/** Cuántos ids por `IN (...)` cuando hay que retirar filas. */
const LOTE_DE_IDS = 500;

export type EstadoDeParticion = 'pendiente' | 'en_curso' | 'completa' | 'fallida';

// ---------------------------------------------------------------------------
// El progreso
// ---------------------------------------------------------------------------

export const claveDeParticion = (recurso: string, particion: string): string =>
  `${recurso}|${particion}`;

/**
 * ── LAS DOS ANOTACIONES, Y POR QUÉ VIVEN EN LA MISMA TABLA ─────────────────
 *
 * Una partición cierra cuando **`entraron + duplicados + huérfanas` da el total
 * que declaró la fuente**. Los dos sumandos de la derecha son filas que la
 * fuente entregó y que la tabla no tiene: sin ellos escritos en algún lado, el
 * verificador no puede comparar `count(*)` contra `total_declarado` — le faltaría
 * justo el término que explica la diferencia, y una verificación a la que le
 * falta un término no verifica, adivina.
 *
 * Se guardan como dos filas más de `geo_seed_progreso`, con la partición
 * sufijada. Es feo y es a propósito: **sobreviven a la reanudación.** Un contador
 * en memoria se pierde cuando la corrida retoma y saltea las particiones que ya
 * cerraron, y entonces la corrida publicaría diciendo «cero duplicados» sobre
 * 3.349 asentamientos deduplicados. La alternativa —una columna nueva— es una
 * migración, y los números 0014 a 0017 ya están reservados por el plan.
 *
 *  - `<particion>:duplicados` — la fuente declaró dos veces el mismo `georef_id`.
 *    **Benigno y esperado**: son los 3.349 asentamientos que ya entraron como
 *    localidad censal. No pide permiso a nadie.
 *  - `<particion>:huerfanas` — la fila no pudo entrar: ilegible, sin ancestro, o
 *    un `georef_id` recodificado a otra localidad. **Cierra sólo con
 *    `--tolerar-huerfanas`**, y aun tolerada queda contada acá para siempre.
 */
export const SUFIJO_DUPLICADOS = ':duplicados';
export const SUFIJO_HUERFANAS = ':huerfanas';

/** ¿Esta fila de `geo_seed_progreso` es una anotación y no una partición? */
export const esAnotacion = (particion: string): boolean =>
  particion.endsWith(SUFIJO_DUPLICADOS) || particion.endsWith(SUFIJO_HUERFANAS);

/**
 * `geo_seed_progreso`, con la corrida DENTRO de la clave.
 *
 * Es lo que hace que matar el proceso a la mitad cueste una página y no una
 * corrida, y lo que hace que «completa» sea una afirmación auditable en vez de
 * «el script terminó».
 *
 * **`filas_escritas` cuenta las filas de la FUENTE que quedaron contabilizadas,
 * no las filas que el motor tocó.** La diferencia importa en dos lugares y en
 * los dos el nombre engaña si no se lee esto:
 *
 *  - una re-siembra sin cambios escribe cero filas en `geo_calles` y sin
 *    embargo `filas_escritas` vuelve a dar 326.832, porque lo que se audita es
 *    «¿vimos todo lo que la fuente declara?» y no «¿cuánto WAL generamos?»;
 *  - los 3.349 asentamientos deduplicados **cuentan**: la fuente los declaró y
 *    los procesamos. Si no contaran, `asentamientos` cerraría en 11.324 contra
 *    un `total_declarado` de 14.673 y la verificación del Step 6 —que exige
 *    `filas_escritas = total_declarado`— fallaría para siempre sobre un estado
 *    correcto.
 *
 * Lo que **no** cuenta es una fila que la fuente entregó y que no pudo entrar
 * (sin ancestro, ilegible). Ahí la partición no llega a `completa` y se ve.
 */
export class RegistroDeProgreso {
  constructor(
    private readonly db: Db,
    readonly corrida: string,
  ) {}

  /** Todo el progreso de una corrida, indexado por `recurso|particion`. */
  async cargar(corrida: string = this.corrida): Promise<Map<string, GeoSeedProgreso>> {
    const filas = await this.db
      .select()
      .from(geoSeedProgreso)
      .where(eq(geoSeedProgreso.corrida, corrida));
    return new Map(filas.map((f) => [claveDeParticion(f.recurso, f.particion), f]));
  }

  async guardar(entrada: {
    readonly recurso: string;
    readonly particion: string;
    readonly estado: EstadoDeParticion;
    readonly totalDeclarado: number | null;
    readonly filasEscritas: number;
    readonly offsetSiguiente: number;
    readonly hashFuente: string | null;
  }): Promise<void> {
    await this.db
      .insert(geoSeedProgreso)
      .values({
        corrida: this.corrida,
        recurso: entrada.recurso,
        particion: entrada.particion,
        estado: entrada.estado,
        totalDeclarado: entrada.totalDeclarado,
        filasEscritas: entrada.filasEscritas,
        offsetSiguiente: entrada.offsetSiguiente,
        hashFuente: entrada.hashFuente,
        actualizadoEn: new Date(),
      })
      .onConflictDoUpdate({
        target: [geoSeedProgreso.corrida, geoSeedProgreso.recurso, geoSeedProgreso.particion],
        set: {
          estado: sql`excluded.estado`,
          totalDeclarado: sql`excluded.total_declarado`,
          filasEscritas: sql`excluded.filas_escritas`,
          offsetSiguiente: sql`excluded.offset_siguiente`,
          hashFuente: sql`excluded.hash_fuente`,
          actualizadoEn: sql`now()`,
        },
      });
  }

  /**
   * Las dos anotaciones de una partición. Se escriben cuando hay algo que
   * anotar y **se borran cuando ya no**: una partición que se vuelve a correr y
   * esta vez entra entera no puede quedar arrastrando las huérfanas de la vez
   * anterior, porque entonces la suma del verificador cerraría de más.
   *
   * `yaAnotadas` es el progreso que ya se cargó de esta corrida: sin él habría
   * que emitir dos `DELETE` por partición —1.068 viajes de más— para borrar lo
   * que en el 99% de los casos no existe.
   */
  async anotar(entrada: {
    readonly recurso: string;
    readonly particion: string;
    readonly duplicados: number;
    readonly huerfanas: number;
    readonly yaAnotadas: ReadonlySet<string>;
  }): Promise<void> {
    const anotaciones = [
      { sufijo: SUFIJO_DUPLICADOS, cuantas: entrada.duplicados },
      { sufijo: SUFIJO_HUERFANAS, cuantas: entrada.huerfanas },
    ] as const;

    for (const { sufijo, cuantas } of anotaciones) {
      const particion = `${entrada.particion}${sufijo}`;
      if (cuantas > 0) {
        await this.guardar({
          recurso: entrada.recurso,
          particion,
          estado: 'completa',
          totalDeclarado: cuantas,
          filasEscritas: cuantas,
          offsetSiguiente: 0,
          hashFuente: null,
        });
      } else if (entrada.yaAnotadas.has(claveDeParticion(entrada.recurso, particion))) {
        await this.db
          .delete(geoSeedProgreso)
          .where(
            and(
              eq(geoSeedProgreso.corrida, this.corrida),
              eq(geoSeedProgreso.recurso, entrada.recurso),
              eq(geoSeedProgreso.particion, particion),
            ),
          );
      }
    }
  }
}

/** El progreso de OTRA corrida, para comparar huellas y saltear lo que no cambió. */
export async function huellasDe(db: Db, corrida: string): Promise<ReadonlyMap<string, string>> {
  const filas = await db
    .select({
      recurso: geoSeedProgreso.recurso,
      particion: geoSeedProgreso.particion,
      hashFuente: geoSeedProgreso.hashFuente,
      estado: geoSeedProgreso.estado,
    })
    .from(geoSeedProgreso)
    .where(eq(geoSeedProgreso.corrida, corrida));

  const mapa = new Map<string, string>();
  for (const fila of filas) {
    // Sólo una partición COMPLETA con huella sirve para saltear: una huella de
    // una partición a medias describiría un pedazo y saltearía el resto.
    if (fila.estado === 'completa' && fila.hashFuente !== null) {
      mapa.set(claveDeParticion(fila.recurso, fila.particion), fila.hashFuente);
    }
  }
  return mapa;
}

// ---------------------------------------------------------------------------
// El índice de la jerarquía
// ---------------------------------------------------------------------------

/**
 * Las 17.986 filas de la jerarquía en memoria, indexadas por `georef_id`.
 *
 * Se cargan de una y no de a una: son ~4 MB y ahorran una consulta por fila en
 * un script que resuelve ancestros 350.000 veces. Es además el insumo del
 * «¿cambió?» que evita reescribir la jerarquía entera en cada re-siembra.
 */
export async function cargarIndice(db: Db): Promise<Map<string, LugarEnBase>> {
  const filas = await db
    .select({
      id: geographicLocations.id,
      level: geographicLocations.level,
      name: geographicLocations.name,
      nameNorm: geographicLocations.nameNorm,
      georefId: geographicLocations.georefId,
      provinceId: geographicLocations.provinceId,
      parentId: geographicLocations.parentId,
      departmentId: geographicLocations.departmentId,
      municipalityId: geographicLocations.municipalityId,
      latitude: geographicLocations.latitude,
      longitude: geographicLocations.longitude,
      vigenteHasta: geographicLocations.vigenteHasta,
    })
    .from(geographicLocations);

  // `georef_id` es NOT NULL desde la Task 6, así que acá no hay filas sin clave
  // y no hace falta descartar ninguna: si volviera a ser nullable, el compilador
  // lo diría en esta línea.
  const indice = new Map<string, LugarEnBase>();
  for (const fila of filas) {
    const { georefId, ...resto } = fila;
    indice.set(georefId, resto);
  }
  return indice;
}

/**
 * Los georef_id de un nivel que ya están en la base y siguen vigentes.
 *
 * **`provinciaId` no es un filtro de conveniencia: acota las desapariciones.**
 * Cuando el nivel se siembra partido por provincia —`asentamientos`, que no
 * cabe en el techo de la API—, la partición de Neuquén ve sólo lo que la fuente
 * lista para Neuquén. Sin acotar, «lo que estaba y la fuente ya no lista» serían
 * los asentamientos de las otras 23 provincias, y la primera partición los
 * retiraría a todos.
 */
export function vigentesDelNivel(
  indice: IndiceDeLugares,
  nivel: string,
  provinciaId?: number,
): Set<string> {
  const ids = new Set<string>();
  for (const [georefId, fila] of indice) {
    if (fila.level !== nivel || fila.vigenteHasta !== null) continue;
    if (provinciaId !== undefined && fila.provinceId !== provinciaId) continue;
    ids.add(georefId);
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Las desapariciones
// ---------------------------------------------------------------------------

/**
 * **Las desapariciones no borran.** Que el Estado deje de listar un paraje no
 * lo hace desaparecer del barrio, y puede haber señales apuntando: se marca
 * `vigente_hasta` y la fila se queda con su `id`.
 *
 * El `WHERE vigente_hasta IS NULL` no es adorno: hace que retirar dos veces lo
 * mismo escriba cero filas.
 */
export async function retirarLugares(db: Db, ids: readonly number[]): Promise<number> {
  let tocadas = 0;
  for (let i = 0; i < ids.length; i += LOTE_DE_IDS) {
    const lote = ids.slice(i, i + LOTE_DE_IDS);
    if (lote.length === 0) continue;
    const filas = await db
      .update(geographicLocations)
      .set({ vigenteHasta: new Date() })
      .where(and(inArray(geographicLocations.id, lote), isNull(geographicLocations.vigenteHasta)))
      .returning({ id: geographicLocations.id });
    tocadas += filas.length;
  }
  return tocadas;
}

export async function retirarCalles(db: Db, ids: readonly number[]): Promise<number> {
  let tocadas = 0;
  for (let i = 0; i < ids.length; i += LOTE_DE_IDS) {
    const lote = ids.slice(i, i + LOTE_DE_IDS);
    if (lote.length === 0) continue;
    const filas = await db
      .update(geoCalles)
      .set({ vigenteHasta: new Date(), actualizadoEn: new Date() })
      .where(and(inArray(geoCalles.id, lote), isNull(geoCalles.vigenteHasta)))
      .returning({ id: geoCalles.id });
    tocadas += filas.length;
  }
  return tocadas;
}

/** Las calles que la base tiene para un departamento, para poder diferenciar. */
export async function callesDelDepartamento(
  db: Db,
  departamentoId: number,
): Promise<{ id: number; georefId: string; vigenteHasta: Date | null }[]> {
  return db
    .select({
      id: geoCalles.id,
      georefId: geoCalles.georefId,
      vigenteHasta: geoCalles.vigenteHasta,
    })
    .from(geoCalles)
    .where(eq(geoCalles.departamentoId, departamentoId));
}

// ---------------------------------------------------------------------------
// Los tres btree compuestos
// ---------------------------------------------------------------------------

/**
 * Los tres índices del autocompletado, con la MISMA definición que la `0013`.
 * Si estas líneas y la migración divergen, `drizzle-kit check` empieza a ver
 * deriva de esquema donde no la hay.
 *
 * `geo_calles_georef_unique` **no está en esta lista y no puede estar**: es el
 * que sostiene el `ON CONFLICT` del upsert y la identidad de una calle.
 */
export const INDICES_DE_CALLES = [
  {
    nombre: 'geo_calles_localidad_nombre_idx',
    crear:
      'CREATE INDEX IF NOT EXISTS "geo_calles_localidad_nombre_idx" ' +
      'ON "geo_calles" USING btree ("localidad_id","nombre_norm")',
  },
  {
    nombre: 'geo_calles_departamento_nombre_idx',
    crear:
      'CREATE INDEX IF NOT EXISTS "geo_calles_departamento_nombre_idx" ' +
      'ON "geo_calles" USING btree ("departamento_id","nombre_norm")',
  },
  {
    nombre: 'geo_calles_provincia_nombre_idx',
    crear:
      'CREATE INDEX IF NOT EXISTS "geo_calles_provincia_nombre_idx" ' +
      'ON "geo_calles" USING btree ("provincia_id","nombre_norm")',
  },
] as const;

/**
 * El unique que sostiene el `ON CONFLICT` del upsert y la identidad de una
 * calle. **No se baja nunca** —sin él el upsert no tiene contra qué
 * conflictuar— y por eso vive fuera de `INDICES_DE_CALLES`. Está acá con su
 * `crear` para que el verificador, si lo encuentra ausente, pueda decir cómo se
 * repone en vez de decir que algo anda mal.
 */
export const INDICE_UNICO_DE_CALLES = {
  nombre: 'geo_calles_georef_unique',
  crear:
    'CREATE UNIQUE INDEX IF NOT EXISTS "geo_calles_georef_unique" ' +
    'ON "geo_calles" USING btree ("georef_id")',
} as const;

/**
 * Los CUATRO que tienen que estar cuando la corrida terminó.
 *
 * Un SIGKILL no ejecuta el `finally` que repone los tres btree, así que la única
 * forma de saber que están es preguntarle a `pg_indexes` después. Sin esta
 * lista, «la verificación pasa» y el autocompletado del país entero corre en seq
 * scan hasta que alguien mide una búsqueda.
 */
export const INDICES_ESPERADOS_DE_CALLES = [
  ...INDICES_DE_CALLES,
  INDICE_UNICO_DE_CALLES,
] as const;

export interface IndiceDeCalles {
  readonly nombre: string;
  readonly crear: string;
}

/** Puro, para poder afirmarlo sin base. */
export const faltantesDeIndices = (
  presentes: ReadonlySet<string>,
): readonly IndiceDeCalles[] =>
  INDICES_ESPERADOS_DE_CALLES.filter((indice) => !presentes.has(indice.nombre));

export async function indicesPresentes(db: Db): Promise<Set<string>> {
  const { rows } = await db.execute<{ indexname: string }>(sql`
    select indexname from pg_indexes
     where schemaname = 'public' and tablename = 'geo_calles'`);
  return new Set(rows.map((f) => f.indexname));
}

export async function bajarIndices(db: Db): Promise<string[]> {
  const bajados: string[] = [];
  const presentes = await indicesPresentes(db);
  for (const indice of INDICES_DE_CALLES) {
    if (!presentes.has(indice.nombre)) continue;
    await db.execute(sql.raw(`DROP INDEX IF EXISTS "${indice.nombre}"`));
    bajados.push(indice.nombre);
  }
  return bajados;
}

/** Se llama SIEMPRE al terminar, incluso cuando la corrida se cayó. */
export async function asegurarIndices(db: Db): Promise<string[]> {
  const creados: string[] = [];
  const presentes = await indicesPresentes(db);
  for (const indice of INDICES_DE_CALLES) {
    if (presentes.has(indice.nombre)) continue;
    await db.execute(sql.raw(indice.crear));
    creados.push(indice.nombre);
  }
  return creados;
}

// ---------------------------------------------------------------------------
// El cierre: dominio, cobertura, totales y versión
// ---------------------------------------------------------------------------

/**
 * El dominio de `categoria`, **derivado de `geo_calles` y no del contador en
 * memoria de esta corrida**.
 *
 * Es deliberado y es por la reanudación: una corrida que retoma lo que otro
 * proceso dejó a medias no vio las particiones que ya estaban completas, así
 * que su contador diría 9 categorías donde el país tiene 23. Contra la tabla,
 * el dominio publicado es siempre el dominio real de lo que hay cargado.
 */
export async function publicarCategorias(db: Db, corrida: string): Promise<number> {
  const filas = await db
    .select({ categoria: geoCalles.categoria, cantidad: sql<number>`count(*)::int` })
    .from(geoCalles)
    .groupBy(geoCalles.categoria);

  for (const fila of filas) {
    await db
      .insert(geoCalleCategorias)
      .values({ categoria: fila.categoria, cantidad: fila.cantidad, corrida })
      .onConflictDoUpdate({
        target: geoCalleCategorias.categoria,
        set: { cantidad: sql`excluded.cantidad`, corrida: sql`excluded.corrida` },
        setWhere: sql`${geoCalleCategorias.cantidad} is distinct from excluded.cantidad
                      or ${geoCalleCategorias.corrida} is distinct from excluded.corrida`,
      });
  }
  return filas.length;
}

export interface RangoPorProvincia {
  readonly provincia: string;
  readonly conRango: number;
  readonly sinRango: number;
}

export interface CoberturaDelCatalogo {
  /** Por provincia. La forma la fija el test ya desplegado de `/version`. */
  readonly rangoDeAltura: readonly RangoPorProvincia[];
  readonly sinNombre: number;
  readonly nominadas: number;
  readonly conRango: number;
  readonly sinRango: number;
}

/**
 * LA cobertura, que se publica y no se esconde: cuánto del país puede confirmar
 * una altura.
 *
 * Medido sobre el corpus completo: 120.115 calles (36,8%) son `sin_nombre` y
 * sólo 79.441 (24,3%) traen algún rango. Sin este número en `/version`, alguien
 * lee «en Córdoba nadie confirma alturas» como un dato sobre Córdoba, cuando es
 * un dato sobre el INDEC.
 */
export async function coberturaDelCatalogo(db: Db): Promise<CoberturaDelCatalogo> {
  const { rows: porProvincia } = await db.execute<{
    name: string;
    con_rango: number;
    sin_rango: number;
  }>(sql`
    select p.name,
           count(*) filter (where c.altura_desde is not null or c.altura_hasta is not null)::int as con_rango,
           count(*) filter (where c.altura_desde is null and c.altura_hasta is null)::int     as sin_rango
      from geo_calles c
      join geographic_locations p on p.id = c.provincia_id
     group by p.name
     order by sin_rango desc`);

  const { rows: totales } = await db.execute<{
    sin_nombre: number;
    nominadas: number;
    con_rango: number;
    sin_rango: number;
  }>(sql`
    select count(*) filter (where nombre_clase = 'sin_nombre')::int as sin_nombre,
           count(*) filter (where nombre_clase = 'nominada')::int   as nominadas,
           count(*) filter (where altura_desde is not null or altura_hasta is not null)::int as con_rango,
           count(*) filter (where altura_desde is null and altura_hasta is null)::int        as sin_rango
      from geo_calles`);

  const fila = totales[0];
  return {
    rangoDeAltura: porProvincia.map((f) => ({
      provincia: f.name,
      conRango: f.con_rango,
      sinRango: f.sin_rango,
    })),
    sinNombre: fila?.sin_nombre ?? 0,
    nominadas: fila?.nominadas ?? 0,
    conRango: fila?.con_rango ?? 0,
    sinRango: fila?.sin_rango ?? 0,
  };
}

export interface TotalesDelCatalogo {
  readonly provincias: number;
  readonly departamentos: number;
  readonly municipios: number;
  readonly localidades: number;
  readonly asentamientos: number;
  readonly calles: number;
}

/** Las seis claves de §4.1, contadas contra la base y no contra una expectativa. */
export async function totalesDelCatalogo(db: Db): Promise<TotalesDelCatalogo> {
  const niveles = await db
    .select({ level: geographicLocations.level, n: sql<number>`count(*)::int` })
    .from(geographicLocations)
    .groupBy(geographicLocations.level);
  const porNivel = new Map(niveles.map((f) => [f.level, f.n]));

  const [calles] = await db.select({ n: sql<number>`count(*)::int` }).from(geoCalles);

  return {
    provincias: porNivel.get('province') ?? 0,
    departamentos: porNivel.get('department') ?? 0,
    municipios: porNivel.get('municipality') ?? 0,
    localidades: porNivel.get('locality') ?? 0,
    asentamientos: porNivel.get('settlement') ?? 0,
    calles: calles?.n ?? 0,
  };
}

/**
 * La corrida nueva se marca vigente **al final**, y las dos sentencias viajan
 * en un solo `db.batch`, que `neon-http` manda envuelto en `BEGIN`/`COMMIT`.
 *
 * Que sea una sola transacción es lo que impide el estado que el unique parcial
 * `ON geo_catalogo_version (vigente) WHERE vigente` prohíbe: si el apagado de
 * la vigente anterior y el encendido de la nueva fueran dos viajes, un corte en
 * el medio dejaría el catálogo sin ninguna vigente y `/version` respondiendo
 * «todavía no sembramos el callejero» sobre 326.832 calles cargadas.
 */
export async function publicarVersion(
  db: Db,
  entrada: {
    readonly corrida: string;
    readonly fuente: string;
    readonly fechaDeCorte: Date;
    readonly totales: TotalesDelCatalogo;
    readonly cobertura: unknown;
  },
): Promise<void> {
  await db.batch([
    db
      .update(geoCatalogoVersion)
      .set({ vigente: false })
      .where(eq(geoCatalogoVersion.vigente, true)),
    db
      .insert(geoCatalogoVersion)
      .values({
        corrida: entrada.corrida,
        fuente: entrada.fuente,
        fechaDeCorte: entrada.fechaDeCorte,
        totales: entrada.totales,
        cobertura: entrada.cobertura,
        vigente: true,
      })
      .onConflictDoUpdate({
        target: geoCatalogoVersion.corrida,
        set: {
          fuente: sql`excluded.fuente`,
          fechaDeCorte: sql`excluded.fecha_de_corte`,
          totales: sql`excluded.totales`,
          cobertura: sql`excluded.cobertura`,
          vigente: sql`excluded.vigente`,
        },
      }),
  ]);
}

/** La corrida vigente, si hay. `undefined` es «nunca se sembró», no un error. */
export async function corridaVigente(db: Db): Promise<string | undefined> {
  const [fila] = await db
    .select({ corrida: geoCatalogoVersion.corrida })
    .from(geoCatalogoVersion)
    .where(eq(geoCatalogoVersion.vigente, true))
    .limit(1);
  return fila?.corrida;
}

/**
 * **Todas las corridas que alguna vez se publicaron**, vigentes o no.
 *
 * Una fila en `geo_catalogo_version` es exactamente eso: esta corrida salió a
 * servirse. Que después otra la reemplace no la vuelve a abrir, y ésa es la
 * diferencia con `corridaVigente`: una corrida publicada y ya no vigente
 * conserva sus 535 particiones en `completa`, así que reanudarla es tomar 535
 * atajos `ya_completa` y reportar éxito sin mirar la tabla.
 */
export async function corridasPublicadas(db: Db): Promise<readonly string[]> {
  const filas = await db.select({ corrida: geoCatalogoVersion.corrida }).from(geoCatalogoVersion);
  return filas.map((f) => f.corrida);
}

/** Cuántas calles hay hoy. Decide si hay que buscar desapariciones. */
export async function cuantasCalles(db: Db): Promise<number> {
  const [fila] = await db.select({ n: sql<number>`count(*)::int` }).from(geoCalles);
  return fila?.n ?? 0;
}

// ---------------------------------------------------------------------------
// El otro lado de la completitud: `count(*)` de la propia tabla
// ---------------------------------------------------------------------------

/**
 * Qué nivel de `geographic_locations` escribe cada recurso de la jerarquía.
 *
 * Es lo que permite preguntarle a la TABLA cuántas filas dejó cada partición,
 * en vez de creerle al contador en memoria que las contó al pasar.
 */
/**
 * El nombre de la partición de un recurso que entra de una sola consulta. Es un
 * nombre y no un número: las particiones partidas se llaman como el `georef_id`
 * de su provincia (`'06'`) o de su departamento, y `'00'` no es ninguno.
 */
export const PARTICION_ENTERA = '00';

export const NIVEL_DEL_RECURSO: Readonly<Record<string, string>> = {
  provincias: 'province',
  departamentos: 'department',
  municipios: 'municipality',
  localidades_censales: 'locality',
  asentamientos: 'settlement',
};

/**
 * Las calles VIGENTES que hay en la tabla, por `georef_id` de departamento —que
 * es exactamente la partición del seed—, en una sola pasada.
 *
 * De a una sería un `count(*)` por departamento: 529 viajes, y encima sobre un
 * índice que la carga baja. Una agregación sola cuesta un scan y se contesta en
 * el mismo segundo.
 *
 * `vigente_hasta is null` es la mitad del punto: una calle que el Estado dejó de
 * listar se queda en la tabla con su `id` y sus señales, y contarla haría que la
 * partición cerrara con más filas que las que la fuente declara.
 */
export async function callesVigentesPorDepartamento(db: Db): Promise<Map<string, number>> {
  const { rows } = await db.execute<{ georef_id: string; n: number }>(sql`
    select d.georef_id, count(*)::int as n
      from geo_calles c
      join geographic_locations d on d.id = c.departamento_id
     where c.vigente_hasta is null
     group by d.georef_id`);
  return new Map(rows.map((f) => [f.georef_id, f.n]));
}

/** Los lugares VIGENTES por nivel. El otro lado de las cinco fases de jerarquía. */
export async function lugaresVigentesPorNivel(db: Db): Promise<Map<string, number>> {
  const { rows } = await db.execute<{ level: string; n: number }>(sql`
    select level, count(*)::int as n
      from geographic_locations
     where vigente_hasta is null
     group by level`);
  return new Map(rows.map((f) => [f.level, f.n]));
}

/**
 * Lo mismo, pero rebanado por provincia — que es la partición de los niveles que
 * no caben en una sola consulta a la fuente (`asentamientos`).
 *
 * **Sin esto la suma del verificador no cierra, y no por un dato malo.** Cada
 * una de las 24 particiones de asentamientos declara el total de SU provincia, y
 * `enTabla` les devolvía a todas el conteo del nivel entero: 11.324 contra 2.358
 * en Buenos Aires, 11.324 contra 49 en CABA, veinticuatro veces. La clave es
 * `nivel:georef_id de la provincia`, que es exactamente el nombre de la
 * partición.
 */
export async function lugaresVigentesPorNivelYProvincia(db: Db): Promise<Map<string, number>> {
  const { rows } = await db.execute<{ level: string; provincia: string; n: number }>(sql`
    select l.level, p.georef_id as provincia, count(*)::int as n
      from geographic_locations l
      join geographic_locations p on p.id = l.province_id
     where l.vigente_hasta is null
       and p.georef_id is not null
     group by l.level, p.georef_id`);
  return new Map(rows.map((f) => [`${f.level}:${f.provincia}`, f.n]));
}

/**
 * LA lectura de la completitud, con los dos lados separados.
 *
 * Junta, por partición de una corrida:
 *
 *  - lo que declaró la FUENTE (`total_declarado`, de `geo_seed_progreso`);
 *  - lo que dice haber contabilizado el SEED (`filas_escritas`, misma fila);
 *  - lo que tiene la TABLA (`count(*)`, medido acá y ahora);
 *  - las dos anotaciones que explican la diferencia.
 *
 * Los dos primeros salen del mismo lado y compararlos entre sí es la
 * verificación circular que este archivo existe para no volver a tener. El que
 * decide es el tercero.
 */
export async function completitudDeLaCorrida(
  db: Db,
  corrida: string,
): Promise<readonly CompletitudDeParticion[]> {
  const filas = await db
    .select({
      recurso: geoSeedProgreso.recurso,
      particion: geoSeedProgreso.particion,
      estado: geoSeedProgreso.estado,
      totalDeclarado: geoSeedProgreso.totalDeclarado,
      filasEscritas: geoSeedProgreso.filasEscritas,
    })
    .from(geoSeedProgreso)
    .where(eq(geoSeedProgreso.corrida, corrida));

  const anotacion = new Map<string, number>();
  for (const fila of filas) {
    if (esAnotacion(fila.particion)) {
      anotacion.set(claveDeParticion(fila.recurso, fila.particion), fila.filasEscritas);
    }
  }

  const porDepartamento = await callesVigentesPorDepartamento(db);
  const porNivel = await lugaresVigentesPorNivel(db);
  const porNivelYProvincia = await lugaresVigentesPorNivelYProvincia(db);

  const enTablaDe = (recurso: string, particion: string): number => {
    if (recurso === 'calles') return porDepartamento.get(particion) ?? 0;
    const nivel = NIVEL_DEL_RECURSO[recurso];
    if (nivel === undefined) return 0;
    // Un nivel que entró de una sola consulta se cuenta entero; uno partido por
    // provincia se cuenta por su rebanada. La partición se llama como el
    // `georef_id` de la provincia, y `'00'` es el nombre de «no está partido».
    return particion === PARTICION_ENTERA
      ? (porNivel.get(nivel) ?? 0)
      : (porNivelYProvincia.get(`${nivel}:${particion}`) ?? 0);
  };

  return filas
    .filter((fila) => !esAnotacion(fila.particion))
    .map((fila) => ({
      recurso: fila.recurso,
      particion: fila.particion,
      estado: fila.estado,
      totalDeclarado: fila.totalDeclarado,
      filasEscritas: fila.filasEscritas,
      enTabla: enTablaDe(fila.recurso, fila.particion),
      duplicados:
        anotacion.get(claveDeParticion(fila.recurso, `${fila.particion}${SUFIJO_DUPLICADOS}`)) ?? 0,
      huerfanas:
        anotacion.get(claveDeParticion(fila.recurso, `${fila.particion}${SUFIJO_HUERFANAS}`)) ?? 0,
    }));
}
