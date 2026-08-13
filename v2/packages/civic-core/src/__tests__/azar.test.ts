import { describe, expect, it } from 'vitest';

import {
  acumularHuella,
  azarDe,
  barajar,
  crearAzar,
  huellaDeTexto,
  huellaHex,
  SEMILLA_FNV,
} from '../simulacion/espina/azar.js';

/**
 * El azar sembrado — spec §2.7 y §3.7.
 *
 * Estos no son tests de rutina: sin ellos, el análisis de sensibilidad entero
 * es imposible. MiroFish no tiene una sola llamada a `random.seed` en todo su
 * backend, y por eso dos corridas idénticas suyas dan resultados distintos y
 * nadie puede decir cuánto de la diferencia fue la palanca.
 */

describe('azarDe — el mezclador sin estado', () => {
  it('misma semilla y mismas coordenadas: mismo número, siempre', () => {
    for (let i = 0; i < 100; i++) {
      expect(azarDe(7, i, 3)).toBe(azarDe(7, i, 3));
    }
  });

  it('otra semilla: otro número', () => {
    let distintos = 0;
    for (let i = 0; i < 200; i++) {
      if (azarDe(7, i) !== azarDe(8, i)) distintos += 1;
    }
    // Que alguno coincida por azar es posible; que coincidan casi todos sería
    // el síntoma de un mezclador que ignora la semilla.
    expect(distintos).toBeGreaterThan(195);
  });

  it('cae siempre en [0, 1), y nunca toca el 1', () => {
    for (let i = 0; i < 5000; i++) {
      const u = azarDe(42, i);
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
    }
  });

  it('se reparte parejo: diez cajones, ninguno vacío ni desbordado', () => {
    const cajones = new Array<number>(10).fill(0);
    const n = 20_000;
    for (let i = 0; i < n; i++) {
      const c = Math.floor(azarDe(99, i) * 10);
      cajones[c] = (cajones[c] ?? 0) + 1;
    }
    for (const cuantos of cajones) {
      // ±10 % del esperado. No es un test de calidad criptográfica: es que no
      // haya un sesgo grosero que le meta forma al muestreo.
      expect(cuantos).toBeGreaterThan(n / 10 - n / 100);
      expect(cuantos).toBeLessThan(n / 10 + n / 100);
    }
  });

  it('coordenadas distintas dan sorteos distintos, y el orden importa', () => {
    expect(azarDe(1, 2, 3)).not.toBe(azarDe(1, 3, 2));
    expect(azarDe(1, 2)).not.toBe(azarDe(1, 2, 0));
  });

  it('AGREGAR UN CONSUMIDOR NO CORRE EL AZAR DE LOS DEMÁS', () => {
    // La propiedad que un PRNG lineal no da, y la razón por la que el azar es
    // por coordenada: dos corridas con distinto N tienen que seguir siendo
    // comparables. Con una corriente única, sortear una vez más para la
    // persona 500 correría todos los sorteos de la 501 en adelante.
    const antes = [azarDe(5, 1, 0), azarDe(5, 2, 0), azarDe(5, 3, 0)];
    const conUnoMas = [azarDe(5, 1, 0), azarDe(5, 1, 1), azarDe(5, 2, 0), azarDe(5, 3, 0)];
    expect([conUnoMas[0], conUnoMas[2], conUnoMas[3]]).toEqual(antes);
  });
});

describe('la corriente con estado', () => {
  it('dos corrientes con la misma semilla dan la misma secuencia', () => {
    const a = crearAzar(123);
    const b = crearAzar(123);
    for (let i = 0; i < 50; i++) expect(a.siguiente()).toBe(b.siguiente());
  });

  it('dos semillas distintas divergen en el primer paso', () => {
    expect(crearAzar(1).siguiente()).not.toBe(crearAzar(2).siguiente());
  });

  it('`entero` cae en [0, n) y nunca devuelve n', () => {
    const azar = crearAzar(7);
    for (let i = 0; i < 2000; i++) {
      const v = azar.entero(6);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(6);
    }
    // Sin dónde sortear no se inventa un valor.
    expect(azar.entero(0)).toBe(0);
    expect(azar.entero(-3)).toBe(0);
  });

  it('una rama no depende de lo que consumió la otra ni el padre', () => {
    const padre = crearAzar(11);
    const solaA = padre.rama('activar').siguiente();

    const otro = crearAzar(11);
    otro.siguiente();
    otro.siguiente();
    otro.rama('corroborar').siguiente();
    const conRuido = otro.rama('activar').siguiente();

    expect(conRuido).toBe(solaA);
  });

  it('dos ramas distintas no comparten corriente', () => {
    const azar = crearAzar(11);
    expect(azar.rama('activar').siguiente()).not.toBe(azar.rama('corroborar').siguiente());
  });
});

describe('barajar', () => {
  it('es determinista con la misma semilla y no muta la entrada', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = barajar(original, crearAzar(3));
    const b = barajar(original, crearAzar(3));
    expect(a).toEqual(b);
    expect(original).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('es una permutación: no pierde ni inventa elementos', () => {
    for (let semilla = 0; semilla < 50; semilla++) {
      const original = Array.from({ length: 30 }, (_, i) => i);
      const revuelto = barajar(original, crearAzar(semilla));
      expect([...revuelto].sort((x, y) => x - y)).toEqual(original);
    }
  });
});

describe('la huella', () => {
  it('el mismo texto da la misma huella', () => {
    expect(huellaDeTexto('Buenos Aires')).toBe(huellaDeTexto('Buenos Aires'));
  });

  it('un cambio de un carácter la cambia', () => {
    expect(huellaDeTexto('Buenos Aires')).not.toBe(huellaDeTexto('Buenos Airas'));
  });

  it('acumular por partes da lo mismo que hashear el todo', () => {
    const partes = acumularHuella(acumularHuella(SEMILLA_FNV, 'Buenos '), 'Aires');
    expect(partes).toBe(huellaDeTexto('Buenos Aires'));
  });

  it('en hexa son siempre ocho caracteres', () => {
    expect(huellaHex(0)).toBe('00000000');
    expect(huellaHex(huellaDeTexto('x'))).toHaveLength(8);
  });
});
