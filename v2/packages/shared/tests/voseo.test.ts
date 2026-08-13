import { describe, expect, it } from 'vitest';

import { detectarTuteo, normalizarVoseo, TUTEO_BLANDO, TUTEO_DURO } from '../src/content/voseo';

describe('normalizarVoseo', () => {
  it('reemplaza las formas duras conservando el caso inicial', () => {
    const { texto, cambios } = normalizarVoseo('Si tienes dudas, Puedes preguntar.');
    expect(texto).toBe('Si tenés dudas, Podés preguntar.');
    expect(cambios).toBe(2);
  });

  it('no toca el posesivo tu, que es igual en voseo', () => {
    expect(normalizarVoseo('tu municipio y tu provincia').texto).toBe('tu municipio y tu provincia');
  });

  it('no toca las formas blandas: las decide una persona', () => {
    expect(normalizarVoseo('el sistema define el resultado').cambios).toBe(0);
  });

  // `resume`, `identifica`, `analiza`, `observa` e `imagina` arrancaron en la
  // lista dura y se movieron acá el 2026-08-13: la corrida real sobre
  // content/courses/ mostró casos donde son 3ª persona del indicativo, no
  // imperativo — «"La crisis nos sacó cosas", resume Diego» y «el sindicato
  // analiza fila por fila» quedaban corrompidos («resumí», «analizá») porque
  // el reemplazo asumía que la forma siempre era una orden a quien lee.
  it('no toca las formas movidas a blanda por ambigüedad real en el corpus', () => {
    const frase = '"La crisis nos sacó cosas", resume Diego. El sindicato analiza fila por fila.';
    expect(normalizarVoseo(frase)).toEqual({ texto: frase, cambios: 0 });
  });

  it('las cinco formas movidas ya no están en la lista dura', () => {
    for (const forma of ['resume', 'identifica', 'analiza', 'observa', 'imagina']) {
      expect(TUTEO_DURO.has(forma)).toBe(false);
      expect(TUTEO_BLANDO).toContain(forma);
    }
  });
});

describe('detectarTuteo', () => {
  it('separa hallazgos duros de blandos', () => {
    const hallazgos = detectarTuteo('Puedes elegir. Define una acción.');
    expect(hallazgos.filter((h) => h.lista === 'dura').map((h) => h.forma)).toEqual(['Puedes']);
    expect(hallazgos.filter((h) => h.lista === 'blanda').map((h) => h.forma)).toEqual(['Define']);
  });

  it('no marca un infinitivo que contiene una forma de la lista', () => {
    // «elegir» es infinitivo y no es tuteo; la lista blanda tiene «elige».
    // Si esto falla, el regex no está exigiendo límites de palabra completa.
    expect(detectarTuteo('Vas a elegir bien.')).toEqual([]);
  });
});
