/**
 * El callejero, del lado de la lectura.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §4.1, §4.2, §4.3 y §4.7.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 3.
 *
 * Son 326.832 filas medidas contra la fuente el 2026-08-11, y ésta es la única
 * tabla del sistema donde una consulta mal escrita no se nota: un seq scan sobre
 * 326.832 filas devuelve exactamente lo mismo que un index scan, sólo que tarda
 * cien veces más, en un endpoint público cuyo espacio de URLs es infinito. Por
 * eso todo lo que hay acá está escrito alrededor de tres índices y no alrededor
 * de tres consultas:
 *
 *   - `(localidad_id, nombre_norm)`, `(departamento_id, nombre_norm)` y
 *     `(provincia_id, nombre_norm)` — btree compuestos. El primer campo va con
 *     igualdad y por eso es condición de índice: acota la rebanada del
 *     territorio (peor caso medido, Córdoba capital con 8.542 calles) y la
 *     entrega YA ordenada por `nombre_norm`, así que el `ORDER BY` no pide un
 *     sort y el `LIMIT` corta temprano de verdad. El `LIKE '%…%'` no puede ser
 *     condición de índice —no tiene prefijo— y corre como filtro sobre esa
 *     rebanada, que es justo el tamaño que lo hace barato.
 *   - `geo_calles_nombre_trgm` (GIN de trigramas, migración `0014`) para el
 *     scope de provincia, donde la rebanada no alcanza. Un `LIKE '%…%'` de tres
 *     caracteres o más SÍ lo usa: de ahí sale el mínimo de 3 de §4.2, que no es
 *     una preferencia de producto sino el largo de un trigrama.
 *
 * **La normalización es la MISMA función que escribió la columna**
 * (`normalizarNombreDeCalle`, en civic-core). Dos normalizadores es cómo vuelve
 * la D-012: la diferencia no rompe nada, aparece como resultados que faltan en
 * unas provincias y no en otras. De paso, esa función elimina todo lo que no sea
 * alfanumérico o espacio, así que `%` y `_` no existen cuando se arma el patrón
 * del `LIKE`: el saneamiento no es un escape en el borde de la consulta, es una
 * propiedad del texto normalizado.
 */
import { normalizarNombreDeCalle, rangoDeAltura } from '@v2/civic-core';
import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { geoCalleCategorias, geoCalles } from '../schema/geo-calles.js';
import { geoCatalogoVersion } from '../schema/geo-seed.js';
import { geographicLocations } from '../schema/geographic.js';

import { correrConTecho } from './_lectura.js';

import type { ConsultaPendiente, Db } from '../client.js';
import type { OpcionesDeLectura } from './_lectura.js';
import type { GeoCatalogoVersion } from '../schema/geo-seed.js';
import type { RangoDeAltura } from '@v2/civic-core';
import type { SQL } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// El vocabulario
// ---------------------------------------------------------------------------

/**
 * `'nominada' | 'sin_nombre'`, cerrado por `geo_calles_clase_chk`. «CALLE S N»
 * son 120.115 filas —el 36,8% del país— y no son un vacío: son calles que el
 * Estado registró SIN nombre. No entran en el autocompletado y sí en los
 * totales, para que la auditoría contra la fuente cierre.
 */
export type ClaseDeNombre = 'nominada' | 'sin_nombre';

/**
 * Dónde buscar. **Es obligatorio y por eso es un parámetro y no una opción:**
 * «SAN MARTIN» sin scope devuelve cientos de resultados indistinguibles y cuesta
 * un scan del país. Que el tipo no lo deje omitir es más barato que un 400.
 */
export type ScopeDeBusqueda =
  | { ambito: 'localidad'; id: number }
  | { ambito: 'departamento'; id: number }
  | { ambito: 'provincia'; id: number };

export type AmbitoDeBusqueda = ScopeDeBusqueda['ambito'];

/**
 * El mínimo por scope (§4.2). Vive acá y no en la validación de la API para que
 * haya un solo número por scope. El 3 de provincia no es una preferencia: con
 * menos de tres caracteres no hay trigrama completo y el GIN no puede ayudar.
 */
