import { describe, expect, it } from 'vitest';

import { validarFicha } from '../validar-ficha';

import type { ContenidoFicha } from '@v2/shared';

const A = '11111111-1111-4111-8111-111111111111';
const valida: ContenidoFicha = {
  titulo: 'Una pregunta de prueba',
  territorioId: null,
  temas: [],
  situacion: '',
  futuro: '',
  proximaTarea: '',
  condiciones: [],
  vinculos: [],
};
const errores = (c: ContenidoFicha) => {
  const r = validarFicha(c);
  if ('datos' in r) throw new Error('Se esperaba un error de validación.');
  return r.errores;
};

describe('Fichas: validación en castellano, un mensaje por campo', () => {
  it('un contenido válido pasa tal cual', () => {
    expect(validarFicha(valida)).toEqual({ datos: valida });
  });

  it('un título corto dice cuánto pide', () => {
    expect(errores({ ...valida, titulo: 'corto' }).titulo).toBe(
      'Poné una pregunta o título de al menos 8 caracteres.',
    );
  });

  it('una condición demasiado corta se explica sin mostrar el mensaje técnico', () => {
    expect(errores({ ...valida, condiciones: ['ab'] }).condiciones).toBe(
      'Cada condición necesita al menos 3 caracteres. Borrá las líneas que sobren.',
    );
  });

  it('trece temas, todo el catálogo, pasan; catorce piden elegir menos', () => {
    const trece = Array.from({ length: 13 }, (_, i) => `tema-${i}`);
    expect(validarFicha({ ...valida, temas: trece })).toHaveProperty('datos');
    const temas = Array.from({ length: 14 }, (_, i) => `tema-${i}`);
    expect(errores({ ...valida, temas }).temas).toBe('Elegí hasta 13 temas.');
  });

  it('el mismo aporte con la misma relación dos veces se avisa en el campo de vínculos', () => {
    const vinculo = { senalId: A, relacion: 'inspira' as const };
    expect(errores({ ...valida, vinculos: [vinculo, vinculo] }).vinculos).toBe(
      'El mismo vínculo ya está en la ficha.',
    );
  });

  it('ningún mensaje queda en inglés', () => {
    const todos = Object.values(
      errores({
        ...valida,
        titulo: 'x',
        condiciones: ['ab'],
        temas: Array.from({ length: 14 }, (_, i) => `t${i}`),
      }),
    );
    for (const mensaje of todos) expect(mensaje).not.toMatch(/String must|Invalid|Array must/);
  });
});
