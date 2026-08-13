import { describe, expect, it } from 'vitest';

import { EmbebedorFalso } from '../radiografia/embebedor.js';

describe('el puerto del embebedor', () => {
  it('devuelve un vector por texto, con las dimensiones que declara', async () => {
    const e = new EmbebedorFalso(8);
    const vs = await e.embeber(['hay un pozo en la esquina', 'sueño con un país sin pozos']);

    expect(vs).toHaveLength(2);
    expect(vs[0]).toHaveLength(8);
    expect(e.dimensiones).toBe(8);
    expect(e.modelo).toBe('falso');
  });

  it('es determinista: el mismo texto da el mismo vector', async () => {
    const e = new EmbebedorFalso(8);
    const [a] = await e.embeber(['no me alcanza']);
    const [b] = await e.embeber(['no me alcanza']);

    expect(a).toEqual(b);
  });

  it('acerca textos parecidos y separa los distintos', async () => {
    const e = new EmbebedorFalso(64);
    const [x, y, z] = await e.embeber([
      'no me alcanza la plata',
      'no me alcanza la guita',
      'hay un pozo en la calle',
    ]);
    const punto = (p: readonly number[], q: readonly number[]) =>
      p.reduce((acc, v, i) => acc + v * (q[i] ?? 0), 0);

    expect(punto(x ?? [], y ?? [])).toBeGreaterThan(punto(x ?? [], z ?? []));
  });

  it('devuelve vectores unitarios', async () => {
    const e = new EmbebedorFalso(16);
    const [v] = await e.embeber(['cualquier cosa']);
    const norma = Math.sqrt((v ?? []).reduce((a, n) => a + n * n, 0));

    expect(norma).toBeCloseTo(1, 10);
  });
});