export const MINIMO_DE_CONSULTA = {
  localidad: 1,
  departamento: 2,
  provincia: 3,
} as const satisfies Record<AmbitoDeBusqueda, number>;

/** El servidor pone `LIMIT` SIEMPRE, aunque el cliente no mande nada (§4.1). */
export const LIMITE_POR_DEFECTO = 20;
export const LIMITE_MAXIMO = 50;

export interface LugarNombrado {
  id: number;
  nombre: string;
}

/** La forma de §4.1. Los cuatro nombres y la nomenclatura se componen al leer. */
export interface CalleDelCatalogo {
  id: number;
  georefId: string;
  /** Tal como lo da el Estado: «AV JOSE MARIA MORENO». Es lo que se muestra. */
  nombre: string;
  categoria: string;
  /** «AV JOSE MARIA MORENO, Comuna 7, Ciudad Autónoma de Buenos Aires». */
  nomenclatura: string;
  localidad: LugarNombrado;
  departamento: LugarNombrado;
  /** El municipio de su LOCALIDAD, no un campo propio de la calle (§2.2). */
  municipio: LugarNombrado | null;
  provincia: LugarNombrado;
  /** La unión de §2.5. **Nunca un par de ceros**, nunca un booleano. */
  rango: RangoDeAltura;
  /** La marca con la que salen por `porId` las que la búsqueda no muestra. */
  nombreClase: ClaseDeNombre;
  vigente: boolean;
}

/**
 * El resultado, con la diferencia que un array vacío no sabe decir: `buscada`
 * con cero calles es «miramos y no hay», `consulta_corta` es «no miramos».
 * Devolver `[]` en los dos casos sería el `0` que significa «no sé». Y cubre el
 * caso de §4.6 que más cuesta ver: `q=%` normaliza a la cadena vacía, y una
 * cadena vacía adentro de un `LIKE '%%'` devuelve la localidad entera.
 */
export type BusquedaDeCalles =
  | { estado: 'buscada'; normalizado: string; calles: CalleDelCatalogo[] }
  | { estado: 'consulta_corta'; normalizado: string; minimo: number };

export interface ConsultaDeCalles {
  scope: ScopeDeBusqueda;
  q: string;
  /**
   * El dominio completo de `geo_calle_categorias`: quien consulta todavía no
   * sabe de qué calle habla y necesita la lista entera, mientras que el seed
   * normaliza cada fila con su propio campo `categoria` (§3.3). La asimetría es
   * deliberada y la guarda 7 afirma que el resultado coincide igual.
   */
  categorias: readonly string[];
  limite?: number;
}

/**
 * El orden de las columnas del paquete. Viaja DENTRO del paquete para que el
 * teléfono no lo tenga hardcodeado: el día que se agregue una columna, un
 * cliente viejo sigue leyendo las que conoce por posición declarada.
 */
export const COLUMNAS_DEL_PAQUETE = [
  'id',
  'nombre',
  'nombreNorm',
  'categoria',
  'desde',
  'hasta',
] as const;

export type FilaDePaquete = readonly [
  id: number,
  nombre: string,
  nombreNorm: string,
  categoria: string,
  desde: number | null,
  hasta: number | null,
];

/**
 * Lo que se baja para trabajar sin señal (§4.3): array de arrays, sin claves
 * repetidas. Peor caso verificado, Córdoba capital: 8.542 calles, ~107 KB gzip.
 * Lleva `categorias` y `nombreNorm` adentro para que la búsqueda offline corra
 * **la misma función** que la online: sin la lista, el teléfono normalizaría
 * contra una lista vacía y encontraría menos calles, en silencio.
 */
export interface PaqueteDeCalles {
  /** La corrida del catálogo. Va en la ruta y se sirve `immutable` (§4.1). */
  corrida: string;
  ambito: 'localidad' | 'departamento';
  id: number;
  columnas: typeof COLUMNAS_DEL_PAQUETE;
  categorias: readonly string[];
  calles: readonly FilaDePaquete[];
}

