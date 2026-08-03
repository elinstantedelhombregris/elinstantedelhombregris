import { describe, expect, it } from 'vitest';

import { declarado, derivado, esMagnitud, medido } from '../simulacion/procedencia.js';

describe('Magnitud', () => {
  it('un medido declara su fuente', () => {
    expect(medido(12, 'voces', 'dreams')).toEqual({
      valor: 12,
      unidad: 'voces',
      procedencia: { tipo: 'medido', fuente: 'dreams' },
    });
  });

  it('un declarado dice qué palanca lo movió', () => {
    expect(declarado(0.5, 'fracción', 'dispersion').procedencia).toEqual({
      tipo: 'declarado',
      palanca: 'dispersion',
    });
  });

  it('un derivado muestra su fórmula y de qué se derivó', () => {
    expect(derivado(0.25, 'fracción', 'alcance × persistencia', ['alcance', 'persistencia'])).toEqual({
      valor: 0.25,
      unidad: 'fracción',
      procedencia: {
        tipo: 'derivado',
        formula: 'alcance × persistencia',
        de: ['alcance', 'persistencia'],
      },
    });
  });

  it('esMagnitud distingue una Magnitud de un número suelto', () => {
    expect(esMagnitud(medido(1, 'voces', 'x'))).toBe(true);
    expect(esMagnitud(3)).toBe(false);
    expect(esMagnitud({ valor: 3, unidad: 'voces' })).toBe(false);
    expect(esMagnitud(null)).toBe(false);
  });
});
