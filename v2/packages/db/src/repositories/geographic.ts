/**
 * El territorio, del lado de la lectura.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §3.1, §4.3 y §5.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 3.
 *
 * Hasta la migración `0013` esta tabla tenía 24 filas y dos consultas alcanzaban
 * para todo. Desde `0013` tiene el árbol entero del Estado —17.986 filas
 * medidas— y las dos consultas que había estaban rotas de dos maneras
 * distintas, las dos silenciosas:
 *
 *   - `findCity` filtraba `level = 'city'`, un valor que nunca tuvo una sola
 *     fila y que el CHECK nuevo vuelve imposible. Devolvía `undefined` siempre y
 *     nadie lo notaba porque nadie la llamaba todavía.
 *   - `findProvinceByName` comparaba `name` con tildes apoyada en el índice
 *     único `(level, name)` que la `0013` dropea. Sin ese índice pasa a ser un
 *     seq scan sobre 17.986 filas **en cada escritura que resuelve provincia**,
 *     o sea en el camino que cerró D-001, y sigue funcionando. Que siga
 *     funcionando es lo peor que puede pasar: no hay error que mirar.
 *
 * La búsqueda por nombre va por `name_norm`, con **la misma función que escribió
 * la columna** (`normalizarNombreDeLugar`, en civic-core), sobre el índice
 * `(level, name_norm)`. Dos normalizadores es cómo vuelve la D-012.
 *
 * `normalizeProvinceName` se queda, pero como lo que siempre debió ser: una
 * **tabla de alias** por encima del normalizador —«CABA» y «Tierra del Fuego,
 * Antártida e Islas del Atlántico Sur» son nombres distintos de la misma
 * provincia, no variantes tipográficas— y nunca un segundo normalizador.
 */
import { normalizarNombreDeLugar } from '@v2/civic-core';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { geographicLocations } from '../schema/geographic.js';

import { correrConTecho } from './_lectura.js';

import type { ConsultaPendiente, Db } from '../client.js';
import type { OpcionesDeLectura } from './_lectura.js';
import type { GeographicLocation, NewGeographicLocation } from '../schema/geographic.js';

/**
 * El vocabulario de niveles, tal como lo cierra `geographic_locations_level_chk`
 * (Task 1). Vive acá para que ningún filtro escriba un literal a mano: el
 * `level = 'city'` que esta misma clase tenía devolvía cero filas en silencio, y
 * el único antídoto es que los niveles sean una constante que un test pueda
 * confrontar contra el CHECK de la base.
 */
export const NIVELES_DE_LUGAR = [
  'province',
  'department',
  'municipality',
  'locality',
  'settlement',
] as const;

export type NivelDeLugar = (typeof NIVELES_DE_LUGAR)[number];

/**
 * Los dos niveles donde vive la gente, y los dos que `city_id` puede apuntar.
 * Un asentamiento no es una localidad censal más chica: es otra lista del
 * Estado (BAHRA), y una señal puede caer en cualquiera de las dos.
 */
export const NIVELES_DE_LOCALIDAD = ['locality', 'settlement'] as const;

/**
 * Los alias, en su forma cruda y legible. Se normalizan al armar el mapa para
 * que nadie tenga que escribir a mano «TIERRA DEL FUEGO ANTARTIDA E ISLAS DEL
 * ATLANTICO SUR» y equivocarse en una tilde que ya no está.
 *
 * El de Tierra del Fuego no es una comodidad: georef la llama «Tierra del Fuego,
 * Antártida e Islas del Atlántico Sur» y la base la llama «Tierra del Fuego».
 * Sin esta fila, el seed del callejero falla en la provincia 24 de 24 — o sea
 * después de cuatro minutos de corrida.
 */
const ALIAS_DE_PROVINCIA_CRUDOS: readonly (readonly [string, string])[] = [
  ['CABA', 'Ciudad Autónoma de Buenos Aires'],
  ['Ciudad de Buenos Aires', 'Ciudad Autónoma de Buenos Aires'],
  ['Tierra del Fuego, Antártida e Islas del Atlántico Sur', 'Tierra del Fuego'],
];

const ALIAS_DE_PROVINCIA: ReadonlyMap<string, string> = new Map(
  ALIAS_DE_PROVINCIA_CRUDOS.map(([alias_, canonico]) => [
    normalizarNombreDeLugar(alias_),
    canonico,
  ]),
);

