import { describe, expect, it } from 'vitest';

import { PALABRAS_POR_MINUTO, contarPalabrasRenderizables, minutosDeLectura } from '../src/content/lectura';

describe('minutosDeLectura', () => {
  it('usa la velocidad del proyecto y redondea hacia arriba', () => {
    expect(PALABRAS_POR_MINUTO).toBe(220);
    expect(minutosDeLectura(220)).toBe(1);
    expect(minutosDeLectura(221)).toBe(2);
  });

  it('nunca devuelve 0', () => {
    expect(minutosDeLectura(0)).toBe(1);
    expect(minutosDeLectura(3)).toBe(1);
  });
});

describe('contarPalabrasRenderizables', () => {
  it('cuenta prosa y encabezados', () => {
    expect(contarPalabrasRenderizables('## Un título\n\nDos palabras acá.')).toBe(5);
  });

  it('no cuenta el contenido de un bloque svg', () => {
    const cuerpo = 'Antes.\n\n<svg viewBox="0 0 10 10"><path d="M 1 2 L 3 4 Z"/></svg>\n\nDespués.';
    expect(contarPalabrasRenderizables(cuerpo)).toBe(2);
  });

  it('no cuenta bloques de código ni pre', () => {
    expect(contarPalabrasRenderizables('Uno.\n\n```\nesto no cuenta nunca\n```\n\n<pre>ni esto</pre>')).toBe(1);
  });

  it('cuenta una palabra con marcado como una sola palabra', () => {
    expect(contarPalabrasRenderizables('**negrita** y *cursiva*')).toBe(3);
  });
});
