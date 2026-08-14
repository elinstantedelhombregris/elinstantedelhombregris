import { describe, expect, it } from 'vitest';

import { ANGULO_AUREO } from '../radiografia/geometria.js';
import {
  conSeparadorDeMiles,
  DECLARACION_DEL_SEMBRADO,
  sembrarCelda,
  sembrarEnCuadrado,
  semillaDeCelda,
  TECHO_DE_PUNTOS_POR_CELDA,
  VUELTA_AUREA,
} from '../simulacion/sembrado.js';
import { PRECISION_QUE_CONOCE_EL_GENERADOR } from '../simulacion/ubicacion-ensayada.js';

import type { PuntoSembrado } from '../simulacion/sembrado.js';

/**
 * El sembrado.
 *
 * Lo que se verifica acá no es geometría por deporte: es que el dibujo no
 * afirme nada que el modelo no sepa, y que la única propiedad que sí promete
 * —reparto parejo, sin grumos ni huecos— sea medible y esté medida.
 */

const distanciaMinima = (puntos: readonly PuntoSembrado[]): number => {
  let minima = Infinity;
  for (let i = 0; i < puntos.length; i++) {
    for (let j = i + 1; j < puntos.length; j++) {
      const a = puntos[i];
      const b = puntos[j];
      if (a === undefined || b === undefined) continue;
      minima = Math.min(minima, Math.hypot(a.x - b.x, a.y - b.y));
    }
  }
  return minima;
};

/** Cuántos puntos cayeron en cada celda de una grilla `lado × lado`. */
const ocupacion = (puntos: readonly PuntoSembrado[], lado: number): number[] => {
  const celdas = new Array<number>(lado * lado).fill(0);
  for (const p of puntos) {
    const cx = Math.min(lado - 1, Math.floor(p.x * lado));
    const cy = Math.min(lado - 1, Math.floor(p.y * lado));
    celdas[cy * lado + cx] = (celdas[cy * lado + cx] ?? 0) + 1;
  }
  return celdas;
};

describe('el sembrado es determinista', () => {
  it('la misma semilla y el mismo conteo dan el mismo dibujo, siempre', () => {
    expect(sembrarEnCuadrado(120, 7)).toEqual(sembrarEnCuadrado(120, 7));
  });

  it('dos semillas distintas dan dos dibujos distintos', () => {
    // Sin esto, dos provincias con el mismo conteo mostrarían la misma figura
    // y alguien la leería como un patrón del territorio.
    const a = sembrarEnCuadrado(60, 1);
    const b = sembrarEnCuadrado(60, 2);
    expect(a).not.toEqual(b);
    expect(a).toHaveLength(b.length);
  });

  it('no usa el reloj ni el azar del sistema: dos corridas seguidas coinciden', () => {
    const primera = JSON.stringify(sembrarCelda(340, semillaDeCelda(99, 'Chaco')));
    const segunda = JSON.stringify(sembrarCelda(340, semillaDeCelda(99, 'Chaco')));
    expect(primera).toBe(segunda);
  });

  it('la semilla de una celda depende del territorio y de la corrida', () => {
    expect(semillaDeCelda(5, 'Chaco')).not.toBe(semillaDeCelda(5, 'Formosa'));
    expect(semillaDeCelda(5, 'Chaco')).not.toBe(semillaDeCelda(6, 'Chaco'));
    expect(semillaDeCelda(5, 'Chaco')).toBe(semillaDeCelda(5, 'Chaco'));
  });

  it('la vuelta áurea sale del ángulo áureo y no de un literal', () => {
    expect(VUELTA_AUREA).toBeCloseTo(ANGULO_AUREO / (2 * Math.PI), 12);
    // 1/φ² = 2 − φ. Si esto se rompe, alguien cambió la constante compartida.
    expect(VUELTA_AUREA).toBeCloseTo(2 - (1 + Math.sqrt(5)) / 2, 12);
  });
});