/**
 * El nombre canónico de una provincia, si el que llegó es un alias conocido.
 *
 * **No normaliza:** traduce. Las tildes, las mayúsculas y los espacios los
 * arregla `normalizarNombreDeLugar` un paso más adelante, del mismo lado que la
 * columna. Acá sólo se resuelve que dos nombres DISTINTOS nombran el mismo
 * lugar, que es una cosa que ninguna función de texto puede saber.
 */
export function normalizeProvinceName(name: string): string {
  return ALIAS_DE_PROVINCIA.get(normalizarNombreDeLugar(name)) ?? name.trim();
}

/**
 * Buscar una localidad por nombre puede ser ambiguo, y ambiguo no es lo mismo
 * que vacío: con 4.027 localidades censales el país tiene decenas de «San
 * Martín» y de «25 de Mayo», y varias pueden convivir en la misma provincia.
 *
 * Devolver la primera sería resolver sola una elección que es de la persona
 * —el mismo criterio con el que §4.6 manda devolver las dos calles homónimas—
 * y devolver `undefined` sería decir «no existe» cuando existen tres.
 */
export type BusquedaDeLocalidad =
  | { estado: 'unica'; localidad: GeographicLocation }
  | { estado: 'ambigua'; candidatas: GeographicLocation[] }
  | { estado: 'sin_coincidencia' };

/**
 * La jerarquía de un lugar, resuelta hacia arriba.
 *
 * `provinciaId` nunca falta: no hay unidad territorial argentina que no
 * pertenezca a una provincia, y la columna es NOT NULL desde la `0013`. Los
 * otros tres sí pueden faltar, y cada `null` es un hecho distinto sobre el país,
 * nunca un dato que no encontramos.
 */
export interface Ancestros {
  lugar: GeographicLocation;
  provinciaId: number;
  departamentoId: number | null;
  /** NULL = el Estado no lo lista dentro de ningún municipio (§2.2). */
  municipioId: number | null;
  /**
   * La localidad censal ancestro: ella misma si el lugar es una localidad, la de
   * su `parent_id` si es un asentamiento. **NULL cuando BAHRA lo deja colgando
   * del departamento**, que es el caso que §4.3 manda resolver al paquete del
   * departamento en vez de inventarle una localidad cercana.
   */
  localidadId: number | null;
}

const padre = alias(geographicLocations, 'padre');

/**
 * Lo que `GET /api/v1/geo/lugares` puede pedir (spec A §4.1). Los cuatro
 * filtros son opcionales entre sí y **al menos uno es obligatorio**, pero eso lo
 * hace cumplir la validación del borde: acá el contrato es que sin ninguno la
 * consulta sigue teniendo `LIMIT`.
 *
 * `q` llega YA normalizado por `normalizarNombreDeLugar`, que es la misma
 * función que escribió `name_norm`. Que el repositorio no lo normalice de nuevo
 * es deliberado: quien llama necesita la forma normalizada para decidir el 308 a
 * la URL canónica, y normalizarla dos veces es cómo se empieza a tener dos
 * normalizadores.
 */
export interface FiltroDeLugares {
  nivel?: NivelDeLugar;
  padreId?: number;
  municipioId?: number;
  qNorm?: string;
  limite?: number;
}

export class GeographicRepository {
  /**
   * `opciones.techoMs` lo pone el router que sirve una request pública; las
   * escrituras y los scripts lo omiten (ver `_lectura.ts`).
   */
  constructor(
    private readonly db: Db,
    private readonly opciones: OpcionesDeLectura = {},
  ) {}

  /** Toda lectura pasa por acá, para que ninguna consulta nueva se olvide el techo. */
  private leer<R>(consulta: ConsultaPendiente<R>): Promise<R> {
    return correrConTecho(this.db, this.opciones, consulta);
  }

  async listProvinces(): Promise<GeographicLocation[]> {
    return this.leer(
      this.db
        .select()
        .from(geographicLocations)
        .where(eq(geographicLocations.level, 'province'))
        .orderBy(asc(geographicLocations.name)),
    );
  }

