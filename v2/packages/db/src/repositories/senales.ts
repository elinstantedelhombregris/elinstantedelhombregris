/**
 * SenalesRepository — la escritura y la lectura de la tabla `senales`.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §3.3 y §4.7.
 * Migración: `0022_senales.sql`.
 *
 * ## Las tres reglas que este archivo existe para cumplir
 *
 * **1 · La idempotencia va en UNA sentencia.** `insert … on conflict (origen,
 * id_local) do nothing returning id`. El patrón de al lado —`SELECT` y después
 * `INSERT`, que es lo que hace `features/civic-map/capturas.ts:53-58` y lo
 * declara como deuda ahí mismo— tiene una carrera real: dos reintentos del
 * outbox que caen juntos leen «no existe» los dos y escriben los dos. El
 * `UNIQUE` los pararía con un 23505, pero el que pierde ya se llevó un 500 en
 * la cara. Con `on conflict` el que pierde recibe cero filas y eso **es** la
 * respuesta correcta: «ya estaba».
 *
 * **2 · `actualizada_en` la escribe el repositorio, en cada UPDATE.** El
 * esquema lo dice explícito (`senales.ts:188-191`): no hay trigger, porque un
 * trigger que drizzle no modela es una regla invisible. `dreams.updated_at` ya
 * demostró qué pasa sin writer — se queda pegado a `created_at` para siempre y
 * nadie se entera hasta que alguien ordena por él.
 *
 * **3 · Todo lo que compara actores va con `IS DISTINCT FROM`.** `actor_id` es
 * nullable a propósito: si el navegador rechaza la cookie la señal existe
 * igual. Con la columna en NULL, `actor_id <> $mio` devuelve NULL, no `true`, y
 * según de qué lado del filtro caiga, o toda señal anónima es incorroborable o
 * —peor— toda señal anónima es **auto-corroborable**.
 */
import { and, desc, eq, gte, inArray, isNotNull, lte, sql } from 'drizzle-orm';

import { senales } from '../schema/senales.js';

import type { Db } from '../client.js';
import type { NewSenal, Senal } from '../schema/senales.js';
import type { SQL } from 'drizzle-orm';

/** Lo que devuelve una ingesta. `yaExistia` es la respuesta del reintento. */
export interface ResultadoDeIngesta {
  readonly idPublico: string;
  readonly estado: string;
  readonly yaExistia: boolean;
}

export interface FiltroDeSenales {
  readonly clases?: readonly string[];
  readonly tipos?: readonly string[];
  readonly provinceId?: number;
  readonly desde?: Date;
  readonly hasta?: Date;
  readonly soloConPunto?: boolean;
  readonly limite?: number;
}

/**
 * La forma pública de una señal. **Es una lista blanca, no un `select *`.**
 *
 * Lo que no está acá no está por decisión y no por olvido: `id` (el ordinal
 * permite enumerar el corpus entero y emparejar dos señales de la misma
 * sesión), `actor_id`, `user_id`, `id_local` (es la clave de idempotencia de
 * un dispositivo) y `direccion_texto` cuando la política no la publica.
 */
export interface SenalPublica {
  readonly idPublico: string;
  readonly tipo: string;
  readonly clase: string;
  readonly tema: string | null;
  readonly titulo: string | null;
  readonly texto: string;
  readonly fuente: string | null;
  readonly firma: string | null;
  readonly estado: string;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly precision: string;
  readonly locationRole: string;
  readonly provinceId: number | null;
  readonly cityId: number | null;
  readonly direccionTexto: string | null;
  readonly comprometidoPara: string | null;
  readonly desenlace: string | null;
  readonly periodicidad: string | null;
  readonly creadaEn: string;
}

const COLUMNAS_PUBLICAS = {
  idPublico: senales.idPublico,
  tipo: senales.tipo,
  clase: senales.clase,
  tema: senales.tema,
  titulo: senales.titulo,
  texto: senales.texto,
  fuente: senales.fuente,
  firma: senales.firma,
  estado: senales.estado,
  lat: senales.lat,
  lng: senales.lng,
  precision: senales.precision,
  locationRole: senales.locationRole,
  provinceId: senales.provinceId,
  cityId: senales.cityId,
  direccionTexto: senales.direccionTexto,
  comprometidoPara: senales.comprometidoPara,
  desenlace: senales.desenlace,
  periodicidad: senales.periodicidad,
  creadaEn: senales.creadaEn,
} as const;

/** El techo duro de una lectura. Sin esto, `?limite=999999` es un DoS de lectura. */
const LIMITE_MAXIMO = 500;

export class SenalesRepository {
  constructor(private readonly db: Db) {}

