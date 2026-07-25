import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { PLANES_SOURCES } from '../planes-sources';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CORPUS = resolve(SCRIPT_DIR, '../../../../Iniciativas Estratégicas');

describe('PLANES_SOURCES (canon de la tabla de fuentes)', () => {
  it('tiene 23 entradas: 22 temáticas + 1 meta', () => {
    expect(PLANES_SOURCES).toHaveLength(23);
    expect(PLANES_SOURCES.filter((p) => p.isMeta)).toHaveLength(1);
    expect(PLANES_SOURCES.filter((p) => !p.isMeta)).toHaveLength(22);
  });

  it('el meta es PLANRUTA y va en orderIndex 0', () => {
    const meta = PLANES_SOURCES.find((p) => p.isMeta);
    expect(meta?.code).toBe('PLANRUTA');
    expect(meta?.orderIndex).toBe(0);
  });

  it('los ordinales temáticos son 1..22 sin huecos ni repetidos', () => {
    const ordinales = PLANES_SOURCES.filter((p) => !p.isMeta)
      .map((p) => p.orderIndex)
      .sort((a, b) => a - b);
    expect(ordinales).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
  });

  it('códigos y slugs únicos, y el slug es el código en minúscula', () => {
    expect(new Set(PLANES_SOURCES.map((p) => p.code)).size).toBe(23);
    expect(new Set(PLANES_SOURCES.map((p) => p.slug)).size).toBe(23);
    for (const p of PLANES_SOURCES) {
      expect(p.slug).toBe(p.code.toLowerCase());
    }
  });

  it('ningún campo de texto queda vacío', () => {
    for (const p of PLANES_SOURCES) {
      expect(p.title.length, `${p.code}: title vacío`).toBeGreaterThan(0);
      expect(
        p.nombreInstitucional.length,
        `${p.code}: nombreInstitucional vacío`,
      ).toBeGreaterThan(0);
      expect(p.summary.length, `${p.code}: summary vacío`).toBeGreaterThan(40);
    }
  });

  it('cada archivo fuente existe en el corpus', () => {
    for (const p of PLANES_SOURCES) {
      expect(existsSync(resolve(CORPUS, p.archivoFuente)), `${p.code}: falta ${p.archivoFuente}`).toBe(
        true,
      );
    }
  });
});