  /**
   * Los lugares que matchean un filtro, para el autocompletado de territorio.
   *
   * `nivel` entra por `NIVELES_DE_LUGAR` y no por un literal: el `level='city'`
   * que esta clase tenía devolvía cero filas en silencio, y la guarda 11 de
   * §8.1 existe justamente para que ningún filtro invente un nivel que el CHECK
   * no conoce.
   *
   * El substring va sobre `name_norm` y no sobre `name`: la columna normalizada
   * es la que tiene índice `(level, name_norm)` y es la que no depende de si la
   * persona escribió la tilde. Con `nivel` puesto, ese índice acota; sin él son
   * 17.986 filas —la tabla entera vive en caché de Postgres— y el `LIMIT` de a
   * lo sumo 50 la cierra.
   */
  async listPlaces(filtro: FiltroDeLugares): Promise<GeographicLocation[]> {
    const condiciones = [];
    if (filtro.nivel !== undefined) condiciones.push(eq(geographicLocations.level, filtro.nivel));
    if (filtro.padreId !== undefined) {
      condiciones.push(eq(geographicLocations.parentId, filtro.padreId));
    }
    if (filtro.municipioId !== undefined) {
      condiciones.push(eq(geographicLocations.municipalityId, filtro.municipioId));
    }
    if (filtro.qNorm !== undefined && filtro.qNorm.length > 0) {
      // `qNorm` salió del normalizador, que elimina todo lo que no sea
      // alfanumérico o espacio: `%` y `_` no pueden llegar hasta acá.
      condiciones.push(sql`${geographicLocations.nameNorm} like ${`%${filtro.qNorm}%`}`);
    }
    // Un lugar que el Estado dejó de listar no se ofrece para elegir; sigue
    // saliendo por id, igual que una calle retirada.
    condiciones.push(isNull(geographicLocations.vigenteHasta));

    return this.leer(
      this.db
        .select()
        .from(geographicLocations)
        .where(and(...condiciones))
        .orderBy(asc(geographicLocations.name), asc(geographicLocations.id))
        .limit(filtro.limite ?? 20),
    );
  }

  /**
   * La provincia por su nombre, por `name_norm` y sobre `(level, name_norm)`.
   *
   * Es el camino de escritura que cerró D-001: `provinciaIdDePunto` termina acá
   * en cada captura con punto. Si esta consulta devuelve `undefined`, la señal
   * se guarda sin provincia y desaparece de todo lo que agrega por territorio,
   * sin un error en ningún lado.
   *
   * **Depende de que `name_norm` esté escrito.** Las 24 filas vivas entraron
   * antes de la `0013` y lo tienen en NULL hasta que la fase 1 del seed las
   * reconcilie (Task 5, Step 1). Entre la migración y esa fase, esto devuelve
   * `undefined` para las 24 — y el test de la guarda 9 está escrito para ponerse
   * rojo exactamente ahí, que es el único aviso que el sistema puede dar.
   */
  async findProvinceByName(name: string): Promise<GeographicLocation | undefined> {
    const canonico = normalizeProvinceName(name);
    const [row] = await this.leer(
      this.db
        .select()
        .from(geographicLocations)
        .where(
          and(
            eq(geographicLocations.level, 'province'),
            eq(geographicLocations.nameNorm, normalizarNombreDeLugar(canonico)),
          ),
        )
        .limit(1),
    );
    return row;
  }

  /**
   * Una localidad o un asentamiento por nombre exacto dentro de una provincia.
   *
   * Reemplaza a `findCity`, que filtraba un nivel inexistente. La igualdad es
   * exacta sobre `name_norm` y no un `ilike`: un `ilike` sin comodines es una
   * igualdad más cara que además no puede usar el índice `(level, name_norm)`,
   * y con comodines sería una búsqueda, que es otra función.
   */
  async findLocalidad(name: string, provinceId: number): Promise<BusquedaDeLocalidad> {
    const candidatas = await this.leer(
      this.db
        .select()
        .from(geographicLocations)
        .where(
          and(
            inArray(geographicLocations.level, [...NIVELES_DE_LOCALIDAD]),
            eq(geographicLocations.nameNorm, normalizarNombreDeLugar(name)),
            eq(geographicLocations.provinceId, provinceId),
          ),
        )
        // El orden importa sólo para que dos corridas iguales devuelvan lo mismo:
        // quién gana entre dos homónimas no lo decide esta consulta.
        .orderBy(asc(geographicLocations.level), asc(geographicLocations.id))
        .limit(20),
    );

    const [primera] = candidatas;
    if (primera === undefined) return { estado: 'sin_coincidencia' };
    if (candidatas.length === 1) return { estado: 'unica', localidad: primera };
    return { estado: 'ambigua', candidatas };
  }