  /**
   * Escribir una señal, idempotente por `(origen, id_local)`.
   *
   * Devuelve `yaExistia: true` cuando el reintento llegó segundo. Ese caso NO
   * es un error y el borde tiene que contestarlo con el mismo 201 y el mismo
   * cuerpo que el primero: un outbox que reintenta hasta ver un 2xx, contra un
   * servidor que contesta 409 al reintento, reintenta para siempre.
   */
  async crear(fila: NewSenal): Promise<ResultadoDeIngesta> {
    const [creada] = await this.db
      .insert(senales)
      .values(fila)
      .onConflictDoNothing({ target: [senales.origen, senales.idLocal] })
      .returning({ idPublico: senales.idPublico, estado: senales.estado });

    if (creada !== undefined) {
      return { idPublico: creada.idPublico, estado: creada.estado, yaExistia: false };
    }

    /**
     * Perdió la carrera o es un reintento: la fila existe y hay que devolver la
     * suya, no una nueva. Se busca por la MISMA clave del conflicto y no por
     * `id_local` a secas — los tres espacios de nombres (`web`, `campo`,
     * `campo-v1`) son deliberados, y buscar sin `origen` devolvería la señal de
     * otro cliente que eligió el mismo uuid.
     */
    const [previa] = await this.db
      .select({ idPublico: senales.idPublico, estado: senales.estado })
      .from(senales)
      .where(and(eq(senales.origen, fila.origen), eq(senales.idLocal, fila.idLocal)))
      .limit(1);

    if (previa === undefined) {
      throw new Error(
        `El insert de la señal no escribió ni encontró la fila (${fila.origen}/${fila.idLocal}). ` +
          'Esto sólo pasa si algo la borró entre las dos sentencias.',
      );
    }
    return { idPublico: previa.idPublico, estado: previa.estado, yaExistia: true };
  }

  /** Una señal por su id público. `null` si no está o si está retenida. */
  async porIdPublico(idPublico: string): Promise<SenalPublica | null> {
    const [fila] = await this.db
      .select(COLUMNAS_PUBLICAS)
      .from(senales)
      .where(and(eq(senales.idPublico, idPublico), sql`${senales.retenidaEn} is null`))
      .limit(1);
    return fila === undefined ? null : normalizar(fila);
  }

  /**
   * La lectura del mapa y del feed.
   *
   * `retenida_en is null` no es un filtro opcional: la retención de cuidado es
   * **visibilidad y no calidad**, no toca `estado`, y tiene que salir de toda
   * superficie pública. Va acá adentro para que ninguna consulta se lo olvide.
   */
  async listar(filtro: FiltroDeSenales = {}): Promise<SenalPublica[]> {
    const condiciones: SQL[] = [sql`${senales.retenidaEn} is null`];

    if (filtro.clases !== undefined && filtro.clases.length > 0) {
      condiciones.push(inArray(senales.clase, [...filtro.clases]));
    }
    if (filtro.tipos !== undefined && filtro.tipos.length > 0) {
      condiciones.push(inArray(senales.tipo, [...filtro.tipos]));
    }
    if (filtro.provinceId !== undefined) {
      condiciones.push(eq(senales.provinceId, filtro.provinceId));
    }
    if (filtro.desde !== undefined) condiciones.push(gte(senales.creadaEn, filtro.desde));
    if (filtro.hasta !== undefined) condiciones.push(lte(senales.creadaEn, filtro.hasta));
    if (filtro.soloConPunto === true) condiciones.push(isNotNull(senales.lat));

    const limite = Math.min(filtro.limite ?? 100, LIMITE_MAXIMO);

    const filas = await this.db
      .select(COLUMNAS_PUBLICAS)
      .from(senales)
      .where(and(...condiciones))
      .orderBy(desc(senales.creadaEn))
      .limit(limite);

    return filas.map(normalizar);
  }

  /** Cuántas hay, por clase. Para el contador de la portada y la composición. */
  async contarPorClase(): Promise<Record<string, number>> {
    const filas = await this.db
      .select({ clase: senales.clase, n: sql<number>`count(*)::int` })
      .from(senales)
      .where(sql`${senales.retenidaEn} is null`)
      .groupBy(senales.clase);
    return Object.fromEntries(filas.map((f) => [f.clase, f.n]));
  }

  async total(): Promise<number> {
    const [fila] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(senales)
      .where(sql`${senales.retenidaEn} is null`);
    return fila?.n ?? 0;
  }