/** Una calle lista para entrar, con el `0` de georef ya traducido a ausencia. */
export interface CalleParaSembrar {
  georefId: string;
  localidadId: number;
  departamentoId: number;
  provinciaId: number;
  nombre: string;
  nombreNorm: string;
  nombreClase: ClaseDeNombre;
  categoria: string;
  rango: RangoDeAltura;
}

export interface ResultadoDeLote {
  /** Altas más modificaciones: las filas que el motor realmente tocó. */
  escritas: number;
  /**
   * Las que ya estaban idénticas. **Tiene que ser el lote entero en una
   * re-siembra sin cambios**: si no, el `WHERE` del `DO UPDATE` está mal y cada
   * corrida duplica el WAL.
   */
  sinCambios: number;
  /**
   * `georef_id` que ya existe apuntando a OTRA localidad. **No se tocan**, y el
   * seed los reporta: la identidad de una calle es su id del Estado más su
   * localidad, así que esto no es una modificación, es un retiro más un alta.
   */
  recodificaciones: readonly string[];
}

// ---------------------------------------------------------------------------
// Traducciones de una sola dirección
// ---------------------------------------------------------------------------

/**
 * El CHECK deja entrar dos valores, así que la rama de defecto es inalcanzable
 * mientras exista; si alguien lo saca, degrada a `nominada`, que es la rama que
 * MUESTRA la calle en vez de esconderla.
 */
const claseDeNombre = (valor: string): ClaseDeNombre =>
  valor === 'sin_nombre' ? 'sin_nombre' : 'nominada';

const acotarLimite = (limite: number | undefined): number => {
  if (limite === undefined) return LIMITE_POR_DEFECTO;
  if (!Number.isFinite(limite)) return LIMITE_POR_DEFECTO;
  return Math.min(Math.max(Math.trunc(limite), 1), LIMITE_MAXIMO);
};

/**
 * Las dos columnas a la unión de §2.5, con la MISMA función que usa el seed en
 * el borde de georef. El CHECK ya impide el cero; la traducción vive en un solo
 * lugar igual, que es el punto de tenerla.
 */
const rangoDeFila = (desde: number | null, hasta: number | null): RangoDeAltura =>
  rangoDeAltura({ inicio: [desde], fin: [hasta] });

// ---------------------------------------------------------------------------
// El repositorio
// ---------------------------------------------------------------------------

/** La forma cruda que devuelven las tres consultas que componen una calle. */
interface FilaDeCalle {
  id: number;
  georefId: string;
  nombre: string;
  categoria: string;
  nombreClase: string;
  alturaDesde: number | null;
  alturaHasta: number | null;
  vigenteHasta: Date | null;
  localidadId: number;
  localidadNombre: string;
  departamentoId: number;
  departamentoNombre: string;
  municipioId: number | null;
  municipioNombre: string | null;
  provinciaId: number;
  provinciaNombre: string;
}

const localidad = alias(geographicLocations, 'localidad');
const departamento = alias(geographicLocations, 'departamento');
const municipio = alias(geographicLocations, 'municipio');
const provincia = alias(geographicLocations, 'provincia');

const CAMPOS_DE_CALLE = {
  id: geoCalles.id,
  georefId: geoCalles.georefId,
  nombre: geoCalles.nombre,
  categoria: geoCalles.categoria,
  nombreClase: geoCalles.nombreClase,
  alturaDesde: geoCalles.alturaDesde,
  alturaHasta: geoCalles.alturaHasta,
  vigenteHasta: geoCalles.vigenteHasta,
  localidadId: localidad.id,
  localidadNombre: localidad.name,
  departamentoId: departamento.id,
  departamentoNombre: departamento.name,
  municipioId: municipio.id,
  municipioNombre: municipio.name,
  provinciaId: provincia.id,
  provinciaNombre: provincia.name,
};

/**
 * Las tres columnas que pueden ir con igualdad: son exactamente las tres que
 * tienen un btree compuesto detrás, y una cuarta sería un seq scan.
 */
type ColumnaDeTerritorio =
  | typeof geoCalles.localidadId
  | typeof geoCalles.departamentoId
  | typeof geoCalles.provinciaId;

