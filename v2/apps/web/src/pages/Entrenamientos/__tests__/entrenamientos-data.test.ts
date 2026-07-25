import { describe, expect, it } from 'vitest';

import {
  GRUPO_COUNT,
  GRUPOS,
  duracionLarga,
  numeroDeFila,
  rotuloDeCategoria,
  rotuloNivel,
  ubicarCurso,
  ubicarLeccion,
} from '../entrenamientos-data';

import { CURSOS } from '~/lib/courses-registry';

/**
 * entrenamientos-data.test.ts — cero literales de contenido: cada
 * expectativa se computa desde CURSOS (el registry manda, nunca un string de
 * copy o un conteo hardcodeado).
 */

describe('nada se pierde', () => {
  it('GRUPOS.flatMap(g => g.cursos) tiene CURSOS.length elementos y el mismo set de slugs', () => {
    const enGrupos = GRUPOS.flatMap((g) => g.cursos);
    expect(enGrupos).toHaveLength(CURSOS.length);
    expect(new Set(enGrupos.map((c) => c.slug))).toEqual(new Set(CURSOS.map((c) => c.slug)));
  });

  it('GRUPO_COUNT es el número de categorías reales distintas', () => {
    expect(GRUPO_COUNT).toBe(new Set(CURSOS.map((c) => c.category)).size);
  });
});

describe('agrupación válida', () => {
  it('en cada grupo los orderIndex son estrictamente crecientes, sin repetidos', () => {
    for (const grupo of GRUPOS) {
      const indices = grupo.cursos.map((c) => c.orderIndex);
      const ordenados = [...new Set(indices)].sort((a, b) => a - b);
      expect(indices).toEqual(ordenados);
    }
  });

  it('todos los cursos de un grupo comparten category', () => {
    for (const grupo of GRUPOS) {
      for (const curso of grupo.cursos) {
        expect(curso.category).toBe(grupo.categoria);
      }
    }
  });
});

describe('orden de los grupos', () => {
  it('se deriva del orderIndex más chico del grupo', () => {
    const minPorCategoria = new Map<string, number>();
    for (const curso of CURSOS) {
      const actual = minPorCategoria.get(curso.category);
      if (actual === undefined || curso.orderIndex < actual) {
        minPorCategoria.set(curso.category, curso.orderIndex);
      }
    }
    const ordenEsperado = [...minPorCategoria.entries()]
      .sort((a, b) => a[1] - b[1])
      .map(([categoria]) => categoria);

    expect(GRUPOS.map((g) => g.categoria)).toEqual(ordenEsperado);
  });
});

describe('rótulo con fallback', () => {
  it('todo grupo tiene rotulo no vacío', () => {
    for (const grupo of GRUPOS) {
      expect(grupo.rotulo.length).toBeGreaterThan(0);
    }
  });

  it('rotuloDeCategoria cae al slug crudo para una categoría desconocida', () => {
    expect(rotuloDeCategoria('inexistente')).toBe('inexistente');
  });
});

describe('niveles', () => {
  it('rotuloNivel mapea los tres valores del enum', () => {
    expect(rotuloNivel('beginner')).toBe('inicial');
    expect(rotuloNivel('intermediate')).toBe('intermedio');
    expect(rotuloNivel('advanced')).toBe('avanzado');
  });

  it('todo curso tiene rótulo de nivel no vacío', () => {
    for (const curso of CURSOS) {
      expect(rotuloNivel(curso.level).length).toBeGreaterThan(0);
    }
  });
});

describe('duracionLarga', () => {
  it('formatea minutos, horas y horas+minutos', () => {
    expect(duracionLarga(45)).toBe('45 min');
    expect(duracionLarga(85)).toBe('1 h 25 min');
    expect(duracionLarga(120)).toBe('2 h');
  });
});

