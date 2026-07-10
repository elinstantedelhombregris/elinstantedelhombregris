import { describe, expect, it } from 'vitest';
import {
  BRASAS_POR_HITO,
  HITOS,
  MOTIVO_POR_HITO,
  brasasDeHitos,
  hitosCruzados,
  progresoExpedicion,
  resumenDeCaptura,
} from './expediciones';

describe('progresoExpedicion', () => {
  it('porcentaje entero con piso: 1/3 → 33%', () => {
    expect(progresoExpedicion(1, 3)).toEqual({ porcentaje: 33, estado: 'activa' });
  });

  it('0 entradas → 0%, activa', () => {
    expect(progresoExpedicion(0, 10)).toEqual({ porcentaje: 0, estado: 'activa' });
  });

  it('meta alcanzada → 100%, completa', () => {
    expect(progresoExpedicion(10, 10)).toEqual({ porcentaje: 100, estado: 'completa' });
  });

  it('entradas de más no pasan del 100%', () => {
    expect(progresoExpedicion(25, 10)).toEqual({ porcentaje: 100, estado: 'completa' });
  });

  it('una entrada menos que la meta sigue activa', () => {
    expect(progresoExpedicion(9, 10).estado).toBe('activa');
  });

  it('meta inválida tira error', () => {
    expect(() => progresoExpedicion(1, 0)).toThrow();
    expect(() => progresoExpedicion(1, -5)).toThrow();
    expect(() => progresoExpedicion(1, 2.5)).toThrow();
  });
});

describe('hitosCruzados — cada hito se otorga una sola vez', () => {
  it('cruza el 25% justo (meta 4, 1 entrada)', () => {
    expect(hitosCruzados(1, 4, [])).toEqual([25]);
  });

  it('24% no cruza nada (meta 25, 6 entradas)', () => {
    expect(hitosCruzados(6, 25, [])).toEqual([]); // 24%
  });

  it('un hito ya otorgado no se repite', () => {
    expect(hitosCruzados(2, 4, [25])).toEqual([50]);
    expect(hitosCruzados(2, 4, [25, 50])).toEqual([]);
  });

  it('un salto de 0 a la meta cruza los tres de una', () => {
    expect(hitosCruzados(5, 5, [])).toEqual([25, 50, 100]);
  });

  it('quedarse en el mismo porcentaje no re-otorga', () => {
    expect(hitosCruzados(3, 4, [25, 50])).toEqual([]); // 75%: nada nuevo
  });

  it('al 100% con 25 y 50 ya cobrados solo paga el 100', () => {
    expect(hitosCruzados(4, 4, [25, 50])).toEqual([100]);
  });
});

describe('economía de hitos (spec §3.2)', () => {
  it('paga +10/+15/+25', () => {
    expect(BRASAS_POR_HITO).toEqual({ 25: 10, 50: 15, 100: 25 });
  });

  it('brasasDeHitos suma lo cruzado', () => {
    expect(brasasDeHitos([25, 50, 100])).toBe(50);
    expect(brasasDeHitos([50])).toBe(15);
    expect(brasasDeHitos([])).toBe(0);
  });

  it('cada hito tiene motivo rioplatense para el ledger', () => {
    for (const h of HITOS) {
      expect(MOTIVO_POR_HITO[h].length).toBeGreaterThan(0);
    }
  });
});

describe('resumenDeCaptura — la línea que lleva la estrella', () => {
  it('chips + contador, en el orden de los pasos', () => {
    const pasos = [
      { key: 'producto', microUI: 'chips' },
      { key: 'precio', microUI: 'contador' },
    ];
    expect(resumenDeCaptura(pasos, { producto: 'Pan', precio: 1500 })).toBe(
      'Pan · 1500',
    );
  });

  it('el texto corto habla con su propia voz; la foto no se transcribe', () => {
    const pasos = [
      { key: 'nombre', microUI: 'texto-corto' },
      { key: 'personas', microUI: 'contador' },
      { key: 'foto', microUI: 'foto-guiada' },
    ];
    expect(
      resumenDeCaptura(pasos, {
        nombre: '  Olla del Sur ',
        personas: 80,
        foto: 'file:///tmp/x.jpg',
      }),
    ).toBe('Olla del Sur · 80');
  });

  it('foto y soles solos → null (el texto siempre fue opcional)', () => {
    const pasos = [
      { key: 'foto', microUI: 'foto-guiada' },
      { key: 'urgencia', microUI: 'rating-soles' },
    ];
    expect(resumenDeCaptura(pasos, { foto: 'file:///a.jpg', urgencia: 4 })).toBeNull();
  });

  it('valores vacíos o de tipo equivocado se ignoran', () => {
    const pasos = [
      { key: 'voz', microUI: 'texto-corto' },
      { key: 'cuenta', microUI: 'contador' },
      { key: 'cat', microUI: 'chips' },
    ];
    expect(
      resumenDeCaptura(pasos, { voz: '   ', cuenta: Number.NaN, cat: 7 }),
    ).toBeNull();
    expect(resumenDeCaptura(pasos, {})).toBeNull();
  });
});
