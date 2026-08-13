import {
  conVariable,
  derivado,
  hipotesis,
  verificarPais,
  type SelloDelModelo,
} from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { corridasPrevistas } from '../barrido-mensajes';
import { escribirDisenoEnHash, leerDisenoDelHash, leerRelojDelHash } from '../diseno-url';
import { medirSalto, pintarNube } from '../nube-pintor';
import { esHipotesis, explicarProcedencia } from '../simulacion-lectura';
import { construirPais, disenoPorDefecto } from '../simulacion-pais';

import { esRutaPapel } from '~/layouts/papel-routes';

/**
 * Las piezas puras del módulo — lo que se puede verificar sin montar nada.
 *
 * Lo que se afirma acá no es que React renderice: es que **la nube detecta el
 * escalón**, que **un link roto no rompe la página**, y que **una hipótesis de
 * modelo no se puede leer como un derivado**. Las tres son afirmaciones sobre
 * el producto, y las tres se romperían en silencio.
 */

const AHORA = 1_800_000_000_000;

const SELLO: SelloDelModelo = {
  modelo: 'llama3.1:8b-instruct-q4_K_M',
  digest: 'abc123def456789',
  temperatura: 0,
  poblacionHuella: 'b208ee34',
  semilla: 7,
  generadaEn: AHORA,
};

describe('la nube', () => {
  it('detecta el escalón: la respuesta del motor no es una rampa', () => {
    // La forma medida sobre el motor: nada, nada, nada, y de golpe todo.
    const puntos = [
      { entrada: 0, salida: 0.04 },
      { entrada: 200, salida: 0.04 },
      { entrada: 400, salida: 0.04 },
      { entrada: 600, salida: 1 },
      { entrada: 800, salida: 1 },
    ];
    const salto = medirSalto(puntos);
    expect(salto).not.toBeNull();
    expect(salto?.desde).toBe(400);
    expect(salto?.hasta).toBe(600);
    // Todo el recorrido se hizo en un solo tramo.
    expect(salto?.fraccion).toBeCloseTo(1, 5);
  });

  it('no inventa un escalón donde hay una rampa', () => {
    const rampa = [0, 1, 2, 3, 4, 5].map((i) => ({ entrada: i, salida: i / 5 }));
    expect(medirSalto(rampa)).toBeNull();
  });

  it('con una salida que no se movió lo dice, en vez de dibujar una recta al tope', () => {
    const plana = [0, 1, 2].map((i) => ({ entrada: i, salida: 0.5 }));
    const nube = pintarNube(plana);
    expect(nube.plana).toBe(true);
    expect(nube.salto).toBeNull();
    // Centrada, no pegada a un borde: una recta arriba se leería «llegó al máximo».
    const primera = nube.puntos[0];
    expect(primera).toBeDefined();
    expect(primera?.y).toBeGreaterThan(nube.margen.arr);
    expect(primera?.y).toBeLessThan(nube.alto - nube.margen.abj);
  });

  it('no produce NaN con un solo punto', () => {
    const nube = pintarNube([{ entrada: 3, salida: 0.2 }]);
    for (const punto of nube.puntos) {
      expect(Number.isFinite(punto.x)).toBe(true);
      expect(Number.isFinite(punto.y)).toBe(true);
    }
  });
});

