import { describe, expect, it } from 'vitest';

import { detectarTuteo, normalizarVoseo, TUTEO_BLANDO, TUTEO_DURO } from '../src/content/voseo';

describe('normalizarVoseo', () => {
  it('reemplaza las formas duras conservando el caso inicial', () => {
    const { texto, cambios } = normalizarVoseo('Si tienes dudas, Puedes preguntar.');
    expect(texto).toBe('Si tenés dudas, Podés preguntar.');
    expect(cambios).toBe(2);
  });

  it('preserva la mayúscula sostenida: PUEDES no se vuelve Podés', () => {
    // Antes devolvía `Podés` y se comía el énfasis que el autor escribió.
    expect(normalizarVoseo('NO PUEDES SOLO').texto).toBe('NO PODÉS SOLO');
    expect(normalizarVoseo('MEJORAS TU BARRIO').texto).toBe('MEJORÁS TU BARRIO');
  });

  it('no toca el posesivo tu, que es igual en voseo', () => {
    expect(normalizarVoseo('tu municipio y tu provincia').texto).toBe('tu municipio y tu provincia');
  });

  it('no toca las formas blandas: las decide una persona', () => {
    expect(normalizarVoseo('el sistema define el resultado').cambios).toBe(0);
  });

  it('no toca las formas movidas a blanda por ambigüedad real en el corpus', () => {
    const frase = '"La crisis nos sacó cosas", resume Diego. El sindicato analiza fila por fila.';
    expect(normalizarVoseo(frase)).toEqual({ texto: frase, cambios: 0 });
  });

  // `mejoras tu` es la única entrada de dos palabras que reemplaza un verbo, y
  // disparó 206 veces sobre el corpus sin una sola prueba. El posesivo es toda
  // la guardia que tiene: `mejoras` pelado es el sustantivo mucho más seguido
  // de lo que es verbo.
  it('exige el posesivo para tocar `mejoras`', () => {
    expect(normalizarVoseo('Las mejoras necesarias llevan tiempo.').cambios).toBe(0);
    expect(normalizarVoseo('Si mejoras tu barrio, cambia el país.').texto).toBe(
      'Si mejorás tu barrio, cambia el país.',
    );
  });

  it('no cruza dígitos, guiones ni guiones bajos: un slug no es prosa', () => {
    // Latente hasta que el corpus tenga un id, una clase o un ancla con una de
    // estas formas adentro: `slug: el-gran-dragon-las-estructuras-que-dicen-debes`
    // ya existe, y sólo se salva porque vive en el frontmatter, que no se toca.
    for (const cadena of ['puedes-caja', 'clase-puedes', 'tienes_2', 'eres3', '#eres-vos']) {
      expect(normalizarVoseo(cadena)).toEqual({ texto: cadena, cambios: 0 });
    }
  });
});

describe('las dos listas', () => {
  it('son disjuntas: ninguna forma se reemplaza y se reporta a la vez', () => {
    expect(TUTEO_BLANDO.filter((forma) => TUTEO_DURO.has(forma))).toEqual([]);
  });

  // La regla, no la lista de casos: para todo verbo regular el imperativo de
  // «tú» y el indicativo de «él/ella» son la misma forma, así que ninguna de
  // estas es segura sin mirar el contexto. `resume`, `identifica`, `analiza`,
  // `observa` e `imagina` arrancaron en la dura y la corrida real sobre
  // content/courses/ mostró el daño: `"La crisis nos sacó cosas", resume
  // Diego.` pasó a `resumí Diego`, `El sindicato analiza fila por fila.` a
  // `analizá`. Las otras están acá para que nadie las promueva sin leer esto.
  it('no tiene en la dura ninguna forma ambigua conocida', () => {
    for (const forma of [
      'resume',
      'identifica',
      'analiza',
      'observa',
      'imagina',
      'define',
      'elige',
      'recuerda',
      'escribe',
      'piensa',
      'miras',
      'haces',
      'vives',
    ]) {
      expect(TUTEO_DURO.has(forma)).toBe(false);
      expect(TUTEO_BLANDO).toContain(forma);
    }
  });

  it('traduce cada forma dura en vez de descartar una palabra', () => {
    // `estás tú` → `estás` era la única entrada que eliminaba una palabra: el
    // voseo enfático es `estás vos` y tirar el pronombre borra el contraste
    // que escribió el autor. La cuenta de palabras es la regla general.
    expect(TUTEO_DURO.has('estás tú')).toBe(false);
    for (const [forma, reemplazo] of TUTEO_DURO) {
      expect(reemplazo.split(' ')).toHaveLength(forma.split(' ').length);
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

  it('reporta el pronombre `tú`, en mayúscula o en minúscula', () => {
    // La mitad sistémica del `TÚ sos` publicado: el reporte nombraba `eres` y
    // no el pronombre de al lado, así que nadie vio que quedaba huérfano.
    expect(detectarTuteo('de que TÚ sos la luz, no lo que ilumina tú').map((h) => h.forma)).toEqual(
      ['TÚ', 'tú'],
    );
  });

  it('reporta las formas de segunda persona que antes eran invisibles', () => {
    const frase = 'Si piensas distinto, cambias lo que dices y escuchas mejor.';
    expect(normalizarVoseo(frase).cambios).toBe(0);
    expect(detectarTuteo(frase).map((h) => h.forma)).toEqual([
      'piensas',
      'cambias',
      'dices',
      'escuchas',
    ]);
  });

  it('reporta la clase imperativa en vez de reescribirla', () => {
    // `la ley establece` es indicativo de tercera y `Optimizá tu flujo` es la
    // orden: la misma forma escrita igual. Por eso se reportan y no se tocan.
    const frase = 'Optimiza tu flujo. La ley establece el plazo.';
    expect(normalizarVoseo(frase).cambios).toBe(0);
    expect(detectarTuteo(frase).map((h) => h.forma)).toEqual(['Optimiza', 'establece']);
  });

  it('gana la forma más larga cuando dos entradas empiezan igual', () => {
    // `cambia` y `cambias` están las dos en la blanda. La alternancia de regex
    // es first-match-wins, así que el patrón se arma por longitud descendente.
    expect(detectarTuteo('cambias de opinión').map((h) => h.forma)).toEqual(['cambias']);
  });

  it('no reporta una forma pegada a un guion: `auto-optimiza` no es una orden', () => {
    // Dos lecciones dicen «el sistema se auto-optimiza». Sin el guion en el
    // límite, agregar `optimiza` a la blanda le mete al revisor humano dos
    // falsos positivos que son indicativo de tercera con todas las letras.
    expect(detectarTuteo('el sistema se auto-optimiza')).toEqual([]);
  });
});
