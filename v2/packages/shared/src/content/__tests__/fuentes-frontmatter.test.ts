import { describe, expect, it } from 'vitest';

import { fuentesDeFrontmatter } from '../fuentes-frontmatter';

const LECCION = `---
slug: una
title: Una
cierre: completo
fuentes:
  - url: https://servicios.infoleg.gob.ar/norma.htm
    titulo: 'Ley 27.275 — Acceso a la información (InfoLeg)'
    consultada: '2026-09-22'
  - url: https://www.argentina.gob.ar/aaip
    titulo: "La Agencia"
    consultada: 2026-09-21
revisarAntesDe: '2027-01-01'
---

Cuerpo.
`;

describe('fuentesDeFrontmatter', () => {
  it('lee las dos fuentes con sus tres campos, con y sin comillas', () => {
    expect(fuentesDeFrontmatter(LECCION)).toEqual([
      {
        url: 'https://servicios.infoleg.gob.ar/norma.htm',
        titulo: 'Ley 27.275 — Acceso a la información (InfoLeg)',
        consultada: '2026-09-22',
      },
      { url: 'https://www.argentina.gob.ar/aaip', titulo: 'La Agencia', consultada: '2026-09-21' },
    ]);
  });

  it('la clave siguiente de primer nivel cierra la lista', () => {
    expect(fuentesDeFrontmatter(LECCION)).toHaveLength(2);
  });

  it('sin fuentes, o sin frontmatter, devuelve vacío', () => {
    expect(fuentesDeFrontmatter('---\nslug: x\n---\nCuerpo')).toEqual([]);
    expect(fuentesDeFrontmatter('Cuerpo sin frontmatter')).toEqual([]);
  });

  it('las comillas simples dobladas de YAML vuelven a ser una', () => {
    const raw = "---\nfuentes:\n  - url: https://a.ar\n    titulo: 'La ''ley'' del hambre'\n    consultada: '2026-01-01'\n---\n";
    expect(fuentesDeFrontmatter(raw)[0]?.titulo).toBe("La 'ley' del hambre");
  });
});
