import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { partirDocumentoPlan } from '../split-documento-plan';

import { TOTAL_SEGUN_REGISTRO } from './canon-registro';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CORPUS = resolve(SCRIPT_DIR, '../../../../Iniciativas Estratégicas');

const archivosCorpus = readdirSync(CORPUS).filter(
  (f) => f.startsWith('PLAN') && f.endsWith('_Argentina_ES.md'),
);

describe('partirDocumentoPlan', () => {
  it('separa la cabecera de auditoría del cuerpo', () => {
    const raw = [
      '> **REVISION_PROFUNDA:** completed 2026-04-28',
      '>',
      '> **Presupuesto canónico:** 1.8B/año',
      '',
      '---',
      '',
      '## PREÁMBULO',
      '',
      'Texto del plan.',
    ].join('\n');

    const { cabecera, cuerpo, parches } = partirDocumentoPlan(raw);

    expect(cabecera).toContain('REVISION_PROFUNDA');
    expect(cabecera).toContain('Presupuesto canónico');
    expect(cuerpo).toContain('## PREÁMBULO');
    expect(cuerpo).not.toContain('REVISION_PROFUNDA');
    expect(parches).toBe('');
  });

  it('encuentra la cabecera aunque el documento abra con la portada ASCII (caso PLANDIG)', () => {
    const raw = [
      '```',
      'TENEMOS LOS DATOS',
      '```',
      '',
      '---',
      '',
      '> **REVISION_PROFUNDA:** completed 2026-04-28',
      '',
      '## PREÁMBULO',
      '',
      'Texto.',
    ].join('\n');

    const { cabecera, cuerpo } = partirDocumentoPlan(raw);

    expect(cabecera).toContain('REVISION_PROFUNDA');
    expect(cuerpo).toContain('TENEMOS LOS DATOS');
    expect(cuerpo).toContain('## PREÁMBULO');
    expect(cuerpo).not.toContain('REVISION_PROFUNDA');
  });

  it('corta los parches post-auditoría desde su heading hasta el final', () => {
    const raw = [
      '> **LAST_AUDIT:** 2026-04-26',
      '',
      '## PREÁMBULO',
      '',
      'Texto.',
      '',
      '## Interconexiones críticas con PLANMOV y PLANTER (post-auditoría 2026-04-26)',
      '',
      'Parche uno.',
      '',
      '## Parche post-auditoría 2026-04-26',
      '',
      'Parche dos.',
    ].join('\n');

    const { cuerpo, parches } = partirDocumentoPlan(raw);

    expect(cuerpo).toContain('## PREÁMBULO');
    expect(cuerpo).not.toContain('Parche uno.');
    expect(parches).toContain('Interconexiones críticas');
    expect(parches).toContain('Parche uno.');
    expect(parches).toContain('Parche dos.');
  });

  it('tolera un documento sin parches', () => {
    const raw = ['> **LAST_AUDIT:** 2026-04-26', '', '## PREÁMBULO', '', 'Texto.'].join('\n');
    expect(partirDocumentoPlan(raw).parches).toBe('');
  });

  it('tolera un documento sin cabecera de auditoría', () => {
    const raw = ['# PLANX', '', 'Texto.'].join('\n');
    const { cabecera, cuerpo } = partirDocumentoPlan(raw);
    expect(cabecera).toBe('');
    expect(cuerpo).toContain('# PLANX');
  });

  it('los documentos reales del corpus se parten con cuerpo no vacío, y son los que el registro dice', () => {
    expect(archivosCorpus).toHaveLength(TOTAL_SEGUN_REGISTRO);

    for (const archivo of archivosCorpus) {
      const raw = readFileSync(resolve(CORPUS, archivo), 'utf8');
      const { cabecera, cuerpo, parches } = partirDocumentoPlan(raw);

      expect(cuerpo.length, `${archivo}: cuerpo vacío`).toBeGreaterThan(500);
      expect(cabecera + parches, `${archivo}: ni cabecera ni parches`).not.toBe('');
      expect(cuerpo, `${archivo}: quedó jerga de auditoría en el cuerpo`).not.toContain(
        'REVISION_PROFUNDA',
      );
    }
  });

  it('no pierde ni duplica contenido: cada documento conserva todas sus líneas no vacías', () => {
    const noVacias = (s: string) =>
      s
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l !== '');

    for (const archivo of archivosCorpus) {
      const raw = readFileSync(resolve(CORPUS, archivo), 'utf8');
      const { cabecera, cuerpo, parches } = partirDocumentoPlan(raw);

      const original = [...noVacias(raw)].sort();
      const partido = [...noVacias(cabecera), ...noVacias(cuerpo), ...noVacias(parches)].sort();

      expect(partido, `${archivo}: el split perdió o duplicó líneas`).toEqual(original);
    }
  });
});
