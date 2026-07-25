import { CURSOS, type CursoEntry, type LeccionEntry } from '~/lib/courses-registry';

/**
 * Entrenamientos (spec 3.5) — derivaciones puras. Los grupos salen del campo
 * real `category`; el rótulo es ese slug puesto en castellano (traducción, no
 * taxonomía nueva) y no lleva descripción: ocho párrafos sobre ocho categorías
 * serían ocho afirmaciones que nadie escribió. Categoría sin rótulo → se
 * muestra igual con su slug.
 */
const ROTULOS: Record<string, string> = {
  'hombre-gris': 'El hombre gris',
  vision: 'La visión',
  action: 'Acción',
  reflection: 'Reflexión',
  community: 'Comunidad',
  economia: 'Economía',
  civica: 'Cívica',
  comunicacion: 'Comunicación',
};

const NIVELES: Record<CursoEntry['level'], string> = {
  beginner: 'inicial',
  intermediate: 'intermedio',
  advanced: 'avanzado',
};

export function rotuloDeCategoria(categoria: string): string {
  return ROTULOS[categoria] ?? categoria;
}
export function rotuloNivel(level: CursoEntry['level']): string {
  return NIVELES[level];
}

/** «45 min» · «1 h 25 min» · «2 h». */
export function duracionLarga(minutos: number): string {
  if (minutos < 60) return `${String(minutos)} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${String(h)} h` : `${String(h)} h ${String(m)} min`;
}

export interface Grupo {
  categoria: string;
  rotulo: string;
  cursos: readonly CursoEntry[];
  /** Suma de lecciones del grupo — dato de la línea mono. */
  lecciones: number;
}

function construirGrupos(): Grupo[] {
  const porCategoria = new Map<string, CursoEntry[]>();
  for (const curso of CURSOS) {
    const acumulado = porCategoria.get(curso.category) ?? [];
    acumulado.push(curso);
    porCategoria.set(curso.category, acumulado);
  }

  return [...porCategoria.entries()]
    .map(([categoria, cursos]) => ({
      categoria,
      cursos: [...cursos].sort((a, b) => a.orderIndex - b.orderIndex),
    }))
    .sort((a, b) => (a.cursos[0]?.orderIndex ?? 0) - (b.cursos[0]?.orderIndex ?? 0))
    .map((grupo) => ({
      categoria: grupo.categoria,
      rotulo: rotuloDeCategoria(grupo.categoria),
      cursos: grupo.cursos,
      lecciones: grupo.cursos.reduce((n, c) => n + c.lecciones.length, 0),
    }));
}

export const GRUPOS: readonly Grupo[] = construirGrupos();
export const GRUPO_COUNT = GRUPOS.length;

/**
 * Cadena de catálogo: grupos en su orden, cursos por `orderIndex` adentro.
 * Las categorías NO son contiguas en el `orderIndex` global (verificado
 * 2026-07-24: `hombre-gris` tiene cursos en 1, 4, 5, 7, 19, 29, 30, 31) —
 * por eso los vecinos se calculan sobre esta cadena agrupada y no sobre
 * `CURSOS` cruda, patrón exacto de `ORDEN_DE_LECTURA` (3.1).
 */
const ORDEN_DE_CATALOGO: readonly CursoEntry[] = GRUPOS.flatMap((g) => g.cursos);

export interface VecinoCurso {
  curso: CursoEntry;
  grupo: Grupo;
  cruzaGrupo: boolean;
}
export interface UbicacionCurso {
  grupo: Grupo;
  anterior: VecinoCurso | null;
  siguiente: VecinoCurso | null;
}

function grupoDe(slug: string): Grupo | undefined {
  return GRUPOS.find((g) => g.cursos.some((c) => c.slug === slug));
}

function vecinoCurso(curso: CursoEntry | undefined, categoriaActual: string): VecinoCurso | null {
  if (!curso) return null;
  const grupo = grupoDe(curso.slug);
  if (!grupo) return null;
  return { curso, grupo, cruzaGrupo: grupo.categoria !== categoriaActual };
}

/** Vecinos en la cadena agrupada del catálogo, con aviso de cruce de grupo. */
export function ubicarCurso(slug: string): UbicacionCurso | null {
  const grupo = grupoDe(slug);
  if (!grupo) return null;
  const enLaCadena = ORDEN_DE_CATALOGO.findIndex((c) => c.slug === slug);
  if (enLaCadena === -1) return null;
  return {
    grupo,
    anterior: vecinoCurso(ORDEN_DE_CATALOGO[enLaCadena - 1], grupo.categoria),
    siguiente: vecinoCurso(ORDEN_DE_CATALOGO[enLaCadena + 1], grupo.categoria),
  };
}

export interface UbicacionLeccion {
  curso: CursoEntry;
  leccion: LeccionEntry;
  /** 1-based: lo que va en la URL y lo que dice el kicker. */
  posicion: number;
  total: number;
  anterior: { leccion: LeccionEntry; posicion: number } | null;
  siguiente: { leccion: LeccionEntry; posicion: number } | null;
}

/** `n` es POSICIÓN 1-based en la lista ordenada, nunca el `orderIndex` crudo. */
export function ubicarLeccion(cursoSlug: string, n: number): UbicacionLeccion | null {
  const curso = CURSOS.find((c) => c.slug === cursoSlug);
  if (!curso || !Number.isInteger(n) || n < 1 || n > curso.lecciones.length) return null;
  const i = n - 1;
  const leccion = curso.lecciones[i];
  if (!leccion) return null;
  const anteriorLeccion = curso.lecciones[i - 1];
  const siguienteLeccion = curso.lecciones[i + 1];
  return {
    curso,
    leccion,
    posicion: n,
    total: curso.lecciones.length,
    anterior: anteriorLeccion ? { leccion: anteriorLeccion, posicion: n - 1 } : null,
    siguiente: siguienteLeccion ? { leccion: siguienteLeccion, posicion: n + 1 } : null,
  };
}

/** Numeración de fila: «01»…«NN» (idéntica a 3.1). */
export function numeroDeFila(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}
