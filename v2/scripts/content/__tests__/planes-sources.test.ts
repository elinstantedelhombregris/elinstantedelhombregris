import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { PLAN_NODES } from '../../../../SocialJusticeHub/shared/arquitecto-data';
import { STRATEGIC_INITIATIVES } from '../../../../SocialJusticeHub/shared/strategic-initiatives';
import { leerPortada } from '../leer-portada';
import { PLANES_SOURCES } from '../planes-sources';
import { TEMATICOS_SEGUN_REGISTRO, TOTAL_SEGUN_REGISTRO } from './canon-registro';

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
    .replace(/[\u0300-\u036f]/g, '') // marcas diacríticas combinantes (tildes, etc.)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

describe('PLANES_SOURCES (canon de la tabla de fuentes)', () => {
  it('tiene las entradas que declara el registro: los temáticos + 1 meta', () => {
    expect(PLANES_SOURCES).toHaveLength(TOTAL_SEGUN_REGISTRO);
    expect(PLANES_SOURCES.filter((p) => p.isMeta)).toHaveLength(1);
    expect(PLANES_SOURCES.filter((p) => !p.isMeta)).toHaveLength(TEMATICOS_SEGUN_REGISTRO);
  });

  it('el meta es PLANRUTA y va en orderIndex 0', () => {
    const meta = PLANES_SOURCES.find((p) => p.isMeta);
    expect(meta?.code).toBe('PLANRUTA');
    expect(meta?.orderIndex).toBe(0);
  });

  it('los ordinales temáticos son 1..N sin huecos ni repetidos, con N del registro', () => {
    const ordinales = PLANES_SOURCES.filter((p) => !p.isMeta)
      .map((p) => p.orderIndex)
      .sort((a, b) => a - b);
    expect(ordinales).toEqual(Array.from({ length: TEMATICOS_SEGUN_REGISTRO }, (_, i) => i + 1));
  });

  it('códigos y slugs únicos, y el slug es el código en minúscula', () => {
    expect(new Set(PLANES_SOURCES.map((p) => p.code)).size).toBe(TOTAL_SEGUN_REGISTRO);
    expect(new Set(PLANES_SOURCES.map((p) => p.slug)).size).toBe(TOTAL_SEGUN_REGISTRO);
    for (const p of PLANES_SOURCES) {
      expect(p.slug).toBe(p.code.toLowerCase());
    }
  });

  it('ningún campo de texto queda vacío', () => {
    for (const p of PLANES_SOURCES) {
      expect(p.title.length, `${p.code}: title vacío`).toBeGreaterThan(0);
      expect(p.nombreInstitucional.length, `${p.code}: nombreInstitucional vacío`).toBeGreaterThan(
        0,
      );
      expect(p.summary.length, `${p.code}: summary vacío`).toBeGreaterThan(40);
    }
  });

  it('cada archivo fuente existe en el corpus', () => {
    for (const p of PLANES_SOURCES) {
      expect(
        existsSync(resolve(CORPUS, p.archivoFuente)),
        `${p.code}: falta ${p.archivoFuente}`,
      ).toBe(true);
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
      expect(
        p.summary,
        `${p.code}: summary no coincide verbatim con strategic-initiatives.ts`,
      ).toBe(iniciativa.summary);
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

      // Cinturón y tirantes: ningún title puede degenerar a vacío (ni acá ni
      // en ninguna otra fila), lo que además volvería trivial cualquier
      // chequeo de prefijo o igualdad hecho sobre soloLetras().
      expect(tituloTabla.length, `${p.code}: title vacío tras soloLetras`).toBeGreaterThan(0);

      // PLANSAL es la única excepción documentada: su portada trae, además del
      // título evocativo, una línea de subtítulo parentético que se excluyó a
      // propósito. Comparamos contra la primera línea del título de portada
      // en vez de contra el bloque entero — un startsWith() sobre el bloque
      // no acota por abajo (una versión truncada, o directamente vacía, del
      // title también sería "prefijo" del bloque completo). Para todos los
      // demás la igualdad es exacta contra el título ya unido.
      if (p.code === 'PLANSAL') {
        const primeraLinea = soloLetras(portada.lineasTitulo[0] ?? '');
        expect(tituloTabla, `${p.code}: title no coincide con la primera línea de la portada`).toBe(
          primeraLinea,
        );
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
