/**
 * Las reglas de Ver (spec 2026-10-19-mi-argentina-ideal-la-pila.md §5).
 *
 * Recibe conteos ya agregados por aporte y región —nunca textos, nunca personas—
 * y decide qué entra en cada sección. Los porcentajes se calculan sobre quienes
 * opinaron: un «Paso» se cuenta aparte y no entra en ningún denominador.
 *
 * Converger no es corroborar: nada de esto entra en la métrica norte.
 * Módulo puro: sin red, sin disco, sin reloj.
 */
import { REGIONES, type Region } from '../regiones.js';

export const REGLAS_DE_VISION = {
  /** Opiniones («Yo también» + «Yo no») para que un aporte entre en la visión. */
  MINIMO_OPINIONES: 20,
  /** Opiniones de una región para que la región «cuente» en un aporte. */
  OPINIONES_POR_REGION: 5,
  /** Regiones que tienen que contar para que un aporte entre en la visión. */
  MINIMO_REGIONES: 2,
  /** Acuerdo que exige «Lo que nos une» en cada región que cuenta. */
  ACUERDO_QUE_UNE: 0.7,
  /** «Donde no coincidimos»: partido al medio… */
  DIVIDE_DESDE: 0.4,
  DIVIDE_HASTA: 0.6,
  /** …o una distancia así entre la región que más quiere y la que menos. */
  DIVIDE_DISTANCIA: 0.3,
  /** «Lo que va primero»: comparaciones mínimas y acuerdo general mínimo. */
  MINIMO_COMPARACIONES: 10,
  ACUERDO_PARA_PRIORIDAD: 0.6,
  TOPE_PRIMERO: 5,
} as const;

export interface ConteoRegional {
  readonly opiniones: number;
  readonly acuerdos: number;
}

export interface ConteoDeAporte {
  readonly id: string;
  readonly tema: string | null;
  readonly publicadaEn: string;
  readonly porRegion: Readonly<Partial<Record<Region, ConteoRegional>>>;
  /** Opiniones de quien no dijo su provincia: suman al total, a ninguna región. */
  readonly sinRegion: ConteoRegional;
  readonly pasos: number;
  readonly comparaciones: number;
  /** Veces que se lo eligió primero en un duelo. */
  readonly primero: number;
}

export interface LecturaRegional {
  readonly region: Region;
  readonly opiniones: number;
  /** `null` si la región no llega a OPINIONES_POR_REGION. */
  readonly acuerdo: number | null;
  readonly cuenta: boolean;
}

export interface LecturaDeAporte {
  readonly id: string;
  readonly opiniones: number;
  readonly acuerdos: number;
  readonly pasos: number;
  readonly acuerdo: number;
  readonly peor: number | null;
  readonly mejor: number | null;
  readonly regiones: readonly LecturaRegional[];
  readonly enDiscusion: boolean;
  readonly une: boolean;
  readonly divide: boolean;
  /** `(primero + 1) / (comparaciones + 2)` si alcanza para prioridad; si no, `null`. */
  readonly prioridad: number | null;
}

export function leerAporte(c: ConteoDeAporte): LecturaDeAporte {
  const R = REGLAS_DE_VISION;
  const regiones = REGIONES.map((region): LecturaRegional => {
    const r = c.porRegion[region] ?? { opiniones: 0, acuerdos: 0 };
    const cuenta = r.opiniones >= R.OPINIONES_POR_REGION;
    return {
      region,
      opiniones: r.opiniones,
      acuerdo: cuenta ? r.acuerdos / r.opiniones : null,
      cuenta,
    };
  });
  const opiniones = regiones.reduce((s, r) => s + r.opiniones, 0) + c.sinRegion.opiniones;
  const acuerdos =
    REGIONES.reduce((s, region) => s + (c.porRegion[region]?.acuerdos ?? 0), 0) +
    c.sinRegion.acuerdos;
  const acuerdo = opiniones > 0 ? acuerdos / opiniones : 0;
  const validas = regiones.flatMap((r) => (r.acuerdo === null ? [] : [r.acuerdo]));
  const peor = validas.length ? Math.min(...validas) : null;
  const mejor = validas.length ? Math.max(...validas) : null;
  const enDiscusion = opiniones >= R.MINIMO_OPINIONES && validas.length >= R.MINIMO_REGIONES;
  const une = enDiscusion && validas.every((a) => a >= R.ACUERDO_QUE_UNE);
  const divide =
    enDiscusion &&
    !une &&
    ((acuerdo >= R.DIVIDE_DESDE && acuerdo <= R.DIVIDE_HASTA) ||
      (peor !== null && mejor !== null && mejor - peor >= R.DIVIDE_DISTANCIA));
  const prioridad =
    acuerdo >= R.ACUERDO_PARA_PRIORIDAD && c.comparaciones >= R.MINIMO_COMPARACIONES
      ? (c.primero + 1) / (c.comparaciones + 2)
      : null;
  return {
    id: c.id,
    opiniones,
    acuerdos,
    pasos: c.pasos,
    acuerdo,
    peor,
    mejor,
    regiones,
    enDiscusion,
    une,
    divide,
    prioridad,
  };
}

