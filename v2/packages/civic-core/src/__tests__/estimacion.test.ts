import { describe, expect, it } from 'vitest';

import {
  anchoDe,
  centroDe,
  estimacionExacta,
  estimacionSinDominio,
  estimarDeMuestras,
  MINIMO_MUESTRAS,
  percentil,
} from '../simulacion/espina/estimacion.js';
import { derivado } from '../simulacion/procedencia.js';

/**
 * La incertidumbre como tipo — spec §3.6.
 *
 * La regla que estos tests protegen es la misma de `brillo.ts`: **nunca un 0
 * para decir «no sé»**. Las tres variantes que no son muestra existen para que
 * no haya que inventar un número.
 */

const muestra = (valores: readonly number[]) =>
  estimarDeMuestras(valores, 'fracción', 'alcance sobre el rango declarado', ['participacion']);

describe('percentil', () => {
  it('interpola linealmente sobre la muestra ordenada', () => {
    const ordenados = [0, 1, 2, 3, 4];
    expect(percentil(ordenados, 0)).toBe(0);
    expect(percentil(ordenados, 1)).toBe(4);
    expect(percentil(ordenados, 0.5)).toBe(2);
    expect(percentil(ordenados, 0.25)).toBe(1);
  });

  it('con un solo valor devuelve ese valor, no un promedio inventado', () => {
    expect(percentil([7], 0.05)).toBe(7);
    expect(percentil([], 0.5)).toBe(0);
  });
});

describe('estimarDeMuestras', () => {
  it('con pocas corridas NO publica percentiles, y dice cuántas hacen falta', () => {
    const pocas = muestra(Array.from({ length: MINIMO_MUESTRAS - 1 }, (_, i) => i));
    expect(pocas.tipo).toBe('sinDato');
    if (pocas.tipo === 'sinDato') {
      expect(pocas.razon).toContain(String(MINIMO_MUESTRAS));
      expect(pocas.razon).toMatch(/extremos/);
    }
  });

  it('sin ninguna corrida no devuelve cero: devuelve sinDato', () => {
    const nada = muestra([]);
    expect(nada.tipo).toBe('sinDato');
    expect(centroDe(nada)).toBeNull();
  });

  it('si todas las corridas dieron lo mismo, es EXACTA y no un intervalo de ancho cero', () => {
    // El modo forma es determinista. Decir «±0» sugeriría que se midió una
    // varianza y dio cero, cuando lo que pasa es que no hay varianza que medir.
    const iguales = muestra(new Array<number>(50).fill(0.42));
    expect(iguales.tipo).toBe('exacta');
    expect(centroDe(iguales)?.valor).toBe(0.42);
    expect(anchoDe(iguales)).toBeNull();
    if (iguales.tipo === 'exacta') {
      expect(iguales.valor.procedencia).toMatchObject({ tipo: 'derivado' });
    }
  });

  it('con muestras de sobra da percentiles ordenados y el centro es la MEDIANA', () => {
    const valores = Array.from({ length: 101 }, (_, i) => i / 100);
    const est = muestra(valores);
    expect(est.tipo).toBe('muestra');
    if (est.tipo !== 'muestra') return;

    expect(est.n).toBe(101);
    // Mediana y no promedio: la respuesta del motor es un escalón, y un
    // promedio cae en un valor que ninguna corrida produjo.
    expect(est.centro.valor).toBeCloseTo(0.5, 10);
    expect(est.minimo.valor).toBe(0);
    expect(est.maximo.valor).toBe(1);
    expect(est.p05.valor).toBeLessThan(est.p25.valor);
    expect(est.p25.valor).toBeLessThan(est.p75.valor);
    expect(est.p75.valor).toBeLessThan(est.p95.valor);
    expect(anchoDe(est)?.valor).toBeCloseTo(est.p95.valor - est.p05.valor, 12);
  });

  it('el orden en que llegan las muestras no cambia la estimación', () => {
    const valores = Array.from({ length: 60 }, (_, i) => Math.sin(i) * 0.5 + 0.5);
    const derecho = muestra(valores);
    const alReves = muestra([...valores].reverse());
    expect(JSON.stringify(derecho)).toBe(JSON.stringify(alReves));
  });
});

describe('las variantes que no son muestra', () => {
  it('una palanca no conectada da sinDominio con su razón, NO una barra en cero', () => {
    const est = estimacionSinDominio('cumplimiento', 'El modo forma no modela señales que cierren.');
    expect(est.tipo).toBe('sinDominio');
    expect(centroDe(est)).toBeNull();
    expect(anchoDe(est)).toBeNull();
    if (est.tipo === 'sinDominio') expect(est.razon).toMatch(/cierren/);
  });

  it('una exacta conserva su procedencia y dice sobre cuántas corridas se apoya', () => {
    // Conservar la procedencia es lo que este test siempre protegió, y sigue.
    // Lo que se agrega es el `n`: «todas dieron lo mismo» pesa distinto con 200
    // corridas que con 4, y antes la frase no decía cuántas eran.
    const est = estimacionExacta(derivado(0.3, 'fracción', 'alcance × persistencia', ['alcance']), 200);
    const proc = centroDe(est)?.procedencia;
    expect(proc?.tipo).toBe('derivado');
    if (proc?.tipo !== 'derivado') throw new Error('la exacta perdió su procedencia');
    expect(proc.de).toEqual(['alcance']);
    expect(proc.formula).toContain('alcance × persistencia');
    expect(proc.formula).toContain('200 corridas');
  });

  it('la misma conclusión sobre cuatro corridas lo dice, y no se disfraza de dominio', () => {
    const pocas = estimacionExacta(derivado(0.3, 'fracción', 'alcance', []), 4);
    const proc = centroDe(pocas)?.procedencia;
    if (proc?.tipo !== 'derivado') throw new Error('la exacta perdió su procedencia');
    expect(proc.formula).toContain('4 corridas');
    // No se bloquea: «las cuatro dieron 0,3» es cierto con cuatro. Lo que no se
    // puede es publicar un p05 y un p95 con cuatro, y de eso se ocupa el piso
    // de `estimarDeMuestras`.
    expect(pocas.tipo).toBe('exacta');
  });
});
