import { describe, expect, it } from 'vitest';

import { fuenteFichaSchema } from '../../validation/evidencia-ficha.js';
import { CATALOGO_FUENTES, datoCatalogoSchema } from '../fuentes.js';

const indicador = CATALOGO_FUENTES.indicadores[0];
if (!indicador) throw new Error('Falta el catálogo.');
const fuente = {
  ...indicador.dato,
  id: '11111111-1111-4111-8111-111111111111',
  catalogo: { version: CATALOGO_FUENTES.version, id: indicador.id },
};
describe('Referencias a evidencia contrastada', () => {
  it('conserva el dato exacto y rechaza cambiar valor, escala, fecha o edición manteniendo el sello', () => {
    expect(fuenteFichaSchema.safeParse(fuente).success).toBe(true);
    for (const cambio of [
      { valor: 0 },
      { territorioId: 6 },
      { referencia: '2024-01-01' },
      { catalogo: { ...fuente.catalogo, version: 'inventada' } },
    ])
      expect(fuenteFichaSchema.safeParse({ ...fuente, ...cambio }).success).toBe(false);
    const { catalogo: _ref, ...manual } = fuente;
    expect(fuenteFichaSchema.safeParse({ ...manual, valor: 0 }).success).toBe(true);
  });
  it('distingue cero de dato faltante y rechaza porcentajes imposibles', () => {
    expect(
      datoCatalogoSchema.safeParse({ ...fuente, id: undefined, catalogo: undefined }).success,
    ).toBe(false);
    for (const estado of ['no_publicado', 'no_disponible']) {
      expect(datoCatalogoSchema.safeParse({ ...indicador.dato, estado, valor: null }).success).toBe(
        true,
      );
      expect(datoCatalogoSchema.safeParse({ ...indicador.dato, estado, valor: 0 }).success).toBe(
        false,
      );
    }
    expect(datoCatalogoSchema.safeParse({ ...indicador.dato, valor: 101 }).success).toBe(false);
    expect(datoCatalogoSchema.safeParse({ ...indicador.dato, valor: 0 }).success).toBe(true);
  });
});
