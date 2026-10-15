import { describe, expect, it } from 'vitest';

import { compararUnidades } from '../comparar.js';

import type { UnidadCensal } from '@v2/shared';

const censal = (codigo: string, nombre = 'San Martín'): UnidadCensal => ({
  nivel: 'municipality',
  codigo,
  nombre,
  provincia: codigo.slice(0, 2),
  departamento: null,
  gobiernoLocal: null,
  aglomerado: null,
  categoria: 'MU',
  residual: false,
  fila: 2,
});
describe('Conciliación sin equivalencias implícitas', () => {
  it('no fusiona homónimos, códigos sin geometría ni geometrías sin código', () => {
    const r = compararUnidades(
      [censal('060001'), censal('060002')],
      [
        { nivel: 'municipality', codigo: '060001', nombre: 'San Martín' },
        { nivel: 'municipality', codigo: null, nombre: 'San Martín' },
      ],
      [{ id: 1, codigo: '060001', nombre: 'San Martin', vigente: true }],
      'municipality',
    );
    expect(r).toHaveLength(3);
    expect(r[0]?.incidencias).toEqual([]);
    expect(r[1]?.operativo).toBeNull();
    expect(r[2]?.censo).toBeNull();
  });
  it('conserva unidades residuales, nombres distintos y vigencia', () => {
    const r = compararUnidades(
      [{ ...censal('149998', 'Indeterminado'), residual: true }],
      [],
      [{ id: 9, codigo: '149998', nombre: 'Otra unidad', vigente: false }],
      'municipality',
    );
    expect(r[0]?.incidencias.join(' ')).toContain('residual');
    expect(r[0]?.incidencias.join(' ')).toContain('no vigente');
    expect(r[0]?.incidencias.join(' ')).toContain('Denominaciones distintas');
  });
});