const aCalleDelCatalogo = (fila: FilaDeCalle): CalleDelCatalogo => ({
  id: fila.id,
  georefId: fila.georefId,
  nombre: fila.nombre,
  categoria: fila.categoria,
  nomenclatura: `${fila.nombre}, ${fila.localidadNombre}, ${fila.provinciaNombre}`,
  localidad: { id: fila.localidadId, nombre: fila.localidadNombre },
  departamento: { id: fila.departamentoId, nombre: fila.departamentoNombre },
  municipio:
    fila.municipioId === null || fila.municipioNombre === null
      ? null
      : { id: fila.municipioId, nombre: fila.municipioNombre },
  provincia: { id: fila.provinciaId, nombre: fila.provinciaNombre },
  rango: rangoDeFila(fila.alturaDesde, fila.alturaHasta),
  nombreClase: claseDeNombre(fila.nombreClase),
  vigente: fila.vigenteHasta === null,
});

export class GeoCallesRepository {
  /**
   * `opciones.techoMs` lo pone el router que sirve la request; el seed lo omite
   * (§4.1 y `_lectura.ts`). Toda LECTURA de acá pasa por `correrConTecho`; el
   * upsert del seed no, porque escribe lotes de miles de filas.
   */
  constructor(
    private readonly db: Db,
    private readonly opciones: OpcionesDeLectura = {},
  ) {}

  /**
   * Toda lectura pasa por acá. Con `techoMs` la consulta viaja envuelta en el
   * `SET LOCAL statement_timeout` del router; sin él, pelada. Que sea un solo
   * lugar es lo que hace que agregar una consulta nueva no pueda olvidarse el
   * techo.
   */
  private leer<R>(consulta: ConsultaPendiente<R>): Promise<R> {
    return correrConTecho(this.db, this.opciones, consulta);
  }

  /**
   * La columna de territorio que le toca a cada scope. Es la que va con
   * igualdad, o sea la que se vuelve condición de índice: cambiar esto por un
   * `OR` de tres columnas convierte las tres consultas en un seq scan.
   */
  private columnaDeTerritorio(ambito: AmbitoDeBusqueda): ColumnaDeTerritorio {
    if (ambito === 'localidad') return geoCalles.localidadId;
    if (ambito === 'departamento') return geoCalles.departamentoId;
    return geoCalles.provinciaId;
  }

  /**
   * El orden. Los scopes de territorio chico salen en el orden que ya entrega
   * el índice —ningún sort— y el de provincia ordena por similitud, porque ahí
   * el `LIKE` puede traer cientos de calles de veinte partidos distintos y la
   * primera pantalla es lo único que alguien mira.
   *
   * `similarity()` es de `pg_trgm`, que instala la migración `0014` (Task 7).
   * Antes de esa migración el scope de provincia falla con «function similarity
   * does not exist», y falla fuerte a propósito: la alternativa —ordenar
   * alfabéticamente y no decirlo— sería servir un ranking peor sin que se note.
   */
  private ordenDeBusqueda(ambito: AmbitoDeBusqueda, normalizado: string): SQL[] {
    if (ambito !== 'provincia') return [asc(geoCalles.nombreNorm)];
    return [
      desc(sql`similarity(${geoCalles.nombreNorm}, ${normalizado})`),
      asc(geoCalles.nombreNorm),
    ];
  }

  /**
   * Buscar una calle para elegirla (§4.2).
   *
   * Nunca devuelve una `sin_nombre` ni una con `vigente_hasta` puesto: elegir
   * «CALLE S N» no querría decir nada, y elegir una calle que el Estado dejó de
   * listar sería empezar una señal nueva sobre un dato retirado. Las dos SÍ
   * salen por `porId`, con su marca, para que una señal vieja pueda seguir
   * mostrando la dirección que tenía.
   */
  async buscarCalles(consulta: ConsultaDeCalles): Promise<BusquedaDeCalles> {
    const normalizado = normalizarNombreDeCalle(consulta.q, consulta.categorias);
    const minimo = MINIMO_DE_CONSULTA[consulta.scope.ambito];
    if (normalizado.length < minimo) {
      return { estado: 'consulta_corta', normalizado, minimo };
    }

    const filas = await this.leer(this.seleccionDeBusqueda(consulta, normalizado));
    return { estado: 'buscada', normalizado, calles: filas.map(aCalleDelCatalogo) };
  }

