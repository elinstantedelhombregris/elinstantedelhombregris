import { describe, expect, it } from 'vitest';

import { contenidoFichaSchema } from '../fichas.js';

const valido = {
  titulo: 'Una pregunta de prueba',
  territorioId: null,
  temas: [] as string[],
  situacion: '',
  futuro: '',
  proximaTarea: '',
  vinculos: [],
};
const conTemas = (n: number) => ({
  ...valido,
  temas: Array.from({ length: n }, (_, i) => `tema-${i}`),
});

describe('El tope de temas de una ficha es el catálogo entero', () => {
  it('una ficha sin temas es válida', () => {
    expect(contenidoFichaSchema.safeParse(valido).success).toBe(true);
  });

  it('trece temas se aceptan', () => {
    expect(contenidoFichaSchema.safeParse(conTemas(13)).success).toBe(true);
  });

  it('catorce temas se rechazan, en el campo de temas', () => {
    const r = contenidoFichaSchema.safeParse(conTemas(14));
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.path.join('.'))).toEqual(['temas']);
  });

  it('una ficha vieja con ocho temas sigue siendo legible', () => {
    expect(contenidoFichaSchema.safeParse(conTemas(8)).success).toBe(true);
  });
});