describe('ubicarCurso — vecinos', () => {
  it('CURSOS[0] no tiene anterior', () => {
    const primero = CURSOS[0];
    expect(primero).toBeDefined();
    if (!primero) return;
    const ubicacion = ubicarCurso(primero.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.anterior).toBeNull();
  });

  it('el último de la cadena agrupada del catálogo no tiene siguiente', () => {
    const ordenDeCatalogo = GRUPOS.flatMap((g) => g.cursos);
    const ultimo = ordenDeCatalogo.at(-1);
    expect(ultimo).toBeDefined();
    if (!ultimo) return;
    const ubicacion = ubicarCurso(ultimo.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.siguiente).toBeNull();
  });

  it('un curso del medio de un grupo tiene cruzaGrupo === false en ambos vecinos', () => {
    const grupo = GRUPOS.find((g) => g.cursos.length >= 3);
    expect(grupo).toBeDefined();
    if (!grupo) return;
    const medioIndex = Math.floor((grupo.cursos.length - 1) / 2);
    const medio = grupo.cursos[medioIndex];
    expect(medio).toBeDefined();
    if (!medio) return;

    const ubicacion = ubicarCurso(medio.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.anterior?.cruzaGrupo).toBe(false);
    expect(ubicacion?.siguiente?.cruzaGrupo).toBe(false);
    expect(ubicacion?.anterior?.curso.slug).toBe(grupo.cursos[medioIndex - 1]?.slug);
    expect(ubicacion?.siguiente?.curso.slug).toBe(grupo.cursos[medioIndex + 1]?.slug);
  });

  it('el último curso de un grupo que no es el último de todo avisa el cruce', () => {
    expect(GRUPOS.length).toBeGreaterThan(1);
    const primerGrupo = GRUPOS[0];
    const siguienteGrupo = GRUPOS[1];
    expect(primerGrupo).toBeDefined();
    expect(siguienteGrupo).toBeDefined();
    if (!primerGrupo || !siguienteGrupo) return;

    const ultimoDelGrupo = primerGrupo.cursos.at(-1);
    expect(ultimoDelGrupo).toBeDefined();
    if (!ultimoDelGrupo) return;

    const ubicacion = ubicarCurso(ultimoDelGrupo.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.siguiente?.cruzaGrupo).toBe(true);
    expect(ubicacion?.siguiente?.grupo.categoria).toBe(siguienteGrupo.categoria);
  });

  it('ubicarCurso de un slug inexistente es null', () => {
    expect(ubicarCurso('no-existe-este-slug')).toBeNull();
  });
});

describe('ubicarLeccion — posición 1-based, nunca el orderIndex crudo', () => {
  it('la posición 1 es la primera lección del orden real, incluso en el curso que arranca en orden 0', () => {
    const curso = CURSOS.find((c) => c.lecciones[0]?.orden === 0);
    expect(curso).toBeDefined();
    if (!curso) return;
    const primeraLeccion = curso.lecciones[0];
    expect(primeraLeccion).toBeDefined();
    if (!primeraLeccion) return;

    const ubicacion = ubicarLeccion(curso.slug, 1);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.leccion.slug).toBe(primeraLeccion.slug);
    expect(ubicacion?.anterior).toBeNull();
  });

  it('la última posición no tiene siguiente — la práctica la pone la página, no la derivada', () => {
    const curso = CURSOS[0];
    expect(curso).toBeDefined();
    if (!curso) return;
    const total = curso.lecciones.length;
    const ubicacion = ubicarLeccion(curso.slug, total);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.siguiente).toBeNull();
    expect(ubicacion?.posicion).toBe(total);
    expect(ubicacion?.total).toBe(total);
  });

  it('posiciones fuera de rango o no enteras devuelven null', () => {
    const curso = CURSOS[0];
    expect(curso).toBeDefined();
    if (!curso) return;
    const total = curso.lecciones.length;
    expect(ubicarLeccion(curso.slug, 0)).toBeNull();
    expect(ubicarLeccion(curso.slug, total + 1)).toBeNull();
    expect(ubicarLeccion(curso.slug, NaN)).toBeNull();
  });

  it('ubicarLeccion de un curso inexistente es null', () => {
    expect(ubicarLeccion('no-existe-este-slug', 1)).toBeNull();
  });
});

describe('numeroDeFila', () => {
  it('formatea el índice 0-based con padding de dos dígitos', () => {
    expect(numeroDeFila(0)).toBe('01');
    expect(numeroDeFila(6)).toBe('07');
    expect(numeroDeFila(9)).toBe('10');
  });
});