describe('el diseño en la URL', () => {
  const pais = construirPais(AHORA);
  const base = disenoPorDefecto(pais);

  it('va y vuelve sin perder la semilla ni las variables', () => {
    const movido = {
      ...base,
      base: conVariable({ ...base.base, semilla: 42 }, 'participacion', 350),
    };
    const { diseno, avisos } = leerDisenoDelHash(escribirDisenoEnHash(movido, pais), base);
    expect(diseno.base.semilla).toBe(42);
    expect(diseno.base.forma.participacion).toBeCloseTo(350, 6);
    expect(avisos).toEqual([]);
  });

  it('el link lleva el reloj del país, y por eso se puede volver a armar el mismo país', () => {
    // Sin esto cada carga inventa un `ahora` nuevo, `huellaDePais` cambia y
    // `verificarPais` tira: el link compartido nace muerto y el propio, al
    // recargar, también.
    const reloj = leerRelojDelHash(escribirDisenoEnHash(base, pais));
    expect(reloj).toBe(AHORA);
    expect(construirPais(reloj ?? 0).huella).toBe(pais.huella);
  });

  it('un hash sin diseño, roto o sin reloj no devuelve un instante inventado', () => {
    expect(leerRelojDelHash('')).toBeNull();
    expect(leerRelojDelHash('#d=%7Bno-es-json')).toBeNull();
    const viejo = JSON.stringify({ version: 1, paisHuella: pais.huella });
    expect(leerRelojDelHash(`#d=${encodeURIComponent(viejo)}`)).toBeNull();
  });

  it('un link del formato viejo abre igual, y dice que no traía su reloj', () => {
    const viejo = JSON.stringify({ version: 1, paisHuella: pais.huella, variables: {} });
    const { avisos } = leerDisenoDelHash(`#d=${encodeURIComponent(viejo)}`, base);
    expect(avisos.join(' ')).toContain('no trae el reloj de su país');
  });

  it('un diseño de otro país corre contra el de acá en vez de matar la página', () => {
    // El caso que queda cuando el lado medido deje de estar vacío: mismo reloj,
    // otras voces, otra huella. El diseño es el mismo; el dato, no. Eso se dice
    // y se sigue corriendo — no se tira.
    const otroPais = construirPais(AHORA + 60_000);
    const { diseno, avisos } = leerDisenoDelHash(
      escribirDisenoEnHash(base, otroPais),
      base,
    );
    expect(diseno.base.paisHuella).toBe(pais.huella);
    expect(() => {
      verificarPais(diseno.base, pais);
    }).not.toThrow();
    expect(avisos.join(' ')).toMatch(/otro país/i);
    expect(avisos.join(' ')).toContain(otroPais.huella);
  });

  it('ante basura abre el diseño por defecto y lo dice, en vez de romper', () => {
    const { diseno, avisos } = leerDisenoDelHash('#d=%7Bno-es-json', base);
    expect(diseno.base.semilla).toBe(base.base.semilla);
    expect(avisos.join(' ')).toContain('no se pudo leer');
  });

  it('acota un valor fuera del dominio y avisa que lo acotó', () => {
    const roto = JSON.stringify({ variables: { participacion: 1e12 } });
    const { diseno, avisos } = leerDisenoDelHash(`#d=${encodeURIComponent(roto)}`, base);
    expect(diseno.base.forma.participacion).toBeLessThanOrEqual(1000);
    expect(avisos.join(' ')).toContain('fuera de su dominio declarado');
  });

  it('un hash vacío no genera avisos', () => {
    expect(leerDisenoDelHash('', base).avisos).toEqual([]);
  });
});

describe('la procedencia en pantalla', () => {
  it('una hipótesis de modelo nombra el modelo y no se lee como un derivado', () => {
    const crudo = derivado(0.5, 'fracción', 'alcance × persistencia', ['alcance', 'persistencia']);
    const sellada = hipotesis(crudo, SELLO);

    expect(esHipotesis(crudo.procedencia)).toBe(false);
    expect(esHipotesis(sellada.procedencia)).toBe(true);

    const prosa = explicarProcedencia(sellada.procedencia);
    expect(prosa).toContain('Hipótesis de llama3.1:8b-instruct-q4_K_M');
    expect(prosa).toContain('no medida');
    // La fórmula NO se pierde: la cuarta procedencia envuelve, no reemplaza.
    expect(prosa).toContain('alcance × persistencia');
  });
});

describe('el presupuesto del barrido', () => {
  const pais = construirPais(AHORA);
  const base = disenoPorDefecto(pais);

  it('la cota del método umbral crece con los territorios', () => {
    const previstas = corridasPrevistas(base, 12);
    expect(previstas).toBe(24 * 19);
  });

  it('el hipercubo pide exactamente sus muestras', () => {
    expect(corridasPrevistas({ ...base, metodo: { tipo: 'hipercubo', muestras: 400 } }, 12)).toBe(400);
  });

  it('una por vez pide pasos × variables conectadas, no × las dieciocho', () => {
    expect(corridasPrevistas({ ...base, metodo: { tipo: 'unaPorVez', pasos: 11 } }, 12)).toBe(132);
  });
});

describe('el país de la simulación', () => {
  it('los dos hilos arman la misma huella con el mismo reloj', () => {
    expect(construirPais(AHORA).huella).toBe(construirPais(AHORA).huella);
  });

  it('un reloj distinto es otro país, y por eso la huella cambia', () => {
    expect(construirPais(AHORA).huella).not.toBe(construirPais(AHORA + 1).huella);
  });

  it('el lado medido arranca vacío: es el estado real de la base, no un supuesto', () => {
    expect(construirPais(AHORA).base.voces).toEqual([]);
  });
});

describe('la ruta', () => {
  it('nace papel', () => {
    expect(esRutaPapel('/la-simulacion')).toBe(true);
  });
});
