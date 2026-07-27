import { describe, expect, it } from 'vitest';

import { AREA_VACIA, claseDe, contarArea, renglonesDeConteo } from '../conteo';

import type { SenalContable } from '../conteo';
import type { GeoPoint } from '@v2/civic-core';

/** Un rectángulo chico alrededor del microcentro porteño. */
const AREA: GeoPoint[] = [
  { lat: -34.58, lng: -58.42 },
  { lat: -34.58, lng: -58.36 },
  { lat: -34.63, lng: -58.36 },
  { lat: -34.63, lng: -58.42 },
];

const ADENTRO = { lat: -34.6037, lng: -58.3816 };
const AFUERA = { lat: -31.4201, lng: -64.1888 };

const senal = (over: Partial<SenalContable> & { id: string }): SenalContable => ({
  lat: null,
  lng: null,
  precision: 'province',
  provinceId: null,
  ...over,
});

describe('el conteo honesto (spec 3 §4)', () => {
  it('separa las cuatro clases en vez de dar un total', () => {
    const conteo = contarArea(
      [
        senal({ id: 'a', ...ADENTRO, precision: 'exact' }),
        senal({ id: 'b', ...ADENTRO, precision: '100m' }),
        senal({ id: 'c', ...ADENTRO, precision: '500m' }),
        senal({ id: 'd', ...ADENTRO, precision: 'city' }),
        senal({ id: 'e', precision: 'province', provinceId: 2 }),
      ],
      AREA,
      new Set([2]),
    );

    expect(conteo.exactas).toEqual(['a', 'b']);
    expect(conteo.aproximadas).toEqual(['c']);
    expect(conteo.centroide).toEqual(['d']);
    expect(conteo.provincialesSinContar).toBe(1);
    // Y lo que efectivamente se cuenta NO incluye la provincial.
    expect(conteo.contadas).toEqual(['a', 'b', 'c', 'd']);
  });

  it('una provincia tocada se nombra pero sus señales NO se suman', () => {
    // Es lo que v1 no hacía: si el lazo roza La Matanza, las 4.200 voces que
    // solo dicen «Buenos Aires» no son de La Matanza.
    const provinciales = Array.from({ length: 4200 }, (_, i) =>
      senal({ id: `p${String(i)}`, precision: 'province', provinceId: 2 }),
    );
    const conteo = contarArea([...provinciales], AREA, new Set([2]));

    expect(conteo.contadas).toHaveLength(0);
    expect(conteo.provincialesSinContar).toBe(4200);
    expect(conteo.provinciasTocadas).toEqual([2]);
  });

  it('lo que cae afuera del polígono no entra', () => {
    const conteo = contarArea(
      [
        senal({ id: 'adentro', ...ADENTRO, precision: 'exact' }),
        senal({ id: 'afuera', ...AFUERA, precision: 'exact' }),
      ],
      AREA,
      new Set(),
    );
    expect(conteo.contadas).toEqual(['adentro']);
  });

  it('una provincial cuya provincia el lazo NO toca ni siquiera se nombra', () => {
    const conteo = contarArea(
      [senal({ id: 'lejana', precision: 'province', provinceId: 14 })],
      AREA,
      new Set([2]),
    );
    expect(conteo.provincialesSinContar).toBe(0);
  });

  it('una precisión desconocida se trata como provincial, nunca como exacta', () => {
    expect(claseDe('vaya-a-saber')).toBe('provincial');
    const conteo = contarArea(
      [senal({ id: 'x', ...ADENTRO, precision: 'vaya-a-saber', provinceId: 2 })],
      AREA,
      new Set([2]),
    );
    expect(conteo.contadas).toHaveLength(0);
  });
});

describe('los renglones del panel', () => {
  it('nunca hay un renglón de total', () => {
    const conteo = contarArea(
      [
        senal({ id: 'a', ...ADENTRO, precision: 'exact' }),
        senal({ id: 'b', ...ADENTRO, precision: 'city' }),
        senal({ id: 'c', precision: 'province', provinceId: 2 }),
      ],
      AREA,
      new Set([2]),
    );
    const renglones = renglonesDeConteo(conteo);
    // 1 exacta + 1 centroide + 1 provincial = 3. Ese número no puede aparecer
    // como si fuera el resultado: son tres cosas distintas.
    expect(renglones.join(' ')).not.toMatch(/\b3\b/);
    expect(renglones.some((r) => r.includes('no se cuentan acá'))).toBe(true);
  });

  it('las clases en cero no ocupan un renglón', () => {
    const conteo = contarArea([senal({ id: 'a', ...ADENTRO, precision: 'exact' })], AREA, new Set());
    const renglones = renglonesDeConteo(conteo);
    expect(renglones).toHaveLength(1);
    expect(renglones[0]).toMatch(/1 con punto exacto/);
  });

  it('un área vacía se dice como información, no como error', () => {
    const conteo = contarArea([], AREA, new Set());
    expect(renglonesDeConteo(conteo)).toHaveLength(0);
    expect(AREA_VACIA).toMatch(/también es información/);
  });
});
