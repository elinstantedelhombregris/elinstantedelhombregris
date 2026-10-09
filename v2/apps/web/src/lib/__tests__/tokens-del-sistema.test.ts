import { describe, expect, it } from 'vitest';

import config from '../../../tailwind.config';

/**
 * Las decisiones de color que viven en `tailwind.config.ts` y que no se ven en ningún
 * componente: si alguien las revierte, ninguna pantalla falla, solo se ve peor.
 */

type Paleta = Record<string, string | Record<string, string>>;

function extension(): { colors: Paleta; borderColor: Record<string, string> } {
  const extend = (config.theme?.extend ?? {}) as {
    colors?: Paleta;
    borderColor?: Record<string, string>;
  };
  return { colors: extend.colors ?? {}, borderColor: extend.borderColor ?? {} };
}

function hex(grupo: string, matiz: string): string {
  const valor = extension().colors[grupo];
  if (typeof valor !== 'object') throw new Error(`«${grupo}» no es un grupo de colores`);
  const color = valor[matiz];
  if (color === undefined) throw new Error(`«${grupo}.${matiz}» no existe`);
  return color;
}

describe('el borde por defecto', () => {
  it('un `border` sin color toma el borde suave del papel, no el gris de Tailwind', () => {
    expect(extension().borderColor.DEFAULT).toBe(hex('papel', 'borde'));
    // El gris de fábrica de Tailwind (gray-200): 1,08:1 sobre papel, de ningún sistema.
    expect(extension().borderColor.DEFAULT?.toUpperCase()).not.toBe('#E5E7EB');
  });
});
