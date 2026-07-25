import { describe, expect, it } from 'vitest';

import {
  CICLO_COUNT,
  CICLOS,
  CRONICA_COUNT,
  CURSOS_DESTACADOS,
  ENSAYO_COUNT,
  HREF_BITACORA,
  HREF_MANIFIESTO,
  ORDEN_DE_LECTURA,
  ULTIMAS_CRONICAS,
  fechaLarga,
  hrefCronica,
  numeroDeFila,
  rotuloDeCiclo,
  ubicarEnsayo,
} from '../biblioteca-data';

import { BLOG_POSTS } from '~/lib/blog-registry';
import { CURSOS } from '~/lib/courses-registry';
import { ENSAYOS, type EnsayoEntry } from '~/lib/ensayos-registry';

/**
 * biblioteca-data.test.ts — cero literales de contenido: cada expectativa se
 * computa desde ENSAYOS/BLOG_POSTS (el registry manda, nunca un string de
 * copy o un conteo hardcodeado).
 */

describe('conteos derivados', () => {
  it('ENSAYO_COUNT y CICLO_COUNT reflejan el registry', () => {
    expect(ENSAYO_COUNT).toBe(ENSAYOS.length);
    expect(CICLO_COUNT).toBe(new Set(ENSAYOS.map((e) => e.series)).size);
  });
});

describe('nada se pierde', () => {
  it('ORDEN_DE_LECTURA tiene ENSAYOS.length elementos', () => {
    expect(ORDEN_DE_LECTURA).toHaveLength(ENSAYOS.length);
  });

  it('el set de slugs de CICLOS.flatMap y de ORDEN_DE_LECTURA es igual al de ENSAYOS', () => {
    const registrySlugs = new Set(ENSAYOS.map((e) => e.slug));
    const ciclosSlugs = new Set(CICLOS.flatMap((c) => c.ensayos.map((e) => e.slug)));
    const ordenSlugs = new Set(ORDEN_DE_LECTURA.map((e) => e.slug));
    expect(ciclosSlugs).toEqual(registrySlugs);
    expect(ordenSlugs).toEqual(registrySlugs);
  });
});

describe('agrupación válida', () => {
  it('en cada ciclo los orderIndex son estrictamente crecientes, sin repetidos', () => {
    for (const ciclo of CICLOS) {
      const indices = ciclo.ensayos.map((e) => e.orderIndex);
      const ordenadosSinRepetir = [...new Set(indices)].sort((a, b) => a - b);
      expect(indices).toEqual(ordenadosSinRepetir);
    }
  });

  it('todos los ensayos de un ciclo comparten series', () => {
    for (const ciclo of CICLOS) {
      for (const ensayo of ciclo.ensayos) {
        expect(ensayo.series).toBe(ciclo.serie);
      }
    }
  });
});

describe('orden de los ciclos', () => {
  it('se deriva del publishedAt más antiguo de cada serie (desempate por serie)', () => {
    const porSerie = new Map<string, EnsayoEntry[]>();
    for (const ensayo of ENSAYOS) {
      const acumulado = porSerie.get(ensayo.series) ?? [];
      acumulado.push(ensayo);
      porSerie.set(ensayo.series, acumulado);
    }

    const ordenEsperado = [...porSerie.entries()]
      .map(([serie, ensayos]) => {
        const primero = ensayos[0];
        const min = ensayos.reduce(
          (acc, e) => (e.publishedAt !== '' && e.publishedAt < acc ? e.publishedAt : acc),
          primero?.publishedAt ?? '9999',
        );
        return { serie, min };
      })
      .sort((a, b) => (a.min === b.min ? a.serie.localeCompare(b.serie) : a.min < b.min ? -1 : 1))
      .map((x) => x.serie);

    expect(CICLOS.map((c) => c.serie)).toEqual(ordenEsperado);
  });
});

describe('ordinales romanos', () => {
  it('empiezan en I, II, III… según la posición del ciclo', () => {
    const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    CICLOS.forEach((ciclo, i) => {
      expect(ciclo.romano).toBe(ROMANOS[i] ?? String(i + 1));
    });
    expect(CICLOS[0]?.romano).toBe('I');
  });
});

describe('rótulo con fallback', () => {
  it('todo ciclo tiene un rotulo no vacío', () => {
    for (const ciclo of CICLOS) {
      expect(ciclo.rotulo.length).toBeGreaterThan(0);
    }
  });

  it('rotuloDeCiclo cae al slug crudo con descripción vacía para una serie desconocida', () => {
    expect(rotuloDeCiclo('sueltos')).toEqual({ rotulo: 'sueltos', descripcion: '' });
  });
});

