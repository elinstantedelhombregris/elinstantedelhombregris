import { describe, expect, it } from 'vitest';
import type { ListeningTheme } from '../civic/types';
import { OFICIOS, oficioDeTema, oficioPorId } from './oficios';

// Hardcoded themes list to avoid importing listening.ts which has heavy db dependencies
const LISTENING_THEMES: readonly ListeningTheme[] = [
  'food',
  'housing',
  'work',
  'care',
  'health',
  'education',
  'environment',
  'mobility',
  'safety',
  'culture',
  'democracy',
];

const HEX = /^#[0-9a-fA-F]{6}$/;

describe('oficios', () => {
  it('hay 11 oficios con ids únicos, color hex e ícono', () => {
    expect(OFICIOS).toHaveLength(11);
    expect(new Set(OFICIOS.map((o) => o.id)).size).toBe(11);
    for (const o of OFICIOS) {
      expect(o.color).toMatch(HEX);
      expect(o.icono.length).toBeGreaterThan(0);
      expect(o.nombre.length).toBeGreaterThan(0);
    }
  });

  it('todo tema de escucha mapea a un oficio existente', () => {
    for (const tema of LISTENING_THEMES) {
      const id = oficioDeTema(tema);
      expect(oficioPorId(id)).not.toBeNull();
    }
  });

  it('oficioPorId devuelve null para desconocidos', () => {
    expect(oficioPorId('no-existe')).toBeNull();
  });
});
