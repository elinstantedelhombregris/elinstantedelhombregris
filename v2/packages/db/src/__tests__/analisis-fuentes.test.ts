/**
 * La guarda de la fuente del embebido.
 *
 * Hasta el 16/8/2026 `faltanPorEmbeber` leía `.from(dreams)` **siempre**, y el
 * parámetro `fuente` sólo filtraba `analisis_vectores`. O sea que
 * `pnpm radiografia:embeber --fuente senales` corría sin un solo error,
 * embebía los textos de la tabla retirada, los guardaba bajo el rótulo
 * `senales`, y La Radiografía —que aparea por `id_publico`— no veía ni una.
 * Filas escritas, cero filas visibles, ningún síntoma.
 *
 * Estos tests no necesitan base: lo que verifican es que la fuente **gobierna**
 * y que una que no sabemos leer se planta antes de tocar el motor. Por eso el
 * `Db` de mentira revienta si alguien lo consulta.
 */
import { describe, expect, it } from 'vitest';

import { AnalisisRepository, FUENTES_LEGIBLES, esFuenteLegible } from '../repositories/analisis.js';

import type { Db } from '../client.js';

/** Un `Db` que grita si lo tocan: acá no se llega a consultar nada. */
const dbQueNoSeUsa = new Proxy(
  {},
  {
    get() {
      throw new Error('La fuente ilegible tenía que plantarse antes de tocar la base.');
    },
  },
) as Db;

describe('AnalisisRepository · la fuente gobierna de qué tabla se lee', () => {
  it('las fuentes legibles son las dos tablas de texto, y `senales` va primera', () => {
    expect([...FUENTES_LEGIBLES]).toEqual(['senales', 'dreams']);
  });

  it('reconoce las que sabe leer y rechaza el resto', () => {
    expect(esFuenteLegible('senales')).toBe(true);
    expect(esFuenteLegible('dreams')).toBe(true);
    expect(esFuenteLegible('voces')).toBe(false);
    expect(esFuenteLegible('')).toBe(false);
    // Sin espacio para un typo silencioso: `senales ` no es `senales`.
    expect(esFuenteLegible('senales ')).toBe(false);
  });

  it('una fuente que no sabe leer revienta en vez de escribir filas invisibles', async () => {
    const repositorio = new AnalisisRepository(dbQueNoSeUsa);
    await expect(
      repositorio.faltanPorEmbeber({ fuente: 'senal', modelo: 'bge-m3' }),
    ).rejects.toThrow(/No sé leer la fuente «senal»/);
  });

  it('el mensaje dice cuáles sí puede leer, para que el error alcance', async () => {
    const repositorio = new AnalisisRepository(dbQueNoSeUsa);
    await expect(
      repositorio.faltanPorEmbeber({ fuente: 'lo que sea', modelo: 'bge-m3' }),
    ).rejects.toThrow(/senales, dreams/);
  });
});
