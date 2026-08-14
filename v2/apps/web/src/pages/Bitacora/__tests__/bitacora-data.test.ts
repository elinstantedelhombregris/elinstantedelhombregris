import { describe, expect, it } from 'vitest';

import {
  ANIOS,
  CRONICA_COUNT,
  DESDE,
  categoriaVisible,
  fechaLarga,
  numeroDeFila,
  resolverCronica,
  ubicarCronica,
} from '../bitacora-data';

import { BLOG_POSTS, findBlogPost, findBlogPostByLegacySlug } from '~/lib/blog-registry';

/**
 * bitacora-data.test.ts — cero literales de contenido: cada expectativa se
 * computa desde BLOG_POSTS (el registry manda, nunca un string de copy o un
 * conteo hardcodeado).
 */

describe('conteos derivados', () => {
  it('CRONICA_COUNT es BLOG_POSTS.length', () => {
    expect(CRONICA_COUNT).toBe(BLOG_POSTS.length);
  });
});

describe('nada se pierde', () => {
  it('ANIOS.flatMap(a => a.cronicas) tiene BLOG_POSTS.length elementos', () => {
    expect(ANIOS.flatMap((a) => a.cronicas)).toHaveLength(BLOG_POSTS.length);
  });

  it('el set de slugs de ANIOS.flatMap es igual al de BLOG_POSTS', () => {
    const registrySlugs = new Set(BLOG_POSTS.map((p) => p.slug));
    const aniosSlugs = new Set(ANIOS.flatMap((a) => a.cronicas.map((p) => p.slug)));
    expect(aniosSlugs).toEqual(registrySlugs);
  });
});

describe('agrupación por año', () => {
  it('cada grupo comparte el año de publishedAt', () => {
    for (const grupo of ANIOS) {
      for (const cronica of grupo.cronicas) {
        expect(cronica.publishedAt.slice(0, 4)).toBe(grupo.anio);
      }
    }
  });

  it('los años vienen descendentes', () => {
    const anios = ANIOS.map((a) => a.anio);
    const ordenados = [...anios].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    expect(anios).toEqual(ordenados);
  });

  it('dentro de cada grupo, publishedAt viene descendente', () => {
    for (const grupo of ANIOS) {
      const publicaciones = grupo.cronicas.map((p) => p.publishedAt);
      const ordenadas = [...publicaciones].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
      expect(publicaciones).toEqual(ordenadas);
    }
  });
});

describe('DESDE', () => {
  it('es mes y año del publishedAt más viejo, contra el mismo Intl del runner', () => {
    const masVieja = BLOG_POSTS.at(-1);
    expect(masVieja).toBeDefined();
    if (!masVieja) return;
    const esperado = new Date(masVieja.publishedAt).toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    expect(DESDE).toBe(esperado);
  });
});

describe('ubicarCronica — cadena cronológica', () => {
  it('la más nueva (BLOG_POSTS[0]) no tiene anterior', () => {
    const masNueva = BLOG_POSTS[0];
    expect(masNueva).toBeDefined();
    if (!masNueva) return;
    const ubicacion = ubicarCronica(masNueva.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.anterior).toBeNull();
  });

  it('la más vieja no tiene siguiente', () => {
    const masVieja = BLOG_POSTS.at(-1);
    expect(masVieja).toBeDefined();
    if (!masVieja) return;
    const ubicacion = ubicarCronica(masVieja.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.siguiente).toBeNull();
  });

  it('una crónica del medio tiene por vecinos a sus vecinos por índice', () => {
    const i = Math.floor(BLOG_POSTS.length / 2);
    const medio = BLOG_POSTS[i];
    expect(medio).toBeDefined();
    if (!medio) return;
    const ubicacion = ubicarCronica(medio.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.anterior?.slug).toBe(BLOG_POSTS[i - 1]?.slug);
    expect(ubicacion?.siguiente?.slug).toBe(BLOG_POSTS[i + 1]?.slug);
  });

  it('ubicarCronica de un slug inexistente es null', () => {
    expect(ubicarCronica('no-existe-este-slug')).toBeNull();
  });
});

describe('resolverCronica — resolución de slugs', () => {
  it('un slug canónico resuelve a estado canonica con su post', () => {
    const post = BLOG_POSTS[0];
    expect(post).toBeDefined();
    if (!post) return;
    expect(resolverCronica(post.slug)).toEqual({ estado: 'canonica', post });
    expect(findBlogPost(post.slug)).toBe(post);
  });

  it('una dirección vieja resuelve a estado legado con el canónico del post dueño', () => {
    const conLegado = BLOG_POSTS.find((p) => p.legacySlugs.length > 0);
    expect(conLegado).toBeDefined();
    if (!conLegado) return;
    const legacySlug = conLegado.legacySlugs[0];
    expect(legacySlug).toBeDefined();
    if (legacySlug === undefined) return;
    expect(resolverCronica(legacySlug)).toEqual({ estado: 'legado', canonico: conLegado.slug });
    expect(findBlogPostByLegacySlug(legacySlug)).toBe(conLegado);
  });

  it('un slug desconocido resuelve a estado desconocida', () => {
    expect(resolverCronica('no-existe-este-slug')).toEqual({ estado: 'desconocida' });
  });
});

describe('fechaLarga', () => {
  it('formatea un ISO válido con el mismo Intl que el runner', () => {
    const muestra = BLOG_POSTS[0];
    expect(muestra).toBeDefined();
    if (!muestra) return;
    const esperado = new Date(muestra.publishedAt).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    expect(fechaLarga(muestra.publishedAt)).toBe(esperado);
  });

  it('de un ISO que no parsea es cadena vacía', () => {
    expect(fechaLarga('no-es-una-fecha')).toBe('');
  });
});

describe('categoriaVisible', () => {
  it('humaniza las categorías editoriales y conserva las desconocidas', () => {
    expect(categoriaVisible('tecnologia')).toBe('Tecnología');
    expect(categoriaVisible('ingenieria-social')).toBe('Ingeniería social');
    expect(categoriaVisible('tema-nuevo')).toBe('tema nuevo');
    expect(categoriaVisible('')).toBe('');
  });
});

describe('numeroDeFila', () => {
  it('formatea el índice 0-based con padding de dos dígitos', () => {
    expect(numeroDeFila(0)).toBe('01');
    expect(numeroDeFila(6)).toBe('07');
    expect(numeroDeFila(9)).toBe('10');
  });
});
