import { quizJsonSchema } from '@v2/shared';
import { describe, expect, it } from 'vitest';

import {
  CURSOS,
  CURSO_COUNT,
  LECCION_COUNT,
  cargarLeccion,
  cargarPractica,
  findCursoBySlug,
} from '../courses-registry';

// Canon verificado 2026-07-24 (spec + plan): estos tres son los únicos
// literales de conteo del archivo — son la afirmación «no se perdió nada
// en la migración», no un atajo de comodidad.
const CANON_CURSOS = 31;
const CANON_LECCIONES = 329;
const CANON_PREGUNTAS = 353;

// Enumeración independiente de los mismos archivos que el registry baja
// perezoso — la red que reemplaza al validador de build (cobertura del glob).
// Este archivo vive un nivel más adentro que `courses-registry.ts`
// (`__tests__/`), de ahí el `..` de más respecto del `RAIZ` del registry.
const RAIZ_DESDE_TEST = '../../../../../content/courses';
const cuerposDisponibles = import.meta.glob('../../../../../content/courses/*/*.mdx');
const practicasCrudas = import.meta.glob<string>('../../../../../content/courses/*/quiz.json', {
  query: '?raw',
  import: 'default',
});

describe('CURSOS registry — canon', () => {
  it(`tiene exactamente ${String(CANON_CURSOS)} entradas`, () => {
    expect(CURSOS).toHaveLength(CANON_CURSOS);
    expect(CURSO_COUNT).toBe(CANON_CURSOS);
  });

  it(`LECCION_COUNT es ${String(CANON_LECCIONES)}`, () => {
    expect(LECCION_COUNT).toBe(CANON_LECCIONES);
  });

  it('los orderIndex de curso son exactamente 1..31, sin repetidos', () => {
    const ordenados = CURSOS.map((c) => c.orderIndex)
      .slice()
      .sort((a, b) => a - b);
    expect(ordenados).toEqual(Array.from({ length: CANON_CURSOS }, (_, i) => i + 1));
  });
});

describe('CURSOS registry — forma de cada entrada', () => {
  it('slug kebab-case, title/excerpt/description no vacíos, level válido, duration coherente', () => {
    for (const c of CURSOS) {
      expect(c.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.excerpt.length).toBeGreaterThan(0);
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.promesa).toHaveLength(3);
      expect(c.noCubre).toHaveLength(2);
      expect(c.paraQuien?.length ?? 0).toBeGreaterThan(0);
      expect(c.productoFinal?.length ?? 0).toBeGreaterThan(0);
      expect(c.coverImage).toMatch(/^\/course-art\/.+\.webp$/);
      expect(c.fuentesBase.length).toBeGreaterThanOrEqual(2);
      expect(['beginner', 'intermediate', 'advanced']).toContain(c.level);
      expect(c.duration).toBeGreaterThan(0);
      const sumaLecciones = c.lecciones.reduce((n, l) => n + l.minutos, 0);
      expect(c.duration).toBe(sumaLecciones);
    }
  });

  it('CURSOS viene ordenado por orderIndex', () => {
    const orden = CURSOS.map((c) => c.orderIndex);
    expect(orden).toEqual([...orden].sort((a, b) => a - b));
  });

  it('las lecciones de cada curso vienen ordenadas por su orden y sin slugs repetidos', () => {
    for (const c of CURSOS) {
      const ordenes = c.lecciones.map((l) => l.orden);
      expect(ordenes).toEqual([...ordenes].sort((a, b) => a - b));
      const slugs = c.lecciones.map((l) => l.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});

describe('cobertura del glob — la red que reemplaza al validador de build', () => {
  it('el set de claves .mdx es exactamente el set de rutas derivadas de los 31 course.json', () => {
    const derivadas = new Set<string>();
    for (const c of CURSOS) {
      for (const l of c.lecciones) {
        derivadas.add(`${RAIZ_DESDE_TEST}/${c.slug}/${l.slug}.mdx`);
      }
    }
    expect(new Set(Object.keys(cuerposDisponibles))).toEqual(derivadas);
  });

  it('el set de claves quiz.json tiene 31 claves, una por curso', () => {
    const derivadas = new Set(CURSOS.map((c) => `${RAIZ_DESDE_TEST}/${c.slug}/quiz.json`));
    const enGlob = new Set(Object.keys(practicasCrudas));
    expect(enGlob).toEqual(derivadas);
    expect(enGlob.size).toBe(CANON_CURSOS);
  });
});

describe('findCursoBySlug', () => {
  it('encuentra por slug real, undefined para uno inexistente', () => {
    const primero = CURSOS[0];
    expect(primero).toBeDefined();
    const slug = primero?.slug ?? '';
    expect(findCursoBySlug(slug)?.slug).toBe(slug);
    expect(findCursoBySlug('no-existe')).toBeUndefined();
  });
});

describe('cargarLeccion', () => {
  it('la primera lección del primer curso devuelve un string no vacío, sin frontmatter', async () => {
    const curso = CURSOS[0];
    expect(curso).toBeDefined();
    const leccion = curso?.lecciones[0];
    expect(leccion).toBeDefined();
    const cuerpo = await cargarLeccion(curso?.slug ?? '', leccion?.slug ?? '');
    expect(cuerpo).not.toBeNull();
    expect((cuerpo ?? '').length).toBeGreaterThan(0);
    expect(cuerpo ?? '').not.toMatch(/^---/);
  });

  it("cargarLeccion('no','existe') devuelve null", async () => {
    expect(await cargarLeccion('no', 'existe')).toBeNull();
  });
});

describe('cargarPractica', () => {
  it('el primer curso trae descripción y preguntas normalizadas válidas', async () => {
    const curso = CURSOS[0];
    expect(curso).toBeDefined();
    const practica = await cargarPractica(curso?.slug ?? '');
    expect(practica).not.toBeNull();
    expect((practica?.descripcion ?? '').length).toBeGreaterThan(0);
    expect(practica?.preguntas.length ?? 0).toBeGreaterThan(0);
    for (const p of practica?.preguntas ?? []) {
      expect(p.opciones.length).toBeGreaterThanOrEqual(2);
      expect(p.correcta).toBeGreaterThanOrEqual(0);
      expect(p.correcta).toBeLessThan(p.opciones.length);
    }
  });

  it("cargarPractica('no-existe') devuelve null", async () => {
    expect(await cargarPractica('no-existe')).toBeNull();
  });

  it('las 31 prácticas normalizan sin perder preguntas — coincide con el archivo, y el total es 353', async () => {
    let total = 0;
    for (const c of CURSOS) {
      const practica = await cargarPractica(c.slug);
      expect(practica).not.toBeNull();

      const cargarCrudo = practicasCrudas[`${RAIZ_DESDE_TEST}/${c.slug}/quiz.json`];
      expect(cargarCrudo).toBeDefined();
      const crudo = cargarCrudo ? quizJsonSchema.parse(JSON.parse(await cargarCrudo())) : null;
      expect(crudo).not.toBeNull();

      expect(practica?.preguntas.length).toBe(crudo?.questions.length);
      total += practica?.preguntas.length ?? 0;
    }
    expect(total).toBe(CANON_PREGUNTAS);
  });
});
