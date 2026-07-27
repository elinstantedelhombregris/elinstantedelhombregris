import { describe, expect, it } from 'vitest';

import {
  ANGULO_VIA,
  NEBULOSAS,
  campoEstelar,
  cuantizarCampo,
  estrellasDestacadas,
  puntosVia,
} from './atmosfera';

const HEX = /^#[0-9a-fA-F]{6}$/;

describe('campoEstelar', () => {
  it('es determinístico y vive dentro del rect', () => {
    const a = campoEstelar('cielo', 375, 812);
    const b = campoEstelar('cielo', 375, 812);
    expect(a).toEqual(b);
    for (const e of a) {
      expect(e.x).toBeGreaterThanOrEqual(0);
      expect(e.y).toBeGreaterThanOrEqual(0);
      expect(e.x).toBeLessThanOrEqual(375 + 34);
      expect(e.y).toBeLessThanOrEqual(812 + 34);
    }
  });

  it('tiene jerarquía tenue: radios 0.5–1.6, opacidades 0.1–0.42', () => {
    for (const e of campoEstelar('cielo', 375, 812)) {
      expect(e.radio).toBeGreaterThanOrEqual(0.5);
      expect(e.radio).toBeLessThanOrEqual(1.6);
      expect(e.opacidad).toBeGreaterThanOrEqual(0.1);
      expect(e.opacidad).toBeLessThanOrEqual(0.42);
      expect(e.tinte).toMatch(HEX);
    }
  });

  it('respira: deja celdas vacías pero puebla la mayoría', () => {
    const celdas = Math.ceil(375 / 34) * Math.ceil(812 / 34);
    const n = campoEstelar('cielo', 375, 812).length;
    expect(n).toBeGreaterThan(celdas * 0.55);
    expect(n).toBeLessThan(celdas * 0.9);
  });
});

describe('estrellasDestacadas', () => {
  it('pocas, más brillantes que el campo, nunca gigantes', () => {
    const d = estrellasDestacadas('cielo', 375, 812);
    expect(d).toHaveLength(7);
    for (const e of d) {
      expect(e.radio).toBeGreaterThanOrEqual(1.5);
      expect(e.radio).toBeLessThanOrEqual(2.4);
      expect(e.opacidad).toBeGreaterThanOrEqual(0.35);
      expect(e.opacidad).toBeLessThanOrEqual(0.57);
    }
  });
});

describe('puntosVia', () => {
  it('se concentra en el eje de la banda', () => {
    const pts = puntosVia('cielo', 1000, 90);
    const cerca = pts.filter((p) => Math.abs(p.y) < 45).length;
    expect(cerca).toBeGreaterThan(pts.length * 0.6);
    for (const p of pts) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(500);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(90);
    }
  });

  it('la banda es diagonal, nunca vertical ni horizontal exacta', () => {
    expect(Math.abs(ANGULO_VIA)).toBeGreaterThan(0.2);
    expect(Math.abs(ANGULO_VIA)).toBeLessThan(1.2);
  });
});

describe('nebulosas y cuantización', () => {
  it('las nebulosas son tenues (nunca roban protagonismo)', () => {
    for (const n of NEBULOSAS) {
      expect(n.opacidad).toBeLessThanOrEqual(0.09);
      expect(n.color).toMatch(HEX);
    }
  });

  it('cuantizarCampo agrupa cientos de estrellas en pocos baldes', () => {
    const campo = campoEstelar('cielo', 375, 812);
    const baldes = cuantizarCampo(campo);
    expect(baldes.length).toBeLessThanOrEqual(18);
    const total = baldes.reduce((acc, b) => acc + b.puntos.length, 0);
    expect(total).toBe(campo.length);
  });
});