  /**
   * Cambiar el estado de una señal.
   *
   * `actualizada_en` va en el `set` y no en un default: **regla 2 del header**.
   * Si esta línea desaparece, nada falla, nada avisa, y la columna se queda
   * pegada a `creada_en` como le pasó a `dreams.updated_at`.
   */
  async cambiarEstado(idPublico: string, estado: string, motivo?: string): Promise<boolean> {
    const filas = await this.db
      .update(senales)
      .set({
        estado,
        estadoDesde: new Date(),
        actualizadaEn: new Date(),
        ...(motivo === undefined ? {} : { motivo }),
      })
      .where(eq(senales.idPublico, idPublico))
      .returning({ idPublico: senales.idPublico });
    return filas.length > 0;
  }

  /**
   * Retirar: vacía el texto y deja la fila.
   *
   * El CHECK `senales_retirada_sin_texto_chk` exige que `texto = ''` cuando el
   * estado es `retirada`, así que las dos cosas van juntas o la base rechaza.
   * El borrado queda auditable —la fila sigue contando en cobertura— y el
   * contenido no.
   */
  async retirar(idPublico: string): Promise<boolean> {
    const filas = await this.db
      .update(senales)
      .set({
        estado: 'retirada',
        texto: '',
        estadoDesde: new Date(),
        actualizadaEn: new Date(),
      })
      .where(eq(senales.idPublico, idPublico))
      .returning({ idPublico: senales.idPublico });
    return filas.length > 0;
  }

  /**
   * Las señales de un actor que NO son de otro actor.
   *
   * El `IS DISTINCT FROM` es la regla 3 del header, y acá se ve por qué: con
   * `<>`, una fila con `actor_id` NULL evalúa a NULL, el `WHERE` la descarta, y
   * el circuito de corroboración se queda mirando sólo las señales con cookie
   * sin que nada lo diga. Con `IS DISTINCT FROM` la fila anónima entra, que es
   * lo correcto: nadie la escribió, así que nadie se está corroborando a sí
   * mismo.
   */
  async corroborablesPor(actorId: number, limite = 20): Promise<SenalPublica[]> {
    const filas = await this.db
      .select(COLUMNAS_PUBLICAS)
      .from(senales)
      .where(
        and(
          sql`${senales.retenidaEn} is null`,
          sql`${senales.actorId} is distinct from ${actorId}`,
          eq(senales.estado, 'por_verificar'),
          inArray(senales.clase, ['hecho', 'acto']),
        ),
      )
      .orderBy(desc(senales.creadaEn))
      .limit(Math.min(limite, LIMITE_MAXIMO));
    return filas.map(normalizar);
  }
}

/**
 * `numeric` vuelve de `pg` como string y `timestamp` como `Date`.
 *
 * Se normaliza acá y no en cada consumidor porque un `lat` que a veces es
 * `"-34.603722"` y a veces `-34.603722` es la clase de cosa que funciona en
 * todos lados hasta que alguien hace `lat > 0`.
 */
function normalizar(fila: {
  lat: string | null;
  lng: string | null;
  creadaEn: Date;
  [k: string]: unknown;
}): SenalPublica {
  return {
    ...(fila as unknown as SenalPublica),
    lat: fila.lat === null ? null : Number(fila.lat),
    lng: fila.lng === null ? null : Number(fila.lng),
    creadaEn: fila.creadaEn.toISOString(),
  };
}

export type { Senal, NewSenal };

/* -------------------------------------------------------------------------- */
/*  La luz de un territorio                                                    */
/* -------------------------------------------------------------------------- */

/**
 * El conteo crudo de una provincia, con la forma exacta que pide `ConteoCelda`
 * de `civic-core/brillo.ts`.
 *
 * Los cinco campos y sus definiciones salen de la spec C §2.8, y no se
 * reinterpretan acá: este repositorio los CUENTA, y `brilloDeCelda` /
 * `nitidezDeCelda` los convierten en los dos números. Que el cálculo viva en el
 * núcleo y el conteo en la base es lo que impide que la web y el teléfono
 * midan distinto.
 */
export interface ConteoDeProvincia {
  readonly provinceId: number;
  readonly vocesDistintas: number;
  readonly senalesSinActor: number;
  readonly verificables: number;
  readonly confirmaciones: number;
}

/** El tope de §2.8: más de veinte hechos de un actor en un territorio no cuentan. */
export const TOPE_VERIFICABLES_POR_ACTOR = 20;

/** Los estados en que una señal está publicada y por lo tanto es verificable. */
const ESTADOS_PUBLICADOS = ['por_verificar', 'corroborada', 'resuelta', 'desactualizada'];
/** De esos, los que cuentan como confirmados. */
const ESTADOS_CONFIRMADOS = ['corroborada', 'resuelta'];

