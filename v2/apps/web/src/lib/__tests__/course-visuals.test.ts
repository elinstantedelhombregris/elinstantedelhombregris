import { describe, expect, it } from 'vitest';

import { CURSOS_CON_VISUAL_EDITORIAL, visualParaCurso } from '../course-visuals';
import { CURSOS } from '../courses-registry';

describe('visuales editoriales de entrenamientos', () => {
  it('cubre 30 cursos y deja Teoría de juegos con sus diagramas MDX específicos', () => {
    const cubiertos = CURSOS.filter((curso) => visualParaCurso(curso.slug) !== undefined);
    const sinAsignar = CURSOS.filter((curso) => visualParaCurso(curso.slug) === undefined);

    expect(CURSOS_CON_VISUAL_EDITORIAL).toBe(30);
    expect(cubiertos).toHaveLength(30);
    expect(sinAsignar.map((curso) => curso.slug)).toEqual(['teoria-juegos-argentina-hombre-gris']);
  });

  it('cada pieza tiene ruta pública, texto alternativo y una lectura editorial', () => {
    for (const curso of CURSOS) {
      const visual = visualParaCurso(curso.slug);
      if (!visual) continue;
      expect(visual.src).toMatch(/^\/course-(illustrations|diagrams)\/.+\.(webp|svg)$/);
      expect(visual.alt.length).toBeGreaterThan(40);
      expect(visual.caption.length).toBeGreaterThan(40);
    }
  });
});
