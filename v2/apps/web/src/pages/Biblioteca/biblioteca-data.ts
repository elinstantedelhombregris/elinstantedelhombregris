import { BLOG_POSTS } from '~/lib/blog-registry';
import { CURSOS } from '~/lib/courses-registry';
import { ENSAYOS, type EnsayoEntry } from '~/lib/ensayos-registry';

/**
 * La biblioteca (spec 3.1/3.2) — todas las derivaciones de contenido en un
 * solo lugar. El registry ordena por `orderIndex` GLOBAL: con tres ciclos de
 * 1..7 los ensayos quedan intercalados, así que las páginas consumen esto y
 * nunca `ENSAYOS` crudo. Ningún conteo literal vive en el JSX.
 */
export interface Ciclo {
  serie: string;
  rotulo: string;
  descripcion: string;
  /** Ordinal derivado de la posición del ciclo (I, II, III…). */
  romano: string;
  /** Mes y año del ensayo más viejo del ciclo, es-AR. */
  fecha: string;
  ensayos: readonly EnsayoEntry[];
}

/**
 * Rótulos de ciclo: mapa de etiquetas del campo real `series`, no taxonomía
 * nueva. Un ciclo sin entrada se muestra igual, con su slug crudo — ningún
 * ensayo se pierde por falta de rótulo.
 */
const ROTULOS: Record<string, { rotulo: string; descripcion: string }> = {
  'primer-ciclo': {
    rotulo: 'Primer ciclo',
    descripcion:
      'La arquitectura de la república: por qué el poder concentrado falla y qué se construye en su lugar.',
  },
  indagaciones: {
    rotulo: 'Indagaciones',
    descripcion:
      'Las condiciones de adentro: obediencia, miedo, identidad prestada — lo que hay que desarmar para que lo de afuera aguante.',
  },
  interdependencia: {
    rotulo: 'Interdependencia',
    descripcion:
      'Escrito para un 9 de julio: de qué está hecha una nación, qué cortó el bisturí de 1816 y qué se firma sin papel.',
  },
};

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const;

export function rotuloDeCiclo(serie: string): { rotulo: string; descripcion: string } {
  return ROTULOS[serie] ?? { rotulo: serie, descripcion: '' };
}

/** Fecha larga es-AR: «9 de julio de 2026». Vacía si el ISO no parsea. */
export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function mesYAnio(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

function construirCiclos(): Ciclo[] {
  const grupos = new Map<string, EnsayoEntry[]>();
  for (const ensayo of ENSAYOS) {
    const acumulado = grupos.get(ensayo.series) ?? [];
    acumulado.push(ensayo);
    grupos.set(ensayo.series, acumulado);
  }

  return [...grupos.entries()]
    .map(([serie, ensayos]) => ({
      serie,
      ensayos: [...ensayos].sort((a, b) => a.orderIndex - b.orderIndex),
      desde: ensayos.reduce((min, e) => (e.publishedAt !== '' && e.publishedAt < min ? e.publishedAt : min), '9999'),
    }))
    .sort((a, b) => (a.desde === b.desde ? a.serie.localeCompare(b.serie) : a.desde < b.desde ? -1 : 1))
    .map((grupo, i) => ({
      serie: grupo.serie,
      ...rotuloDeCiclo(grupo.serie),
      romano: ROMANOS[i] ?? String(i + 1),
      fecha: mesYAnio(grupo.desde),
      ensayos: grupo.ensayos,
    }));
}

export const CICLOS: readonly Ciclo[] = construirCiclos();
export const CICLO_COUNT = CICLOS.length;
export const ENSAYO_COUNT = ENSAYOS.length;

/** Cadena de lectura plana: ciclos en orden, ensayos por orderIndex. */
export const ORDEN_DE_LECTURA: readonly EnsayoEntry[] = CICLOS.flatMap((c) => [...c.ensayos]);

export interface Vecino {
  ensayo: EnsayoEntry;
  ciclo: Ciclo;
  /** El vecino pertenece a otro ciclo: el link lo dice antes de cruzar. */
  cruzaCiclo: boolean;
}

export interface UbicacionEnsayo {
  ciclo: Ciclo;
  /** Posición 1-based dentro del ciclo. */
  posicion: number;
  total: number;
  anterior: Vecino | null;
  siguiente: Vecino | null;
}

function cicloDe(slug: string): Ciclo | undefined {
  return CICLOS.find((c) => c.ensayos.some((e) => e.slug === slug));
}

function vecino(ensayo: EnsayoEntry | undefined, serieActual: string): Vecino | null {
  if (!ensayo) return null;
  const ciclo = cicloDe(ensayo.slug);
  if (!ciclo) return null;
  return { ensayo, ciclo, cruzaCiclo: ciclo.serie !== serieActual };
}

export function ubicarEnsayo(slug: string): UbicacionEnsayo | null {
  const ciclo = cicloDe(slug);
  if (!ciclo) return null;
  const enElCiclo = ciclo.ensayos.findIndex((e) => e.slug === slug);
  const enLaCadena = ORDEN_DE_LECTURA.findIndex((e) => e.slug === slug);
  return {
    ciclo,
    posicion: enElCiclo + 1,
    total: ciclo.ensayos.length,
    anterior: vecino(ORDEN_DE_LECTURA[enLaCadena - 1], ciclo.serie),
    siguiente: vecino(ORDEN_DE_LECTURA[enLaCadena + 1], ciclo.serie),
  };
}

/** Numeración de fila dentro del ciclo: «01»…«07». */
export function numeroDeFila(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}

/** Destinos que cambian cuando su fase ship. Hoy apuntan a la superficie que EXISTE. */
export const HREF_MANIFIESTO = '/manifiesto'; // 3.3 lo rediseña; la ruta NO cambia.
export const HREF_BITACORA = '/bitacora';
export function hrefCronica(slug: string): string {
  return `/bitacora/${slug}`;
}

export const CRONICA_COUNT = BLOG_POSTS.length;
/** Tope de display del hub (especimen): las últimas 4. No afirma nada del total. */
const CRONICAS_EN_EL_HUB = 4;
export const ULTIMAS_CRONICAS = BLOG_POSTS.slice(0, CRONICAS_EN_EL_HUB);

/** Tope de display de la vidriera (§8/D4): 6 curados. El catálogo tiene todos. */
const DESTACADOS_EN_EL_HUB = 6;
/** Curación real del contenido: `isFeatured` + el recorrido del autor (`orderIndex`). */
export const CURSOS_DESTACADOS = CURSOS.filter((c) => c.isFeatured).slice(0, DESTACADOS_EN_EL_HUB);
