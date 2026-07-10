import { describe, expect, it } from 'vitest';
import {
  COLOR_ESTRELLA,
  MAX_ESTRELLAS_NITIDAS,
  grumosDePolvo,
  hexARgb,
  polvoAmbiental,
  posicionEstrella,
  radioDelCielo,
  faseTitilado,
  tamanoEstrella,
  velocidadTitilado,
} from './posiciones';

const ids = (n: number): string[] =>
  Array.from({ length: n }, (_, i) => `estrella-${i.toString(16)}-fija`);

describe('posicionEstrella', () => {
  it('es determinística: mismo índice + id → mismo punto, siempre', () => {
    const a = posicionEstrella(42, 'abc-123');
    const b = posicionEstrella(42, 'abc-123');
    expect(a).toEqual(b);
  });

  it('el id solo perturba: ids distintos mueven poco el punto', () => {
    const a = posicionEstrella(10, 'id-uno');
    const b = posicionEstrella(10, 'id-dos');
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    expect(d).toBeLessThan(7); // jitter máximo 1.5px por eje y por id
  });

  it('sin choques: ninguna de las primeras 200 queda a menos de 8px de otra', () => {
    const pts = ids(200).map((id, i) => posicionEstrella(i, id));
    let minima = Infinity;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i]!.x - pts[j]!.x, pts[i]!.y - pts[j]!.y);
        if (d < minima) minima = d;
      }
    }
    expect(minima).toBeGreaterThanOrEqual(8);
  });

  it('despeja el centro: ninguna estrella pisa el halo de la Guía', () => {
    for (let i = 0; i < 50; i++) {
      const p = posicionEstrella(i, `id-${i}`);
      expect(Math.hypot(p.x, p.y)).toBeGreaterThan(20);
    }
  });

  it('crece como disco: el radio sube con el índice', () => {
    const r50 = Math.hypot(posicionEstrella(50, 'a').x, posicionEstrella(50, 'a').y);
    const r250 = Math.hypot(posicionEstrella(250, 'b').x, posicionEstrella(250, 'b').y);
    expect(r250).toBeGreaterThan(r50);
    expect(radioDelCielo(300)).toBeGreaterThanOrEqual(r250);
  });

  it('rechaza índices inválidos', () => {
    expect(() => posicionEstrella(-1, 'x')).toThrow();
    expect(() => posicionEstrella(1.5, 'x')).toThrow();
  });
});

describe('titilado', () => {
  it('fase y velocidad son estables por id y caen en rango', () => {
    for (const id of ids(30)) {
      const f = faseTitilado(id);
      expect(f).toBe(faseTitilado(id));
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(Math.PI * 2);
      const v = velocidadTitilado(id);
      expect(v).toBe(velocidadTitilado(id));
      expect(v).toBeGreaterThanOrEqual(0.6);
      expect(v).toBeLessThanOrEqual(1.6);
    }
  });
});

describe('tamanoEstrella', () => {
  const caso = (fundadora: boolean, nocturna: boolean, fugaz: boolean) =>
    tamanoEstrella({ fundadora, nocturna, fugaz });

  it('rarezas comunes viven entre 2.5 y 4', () => {
    expect(caso(false, false, false)).toBe(2.5);
    expect(caso(false, true, false)).toBe(3);
    expect(caso(false, false, true)).toBe(3.5);
    expect(caso(false, true, true)).toBe(4);
  });

  it('las fundadoras son siempre más grandes', () => {
    expect(caso(true, false, false)).toBeGreaterThanOrEqual(4.5);
    expect(caso(true, true, true)).toBeGreaterThan(caso(false, true, true));
  });
});

describe('colores', () => {
  it('cubre los 7 tipos de estrella con hex válidos', () => {
    const tipos = Object.keys(COLOR_ESTRELLA);
    expect(tipos.sort()).toEqual(
      ['amistad', 'basta', 'compromiso', 'dream', 'need', 'recurso', 'value'].sort(),
    );
    for (const hex of Object.values(COLOR_ESTRELLA)) {
      expect(hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('hexARgb normaliza a 0..1', () => {
    expect(hexARgb('#ffffff')).toEqual([1, 1, 1]);
    expect(hexARgb('#000000')).toEqual([0, 0, 0]);
    const [r, g, b] = hexARgb('#7D5BDE');
    expect(r).toBeCloseTo(0x7d / 255);
    expect(g).toBeCloseTo(0x5b / 255);
    expect(b).toBeCloseTo(0xde / 255);
  });
});

describe('polvo y LOD', () => {
  it('polvoAmbiental: determinístico, dentro del rect, opacidades tenues', () => {
    const a = polvoAmbiental('cielo', 390, 800);
    expect(a).toEqual(polvoAmbiental('cielo', 390, 800));
    expect(a).toHaveLength(80);
    for (const p of a) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(390);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(800);
      expect(p.opacidad).toBeGreaterThanOrEqual(0.08);
      expect(p.opacidad).toBeLessThanOrEqual(0.2);
    }
  });

  it('grumosDePolvo agrega viejas en pocos glow-blobs', () => {
    const viejas = ids(120).map((id, i) => posicionEstrella(i, id));
    const grumos = grumosDePolvo(viejas);
    expect(grumos.length).toBeGreaterThan(0);
    expect(grumos.length).toBeLessThanOrEqual(8);
    expect(grumos.reduce((acc, g) => acc + g.cantidad, 0)).toBe(120);
    for (const g of grumos) {
      expect(g.radio).toBeGreaterThan(10);
    }
    expect(grumosDePolvo([])).toEqual([]);
  });

  it('el presupuesto de nitidez es 300 (spec §5)', () => {
    expect(MAX_ESTRELLAS_NITIDAS).toBe(300);
  });
});
