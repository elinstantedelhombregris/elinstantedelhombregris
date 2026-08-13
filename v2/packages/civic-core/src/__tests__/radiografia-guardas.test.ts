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

/**
 * Los nombres prohibidos NO se escriben a mano: se **derivan de lo que
 * `geometria.ts` exporta hoy**. La primera versión de esta guarda listaba
 * `PHI` y `ANGULO_AUREO` y nada más, y por eso se podía meter φ adentro del
 * umbral escribiendo `umbral / escalaModular(1)` con los cuatro tests en
 * verde. Derivar la lista hace que agregar un export a `geometria.ts` extienda
 * la guarda solo, sin que nadie se acuerde de venir acá.
 */
const exportadosDeGeometria = (): string[] => {
  const codigo = fuente('geometria.ts');
  const nombres = [...codigo.matchAll(/export\s+(?:const|function|class|interface|type)\s+(\w+)/g)]
    .map((m) => m[1])
    .filter((n): n is string => typeof n === 'string');
  if (nombres.length === 0) throw new Error('la guarda no encontró exports en geometria.ts');
  return nombres;
};

describe('la guarda de φ', () => {
  it('ningún módulo de medición importa la geometría, se escriba como se escriba', () => {
    for (const archivo of MEDICION) {
      // Cualquier ruta que termine en `geometria`, con o sin extensión, con
      // comillas simples o dobles, y también en `import(...)` dinámico.
      expect(fuente(archivo)).not.toMatch(/['"][^'"]*geometria(\.js)?['"]/);
    }
  });

  it('ningún módulo de medición nombra un export de la geometría', () => {
    const prohibidos = exportadosDeGeometria();
    // Si esto se rompe, es que geometria.ts dejó de exportar lo que exportaba.
    expect(prohibidos).toEqual(
      expect.arrayContaining(['PHI', 'ANGULO_AUREO', 'esferaDeFibonacci', 'espiralAurea', 'escalaModular']),
    );

    for (const archivo of MEDICION) {
      const codigo = fuente(archivo);
      for (const nombre of prohibidos) {
        expect(codigo).not.toMatch(new RegExp(`\\b${nombre}\\b`));
      }
    }
  });

  it('ningún módulo de medición escribe φ a mano', () => {
    for (const archivo of MEDICION) {
      const codigo = fuente(archivo);
      expect(codigo).not.toMatch(/1\.618/);
      expect(codigo).not.toMatch(/0\.618/);
      expect(codigo).not.toMatch(/2\.618/);
      expect(codigo).not.toMatch(/137\.5/);
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
