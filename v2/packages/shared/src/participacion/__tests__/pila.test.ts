import { describe, expect, it } from 'vitest';

import { buscarDatosPersonales, lineaSugerida, sugerirTema, LARGO_LINEA } from '../pila.js';

describe('lineaSugerida', () => {
  it('saca la fórmula de arranque y pone mayúscula', () => {
    expect(lineaSugerida('En mi Argentina ideal, podría estudiar cerca de casa.')).toBe(
      'Podría estudiar cerca de casa.',
    );
    expect(lineaSugerida('en mi argentina ideal mi vieja tendría médico')).toBe(
      'Mi vieja tendría médico',
    );
    expect(lineaSugerida('En una Argentina ideal que el tren vuelva.')).toBe('Que el tren vuelva.');
  });

  it('se queda con la primera oración', () => {
    expect(lineaSugerida('Que haya trabajo. Y que se pague bien. Y más.')).toBe(
      'Que haya trabajo.',
    );
  });

  it('corta en una palabra entera sin inventar puntos suspensivos', () => {
    const largo = 'Que '.concat('la escuela del pueblo tenga '.repeat(12));
    const l = lineaSugerida(largo);
    expect(l.length).toBeLessThanOrEqual(LARGO_LINEA);
    expect(l.endsWith('…')).toBe(false);
    expect(largo.startsWith(l)).toBe(true);
  });
});

describe('sugerirTema', () => {
  it('sugiere cuando un tema gana claro', () => {
    expect(sugerirTema('Que un turno con el médico no tarde tres meses')).toBe('salud');
    expect(sugerirTema('Alquilar sin dejar la mitad del sueldo en la casa')).toBe('vivienda');
    expect(sugerirTema('Que el tren vuelva a mi pueblo')).toBe('movilidad');
  });

  it('no sugiere nada con un empate o sin palabras conocidas', () => {
    expect(sugerirTema('Ser feliz')).toBeNull();
    expect(sugerirTema('La escuela y el hospital')).toBeNull();
  });

  it('respeta el catálogo que se le pasa', () => {
    expect(sugerirTema('Que el tren vuelva', ['salud'])).toBeNull();
  });
});

describe('buscarDatosPersonales', () => {
  it.each([
    '1.000.000 de pesos por año',
    'Que vuelva la Ruta 40 asfaltada',
    'Para 2030 quiero mi casa',
    'Una ciudad de 100.000 habitantes',
    'Que el 0800 de la obra social atienda',
    'Que la línea 60 pase cada diez minutos',
  ])('no frena «%s»', (texto) => {
    expect(buscarDatosPersonales(texto)).toEqual([]);
  });

  it.each([
    ['Llamame al 11 1234-5678', 'telefono'],
    ['Mi celu es +54 9 351 555 1234', 'telefono'],
    ['0351-15-555-1234 es el número', 'telefono'],
    ['Mi DNI es 30.123.456', 'dni'],
    ['Escribime a juana.perez@correo.com', 'mail'],
  ])('frena «%s»', (texto, tipo) => {
    const h = buscarDatosPersonales(texto);
    expect(h).toHaveLength(1);
    expect(h[0]?.tipo).toBe(tipo);
  });

  it('marca el tramo exacto', () => {
    const texto = 'Llamame al 11 1234-5678 por favor';
    const [h] = buscarDatosPersonales(texto);
    expect(h && texto.slice(h.desde, h.hasta)).toBe('11 1234-5678');
  });
});
