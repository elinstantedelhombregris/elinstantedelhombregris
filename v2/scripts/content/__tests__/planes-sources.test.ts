import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { PLAN_NODES } from '../../../../SocialJusticeHub/shared/arquitecto-data';
import { STRATEGIC_INITIATIVES } from '../../../../SocialJusticeHub/shared/strategic-initiatives';
import { leerPortada } from '../leer-portada';
import { PLANES_SOURCES } from '../planes-sources';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CORPUS = resolve(SCRIPT_DIR, '../../../../Iniciativas Estratégicas');

/**
 * Deja solo las letras y los dígitos, en mayúscula y sin acentos. Permite las
 * transformaciones editoriales autorizadas — caja, tildes y la puntuación del
 * corte de línea — y prohíbe lo demás: una palabra agregada, quitada o
 * cambiada rompe el test.
 */
function soloLetras(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

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

  it('summary es copia verbatim de strategic-initiatives.ts (PLANRUTA es el único sin iniciativa)', () => {
    const sinIniciativa: string[] = [];
    for (const p of PLANES_SOURCES) {
      const iniciativa = STRATEGIC_INITIATIVES.find((i) => i.title === p.code);
      if (!iniciativa) {
        sinIniciativa.push(p.code);
        continue;
      }
      expect(p.summary, `${p.code}: summary no coincide verbatim con strategic-initiatives.ts`).toBe(
        iniciativa.summary,
      );
    }
    expect(sinIniciativa).toEqual(['PLANRUTA']);
  });

  it('orderIndex es el ordinal de arquitecto-data.ts', () => {
    const meta = PLANES_SOURCES.find((p) => p.isMeta);
    expect(meta?.code).toBe('PLANRUTA');
    expect(meta?.orderIndex).toBe(0);
    expect(meta?.isMeta).toBe(true);

    for (const p of PLANES_SOURCES) {
      if (p.isMeta) continue;
      const nodo = PLAN_NODES.find((n) => n.id === p.code);
      expect(nodo, `${p.code}: sin nodo en arquitecto-data.ts`).toBeDefined();
      expect(p.orderIndex, `${p.code}: orderIndex no coincide con el ordinal`).toBe(nodo?.ordinal);
    }
  });

  it('title y nombreInstitucional conservan las letras de la portada del corpus', () => {
    for (const p of PLANES_SOURCES) {
      const raw = readFileSync(resolve(CORPUS, p.archivoFuente), 'utf8');
      const portada = leerPortada(raw);

      const tituloTabla = soloLetras(p.title);
      const tituloPortada = soloLetras(portada.title);
      // PLANSAL es la única excepción documentada: su portada trae, además del
      // título evocativo, una línea de subtítulo parentético que se excluyó a
      // propósito. Para todos los demás la igualdad es exacta; para PLANSAL
      // alcanza con que el título de la tabla sea prefijo del de la portada —
      // esa regla sigue detectando cualquier palabra inventada.
      if (p.code === 'PLANSAL') {
        expect(
          tituloPortada.startsWith(tituloTabla),
          `${p.code}: title de la tabla no es prefijo del título de la portada`,
        ).toBe(true);
      } else {
        expect(tituloTabla, `${p.code}: title no coincide con la portada`).toBe(tituloPortada);
      }

      expect(
        soloLetras(p.nombreInstitucional),
        `${p.code}: nombreInstitucional no coincide con la portada`,
      ).toBe(soloLetras(portada.nombreInstitucional));
    }
  });
});
