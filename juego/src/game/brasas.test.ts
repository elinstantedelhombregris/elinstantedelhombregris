import { describe, expect, it } from 'vitest';
import {
  COSTOS,
  GANANCIAS,
  balance,
  crearGanancia,
  crearGasto,
  esCostoPaletaValido,
  motivoDeLuz,
  puedeGastar,
  totalGanado,
} from './brasas';
import type { EmberEntry } from './types';

const F = '2026-07-09';
let n = 0;
const gano = (delta: number): EmberEntry =>
  crearGanancia({ id: `g${n++}`, delta, motivo: 'test', fecha: F });

describe('constantes del spec §3.3', () => {
  it('ganancias exactas', () => {
    expect(GANANCIAS).toMatchObject({
      luz: 2,
      nocheCompleta: 4,
      compromisoCumplido: 3,
      pasoExpedicion: 3,
      hito25: 10,
      hito50: 15,
      hito100: 25,
      bienvenida: 5,
      chispaRecibida: 5,
    });
  });

  it('día completo = 10 brasas (3 luces + bonus)', () => {
    expect(GANANCIAS.luz * 3 + GANANCIAS.nocheCompleta).toBe(10);
  });

  it('costos exactos', () => {
    expect(COSTOS).toEqual({
      fundarExpedicion: 15,
      chispaRegalada: 5,
      paletaMin: 30,
      paletaMax: 80,
    });
  });
});

describe('ledger', () => {
  it('balance suma ganancias y gastos', () => {
    const entries = [gano(10), gano(5)];
    entries.push(crearGasto(entries, { id: 'x', costo: 6, motivo: 'test', fecha: F }));
    expect(balance(entries)).toBe(9);
  });

  it('totalGanado ignora los gastos (mueve rangos)', () => {
    const entries = [gano(10), gano(5)];
    entries.push(crearGasto(entries, { id: 'x', costo: 15, motivo: 'test', fecha: F }));
    expect(balance(entries)).toBe(0);
    expect(totalGanado(entries)).toBe(15);
  });

  it('ledger vacío: balance y total en 0', () => {
    expect(balance([])).toBe(0);
    expect(totalGanado([])).toBe(0);
  });
});

describe('gastos', () => {
  it('no se puede gastar por debajo de 0', () => {
    const entries = [gano(10)];
    expect(() =>
      crearGasto(entries, { id: 'x', costo: 11, motivo: 'test', fecha: F }),
    ).toThrow('No te alcanzan las brasas');
  });

  it('gastar el balance exacto deja 0 y es válido', () => {
    const entries = [gano(15)];
    const gasto = crearGasto(entries, { id: 'x', costo: 15, motivo: 'test', fecha: F });
    expect(gasto.delta).toBe(-15);
    expect(balance([...entries, gasto])).toBe(0);
  });

  it('un total histórico alto no habilita gastar sin balance', () => {
    const entries = [gano(100)];
    entries.push(crearGasto(entries, { id: 'a', costo: 100, motivo: 'test', fecha: F }));
    expect(totalGanado(entries)).toBe(100);
    expect(puedeGastar(entries, 1)).toBe(false);
  });

  it('puedeGastar rechaza costos no positivos', () => {
    expect(puedeGastar([gano(10)], 0)).toBe(false);
    expect(puedeGastar([gano(10)], -5)).toBe(false);
  });

  it('crearGasto valida costo entero positivo', () => {
    expect(() =>
      crearGasto([gano(10)], { id: 'x', costo: 2.5, motivo: 'test', fecha: F }),
    ).toThrow();
  });
});

describe('ganancias', () => {
  it('multiplicador x2 (día de brasas dobles) duplica el delta', () => {
    const e = crearGanancia({ id: 'x', delta: 3, motivo: 'test', fecha: F, multiplicador: 2 });
    expect(e.delta).toBe(6);
  });

  it('rechaza deltas no enteros o no positivos', () => {
    expect(() => crearGanancia({ id: 'x', delta: 0, motivo: 't', fecha: F })).toThrow();
    expect(() => crearGanancia({ id: 'x', delta: -2, motivo: 't', fecha: F })).toThrow();
    expect(() => crearGanancia({ id: 'x', delta: 1.5, motivo: 't', fecha: F })).toThrow();
  });

  it('motivoDeLuz habla rioplatense', () => {
    expect(motivoDeLuz('ver')).toBe('Luz de ver');
    expect(motivoDeLuz('encender')).toBe('Luz de encender');
    expect(motivoDeLuz('dar')).toBe('Luz de dar');
  });
});

describe('paletas', () => {
  it('acepta el rango 30–80 y rechaza afuera', () => {
    expect(esCostoPaletaValido(29)).toBe(false);
    expect(esCostoPaletaValido(30)).toBe(true);
    expect(esCostoPaletaValido(80)).toBe(true);
    expect(esCostoPaletaValido(81)).toBe(false);
    expect(esCostoPaletaValido(45.5)).toBe(false);
  });
});
