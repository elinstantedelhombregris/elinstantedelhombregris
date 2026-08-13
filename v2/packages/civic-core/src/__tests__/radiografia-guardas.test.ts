import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import * as civicCore from '../index.js';

/**
 * Los tres módulos que MIDEN. La spec R10 dice que φ gobierna la presentación
 * y jamás la medición; esta guarda es lo que hace que eso no dependa de que
 * alguien se acuerde.
 */
const MEDICION = ['similitud.ts', 'grafo.ts', 'nucleos.ts'] as const;

const fuente = (archivo: string): string =>
  readFileSync(fileURLToPath(new URL(`../radiografia/${archivo}`, import.meta.url)), 'utf8');

describe('la guarda de φ', () => {
  it('ningún módulo de medición importa la geometría', () => {
    for (const archivo of MEDICION) {
      expect(fuente(archivo)).not.toMatch(/from '\.\/geometria\.js'/);
    }
  });

  it('ningún módulo de medición nombra φ ni el ángulo áureo', () => {
    for (const archivo of MEDICION) {
      const codigo = fuente(archivo);
      expect(codigo).not.toMatch(/\bPHI\b/);
      expect(codigo).not.toMatch(/\bANGULO_AUREO\b/);
      // El literal de φ y el de √5, por si alguien lo escribe a mano.
      expect(codigo).not.toMatch(/1\.618/);
      expect(codigo).not.toMatch(/Math\.sqrt\(5\)/);
    }
  });
});

describe('el barril', () => {
  it('exporta el motor entero desde @v2/civic-core', () => {
    expect(typeof civicCore.similitudCoseno).toBe('function');
    expect(typeof civicCore.aristasMedidas).toBe('function');
    expect(typeof civicCore.aristasDeclaradas).toBe('function');
    expect(typeof civicCore.nucleosAlUmbral).toBe('function');
    expect(typeof civicCore.fraseDelNucleo).toBe('function');
    expect(typeof civicCore.dosMasLejanos).toBe('function');
    expect(typeof civicCore.esferaDeFibonacci).toBe('function');
    expect(typeof civicCore.espiralAurea).toBe('function');
    expect(typeof civicCore.escalaModular).toBe('function');
    expect(typeof civicCore.EmbebedorFalso).toBe('function');
  });
});

describe('el motor de punta a punta', () => {
  it('agrupa un corpus de juguete, y aflojar el umbral funde los núcleos', async () => {
    const corpus = [
      { id: 's1', texto: 'no me alcanza la plata para comer' },
      { id: 's2', texto: 'no me alcanza la plata a fin de mes' },
      { id: 's3', texto: 'hay un pozo enorme en la esquina' },
      { id: 's4', texto: 'un pozo enorme en la esquina de casa' },
      { id: 's5', texto: 'quiero aprender a tocar la guitarra' },
    ];
    const embebedor = new civicCore.EmbebedorFalso(128);
    const vectores = await embebedor.embeber(corpus.map((c) => c.texto));
    const porId = new Map<string, readonly number[]>(
      corpus.map((c, i) => [c.id, vectores[i] ?? []]),
    );

    const aristas = civicCore.aristasMedidas(porId, 4);
    const apretado = civicCore.nucleosAlUmbral([...porId.keys()], aristas, 0.5);
    const flojo = civicCore.nucleosAlUmbral([...porId.keys()], aristas, 0.05);

    expect(apretado.nucleos.length).toBeGreaterThanOrEqual(2);
    expect(flojo.nucleos.length).toBeLessThanOrEqual(apretado.nucleos.length);
    expect(apretado.nucleos.reduce((n, x) => n + x.ids.length, 0) + apretado.solas.length).toBe(
      corpus.length,
    );
  });
});
