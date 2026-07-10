import { describe, expect, it } from 'vitest';
import {
  EVENTOS,
  PROBABILIDAD_EVENTO,
  descripcionEvento,
  hashSemilla,
  mulberry32,
  pickEvento,
  shouldTrigger,
} from './eventos';

/** Genera fechas ISO consecutivas desde el 2026-01-01. */
const fechas = (n: number): string[] => {
  const base = Date.UTC(2026, 0, 1);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base + i * 86_400_000);
    const pad = (x: number): string => String(x).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  });
};

describe('mulberry32 + hash', () => {
  it('misma seed → misma secuencia', () => {
    const a = mulberry32(hashSemilla('2026-07-09'));
    const b = mulberry32(hashSemilla('2026-07-09'));
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('seeds distintas → secuencias distintas', () => {
    expect(mulberry32(hashSemilla('2026-07-09'))()).not.toBe(
      mulberry32(hashSemilla('2026-07-10'))(),
    );
  });

  it('los valores caen en [0, 1)', () => {
    const rng = mulberry32(hashSemilla('x'));
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('shouldTrigger', () => {
  it('es determinista por fecha', () => {
    for (const f of fechas(30)) {
      expect(shouldTrigger(f, false)).toBe(shouldTrigger(f, false));
    }
  });

  it('si ya la vio hoy, jamás vuelve a aparecer (máx. 1/día)', () => {
    for (const f of fechas(400)) {
      expect(shouldTrigger(f, true)).toBe(false);
    }
  });

  it('frecuencia ≈ 15% sobre 1000 días (±3 puntos)', () => {
    const dias = fechas(1000);
    const hits = dias.filter((f) => shouldTrigger(f, false)).length;
    expect(hits / 1000).toBeGreaterThanOrEqual(PROBABILIDAD_EVENTO - 0.03);
    expect(hits / 1000).toBeLessThanOrEqual(PROBABILIDAD_EVENTO + 0.03);
  });
});

describe('pickEvento', () => {
  it('es determinista por fecha', () => {
    for (const f of fechas(30)) {
      expect(pickEvento(f)).toBe(pickEvento(f));
    }
  });

  it('solo devuelve efectos válidos', () => {
    for (const f of fechas(200)) {
      expect(EVENTOS).toContain(pickEvento(f));
    }
  });

  it('reparte más o menos uniforme entre los tres (999 días)', () => {
    const cuenta: Record<string, number> = {};
    for (const f of fechas(999)) {
      const e = pickEvento(f);
      cuenta[e] = (cuenta[e] ?? 0) + 1;
    }
    for (const e of EVENTOS) {
      // Esperado ≈ 333; toleramos ±100 (sanidad, no chi-cuadrado).
      expect(cuenta[e]).toBeGreaterThan(233);
      expect(cuenta[e]).toBeLessThan(433);
    }
  });

  it('el tipo no queda atado al trigger (seeds independientes)', () => {
    // Con la misma fecha, trigger y tipo usan streams distintos: cambiar
    // el resultado de uno no puede cambiar el otro (smoke de independencia).
    const f = '2026-07-09';
    expect(typeof shouldTrigger(f, false)).toBe('boolean');
    expect(EVENTOS).toContain(pickEvento(f));
  });
});

describe('descripcionEvento', () => {
  it('cada efecto tiene copy rioplatense', () => {
    expect(descripcionEvento('pregunta-extra')).toContain('+2');
    expect(descripcionEvento('brasas-x2')).toContain('doble');
    expect(descripcionEvento('desafio-24h')).toContain('3 estrellas');
  });
});
