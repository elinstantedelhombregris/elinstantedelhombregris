import { describe, expect, it } from 'vitest';

import { barajarOpciones, type PreguntaNormalizada } from '../courses.js';

const pregunta = (enunciado: string): PreguntaNormalizada => ({
  enunciado,
  opciones: ['a', 'b', 'c', 'd'],
  correcta: 1,
  explicacion: 'x',
});

describe('barajarOpciones', () => {
  it('la correcta sigue siendo la misma opción', () => {
    for (let i = 0; i < 50; i++) {
      const b = barajarOpciones(pregunta(`¿Pregunta ${String(i)}?`));
      expect(b.opciones[b.correcta]).toBe('b');
      expect([...b.opciones].sort()).toEqual(['a', 'b', 'c', 'd']);
    }
  });
  it('es determinista: la misma pregunta se baraja igual siempre', () => {
    expect(barajarOpciones(pregunta('¿Una?'))).toEqual(barajarOpciones(pregunta('¿Una?')));
  });
  it('reparte la correcta entre las cuatro posiciones (D-095)', () => {
    const posiciones = new Set(
      Array.from({ length: 40 }, (_, i) => barajarOpciones(pregunta(`¿P${String(i)}?`)).correcta),
    );
    expect(posiciones.size).toBe(4);
  });
  it('no toca Verdadero/Falso', () => {
    const vf = {
      enunciado: '¿V?',
      opciones: ['Verdadero', 'Falso'],
      correcta: 1,
      explicacion: 'x',
    };
    expect(barajarOpciones(vf)).toBe(vf);
  });
});