describe('el reparto no se apelmaza', () => {
  it('la distancia mínima queda cerca del óptimo, no cerca del azar', () => {
    for (const n of [50, 200, 500]) {
      const puntos = sembrarEnCuadrado(n, 12345);
      const normalizada = distanciaMinima(puntos) * Math.sqrt(n);
      // El máximo teórico —empaquetado hexagonal— ronda 1,07. Un sorteo
      // uniforme del mismo tamaño no llega ni a 0,1: ahí están los grumos que
      // un lector leería como densidad, que es la afirmación que este módulo
      // no puede hacer.
      expect(normalizada, `n = ${String(n)}`).toBeGreaterThan(0.5);
    }
  });

  it('cubre parejo: ninguna cuadrícula queda vacía ni amontonada', () => {
    const puntos = sembrarEnCuadrado(480, 4);
    const celdas = ocupacion(puntos, 4);
    const esperado = 480 / 16;
    expect(Math.min(...celdas)).toBeGreaterThan(esperado * 0.6);
    expect(Math.max(...celdas)).toBeLessThan(esperado * 1.5);
  });

  it('no es una grilla: las coordenadas no se repiten en columnas', () => {
    const puntos = sembrarEnCuadrado(400, 3);
    // Una grilla de 400 puntos tiene 20 valores distintos de `x`. Ésta tiene
    // casi 400: es lo que separa «repartido» de «cuadriculado».
    const distintos = new Set(puntos.map((p) => p.x.toFixed(3))).size;
    expect(distintos).toBeGreaterThan(300);
  });

  it('todo punto cae adentro del cuadrado unitario', () => {
    for (const n of [1, 2, 9, 137, 500]) {
      for (const p of sembrarEnCuadrado(n, n)) {
        expect(p.x, `n = ${String(n)}`).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThan(1);
        expect(p.y).toBeGreaterThan(0);
        expect(p.y).toBeLessThan(1);
      }
    }
  });

  it('el índice viaja con el punto y es correlativo', () => {
    expect(sembrarEnCuadrado(5, 1).map((p) => p.i)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('los bordes', () => {
  it('cero voces no dibujan nada', () => {
    expect(sembrarEnCuadrado(0, 1)).toEqual([]);
  });

  it('un conteo negativo no dibuja nada en vez de romper', () => {
    expect(sembrarEnCuadrado(-4, 1)).toEqual([]);
    expect(sembrarCelda(-4, 1).voces).toBe(0);
    expect(sembrarCelda(-4, 1).puntos).toEqual([]);
  });

  it('una sola voz dibuja un solo punto, y no en el centro exacto', () => {
    const puntos = sembrarEnCuadrado(1, 42);
    expect(puntos).toHaveLength(1);
    // Un punto clavado en el centro se lee como el centroide de la provincia,
    // que es una coordenada que nadie midió.
    expect(puntos[0]?.x).not.toBeCloseTo(0.5, 3);
  });

  it('un conteo fraccionario se trunca, y uno que no es número no dibuja', () => {
    expect(sembrarEnCuadrado(3.9, 1)).toHaveLength(3);
    expect(sembrarEnCuadrado(Number.NaN, 1)).toEqual([]);
    expect(sembrarEnCuadrado(Number.POSITIVE_INFINITY, 1)).toEqual([]);
    expect(sembrarCelda(Number.NaN, 1).voces).toBe(0);
  });
});

describe('el techo se satura y SE DICE', () => {
  it('debajo del techo entra una voz por punto y no hay leyenda', () => {
    const celda = sembrarCelda(120, 8);
    expect(celda.dibujados).toBe(120);
    expect(celda.noDibujados).toBe(0);
    expect(celda.saturada).toBe(false);
    expect(celda.leyenda).toBeNull();
  });

  it('justo en el techo todavía no satura', () => {
    const celda = sembrarCelda(TECHO_DE_PUNTOS_POR_CELDA, 8);
    expect(celda.saturada).toBe(false);
    expect(celda.puntos).toHaveLength(TECHO_DE_PUNTOS_POR_CELDA);
  });

  it('por encima del techo se dibuja el techo y se declara el resto', () => {
    const celda = sembrarCelda(TECHO_DE_PUNTOS_POR_CELDA + 3400, 8);
    expect(celda.puntos).toHaveLength(TECHO_DE_PUNTOS_POR_CELDA);
    expect(celda.noDibujados).toBe(3400);
    expect(celda.saturada).toBe(true);
    expect(celda.leyenda).toBe('+3.400 más');
  });

  it('el conteo NUNCA se recorta: el techo toca el dibujo, no el dato', () => {
    const celda = sembrarCelda(97_000, 8);
    expect(celda.voces).toBe(97_000);
    expect(celda.dibujados).toBe(TECHO_DE_PUNTOS_POR_CELDA);
    expect(celda.voces).toBe(celda.dibujados + celda.noDibujados);
  });

  it('el separador de miles es rioplatense y no depende de `Intl`', () => {
    expect(conSeparadorDeMiles(0)).toBe('0');
    expect(conSeparadorDeMiles(999)).toBe('999');
    expect(conSeparadorDeMiles(1000)).toBe('1.000');
    expect(conSeparadorDeMiles(3400)).toBe('3.400');
    expect(conSeparadorDeMiles(1_234_567)).toBe('1.234.567');
  });
});

describe('la declaración de lo que el sembrado no sabe', () => {
  it('el generador sigue conociendo la provincia y nada más fino', () => {
    /*
     * Esta guarda es el gozne de todo el módulo. Si alguien enseña al generador
     * a ubicar por departamento o por punto, este test falla y obliga a
     * reescribir `DECLARACION_DEL_SEMBRADO` a mano — que es lo que se quiere:
     * la frase que ve una persona no puede quedar desactualizada en silencio.
     */
    expect(PRECISION_QUE_CONOCE_EL_GENERADOR).toBe('province');
  });

  it('la frase nombra el conteo como dato y la posición como dibujo', () => {
    expect(DECLARACION_DEL_SEMBRADO).toContain('el dato');
    expect(DECLARACION_DEL_SEMBRADO).toContain('dibujo');
    expect(DECLARACION_DEL_SEMBRADO).toContain('provincia');
  });
});
