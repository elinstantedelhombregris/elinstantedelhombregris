import { describe, expect, it } from 'vitest';

import { slugCanonico } from '../slug.js';

describe('slugCanonico', () => {
  it('transliterates diacritics instead of dropping them', () => {
    expect(slugCanonico('¿Cuáles deberían ser nuestros parámetros?')).toBe(
      'cuales-deberian-ser-nuestros-parametros',
    );
    expect(slugCanonico('Diseño Idealizado: La Argentina Posible')).toBe(
      'diseno-idealizado-la-argentina-posible',
    );
    expect(slugCanonico('Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social')).toBe(
      'sistemas-vs-sintomas-como-pensar-como-ingeniero-social',
    );
    expect(slugCanonico('El Cristo que llevás dentro')).toBe('el-cristo-que-llevas-dentro');
  });

  it('is idempotent', () => {
    const titulos = [
      '¿Cuáles deberían ser nuestros parámetros?',
      'Diseño Idealizado: La Argentina Posible',
      'Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social',
      'El Cristo que llevás dentro',
    ];
    for (const titulo of titulos) {
      const once = slugCanonico(titulo);
      expect(slugCanonico(once)).toBe(once);
    }
  });

  it('never leaves a loose hyphen at either edge', () => {
    expect(slugCanonico('¿Contra quién estás peleando, en serio?')).not.toMatch(/^-|-$/);
    expect(slugCanonico('Pago por Inteligencia Artificial. ¿Y por la mía?')).not.toMatch(/^-|-$/);
    expect(slugCanonico('  --Espacios y guiones sueltos--  ')).not.toMatch(/^-|-$/);
  });
});
