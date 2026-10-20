import { describe, expect, it } from 'vitest';

import { destinoDeImaginar, pideAportePuntual } from '../pedido-de-aporte';

describe('qué pide un enlace al mapa', () => {
  it.each(['aportar', 'imaginar', 'guiado'])('participar=%s lleva a Imaginar', (valor) => {
    expect(destinoDeImaginar(`?participar=${valor}`, '#instrumento')).toBe(
      '/mi-argentina-ideal/imaginar',
    );
  });

  it('el ancla #aportar sola también lleva a Imaginar', () => {
    expect(destinoDeImaginar('', '#aportar')).toBe('/mi-argentina-ideal/imaginar');
  });

  it.each(['directo', 'voz'])(
    'participar=%s se queda en el mapa, con o sin el ancla vieja',
    (v) => {
      expect(pideAportePuntual(`?participar=${v}`)).toBe(true);
      expect(destinoDeImaginar(`?participar=${v}`, '')).toBeNull();
      expect(destinoDeImaginar(`?participar=${v}`, '#aportar')).toBeNull();
    },
  );

  it('un enlace del mapa sin pedido no se mueve', () => {
    expect(destinoDeImaginar('?lente=analisis&lugar=6', '#instrumento')).toBeNull();
    expect(destinoDeImaginar('?participar=otra', '')).toBeNull();
    expect(pideAportePuntual('?participar=aportar')).toBe(false);
  });

  it('se lleva la campaña, la edición, el borrador y el lugar, y nada más', () => {
    const destino = destinoDeImaginar(
      '?participar=aportar&lente=tiempo&campana=mi-argentina-ideal&edicion=3&borrador=b-9&lugar=14&nombre=C%C3%B3rdoba&codigoRetiro=privado',
      '#instrumento',
    );
    expect(destino).toBe(
      '/mi-argentina-ideal/imaginar?campana=mi-argentina-ideal&edicion=3&borrador=b-9&lugar=14',
    );
    expect(destino).not.toContain('privado');
  });

  it('una edición mal escrita viaja tal cual, para que Imaginar la marque', () => {
    expect(destinoDeImaginar('?participar=imaginar&campana=una&edicion=otra', '')).toBe(
      '/mi-argentina-ideal/imaginar?campana=una&edicion=otra',
    );
  });
});
