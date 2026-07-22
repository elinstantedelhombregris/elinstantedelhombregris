import { describe, expect, it } from 'vitest';
import { agruparPalitos } from './palitos-logica';

/** Suma de un arreglo de grupos — para chequear que nada se pierde en el reparto. */
const suma = (grupos: number[]) => grupos.reduce((acc, g) => acc + g, 0);

describe('agruparPalitos (spec §3.7)', () => {
  it('0: sin palitos, sin meta → todo vacío', () => {
    expect(agruparPalitos(0)).toEqual({ llenos: [], huecos: [] });
  });

  it('3: un solo grupo parcial de 3, sin cruzar', () => {
    expect(agruparPalitos(3)).toEqual({ llenos: [3], huecos: [] });
  });

  it('5: un quinteto exacto (4 verticales + 1 cruzado)', () => {
    expect(agruparPalitos(5)).toEqual({ llenos: [5], huecos: [] });
  });

  it('7: un quinteto completo + un parcial de 2', () => {
    expect(agruparPalitos(7)).toEqual({ llenos: [5, 2], huecos: [] });
  });

  it('23: cuatro quintetos + un parcial de 3', () => {
    const r = agruparPalitos(23);
    expect(r).toEqual({ llenos: [5, 5, 5, 5, 3], huecos: [] });
    expect(suma(r.llenos)).toBe(23);
  });

  it('con `de`: 3 de 10 → cierra el quinteto (2) y agrega uno entero (5)', () => {
    const r = agruparPalitos(3, 10);
    expect(r).toEqual({ llenos: [3], huecos: [2, 5] });
    expect(suma(r.llenos) + suma(r.huecos)).toBe(10);
  });

  it('con `de`: 0 de 5 → sin llenos, un quinteto entero hueco', () => {
    expect(agruparPalitos(0, 5)).toEqual({ llenos: [], huecos: [5] });
  });

  it('con `de`: 0 de 12 → sin llenos, dos quintetos huecos + parcial de 2', () => {
    const r = agruparPalitos(0, 12);
    expect(r).toEqual({ llenos: [], huecos: [5, 5, 2] });
  });

  it('con `de`: el último lleno ya cierra un quinteto → huecos arrancan frescos', () => {
    // total=5 (un quinteto cerrado), de=13: faltan 8 → [5, 3], sin cierre parcial.
    expect(agruparPalitos(5, 13)).toEqual({ llenos: [5], huecos: [5, 3] });
  });

  it('con `de`: meta ya alcanzada exacto → huecos vacío', () => {
    expect(agruparPalitos(10, 10)).toEqual({ llenos: [5, 5], huecos: [] });
  });

  it('con `de`: total supera la meta → huecos vacío, llenos muestra el total real', () => {
    expect(agruparPalitos(12, 5)).toEqual({ llenos: [5, 5, 2], huecos: [] });
  });

  it('presupuesto de pulsos: 5 puntos, 2 gastados → 3 llenos + 2 huecos', () => {
    // Corriente: Palitos total={restantes} de={5} (spec §4/§8).
    expect(agruparPalitos(3, 5)).toEqual({ llenos: [3], huecos: [2] });
  });

  it('defensivo: negativos y no-enteros truncan a un entero no negativo', () => {
    expect(agruparPalitos(-4)).toEqual({ llenos: [], huecos: [] });
    expect(agruparPalitos(3.9)).toEqual({ llenos: [3], huecos: [] });
    expect(agruparPalitos(3, -1)).toEqual({ llenos: [3], huecos: [] });
  });
});
