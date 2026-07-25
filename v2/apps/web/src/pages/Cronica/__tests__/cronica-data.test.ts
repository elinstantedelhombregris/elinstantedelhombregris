import { describe, expect, it } from 'vitest';

import { CAPITULO_COUNT, fechaLarga, idCapitulo, numeroDeCapitulo } from '../cronica-data';

import { CRONICA_CHAPTERS } from '~/lib/cronica-registry';

/**
 * cronica-data.test.ts — cero literales de contenido: cada expectativa se
 * computa desde CRONICA_CHAPTERS (el registry manda, nunca un string de
 * copy o un conteo hardcodeado). Documenta la precondición de toda la
 * página /cronica: si el canon del registry rompe, rompe acá y no como un
 * bug silencioso en el sumario.
 */

describe('canon del registry', () => {
  it('CRONICA_CHAPTERS no está vacío', () => {
    expect(CRONICA_CHAPTERS.length).toBeGreaterThan(0);
  });

  it('los orderIndex son estrictamente crecientes empezando en 1', () => {
    const indices = CRONICA_CHAPTERS.map((c) => c.orderIndex);
    const esperado = CRONICA_CHAPTERS.map((_, i) => i + 1);
    expect(indices).toEqual(esperado);
  });

  it('los slug son todos distintos', () => {
    const slugs = CRONICA_CHAPTERS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('ningún capítulo tiene subtitle vacío', () => {
    for (const capitulo of CRONICA_CHAPTERS) {
      expect(capitulo.subtitle.length).toBeGreaterThan(0);
    }
  });

  it('ningún capítulo tiene epigraph vacío', () => {
    for (const capitulo of CRONICA_CHAPTERS) {
      expect(capitulo.epigraph.length).toBeGreaterThan(0);
    }
  });
});

describe('CAPITULO_COUNT', () => {
  it('coincide con CRONICA_CHAPTERS.length', () => {
    expect(CAPITULO_COUNT).toBe(CRONICA_CHAPTERS.length);
  });
});

describe('idCapitulo', () => {
  it('devuelve capitulo-{orderIndex} para el primer capítulo', () => {
    const primero = CRONICA_CHAPTERS[0];
    expect(primero).toBeDefined();
    if (!primero) return;
    expect(idCapitulo(primero)).toBe(`capitulo-${String(primero.orderIndex)}`);
  });

  it('devuelve capitulo-{orderIndex} para otro capítulo distinto', () => {
    const otro = CRONICA_CHAPTERS.at(-1);
    expect(otro).toBeDefined();
    if (!otro) return;
    expect(idCapitulo(otro)).toBe(`capitulo-${String(otro.orderIndex)}`);
  });
});

describe('numeroDeCapitulo', () => {
  it('formatea el índice 0-based con padding de dos dígitos (casos puros)', () => {
    expect(numeroDeCapitulo(0)).toBe('01');
    expect(numeroDeCapitulo(9)).toBe('10');
  });
});

describe('fechaLarga', () => {
  it('formatea un ISO válido con el mismo Intl que el runner', () => {
    const iso = '2026-07-25T00:00:00Z';
    const esperado = new Date(iso).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    expect(fechaLarga(iso)).toBe(esperado);
  });

  it('un ISO inválido da cadena vacía', () => {
    expect(fechaLarga('no-es-fecha')).toBe('');
  });
});