  /** Un lugar por el id del Estado. Es la clave por la que reconcilia el seed. */
  async findByGeorefId(georefId: string): Promise<GeographicLocation | undefined> {
    const [row] = await this.leer(
      this.db
        .select()
        .from(geographicLocations)
        .where(eq(geographicLocations.georefId, georefId))
        .limit(1),
    );
    return row;
  }

  /**
   * Los hijos directos de un lugar, sobre `geographic_locations_parent_idx`.
   *
   * `nivel` acota el escalón cuando quien pregunta ya sabe qué busca: los
   * departamentos y los municipios cuelgan los dos de la provincia (§2.2), así
   * que sin el filtro «los hijos de Córdoba» son 26 departamentos y 427
   * municipios mezclados.
   */
  async listChildren(parentId: number, nivel?: NivelDeLugar): Promise<GeographicLocation[]> {
    const condiciones = [eq(geographicLocations.parentId, parentId)];
    if (nivel !== undefined) condiciones.push(eq(geographicLocations.level, nivel));

    return this.leer(
      this.db
        .select()
        .from(geographicLocations)
        .where(and(...condiciones))
        .orderBy(asc(geographicLocations.name)),
    );
  }

  /**
   * La jerarquía hacia arriba de un lugar, en una sola consulta.
   *
   * No hace falta un CTE recursivo y no lo hay: provincia, departamento y
   * municipio están desnormalizados en la propia fila, y el único salto que la
   * fila no sabe dar es el de un asentamiento a su localidad censal, que es un
   * `parent_id`. Dos lookups por clave primaria, profundidad fija.
   */
  async resolveAncestors(id: number): Promise<Ancestros | undefined> {
    const [fila] = await this.leer(
      this.db
        .select({
          lugar: geographicLocations,
          padreId: padre.id,
          padreLevel: padre.level,
        })
        .from(geographicLocations)
        .leftJoin(padre, eq(padre.id, geographicLocations.parentId))
        .where(eq(geographicLocations.id, id))
        .limit(1),
    );

    if (fila === undefined) return undefined;

    const { lugar } = fila;
    let localidadId: number | null = null;
    if (lugar.level === 'locality') {
      localidadId = lugar.id;
    } else if (lugar.level === 'settlement' && fila.padreLevel === 'locality') {
      localidadId = fila.padreId;
    }

    return {
      lugar,
      provinciaId: lugar.provinceId,
      departamentoId: lugar.departmentId,
      municipioId: lugar.municipalityId,
      localidadId,
    };
  }

  /**
   * Alta o actualización de un lugar por el id del Estado.
   *
   * Se llamaba `upsert` y era un INSERT pelado: la segunda corrida del seed
   * habría entrado 17.986 filas repetidas. Ahora es un upsert de verdad, y
   * `georefId` es **obligatorio** en la entrada: en Postgres dos NULL no chocan
   * en un índice único, así que un upsert sin `georef_id` no reconcilia con
   * nada y entra siempre una fila nueva.
   *
   * Desde la migración `0015` la columna es `NOT NULL` y el tipo inferido ya lo
   * exige solo, así que la intersección de abajo es redundante hoy. Se queda:
   * es la que sigue exigiendo `georefId` en la entrada el día que alguien le
   * saque el `notNull()` al esquema — un cambio cuyo daño no aparece hasta la
   * segunda siembra, y ahí ya son 17.986 filas duplicadas.
   */
  async upsertLocation(
    input: NewGeographicLocation & { georefId: string },
  ): Promise<GeographicLocation> {
    const [row] = await this.db
      .insert(geographicLocations)
      .values(input)
      .onConflictDoUpdate({
        target: geographicLocations.georefId,
        set: {
          level: sql`excluded.level`,
          name: sql`excluded.name`,
          nameNorm: sql`excluded.name_norm`,
          isoCode: sql`excluded.iso_code`,
          provinceId: sql`excluded.province_id`,
          parentId: sql`excluded.parent_id`,
          departmentId: sql`excluded.department_id`,
          municipalityId: sql`excluded.municipality_id`,
          latitude: sql`excluded.latitude`,
          longitude: sql`excluded.longitude`,
          vigenteHasta: sql`excluded.vigente_hasta`,
        },
      })
      .returning();
    if (!row) throw new Error('Failed to upsert geographic location');
    return row;
  }
}
