import { describe, expect, it } from 'vitest';

import { hrefIngresar, volverTrasIngresar } from './volver';
describe('El regreso de la cuenta permanece en el sitio', () => {
  it('preserva campañas y rechaza orígenes externos, escapes y bucles de autenticación', () => {
    expect(volverTrasIngresar('?volver=/mi-espacio')).toBe('/mi-espacio');
    expect(volverTrasIngresar('?volver=https://ajeno.example/')).toBe('/mi-espacio');
    expect(volverTrasIngresar('?volver=//ajeno.example')).toBe('/mi-espacio');
    expect(volverTrasIngresar('?volver=/ingresar')).toBe('/mi-espacio');
  });
});

describe('hrefIngresar', () => {
  it('lleva el destino pedido', () => {
    expect(hrefIngresar('/campanas/mi-argentina-ideal?edicion=1')).toBe(
      '/ingresar?volver=%2Fcampanas%2Fmi-argentina-ideal%3Fedicion%3D1',
    );
  });
  it('arma el enlace de registro', () => {
    expect(hrefIngresar('/fichas', '/registrarse')).toBe('/registrarse?volver=%2Ffichas');
  });
  it('no deja salir del sitio ni volver a las pantallas de ingreso', () => {
    expect(hrefIngresar('//otro.sitio')).toBe('/ingresar?volver=%2Fmi-espacio');
    expect(hrefIngresar('/ingresar')).toBe('/ingresar?volver=%2Fmi-espacio');
  });
  it('sin destino usa la página actual', () => {
    window.history.replaceState(null, '', '/la-radiografia?tema=agua');
    expect(hrefIngresar()).toBe('/ingresar?volver=%2Fla-radiografia%3Ftema%3Dagua');
  });
});