  /** La consulta de `buscarCalles`, armada aparte para que `explicar` mire la misma. */
  private seleccionDeBusqueda(consulta: ConsultaDeCalles, normalizado: string) {
    return this.db
      .select(CAMPOS_DE_CALLE)
      .from(geoCalles)
      .innerJoin(localidad, eq(localidad.id, geoCalles.localidadId))
      .innerJoin(departamento, eq(departamento.id, geoCalles.departamentoId))
      .innerJoin(provincia, eq(provincia.id, geoCalles.provinciaId))
      .leftJoin(municipio, eq(municipio.id, localidad.municipalityId))
      .where(
        and(
          eq(this.columnaDeTerritorio(consulta.scope.ambito), consulta.scope.id),
          // El patrón se arma acá y no en el borde: `normalizado` no puede
          // contener `%` ni `_` porque el normalizador los eliminó.
          sql`${geoCalles.nombreNorm} like ${`%${normalizado}%`}`,
          eq(geoCalles.nombreClase, 'nominada'),
          isNull(geoCalles.vigenteHasta),
        ),
      )
      .orderBy(...this.ordenDeBusqueda(consulta.scope.ambito, normalizado))
      .limit(acotarLimite(consulta.limite));
  }

  /**
   * El plan de la búsqueda, sin ejecutarla. Existe para que «ninguna consulta
   * del callejero hace seq scan» sea algo que un test confronta contra el motor
   * y no una promesa verificada una vez a mano: la diferencia entre un plan
   * bueno y uno malo no es un error, son las mismas filas cien veces más lentas.
   */
  async explicarBusqueda(consulta: ConsultaDeCalles): Promise<string[]> {
    const normalizado = normalizarNombreDeCalle(consulta.q, consulta.categorias);
    const seleccion = this.seleccionDeBusqueda(consulta, normalizado);
    const { rows } = await this.db.execute<{ 'QUERY PLAN': string }>(
      sql`explain ${seleccion.getSQL()}`,
    );
    return rows.map((fila) => fila['QUERY PLAN']);
  }

  /** El plan del paquete offline: la otra consulta que barre `geo_calles`. */
  async explicarPaquete(ambito: 'localidad' | 'departamento', id: number): Promise<string[]> {
    const columna = ambito === 'localidad' ? geoCalles.localidadId : geoCalles.departamentoId;
    const { rows } = await this.db.execute<{ 'QUERY PLAN': string }>(
      sql`explain ${this.seleccionDePaquete(columna, id).getSQL()}`,
    );
    return rows.map((fila) => fila['QUERY PLAN']);
  }

  /**
   * Una calle por su id interno, sin filtros.
   *
   * Es la única puerta por la que salen las `sin_nombre` y las retiradas, y
   * tiene que seguir existiendo mientras exista una señal que las apunte: por
   * eso el catálogo marca con `vigente_hasta` y no borra.
   */
  async porId(id: number): Promise<CalleDelCatalogo | undefined> {
    const [fila] = await this.leer(
      this.db
        .select(CAMPOS_DE_CALLE)
        .from(geoCalles)
        .innerJoin(localidad, eq(localidad.id, geoCalles.localidadId))
        .innerJoin(departamento, eq(departamento.id, geoCalles.departamentoId))
        .innerJoin(provincia, eq(provincia.id, geoCalles.provinciaId))
        .leftJoin(municipio, eq(municipio.id, localidad.municipalityId))
        .where(eq(geoCalles.id, id))
        .limit(1),
    );

    return fila === undefined ? undefined : aCalleDelCatalogo(fila);
  }

  /** El dominio de `categoria` como dato, que es lo que §3.3 existe para dar. */
  async listarCategorias(): Promise<string[]> {
    const filas = await this.leer(
      this.db
        .select({ categoria: geoCalleCategorias.categoria })
        .from(geoCalleCategorias)
        .orderBy(desc(geoCalleCategorias.cantidad), asc(geoCalleCategorias.categoria)),
    );
    return filas.map((f) => f.categoria);
  }

