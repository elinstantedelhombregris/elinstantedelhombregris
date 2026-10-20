import { describe, expect, it } from 'vitest';

import { pedidoParecidosSchema, pedidoVisionSchema } from '../vision.js';

describe('pedidoVisionSchema', () => {
  it('sin campaña es la nacional, y un parámetro de más no rompe la lectura', () => {
    expect(pedidoVisionSchema.parse({})).toEqual({});
    expect(pedidoVisionSchema.parse({ campana: 'mi-argentina-ideal', _: '123' })).toEqual({
      campana: 'mi-argentina-ideal',
    });
  });

  it('no acepta un slug con forma rara', () => {
    const r = pedidoVisionSchema.safeParse({ campana: '../../etc' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe('No reconocemos esa campaña.');
  });
});

describe('pedidoParecidosSchema', () => {
  it('pide entre 10 y 2000 letras, sin contar los espacios de los bordes', () => {
    expect(pedidoParecidosSchema.safeParse({ texto: '   corto   ' }).success).toBe(false);
    expect(pedidoParecidosSchema.parse({ texto: '  Que el tren vuelva  ' })).toEqual({
      texto: 'Que el tren vuelva',
    });
    expect(pedidoParecidosSchema.safeParse({ texto: 'a'.repeat(2001) }).success).toBe(false);
  });

  it('dice en castellano qué falta', () => {
    const r = pedidoParecidosSchema.safeParse({});
    expect(r.success).toBe(false);
    if (!r.success)
      expect(r.error.issues[0]?.message).toBe('Escribí algo para buscar aportes parecidos.');
  });

  it('no acepta campos de más', () => {
    expect(
      pedidoParecidosSchema.safeParse({ texto: 'Que el tren vuelva', campana: 'otra' }).success,
    ).toBe(false);
  });
});
