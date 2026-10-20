import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PASOS_DE_LA_REVISION, PASOS_DE_QUIEN_IMPULSA, estadosCampana } from '@v2/shared';
import { describe, expect, it } from 'vitest';

import { negarPaso } from '../pasos.js';

import type { EstadoCampana } from '@v2/shared';

/** `PASOS` vive en `routes.ts` (el espejo web lo lee de ahí); se lee igual que en la web. */
function pasosDelServidor(): Record<EstadoCampana, EstadoCampana[]> {
  const fuente = readFileSync(resolve(import.meta.dirname, '../routes.ts'), 'utf8');
  const literal = /const PASOS[^=]*=\s*(\{[\s\S]*?\n\});/.exec(fuente)?.[1];
  if (!literal) throw new Error('No encontré PASOS en routes.ts.');
  return JSON.parse(
    literal
      .replace(/(\w+):/g, '"$1":')
      .replace(/'/g, '"')
      .replace(/,(\s*[}\]])/g, '$1'),
  ) as Record<EstadoCampana, EstadoCampana[]>;
}

const codigo = (p: Parameters<typeof negarPaso>[0]) => negarPaso(p)?.code ?? null;

describe('negarPaso', () => {
  it('quien impulsa sin ser de la administración presenta, retira y coordina, pero no abre ni programa', () => {
    const impulsa = { admin: false, impulsa: true };
    expect(codigo({ ...impulsa, desde: 'borrador', hacia: 'reuniendo' })).toBeNull();
    expect(codigo({ ...impulsa, desde: 'reuniendo', hacia: 'borrador' })).toBeNull();
    expect(codigo({ ...impulsa, desde: 'abierta', hacia: 'pausada' })).toBeNull();
    expect(codigo({ ...impulsa, desde: 'pausada', hacia: 'abierta' })).toBeNull();
    expect(codigo({ ...impulsa, desde: 'en_devolucion', hacia: 'cerrada' })).toBeNull();
    expect(codigo({ ...impulsa, desde: 'borrador', hacia: 'abierta' })).toBe('NOT_ADMIN');
    expect(codigo({ ...impulsa, desde: 'borrador', hacia: 'programada' })).toBe('NOT_ADMIN');
    expect(codigo({ ...impulsa, desde: 'por_revisar', hacia: 'abierta' })).toBe('NOT_ADMIN');
    expect(codigo({ ...impulsa, desde: 'por_revisar', hacia: 'reuniendo' })).toBe('NOT_ADMIN');
    expect(codigo({ ...impulsa, desde: 'en_devolucion', hacia: 'abierta' })).toBe('NOT_ADMIN');
    expect(codigo({ ...impulsa, desde: 'programada', hacia: 'pausada' })).toBe('NOT_ADMIN');
  });

  it('una cuenta común no toca la campaña de otra persona', () => {
    const ajena = { admin: false, impulsa: false };
    expect(codigo({ ...ajena, desde: 'reuniendo', hacia: 'borrador' })).toBe('SIN_PERMISO');
    expect(codigo({ ...ajena, desde: 'abierta', hacia: 'pausada' })).toBe('SIN_PERMISO');
    expect(codigo({ ...ajena, desde: 'borrador', hacia: 'abierta' })).toBe('NOT_ADMIN');
  });

  it('la administración, sobre una campaña ajena, sólo decide la propuesta revisada o la programada', () => {
    const revision = { admin: true, impulsa: false };
    expect(codigo({ ...revision, desde: 'por_revisar', hacia: 'abierta' })).toBeNull();
    expect(codigo({ ...revision, desde: 'por_revisar', hacia: 'programada' })).toBeNull();
    expect(codigo({ ...revision, desde: 'por_revisar', hacia: 'reuniendo' })).toBeNull();
    expect(codigo({ ...revision, desde: 'programada', hacia: 'abierta' })).toBeNull();
    expect(codigo({ ...revision, desde: 'borrador', hacia: 'abierta' })).toBe('SIN_PERMISO');
    expect(codigo({ ...revision, desde: 'reuniendo', hacia: 'borrador' })).toBe('SIN_PERMISO');
    expect(codigo({ ...revision, desde: 'abierta', hacia: 'pausada' })).toBe('SIN_PERMISO');
  });

  it('la administración, en su propia campaña, da cualquier paso del recorrido', () => {
    const pasos = pasosDelServidor();
    for (const desde of estadosCampana)
      for (const hacia of pasos[desde])
        expect(codigo({ desde, hacia, admin: true, impulsa: true })).toBeNull();
  });

  it('los pasos de quien impulsa y de la revisión son pasos que el recorrido ya tiene', () => {
    const pasos = pasosDelServidor();
    for (const tabla of [PASOS_DE_QUIEN_IMPULSA, PASOS_DE_LA_REVISION])
      for (const desde of estadosCampana)
        for (const hacia of tabla[desde] ?? []) expect(pasos[desde]).toContain(hacia);
  });

  it('nadie pide a mano el paso a revisión: lo da el sistema', () => {
    expect(pasosDelServidor().reuniendo).not.toContain('por_revisar');
  });
});
