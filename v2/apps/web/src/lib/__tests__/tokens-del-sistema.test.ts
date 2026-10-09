import { describe, expect, it } from 'vitest';

import config from '../../../tailwind.config';

import { contraste } from '~/components/mapa/pintor-senales';
import { RELLENO_CLASE_OSCURO } from '~/pages/ElMandatoVivo/el-mandato-data';

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

describe('el ámbar', () => {
  const ambar = hex('ambar', 'DEFAULT');
  const claro = hex('ambar', 'claro');
  const AA_TEXTO = 4.5;
  const AA_GRAFICO = 3;

  it('sirve de texto: llega a 4,5:1 sobre papel y sobre papel crudo', () => {
    expect(contraste(ambar, hex('papel', 'DEFAULT'))).toBeGreaterThanOrEqual(AA_TEXTO);
    expect(contraste(ambar, hex('papel', 'crudo'))).toBeGreaterThanOrEqual(AA_TEXTO);
  });

  it('sobre fondo oscuro la superficie es `ambar-claro`, que sigue cruzando 3:1', () => {
    expect(contraste(claro, hex('tinta', 'DEFAULT'))).toBeGreaterThanOrEqual(AA_GRAFICO);
    expect(contraste(claro, hex('oscuro', 'barra'))).toBeGreaterThanOrEqual(AA_GRAFICO);
    // El token de texto, en cambio, se hunde ahí: por eso hace falta el claro.
    expect(contraste(ambar, hex('oscuro', 'barra'))).toBeLessThan(AA_GRAFICO);
    expect(RELLENO_CLASE_OSCURO.hecho).toBe('bg-ambar-claro');
  });

  it('sigue siendo distinto de los otros tres colores de clase', () => {
    const clases = [
      ambar,
      hex('violeta', 'DEFAULT'),
      extension().colors.verde,
      extension().colors.cian,
    ];
    expect(new Set(clases).size).toBe(4);
  });
});
