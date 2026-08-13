/**
 * El JSONL de juguete — la puerta por la que el motor se prueba sin base.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §8.
 */
import { describe, expect, it } from 'vitest';

import { enTandas, leerJsonl } from '../corpus.js';

describe('leerJsonl', () => {
  it('lee una fila por línea y saltea las vacías', () => {
    const leido = leerJsonl(
      ['{"id":"1","texto":"no llego a fin de mes"}', '', '{"id":"2","texto":"la guita no alcanza"}', ''].join(
        '\n',
      ),
    );

    expect(leido.filas).toEqual([
      { id: '1', texto: 'no llego a fin de mes' },
      { id: '2', texto: 'la guita no alcanza' },
    ]);
    expect(leido.vacias).toBe(0);
    expect(leido.repetidos).toEqual([]);
  });

  it('acepta un id numérico y lo guarda como texto, que es lo que la tabla espera', () => {
    const leido = leerJsonl('{"id":42,"texto":"falta el colectivo"}');

    expect(leido.filas).toEqual([{ id: '42', texto: 'falta el colectivo' }]);
  });

  it('un texto en blanco se cuenta pero no se embebe', () => {
    const leido = leerJsonl(['{"id":"1","texto":"   "}', '{"id":"2","texto":"algo"}'].join('\n'));

    expect(leido.filas).toHaveLength(1);
    expect(leido.vacias).toBe(1);
  });

  it('un id repetido no pisa al primero, y se reporta', () => {
    const leido = leerJsonl(
      ['{"id":"1","texto":"la primera"}', '{"id":"1","texto":"la segunda"}'].join('\n'),
    );

    expect(leido.filas).toEqual([{ id: '1', texto: 'la primera' }]);
    expect(leido.repetidos).toEqual(['1']);
  });

  it('falla con el número de línea cuando el JSON está roto', () => {
    expect(() => leerJsonl(['{"id":"1","texto":"ok"}', '{roto'].join('\n'))).toThrow(/Línea 2/);
  });

  it('falla cuando falta el id o el texto — un corpus a medias miente sin avisar', () => {
    expect(() => leerJsonl('{"texto":"sin id"}')).toThrow(/no tiene un «id» usable/);
    expect(() => leerJsonl('{"id":"1"}')).toThrow(/no tiene un «texto»/);
    expect(() => leerJsonl('{"id":"1","texto":7}')).toThrow(/«texto» de tipo string/);
    expect(() => leerJsonl('["no soy un objeto"]')).toThrow(/no es un objeto JSON/);
  });
});

describe('enTandas', () => {
  it('parte en tandas del tamaño pedido y deja el resto en la última', () => {
    expect(enTandas([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('una lista vacía no produce ninguna tanda', () => {
    expect(enTandas([], 4)).toEqual([]);
  });

  it('un tamaño que no es un entero positivo no se acepta', () => {
    expect(() => enTandas([1], 0)).toThrow(/entero positivo/);
    expect(() => enTandas([1], 1.5)).toThrow(/entero positivo/);
  });
});
