import { describe, expect, it } from 'vitest';

import { CLASE_ROTULO, CLASES_SENAL, cuantos, mayuscula } from '../vocabulario';

describe('cuantos — cantidades en castellano', () => {
  it('el cero va en palabras y concuerda en género', () => {
    expect(cuantos(0, 'aporte', 'aportes')).toBe('ningún aporte');
    expect(cuantos(0, 'celda', 'celdas', true)).toBe('ninguna celda');
  });

  it('el uno va en singular y el resto en plural, con puntos de miles', () => {
    expect(cuantos(1, 'aporte', 'aportes')).toBe('1 aporte');
    expect(cuantos(2, 'aporte', 'aportes')).toBe('2 aportes');
    expect(cuantos(1234, 'aporte', 'aportes')).toBe('1.234 aportes');
  });

  it('un número que no es una cantidad no se escribe como dato', () => {
    expect(cuantos(Number.NaN, 'aporte', 'aportes')).toBe('ningún aporte');
    expect(cuantos(-3, 'celda', 'celdas', true)).toBe('ninguna celda');
  });

  it('mayuscula abre la oración sin tocar el resto', () => {
    expect(mayuscula(cuantos(0, 'aporte', 'aportes'))).toBe('Ningún aporte');
    expect(mayuscula('3 aportes')).toBe('3 aportes');
  });
});

describe('las cuatro clases tienen un solo nombre', () => {
  it('cada clase del canon tiene su rótulo, y los cuatro son distintos', () => {
    const rotulos = CLASES_SENAL.map((c) => CLASE_ROTULO[c]);
    expect(new Set(rotulos).size).toBe(CLASES_SENAL.length);
    for (const r of rotulos) expect(r.length).toBeGreaterThan(0);
  });
});
