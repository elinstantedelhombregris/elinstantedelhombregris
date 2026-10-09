import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getConfig, resetConfig } from '../config.js';

const VARIABLES = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'EXPORTACIONES_EN_PEDIDO',
] as const;

describe('El avance en pedido de las exportaciones (EXPORTACIONES_EN_PEDIDO)', () => {
  const guardado = new Map<string, string | undefined>();
  beforeEach(() => {
    for (const k of VARIABLES) guardado.set(k, process.env[k]);
    process.env.DATABASE_URL = 'postgresql://postgres@127.0.0.1:1/descartable';
    process.env.JWT_SECRET = 'x'.repeat(32);
    process.env.SESSION_SECRET = 'y'.repeat(32);
    Reflect.deleteProperty(process.env, 'EXPORTACIONES_EN_PEDIDO');
    resetConfig();
  });
  afterEach(() => {
    for (const k of VARIABLES) {
      const v = guardado.get(k);
      if (v === undefined) Reflect.deleteProperty(process.env, k);
      else process.env[k] = v;
    }
    resetConfig();
  });
  const con = (valor: string) => {
    process.env.EXPORTACIONES_EN_PEDIDO = valor;
    resetConfig();
    return getConfig().exportacionesEnPedido;
  };

  it('está prendido por defecto', () => {
    expect(getConfig().exportacionesEnPedido).toBe(true);
  });
  it('un valor vacío es «sin definir», no «apagado»', () => {
    expect(con('')).toBe(true);
    expect(con('   ')).toBe(true);
  });
  it('1 lo prende y 0 lo apaga', () => {
    expect(con('1')).toBe(true);
    expect(con('0')).toBe(false);
  });
});
