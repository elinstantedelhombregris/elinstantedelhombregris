import { describe, expect, it } from 'vitest';
import { VIDA_MEDIA_DIAS, brilloDeObras, nivelDeBrillo } from './brillo';

const AHORA = '2026-07-19T00:00:00.000Z';
const haceDias = (d: number): string =>
  new Date(Date.parse(AHORA) - d * 24 * 60 * 60 * 1000).toISOString();

describe('brillo con decay (trust half-life §4.2)', () => {
  it('una obra de hoy vale ~1; a la vida media vale ~0.5', () => {
    expect(brilloDeObras([haceDias(0)], AHORA)).toBeCloseTo(1, 5);
    expect(brilloDeObras([haceDias(VIDA_MEDIA_DIAS)], AHORA)).toBeCloseTo(0.5, 2);
    expect(brilloDeObras([haceDias(VIDA_MEDIA_DIAS * 2)], AHORA)).toBeCloseTo(0.25, 2);
  });

  it('las obras suman; sin obras el brillo es 0', () => {
    expect(brilloDeObras([], AHORA)).toBe(0);
    const tres = brilloDeObras([haceDias(0), haceDias(0), haceDias(0)], AHORA);
    expect(tres).toBeCloseTo(3, 5);
  });

  it('sos quien sos ahora: obra vieja pesa menos que obra nueva', () => {
    const vieja = brilloDeObras([haceDias(300)], AHORA);
    const nueva = brilloDeObras([haceDias(3)], AHORA);
    expect(nueva).toBeGreaterThan(vieja);
  });

  it('niveles para el render: apagada/tenue/viva/radiante', () => {
    expect(nivelDeBrillo(0)).toBe('apagada');
    expect(nivelDeBrillo(0.4)).toBe('tenue');
    expect(nivelDeBrillo(1.5)).toBe('viva');
    expect(nivelDeBrillo(3.2)).toBe('radiante');
  });
});
