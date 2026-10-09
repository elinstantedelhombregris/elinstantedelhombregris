import { describe, expect, it } from 'vitest';

import { volverTrasIngresar } from './volver';
describe('El regreso de la cuenta permanece en el sitio', () => {
  it('preserva campañas y rechaza orígenes externos, escapes y bucles de autenticación', () => {
    expect(volverTrasIngresar('?volver=/mi-espacio')).toBe('/mi-espacio');
    expect(volverTrasIngresar('?volver=https://ajeno.example/')).toBe('/mi-espacio');
    expect(volverTrasIngresar('?volver=//ajeno.example')).toBe('/mi-espacio');
    expect(volverTrasIngresar('?volver=/ingresar')).toBe('/mi-espacio');
  });
});
