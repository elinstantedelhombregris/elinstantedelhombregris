import { describe, expect, it } from 'vitest';
import { esCostoPaletaValido } from '../game/brasas';
import { PALETAS, PALETA_DEFAULT, paletaPorId } from './paletas';

const HEX = /^#[0-9a-f]{6}$/i;

describe('paletas del cielo (spec §3.3)', () => {
  it('la Noche Pura es la default: gratis y con el fondo original del Cielo', () => {
    expect(PALETA_DEFAULT.id).toBe('noche-pura');
    expect(PALETA_DEFAULT.precio).toBe(0);
    // Invariante sagrado: el cielo no cambia sin permiso del jugador.
    expect(PALETA_DEFAULT.gradiente).toEqual(['#0d0d16', '#0a0a0a']);
  });

  it('hay cuatro paletas con ids únicos', () => {
    expect(PALETAS).toHaveLength(4);
    expect(new Set(PALETAS.map((p) => p.id)).size).toBe(4);
  });

  it('las paletas pagas cuestan entre 30 y 80 brasas (jamás dinero real)', () => {
    const pagas = PALETAS.filter((p) => p.precio > 0);
    expect(pagas.length).toBe(3);
    for (const p of pagas) {
      expect(esCostoPaletaValido(p.precio)).toBe(true);
    }
  });

  it('todos los gradientes son hex #rrggbb válidos', () => {
    for (const p of PALETAS) {
      expect(p.gradiente[0]).toMatch(HEX);
      expect(p.gradiente[1]).toMatch(HEX);
    }
  });

  it('paletaPorId: desconocida o null cae en la default', () => {
    expect(paletaPorId(null)).toBe(PALETA_DEFAULT);
    expect(paletaPorId(undefined)).toBe(PALETA_DEFAULT);
    expect(paletaPorId('no-existe')).toBe(PALETA_DEFAULT);
    expect(paletaPorId('aurora').nombre).toBe('Aurora');
  });
});