export class LuzRepository {
  constructor(private readonly db: Db) {}

  /**
   * Los cuatro conteos por provincia, en una sola consulta.
   *
   * Tres decisiones que la spec fija y que son fáciles de escribir mal:
   *
   * 1. **`vocesDistintas` cuenta PERSONAS, no señales**, y suma dos conjuntos:
   *    quien escribió algo en la provincia y quien adhirió a algo de la
   *    provincia. La adhesión enciende la celda de la señal que apoya, no la de
   *    quien adhiere — por eso el join va contra la provincia de la SEÑAL.
   * 2. **`senalesSinActor` va aparte y no se pliega a cero.** «No sé quién» no
   *    es «nadie», y plegarlo sesgaría justo contra lo que carga la app de
   *    campo, que es donde más falta la cookie.
   * 3. **El tope de veinte por actor** existe porque `verificables` es el
   *    denominador de la nitidez y cargar señales no cuesta nada: cien hechos
   *    de una sola persona apagarían la nitidez de su provincia a casi cero.
   *    Sin el tope, el denominador es el diario de alguien.
   */
  async conteosPorProvincia(): Promise<ConteoDeProvincia[]> {
    const crudo = await this.db.execute<{
      province_id: number;
      voces: number;
      sin_actor: number;
      verificables: number;
      confirmaciones: number;
    }>(sql`
      with publicadas as (
        select s.id, s.province_id, s.actor_id, s.clase, s.estado,
               row_number() over (
                 partition by s.province_id, s.actor_id order by s.creada_en
               ) as orden_por_actor
        from senales s
        where s.retenida_en is null
          and s.province_id is not null
          and s.clase in ('hecho','acto')
          and s.estado = any(${sql.raw(`array['${ESTADOS_PUBLICADOS.join("','")}']`)})
      ),
      topeadas as (
        -- El tope sólo aplica a quien TIENE actor: sin actor no hay a quién topear.
        select * from publicadas
        where actor_id is null or orden_por_actor <= ${TOPE_VERIFICABLES_POR_ACTOR}
      ),
      escritoras as (
        select province_id, actor_id from senales
        where retenida_en is null and province_id is not null and actor_id is not null
      ),
      adherentes as (
        select s.province_id, a.actor_id from adhesiones a
        join senales s on s.id = a.senal_id
        where s.retenida_en is null and s.province_id is not null
      ),
      personas as (
        select province_id, actor_id from escritoras
        union
        select province_id, actor_id from adherentes
      )
      select
        p.province_id,
        coalesce((select count(*) from personas x where x.province_id = p.province_id), 0)::int as voces,
        coalesce((select count(*) from senales y
                  where y.province_id = p.province_id and y.retenida_en is null
                    and y.actor_id is null), 0)::int as sin_actor,
        count(*)::int as verificables,
        count(*) filter (
          where t.estado = any(${sql.raw(`array['${ESTADOS_CONFIRMADOS.join("','")}']`)})
        )::int as confirmaciones
      from topeadas t
      join (select distinct province_id from topeadas) p on p.province_id = t.province_id
      group by p.province_id
    `);

    // `neon-http` devuelve `{ rows }`, no un array pelado.
    const filas = crudo.rows;
    const listadas: ConteoDeProvincia[] = filas.map((f) => ({
      provinceId: f.province_id,
      vocesDistintas: f.voces,
      senalesSinActor: f.sin_actor,
      verificables: f.verificables,
      confirmaciones: f.confirmaciones,
    }));

    /**
     * Las provincias que sólo tienen deseos o preguntas no aparecen en
     * `topeadas` —no hay verificables— y sin embargo **tienen brillo**: alguien
     * habló ahí. Se completan aparte para que no desaparezcan del mapa: una
     * provincia con cien sueños y ningún hecho tiene que dibujarse encendida y
     * nítida, no oscura.
     */
    const conVerificables = new Set(listadas.map((l) => l.provinceId));
    const crudoDeseos = await this.db.execute<{
      province_id: number;
      voces: number;
      sin_actor: number;
    }>(sql`
      select s.province_id,
             count(distinct s.actor_id)::int as voces,
             count(*) filter (where s.actor_id is null)::int as sin_actor
      from senales s
      where s.retenida_en is null and s.province_id is not null
      group by s.province_id
    `);

    for (const f of crudoDeseos.rows) {
      if (conVerificables.has(f.province_id)) continue;
      listadas.push({
        provinceId: f.province_id,
        vocesDistintas: f.voces,
        senalesSinActor: f.sin_actor,
        verificables: 0,
        confirmaciones: 0,
      });
    }

    return listadas;
  }
}
