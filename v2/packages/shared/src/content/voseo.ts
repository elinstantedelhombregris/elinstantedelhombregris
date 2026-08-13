/**
 * Tuteo → voseo. Dos listas, porque una sola rompe prosa correcta.
 *
 * Medido el 2026-08-12 sobre los cuerpos propios: 775 apariciones en 151
 * lecciones, y 90 lecciones mezclan tú y vos en el mismo texto.
 *
 * DURA: formas sin ambigüedad. Se reemplazan y la guardia las prohíbe.
 * BLANDA: dependen del contexto — `define` es imperativo en «Define una acción»
 * e indicativo en «el sistema define el resultado» (127 apariciones). Se
 * reportan; las decide una persona.
 * El posesivo `tu` NO entra en ninguna lista: es idéntico en voseo.
 *
 * `resume`, `identifica`, `analiza`, `observa` e `imagina` arrancaron acá en
 * la lista dura (así llegaron en el plan original) y se movieron a la blanda
 * el 2026-08-13, después de correr el script sobre el corpus real: para todo
 * verbo regular, el imperativo de «tú» y el indicativo de «él/ella» son la
 * misma forma («identifica» vale para «Identifica la causa» Y para «el
 * sistema identifica la causa»), así que ningún verbo bare de esta forma es
 * seguro sin mirar el contexto. La corrida encontró casos reales
 * corrompidos: `"La crisis nos sacó cosas", resume Diego.` (Diego lo dice, no
 * es una orden) pasó a `resumí Diego`; `El sindicato analiza fila por fila.`
 * pasó a `analizá`; `Como observa el Hombre Gris: "..."` pasó a `observá`;
 * `más poderoso de lo que imagina` (dentro de una cita) pasó a `imaginá`.
 * Las formas con pronombre enclítico (`llévalo`, `conviértelo`, `asegúrate`,
 * `pregúntate`, `hazlo`) no tienen este problema: el imperativo con
 * pronombre pegado no tiene equivalente de una sola palabra en indicativo
 * («lo lleva» son dos palabras), así que esas sí quedan en la dura.
 */

export const TUTEO_DURO: ReadonlyMap<string, string> = new Map([
  ['tienes', 'tenés'],
  ['puedes', 'podés'],
  ['debes', 'debés'],
  ['quieres', 'querés'],
  ['sabes', 'sabés'],
  ['haces', 'hacés'],
  ['necesitas', 'necesitás'],
  ['sientes', 'sentís'],
  ['entiendes', 'entendés'],
  ['vives', 'vivís'],
  ['eres', 'sos'],
  ['estás tú', 'estás'],
  ['conviertes', 'convertís'],
  ['mejoras tu', 'mejorás tu'],
  ['separas', 'separás'],
  ['miras', 'mirás'],
  ['llévalo', 'llevalo'],
  ['conviértelo', 'convertilo'],
  ['asegúrate', 'asegurate'],
  ['pregúntate', 'preguntate'],
  ['hazlo', 'hacelo'],
]);

// Ojo: acá no entra ninguna forma que sea igual en voseo. `pasabas`, `mirabas`,
// `tenías` y todo el imperfecto se escriben igual en las dos variedades: si se
// listaran, el reemplazo contaría un cambio que no cambia nada.

/** Formas cuyo reemplazo depende del contexto. Se reportan, no se tocan. */
export const TUTEO_BLANDO: readonly string[] = [
  'define',
  'elige',
  'recuerda',
  'escribe',
  'piensa',
  'resume',
  'identifica',
  'analiza',
  'observa',
  'imagina',
];

export interface Hallazgo {
  forma: string;
  indice: number;
  lista: 'dura' | 'blanda';
}

const patron = (formas: Iterable<string>): RegExp =>
  new RegExp(`(?<![\\p{L}])(${[...formas].join('|')})(?![\\p{L}])`, 'giu');

export function detectarTuteo(texto: string): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];
  for (const [lista, formas] of [
    ['dura', TUTEO_DURO.keys()],
    ['blanda', TUTEO_BLANDO],
  ] as const) {
    const re = patron(formas);
    let m: RegExpExecArray | null;
    while ((m = re.exec(texto)) !== null) {
      // `m[1]` es el único grupo de captura del patrón y el patrón sólo
      // matchea si ese grupo matcheó, así que siempre está — pero
      // `noUncheckedIndexedAccess` no lo sabe. Guardia igual que
      // `encabezados()` en cola-generada.ts.
      const forma = m[1];
      if (forma) hallazgos.push({ forma, indice: m.index, lista });
    }
  }
  return hallazgos.sort((a, b) => a.indice - b.indice);
}

/** Reemplaza sólo la lista dura, conservando mayúscula inicial. */
export function normalizarVoseo(texto: string): { texto: string; cambios: number } {
  let cambios = 0;
  const salida = texto.replace(patron(TUTEO_DURO.keys()), (encontrado) => {
    const reemplazo = TUTEO_DURO.get(encontrado.toLowerCase());
    if (reemplazo === undefined) return encontrado;
    cambios += 1;
    // `.charAt(0)` en vez de `[0]`: devuelve `string` siempre (cadena vacía
    // si no hay carácter), no `string | undefined` como la indexación —
    // `encontrado` y `reemplazo` nunca son vacíos, pero así se lo demuestra
    // al compilador sin un `!`.
    const esMayuscula = encontrado.charAt(0) === encontrado.charAt(0).toUpperCase();
    return esMayuscula ? reemplazo.charAt(0).toUpperCase() + reemplazo.slice(1) : reemplazo;
  });
  return { texto: salida, cambios };
}
