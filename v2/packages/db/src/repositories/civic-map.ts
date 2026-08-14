/**
 * CivicMapRepository — la forma unificada de señal del mapa territorial.
 *
 * Spec: `docs/specs/2026-07-26-mapa-2-la-verdad-de-la-ubicacion.md` §5.
 *
 * Las cuatro capas de D5 (voces, pulso, propuestas, mandato) viven en tablas
 * distintas y se leen con una sola forma, para que el lazo y el conteo honesto
 * del instrumento no tengan que saber de qué tabla salió cada cosa.
 *
 * El panel de conversión de `/el-mapa` NO usa esto: sigue con sus llamadas
 * livianas de open-data, porque el instrumento no se paga en el camino crítico
 * de los 30 segundos.
 */
import { and, desc, eq, gte, isNotNull, lte, sql } from 'drizzle-orm';

import { dreams } from '../schema/dreams.js';
import { territoryMandates } from '../schema/mandato.js';
import { proposals, pulseSignals } from '../schema/pulso.js';
import { senales } from '../schema/senales.js';

import type { Db } from '../client.js';
import type { SQL } from 'drizzle-orm';

export type CapaMapa = 'voz' | 'pulso' | 'propuesta' | 'mandato';

export const CAPAS_MAPA: readonly CapaMapa[] = ['voz', 'pulso', 'propuesta', 'mandato'];

export interface SenalMapa {
  /** `"voz:412"` — la capa va adentro del id para que sea único entre capas. */
  id: string;
  capa: CapaMapa;
  /** Uno de los nueve del canon, o el tipo propio de la capa. Crudo, sin plegar. */
  tipo: string | null;
  /** La clase de la señal, cuando la capa la tiene. Es la que decide el color. */
  clase?: string | null;
  texto: string;
  lat: number | null;
  lng: number | null;
  /** `LocationPrecision` de @v2/civic-core. */
  precision: string;
  /** `LocationRole` de @v2/civic-core. */
  role: string;
  provinceId: number | null;
  cityId: number | null;
  createdAt: string;
}

export interface BBox {
  oeste: number;
  sur: number;
  este: number;
  norte: number;
}

export interface ConsultaSenales {
  capas?: readonly CapaMapa[];
  bbox?: BBox;
  desde?: Date;
  hasta?: Date;
  /** Techo por capa, no total: una capa ruidosa no puede tapar a las otras. */
  limitePorCapa?: number;
}

const LIMITE_POR_CAPA_DEFECTO = 500;
const LIMITE_POR_CAPA_MAXIMO = 2_000;

/** `numeric` de Postgres llega como string por driver; el mapa necesita número. */
const aNumero = (valor: string | null): number | null => {
  if (valor === null) return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
};

const aIso = (valor: Date | string): string =>
  valor instanceof Date ? valor.toISOString() : new Date(valor).toISOString();

/**
 * El mandato no tiene texto propio en el esquema: es un agregado calculado por
 * el mandato-engine. Su renglón en el mapa se arma con lo que sí guarda —
 * los temas rankeados y cuántas señales lo sostienen. Decir de cuántas señales
 * sale es parte del dato: un mandato sobre 4 voces no pesa lo mismo que uno
 * sobre 4.000.
 */
function resumenDeMandato(topThemes: unknown, pulseCount: number): string {
  const temas = Array.isArray(topThemes)
    ? topThemes.filter((t): t is string => typeof t === 'string').slice(0, 3)
    : [];
  const base = temas.length > 0 ? temas.join(' · ') : 'Sin temas todavía';
  return `${base} — ${String(pulseCount)} ${pulseCount === 1 ? 'señal' : 'señales'}`;
}

export class CivicMapRepository {
  constructor(private readonly db: Db) {}