describe('ubicarEnsayo — vecinos', () => {
  it('el primero de ORDEN_DE_LECTURA no tiene anterior', () => {
    const primero = ORDEN_DE_LECTURA[0];
    expect(primero).toBeDefined();
    if (!primero) return;
    const ubicacion = ubicarEnsayo(primero.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.anterior).toBeNull();
  });

  it('el último de ORDEN_DE_LECTURA no tiene siguiente', () => {
    const ultimo = ORDEN_DE_LECTURA.at(-1);
    expect(ultimo).toBeDefined();
    if (!ultimo) return;
    const ubicacion = ubicarEnsayo(ultimo.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.siguiente).toBeNull();
  });

  it('un ensayo del medio de un ciclo tiene vecinos del mismo ciclo (cruzaCiclo === false)', () => {
    const ciclo = CICLOS.find((c) => c.ensayos.length >= 3);
    expect(ciclo).toBeDefined();
    if (!ciclo) return;
    const medioIndex = Math.floor((ciclo.ensayos.length - 1) / 2);
    const medio = ciclo.ensayos[medioIndex];
    expect(medio).toBeDefined();
    if (!medio) return;

    const ubicacion = ubicarEnsayo(medio.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.anterior?.cruzaCiclo).toBe(false);
    expect(ubicacion?.siguiente?.cruzaCiclo).toBe(false);
    expect(ubicacion?.anterior?.ensayo.slug).toBe(ciclo.ensayos[medioIndex - 1]?.slug);
    expect(ubicacion?.siguiente?.ensayo.slug).toBe(ciclo.ensayos[medioIndex + 1]?.slug);
  });

  it('el último ensayo de un ciclo que no es el último de todo avisa el cruce', () => {
    expect(CICLOS.length).toBeGreaterThan(1);
    const primerCiclo = CICLOS[0];
    const siguienteCiclo = CICLOS[1];
    expect(primerCiclo).toBeDefined();
    expect(siguienteCiclo).toBeDefined();
    if (!primerCiclo || !siguienteCiclo) return;

    const ultimoDelCiclo = primerCiclo.ensayos.at(-1);
    expect(ultimoDelCiclo).toBeDefined();
    if (!ultimoDelCiclo) return;

    const ubicacion = ubicarEnsayo(ultimoDelCiclo.slug);
    expect(ubicacion).not.toBeNull();
    expect(ubicacion?.siguiente?.cruzaCiclo).toBe(true);
    expect(ubicacion?.siguiente?.ciclo.serie).toBe(siguienteCiclo.serie);
  });

  it('ubicarEnsayo de un slug inexistente es null', () => {
    expect(ubicarEnsayo('no-existe-este-slug')).toBeNull();
  });
});

describe('ubicarEnsayo — posición', () => {
  it('posicion y total coinciden con el índice 1-based y el largo del ciclo', () => {
    for (const ciclo of CICLOS) {
      ciclo.ensayos.forEach((ensayo, i) => {
        const ubicacion = ubicarEnsayo(ensayo.slug);
        expect(ubicacion).not.toBeNull();
        expect(ubicacion?.posicion).toBe(i + 1);
        expect(ubicacion?.total).toBe(ciclo.ensayos.length);
      });
    }
  });
});

describe('fechas — es-AR, contra el mismo Intl del runner', () => {
  it('fechaLarga formatea un ISO válido con el mismo Intl que el runner', () => {
    const muestra = ENSAYOS[0];
    expect(muestra).toBeDefined();
    if (!muestra) return;
    const esperado = new Date(muestra.publishedAt).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    expect(fechaLarga(muestra.publishedAt)).toBe(esperado);
  });

  it('fechaLarga de un ISO que no parsea es cadena vacía', () => {
    expect(fechaLarga('no-es-una-fecha')).toBe('');
  });

  it('la fecha de cada ciclo es mes y año del publishedAt más antiguo, mismo Intl', () => {
    for (const ciclo of CICLOS) {
      const delSerie = ENSAYOS.filter((e) => e.series === ciclo.serie);
      const primero = delSerie[0];
      const min = delSerie.reduce(
        (acc, e) => (e.publishedAt !== '' && e.publishedAt < acc ? e.publishedAt : acc),
        primero?.publishedAt ?? '9999',
      );
      const esperado = new Date(min).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
      expect(ciclo.fecha).toBe(esperado);
    }
  });
});

describe('numeroDeFila', () => {
  it('formatea el índice 0-based con padding de dos dígitos', () => {
    expect(numeroDeFila(0)).toBe('01');
    expect(numeroDeFila(6)).toBe('07');
    expect(numeroDeFila(9)).toBe('10');
  });
});

describe('bitácora', () => {
  it('CRONICA_COUNT es BLOG_POSTS.length', () => {
    expect(CRONICA_COUNT).toBe(BLOG_POSTS.length);
  });

  it('ULTIMAS_CRONICAS son las primeras 4 de BLOG_POSTS (o todas, si hubiera menos)', () => {
    expect(ULTIMAS_CRONICAS).toEqual(BLOG_POSTS.slice(0, 4));
    expect(ULTIMAS_CRONICAS.length).toBeLessThanOrEqual(4);
  });

  it('hrefCronica arma la ruta de la bitácora (spec 3.4)', () => {
    expect(hrefCronica('x')).toBe('/bitacora/x');
  });
});

describe('hrefs de fase', () => {
  it('HREF_MANIFIESTO y HREF_BITACORA apuntan a las superficies vivas de hoy', () => {
    expect(HREF_MANIFIESTO).toBe('/manifiesto');
    expect(HREF_BITACORA).toBe('/bitacora');
  });
});

describe('vidriera de entrenamientos (curación 3.5 → 3.1)', () => {
  it('CURSOS_DESTACADOS son los primeros 6 isFeatured por orderIndex', () => {
    const esperado = CURSOS.filter((c) => c.isFeatured)
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .slice(0, 6);
    expect(CURSOS_DESTACADOS).toEqual(esperado);
  });

  it('tiene a lo sumo 6 elementos y ninguno con isFeatured === false', () => {
    expect(CURSOS_DESTACADOS.length).toBeLessThanOrEqual(6);
    for (const curso of CURSOS_DESTACADOS) {
      expect(curso.isFeatured).toBe(true);
    }
  });
});