  /**
   * La corrida vigente del catálogo. El unique parcial de la Task 1 garantiza
   * que no haya dos; `undefined` acá significa que todavía no se sembró nada, y
   * es un hecho sobre la base, no un error.
   */
  async versionVigente(): Promise<GeoCatalogoVersion | undefined> {
    const [fila] = await this.leer(
      this.db
        .select()
        .from(geoCatalogoVersion)
        .where(eq(geoCatalogoVersion.vigente, true))
        .limit(1),
    );
    return fila;
  }

  /**
   * El paquete offline de una localidad (§4.3). `corrida` la pone quien llama,
   * desde la ruta: el paquete se sirve `immutable` y una corrida nueva es una
   * URL nueva, así que validar que exista es de la capa que arma la URL (Task 4).
   */
  async paqueteDeLocalidad(localidadId: number, corrida: string): Promise<PaqueteDeCalles> {
    return this.paquete('localidad', geoCalles.localidadId, localidadId, corrida);
  }

  /** El paquete offline de un departamento: una campaña cubre una zona (§4.3). */
  async paqueteDeDepartamento(departamentoId: number, corrida: string): Promise<PaqueteDeCalles> {
    return this.paquete('departamento', geoCalles.departamentoId, departamentoId, corrida);
  }

  private seleccionDePaquete(columna: ColumnaDeTerritorio, id: number) {
    return (
      this.db
        .select({
          id: geoCalles.id,
          nombre: geoCalles.nombre,
          nombreNorm: geoCalles.nombreNorm,
          categoria: geoCalles.categoria,
          desde: geoCalles.alturaDesde,
          hasta: geoCalles.alturaHasta,
        })
        .from(geoCalles)
        // Mismo recorte que la búsqueda online: si el paquete trajera las
        // `sin_nombre` y las retiradas, la superficie offline diría cosas que la
        // online no dice, que es exactamente el defecto que §4.3 evita.
        .where(
          and(
            eq(columna, id),
            eq(geoCalles.nombreClase, 'nominada'),
            isNull(geoCalles.vigenteHasta),
          ),
        )
        .orderBy(asc(geoCalles.nombreNorm))
    );
  }

  private async paquete(
    ambito: 'localidad' | 'departamento',
    columna: ColumnaDeTerritorio,
    id: number,
    corrida: string,
  ): Promise<PaqueteDeCalles> {
    const [filas, categorias] = await Promise.all([
      this.leer(this.seleccionDePaquete(columna, id)),
      this.listarCategorias(),
    ]);

    return {
      corrida,
      ambito,
      id,
      columnas: COLUMNAS_DEL_PAQUETE,
      categorias,
      calles: filas.map(
        (f): FilaDePaquete => [f.id, f.nombre, f.nombreNorm, f.categoria, f.desde, f.hasta],
      ),
    };
  }