  async listSignals(consulta: ConsultaSenales = {}): Promise<SenalMapa[]> {
    const capas = consulta.capas?.length ? consulta.capas : CAPAS_MAPA;
    const limite = Math.min(
      LIMITE_POR_CAPA_MAXIMO,
      Math.max(1, consulta.limitePorCapa ?? LIMITE_POR_CAPA_DEFECTO),
    );

    const porCapa = await Promise.all([
      capas.includes('voz') ? this.voces(consulta, limite) : Promise.resolve([]),
      capas.includes('pulso') ? this.pulso(consulta, limite) : Promise.resolve([]),
      capas.includes('propuesta') ? this.propuestas(consulta, limite) : Promise.resolve([]),
      capas.includes('mandato') ? this.mandatos(consulta, limite) : Promise.resolve([]),
    ]);

    return porCapa.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /**
   * El recorte por bbox es del SERVIDOR; el lazo NO. El polígono se resuelve
   * en el cliente sobre lo que el bbox ya trajo, porque es una interacción
   * viva y no vale un round-trip por vértice (spec 2 §5).
   *
   * Ojo con lo que el bbox implica: pedir un recorte descarta las señales sin
   * coordenada, cuya ubicación es la provincia. El instrumento las trae aparte
   * y las cuenta aparte — son la clase «provincias tocadas» del conteo honesto
   * (spec 3 §4), que se nombra y no se suma.
   */
  /**
   * La capa «voz» sale de `senales` y ya no de `dreams`.
   *
   * No entró como una QUINTA capa —que era la otra opción— porque `dreams`
   * tenía cero filas: no hay nada que convivir. Y el nombre de la capa se
   * conserva a propósito: el instrumento, la URL del área y el estado guardado
   * de los cinco modos hablan de `voz`, y renombrarla el mismo día que cambia
   * la tabla habría mezclado dos migraciones en una.
   *
   * Tres filtros que `dreams` no tenía y esta tabla sí necesita:
   *
   * - `retenida_en is null` — la retención de cuidado es **visibilidad y no
   *   calidad**, no toca `estado`, y sale de toda superficie pública;
   * - `estado <> 'retirada'` — una retirada conserva la fila para la cobertura
   *   pero su texto está vacío por CHECK, y un punto con texto vacío en el mapa
   *   es ruido sin contenido;
   * - `tipo` viaja crudo y sin plegar: el cliente lo lee con `leerTipo` y decide
   *   qué hacer con lo que no reconoce.
   */
  /**
   * La capa `voz` tiene DOS fuentes mientras dure la mudanza, y eso es
   * deliberado.
   *
   * `POST /api/v1/civic/capturas` —la ingesta de la app de campo— sigue
   * escribiendo en `dreams`. Cuando esta capa pasó a leer sólo `senales`, las
   * capturas de terreno **desaparecieron del mapa**: un test lo cazó en el acto
   * («la captura aparece en el mapa y el lazo la puede agarrar»). Dejar la
   * segunda fuente cuesta una consulta y evita que la migración de la web se
   * lleve puesta a la app de campo el mismo día.
   *
   * Se va cuando `capturas.ts` escriba `senales`, y eso pide una decisión que
   * no es de este archivo: sus tres tipos —`observation`, `need`, `resource`—
   * están en inglés y no son del canon, así que mapearlos es traducir, y una
   * traducción hecha al pasar es cómo se pierde el significado.
   */
  private async voces(consulta: ConsultaSenales, limite: number): Promise<SenalMapa[]> {
    const [nuevas, viejas] = await Promise.all([
      this.vocesDeSenales(consulta, limite),
      this.vocesDeDreams(consulta, limite),
    ]);
    return [...nuevas, ...viejas];
  }

  private async vocesDeSenales(
    consulta: ConsultaSenales,
    limite: number,
  ): Promise<SenalMapa[]> {
    const filtros: SQL[] = [
      sql`${senales.retenidaEn} is null`,
      sql`${senales.estado} <> 'retirada'`,
    ];
    if (consulta.bbox) {
      filtros.push(
        isNotNull(senales.lat),
        gte(senales.lat, String(consulta.bbox.sur)),
        lte(senales.lat, String(consulta.bbox.norte)),
        gte(senales.lng, String(consulta.bbox.oeste)),
        lte(senales.lng, String(consulta.bbox.este)),
      );
    }
    if (consulta.desde) filtros.push(gte(senales.creadaEn, consulta.desde));
    if (consulta.hasta) filtros.push(lte(senales.creadaEn, consulta.hasta));

    const filas = await this.db
      .select({
        id: senales.idPublico,
        texto: senales.texto,
        tipo: senales.tipo,
        clase: senales.clase,
        lat: senales.lat,
        lng: senales.lng,
        precision: senales.precision,
        role: senales.locationRole,
        provinceId: senales.provinceId,
        cityId: senales.cityId,
        createdAt: senales.creadaEn,
      })
      .from(senales)
      .where(and(...filtros))
      .orderBy(desc(senales.creadaEn))
      .limit(limite);

    return filas.map((f) => ({
      // El id público y no el ordinal: un entero en la URL deja enumerar el
      // corpus entero y emparejar dos señales de la misma sesión.
      id: `voz:${f.id}`,
      capa: 'voz' as const,
      tipo: f.tipo,
      clase: f.clase,
      texto: f.texto,
      lat: aNumero(f.lat),
      lng: aNumero(f.lng),
      precision: f.precision,
      role: f.role,
      provinceId: f.provinceId,
      cityId: f.cityId,
      createdAt: aIso(f.createdAt),
    }));
  }

  /** La fuente vieja: lo que la app de campo todavía escribe. */
  private async vocesDeDreams(consulta: ConsultaSenales, limite: number): Promise<SenalMapa[]> {
    const filtros: SQL[] = [eq(dreams.status, 'approved')];
    if (consulta.bbox) {
      filtros.push(
        isNotNull(dreams.lat),
        gte(dreams.lat, String(consulta.bbox.sur)),
        lte(dreams.lat, String(consulta.bbox.norte)),
        gte(dreams.lng, String(consulta.bbox.oeste)),
        lte(dreams.lng, String(consulta.bbox.este)),
      );
    }
    if (consulta.desde) filtros.push(gte(dreams.createdAt, consulta.desde));
    if (consulta.hasta) filtros.push(lte(dreams.createdAt, consulta.hasta));

    const filas = await this.db
      .select({
        id: dreams.id,
        texto: dreams.body,
        tipo: dreams.category,
        lat: dreams.lat,
        lng: dreams.lng,
        precision: dreams.precision,
        role: dreams.locationRole,
        provinceId: dreams.provinceId,
        cityId: dreams.cityId,
        createdAt: dreams.createdAt,
      })
      .from(dreams)
      .where(and(...filtros))
      .orderBy(desc(dreams.createdAt))
      .limit(limite);

    return filas.map((f) => ({
      // El prefijo `voz-v1:` y no `voz:` — dos espacios de id que no se pisan,
      // y que además dejan ver de dónde salió cada punto sin adivinar.
      id: `voz-v1:${String(f.id)}`,
      capa: 'voz' as const,
      tipo: f.tipo,
      // Sin clase: estos tipos no son del canon. `null` y no una clase
      // inventada — el cliente los pinta neutros, que es lo honesto.
      clase: null,
      texto: f.texto,
      lat: aNumero(f.lat),
      lng: aNumero(f.lng),
      precision: f.precision,
      role: f.role,
      provinceId: f.provinceId,
      cityId: f.cityId,
      createdAt: aIso(f.createdAt),
    }));
  }

  private async pulso(consulta: ConsultaSenales, limite: number): Promise<SenalMapa[]> {
    const filtros: SQL[] = [];
    if (consulta.bbox) {
      filtros.push(
        isNotNull(pulseSignals.lat),
        gte(pulseSignals.lat, String(consulta.bbox.sur)),
        lte(pulseSignals.lat, String(consulta.bbox.norte)),
        gte(pulseSignals.lng, String(consulta.bbox.oeste)),
        lte(pulseSignals.lng, String(consulta.bbox.este)),
      );
    }
    if (consulta.desde) filtros.push(gte(pulseSignals.createdAt, consulta.desde));
    if (consulta.hasta) filtros.push(lte(pulseSignals.createdAt, consulta.hasta));

    const filas = await this.db
      .select({
        id: pulseSignals.id,
        texto: pulseSignals.body,
        tipo: pulseSignals.theme,
        lat: pulseSignals.lat,
        lng: pulseSignals.lng,
        precision: pulseSignals.precision,
        role: pulseSignals.locationRole,
        provinceId: pulseSignals.provinceId,
        cityId: pulseSignals.cityId,
        createdAt: pulseSignals.createdAt,
      })
      .from(pulseSignals)
      .where(filtros.length ? and(...filtros) : undefined)
      .orderBy(desc(pulseSignals.createdAt))
      .limit(limite);

    return filas.map((f) => ({
      id: `pulso:${String(f.id)}`,
      capa: 'pulso' as const,
      tipo: f.tipo,
      texto: f.texto,
      lat: aNumero(f.lat),
      lng: aNumero(f.lng),
      precision: f.precision,
      role: f.role,
      provinceId: f.provinceId,
      cityId: f.cityId,
      createdAt: aIso(f.createdAt),
    }));
  }

  private async propuestas(consulta: ConsultaSenales, limite: number): Promise<SenalMapa[]> {
    const filtros: SQL[] = [];
    if (consulta.bbox) {
      filtros.push(
        isNotNull(proposals.lat),
        gte(proposals.lat, String(consulta.bbox.sur)),
        lte(proposals.lat, String(consulta.bbox.norte)),
        gte(proposals.lng, String(consulta.bbox.oeste)),
        lte(proposals.lng, String(consulta.bbox.este)),
      );
    }
    if (consulta.desde) filtros.push(gte(proposals.createdAt, consulta.desde));
    if (consulta.hasta) filtros.push(lte(proposals.createdAt, consulta.hasta));

    const filas = await this.db
      .select({
        id: proposals.id,
        titulo: proposals.title,
        resumen: proposals.summary,
        tipo: proposals.theme,
        lat: proposals.lat,
        lng: proposals.lng,
        precision: proposals.precision,
        role: proposals.locationRole,
        provinceId: proposals.provinceId,
        cityId: proposals.cityId,
        createdAt: proposals.createdAt,
      })
      .from(proposals)
      .where(filtros.length ? and(...filtros) : undefined)
      .orderBy(desc(proposals.createdAt))
      .limit(limite);

    return filas.map((f) => ({
      id: `propuesta:${String(f.id)}`,
      capa: 'propuesta' as const,
      tipo: f.tipo,
      texto: `${f.titulo} — ${f.resumen}`,
      lat: aNumero(f.lat),
      lng: aNumero(f.lng),
      precision: f.precision,
      role: f.role,
      provinceId: f.provinceId,
      cityId: f.cityId,
      createdAt: aIso(f.createdAt),
    }));
  }

  /**
   * El mandato es una fila por provincia, no un punto: no tiene columnas de
   * geografía y su precisión es siempre `province`. Entra al mapa como el
   * documento de su territorio, y por eso el bbox no lo recorta — un mandato
   * no está «adentro» de un rectángulo, cubre una provincia entera.
   */
  private async mandatos(consulta: ConsultaSenales, limite: number): Promise<SenalMapa[]> {
    const filtros: SQL[] = [];
    if (consulta.desde) filtros.push(gte(territoryMandates.updatedAt, consulta.desde));
    if (consulta.hasta) filtros.push(lte(territoryMandates.updatedAt, consulta.hasta));

    const filas = await this.db
      .select({
        id: territoryMandates.id,
        provinceId: territoryMandates.provinceId,
        topThemes: territoryMandates.topThemes,
        pulseCount: territoryMandates.pulseCount,
        updatedAt: territoryMandates.updatedAt,
      })
      .from(territoryMandates)
      .where(filtros.length ? and(...filtros) : undefined)
      .orderBy(desc(territoryMandates.updatedAt))
      .limit(limite);

    return filas.map((f) => ({
      id: `mandato:${String(f.id)}`,
      capa: 'mandato' as const,
      tipo: 'mandato',
      texto: resumenDeMandato(f.topThemes, f.pulseCount),
      lat: null,
      lng: null,
      precision: 'province',
      role: 'subject',
      provinceId: f.provinceId,
      cityId: null,
      createdAt: aIso(f.updatedAt),
    }));
  }

  /** Conteo por capa sin traer las filas — para la leyenda y las fichas. */
  async countByLayer(): Promise<Record<CapaMapa, number>> {
    const [voz, vozV1, pulso, propuesta, mandato] = await Promise.all([
      this.db
        .select({ n: sql<number>`count(*)::int` })
        .from(senales)
        .where(sql`${senales.retenidaEn} is null and ${senales.estado} <> 'retirada'`),
      this.db
        .select({ n: sql<number>`count(*)::int` })
        .from(dreams)
        .where(eq(dreams.status, 'approved')),
      this.db.select({ n: sql<number>`count(*)::int` }).from(pulseSignals),
      this.db.select({ n: sql<number>`count(*)::int` }).from(proposals),
      this.db.select({ n: sql<number>`count(*)::int` }).from(territoryMandates),
    ]);
    return {
      voz: (voz[0]?.n ?? 0) + (vozV1[0]?.n ?? 0),
      pulso: pulso[0]?.n ?? 0,
      propuesta: propuesta[0]?.n ?? 0,
      mandato: mandato[0]?.n ?? 0,
    };
  }
}
