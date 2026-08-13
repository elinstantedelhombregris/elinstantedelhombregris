import { describe, expect, it } from 'vitest';

import { nucleosAlUmbral } from '../radiografia/nucleos.js';

import type { AristaMedida } from '../radiografia/tipos.js';

const ids = ['a', 'b', 'c', 'd', 'e'];
const aristas: readonly AristaMedida[] = [
  { a: 'a', b: 'b', similitud: 0.9 },
  { a: 'c', b: 'd', similitud: 0.8 },
  { a: 'b', b: 'c', similitud: 0.5 },
];

describe('núcleos al umbral', () => {
  it('agrupa por componentes conexas', () => {
    const { nucleos } = nucleosAlUmbral(ids, aristas, 0.75);
    const tamanios = nucleos.map((n) => n.ids.length).sort();

    expect(tamanios).toEqual([2, 2]);
  });

  it('funde islas en un continente cuando baja el umbral', () => {
    const apretado = nucleosAlUmbral(ids, aristas, 0.75);
    const flojo = nucleosAlUmbral(ids, aristas, 0.4);

    expect(apretado.nucleos).toHaveLength(2);
    expect(flojo.nucleos).toHaveLength(1);
    expect(flojo.nucleos[0]?.ids).toHaveLength(4);
  });

  it('cuenta como voz sola a la que ninguna arista alcanza', () => {
    const { solas } = nucleosAlUmbral(ids, aristas, 0.4);

    expect(solas).toEqual(['e']);
  });

  it('con el umbral al tope, todas son voces solas y no hay núcleos', () => {
    const { nucleos, solas } = nucleosAlUmbral(ids, aristas, 0.99);

    expect(nucleos).toEqual([]);
    expect(solas).toEqual(ids);
  });

  it('no pierde ninguna señal: núcleos + solas = todas', () => {
    for (const umbral of [0.3, 0.5, 0.75, 0.85, 0.99]) {
      const { nucleos, solas } = nucleosAlUmbral(ids, aristas, umbral);
      const total = nucleos.reduce((n, x) => n + x.ids.length, 0) + solas.length;

      expect(total).toBe(ids.length);
    }
  });

  it('devuelve los ids ordenados, para que el resultado sea comparable', () => {
    const { nucleos } = nucleosAlUmbral(['b', 'a'], [{ a: 'a', b: 'b', similitud: 1 }], 0.5);

    expect(nucleos[0]?.ids).toEqual(['a', 'b']);
  });
});