export interface LecturaDeVision {
  readonly lecturas: ReadonlyMap<string, LecturaDeAporte>;
  /** Ordenados por el acuerdo de la región donde andan peor, y después por opiniones. */
  readonly une: readonly string[];
  readonly primero: readonly string[];
  /** Ordenados por la distancia entre regiones, la más grande primero. */
  readonly divide: readonly string[];
  /** Los que todavía no entran en la visión, con menos opiniones primero. */
  readonly recien: readonly string[];
  /** El aporte que más une, por tema. */
  readonly porTema: ReadonlyMap<string, string>;
  readonly enDiscusion: number;
  /** En cuántos aportes en discusión cuenta cada región. */
  readonly cuentaPorRegion: Readonly<Record<Region, number>>;
}

export function leerVision(conteos: readonly ConteoDeAporte[]): LecturaDeVision {
  const lecturas = new Map(conteos.map((c) => [c.id, leerAporte(c)] as const));
  const todas = [...lecturas.values()];
  const tema = new Map(conteos.map((c) => [c.id, c.tema] as const));
  const fecha = new Map(conteos.map((c) => [c.id, c.publicadaEn] as const));
  const une = todas
    .filter((l) => l.une)
    .sort(
      (x, y) =>
        (y.peor ?? 0) - (x.peor ?? 0) || y.opiniones - x.opiniones || x.id.localeCompare(y.id),
    );
  const primero = todas
    .filter((l) => l.prioridad !== null)
    .sort(
      (x, y) =>
        (y.prioridad ?? 0) - (x.prioridad ?? 0) ||
        y.opiniones - x.opiniones ||
        x.id.localeCompare(y.id),
    )
    .slice(0, REGLAS_DE_VISION.TOPE_PRIMERO);
  const distancia = (l: LecturaDeAporte) => (l.mejor ?? 0) - (l.peor ?? 0);
  const divide = todas
    .filter((l) => l.divide)
    .sort(
      (x, y) =>
        distancia(y) - distancia(x) ||
        Math.abs(x.acuerdo - 0.5) - Math.abs(y.acuerdo - 0.5) ||
        x.id.localeCompare(y.id),
    );
  const recien = todas
    .filter((l) => !l.enDiscusion)
    .sort(
      (x, y) =>
        x.opiniones - y.opiniones ||
        (fecha.get(y.id) ?? '').localeCompare(fecha.get(x.id) ?? '') ||
        x.id.localeCompare(y.id),
    );
  const porTema = new Map<string, string>();
  for (const l of une) {
    const t = tema.get(l.id);
    if (t && !porTema.has(t)) porTema.set(t, l.id);
  }
  const enDiscusion = todas.filter((l) => l.enDiscusion);
  const cuentaPorRegion = Object.fromEntries(
    REGIONES.map((region) => [
      region,
      enDiscusion.filter((l) => l.regiones.some((r) => r.region === region && r.cuenta)).length,
    ]),
  ) as Record<Region, number>;
  return {
    lecturas,
    une: une.map((l) => l.id),
    primero: primero.map((l) => l.id),
    divide: divide.map((l) => l.id),
    recien: recien.map((l) => l.id),
    porTema,
    enDiscusion: enDiscusion.length,
    cuentaPorRegion,
  };
}

/** Nivel de luz de una provincia, de 0 (nadie) a 5, por personas cada 100.000 habitantes. */
export function nivelDeLuzPorHabitante(personas: number, habitantes: number, plena = 15): number {
  if (personas <= 0 || habitantes <= 0) return 0;
  const cada100k = (personas / habitantes) * 100_000;
  return 1 + Math.min(4, Math.floor(Math.pow(Math.min(1, cada100k / plena), 0.45) * 4.999));
}