  /**
   * Un lote de calles, idempotente (§4.7, y Task 5 Step 3 del plan).
   *
   * **El `WHERE` del `DO UPDATE` es lo que hace que una re-corrida sin cambios
   * escriba cero filas** — sin tuplas muertas, sin WAL, sin bloat. Sin él, cada
   * re-siembra duplica el WAL y con él el almacenamiento, que en una base con
   * techo duro de 512 MB no es un detalle de higiene.
   *
   * **La identidad de una calle es su `georef_id` MÁS su localidad.** Si georef
   * recodifica y un id que existía pasa a nombrar una calle de otra localidad,
   * el `DO UPDATE` no corre: `calle_id` de N señales pasaría a apuntar a otra
   * calle en silencio, y eso no se reconstruye dos años después.
   *
   * TODO(Task 5, Step 3 · el retiro y el alta de una recodificación): el plan
   * pide que la fila vieja reciba `vigente_hasta` y conserve su `id` **y** que
   * entre una fila nueva. Las dos cosas juntas son inexpresables mientras
   * `geo_calles_georef_unique` sea un unique TOTAL sobre `georef_id`: la fila
   * nueva choca contra la vieja. Hasta que ese índice sea parcial
   * (`WHERE vigente_hasta IS NULL`), acá las recodificaciones se DETECTAN y se
   * REPORTAN, y no se escribe nada por ellas — perder una calle en silencio y
   * mudarle las señales a otra son los dos desenlaces que hay que evitar, y
   * reportar no es ninguno de los dos.
   */
  async upsertLote(lote: readonly CalleParaSembrar[]): Promise<ResultadoDeLote> {
    if (lote.length === 0) return { escritas: 0, sinCambios: 0, recodificaciones: [] };

    const porGeorefId = new Map(lote.map((calle) => [calle.georefId, calle]));
    const existentes = await this.db
      .select({ georefId: geoCalles.georefId, localidadId: geoCalles.localidadId })
      .from(geoCalles)
      .where(inArray(geoCalles.georefId, [...porGeorefId.keys()]));

    const recodificaciones = existentes
      .filter((fila) => porGeorefId.get(fila.georefId)?.localidadId !== fila.localidadId)
      .map((fila) => fila.georefId);
    const recodificados = new Set(recodificaciones);

    const aEscribir = lote.filter((calle) => !recodificados.has(calle.georefId));
    if (aEscribir.length === 0) {
      return { escritas: 0, sinCambios: 0, recodificaciones };
    }

    const filas = await this.db
      .insert(geoCalles)
      .values(
        aEscribir.map((calle) => ({
          georefId: calle.georefId,
          localidadId: calle.localidadId,
          departamentoId: calle.departamentoId,
          provinciaId: calle.provinciaId,
          nombre: calle.nombre,
          nombreNorm: calle.nombreNorm,
          nombreClase: calle.nombreClase,
          categoria: calle.categoria,
          alturaDesde: desdeDelRango(calle.rango),
          alturaHasta: hastaDelRango(calle.rango),
          // Una calle que vuelve a aparecer deja de estar retirada. Que el
          // Estado la haya dejado de listar un mes no la borra, y volver a
          // listarla tampoco crea una calle nueva.
          vigenteHasta: null,
        })),
      )
      .onConflictDoUpdate({
        target: geoCalles.georefId,
        set: {
          departamentoId: sql`excluded.departamento_id`,
          provinciaId: sql`excluded.provincia_id`,
          nombre: sql`excluded.nombre`,
          nombreNorm: sql`excluded.nombre_norm`,
          nombreClase: sql`excluded.nombre_clase`,
          categoria: sql`excluded.categoria`,
          alturaDesde: sql`excluded.altura_desde`,
          alturaHasta: sql`excluded.altura_hasta`,
          vigenteHasta: sql`excluded.vigente_hasta`,
          actualizadoEn: sql`now()`,
        },
        // La primera condición es la regla de identidad, repetida acá porque
        // entre el SELECT de arriba y este INSERT puede haber corrido otra
        // siembra. Las demás son «algo cambió»: si nada cambió, la fila no se
        // toca y el motor no escribe.
        setWhere: sql`
          ${geoCalles.localidadId} = excluded.localidad_id
          and (${geoCalles.departamentoId}, ${geoCalles.provinciaId}, ${geoCalles.nombre},
               ${geoCalles.nombreNorm}, ${geoCalles.nombreClase}, ${geoCalles.categoria},
               ${geoCalles.alturaDesde}, ${geoCalles.alturaHasta}, ${geoCalles.vigenteHasta})
          is distinct from
              (excluded.departamento_id, excluded.provincia_id, excluded.nombre,
               excluded.nombre_norm, excluded.nombre_clase, excluded.categoria,
               excluded.altura_desde, excluded.altura_hasta, excluded.vigente_hasta)`,
      })
      .returning({ id: geoCalles.id });

    return {
      escritas: filas.length,
      sinCambios: aEscribir.length - filas.length,
      recodificaciones,
    };
  }
}

/**
 * La vuelta de la unión a las dos columnas. Vive acá y no en el seed para que la
 * traducción tenga una sola ida y una sola vuelta.
 */
const desdeDelRango = (rango: RangoDeAltura): number | null =>
  rango.tipo === 'completo' || rango.tipo === 'parcialDesde' ? rango.desde : null;

const hastaDelRango = (rango: RangoDeAltura): number | null =>
  rango.tipo === 'completo' || rango.tipo === 'parcialHasta' ? rango.hasta : null;
