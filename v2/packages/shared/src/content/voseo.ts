/**
 * Tuteo → voseo. Dos listas, porque una sola rompe prosa correcta.
 *
 * Medido el 2026-08-12 sobre los cuerpos propios: 775 apariciones en 151
 * lecciones, y 90 lecciones mezclan tú y vos en el mismo texto.
 *
 * DURA: formas sin ambigüedad. Se reemplazan sin que nadie mire. No hay
 * guardia que las prohíba en el resto del proyecto todavía: la construye la
 * Tarea 12 del Ciclo 1.
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
 *
 * `miras`, `haces` y `vives` salieron de la dura el 2026-08-13, en la revisión
 * del barrido, por la misma clase de razón pero por el lado del sustantivo y
 * del nombre propio: `las miras` («con las miras puestas en 2027», «miras
 * estrechas») es idiomático justo en el registro político que escribe este
 * corpus; `haces` es el plural de `haz` («haces de luz», «haces nerviosos»)
 * en un corpus que habla de flujos de energía; y `Vives` es un apellido
 * (Juan Luis Vives, Carlos Vives) que la lógica de mayúsculas convertiría en
 * «según Vivís». Las sustituciones que ya se aplicaron con esas tres se
 * verificaron una por una y eran correctas: salen para que no vuelvan a
 * dispararse a ciegas, no porque hayan hecho daño.
 *
 * Y `estás tú` → `estás` se borró entera: era la única entrada que eliminaba
 * una palabra en vez de traducirla. El voseo enfático es `estás vos`, así que
 * tirar el pronombre descartaba el contraste que escribió el autor.
 */

export const TUTEO_DURO: ReadonlyMap<string, string> = new Map([
  ['tienes', 'tenés'],
  ['puedes', 'podés'],
  ['debes', 'debés'],
  ['quieres', 'querés'],
  ['sabes', 'sabés'],
  ['necesitas', 'necesitás'],
  ['sientes', 'sentís'],
  ['entiendes', 'entendés'],
  ['eres', 'sos'],
  ['conviertes', 'convertís'],
  ['mejoras tu', 'mejorás tu'],
  ['separas', 'separás'],
  ['llévalo', 'llevalo'],
  ['conviértelo', 'convertilo'],
  ['asegúrate', 'asegurate'],
  ['pregúntate', 'preguntate'],
  ['hazlo', 'hacelo'],
]);

// Ojo: acá no entra ninguna forma que sea igual en voseo. `pasabas`, `mirabas`,
// `tenías` y todo el imperfecto se escriben igual en las dos variedades: si se
// listaran, el reemplazo contaría un cambio que no cambia nada.

/**
 * Formas cuyo reemplazo depende del contexto. Se reportan, no se tocan.
 *
 * Todas en minúscula: la detección es case-insensitive, así que duplicar la
 * mayúscula sólo agrandaría la alternancia.
 */
export const TUTEO_BLANDO: readonly string[] = [
  // Imperativos ambiguos: la misma forma es indicativo de tercera.
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
  // La clase imperativa que faltaba. `establece` choca con «la ley establece»,
  // `optimiza` con «el sistema se auto-optimiza» —dos casos reales en el
  // corpus—, y `evita` con Evita: el corpus habla de Perón en trece lecciones.
  'optimiza',
  'empieza',
  'cambia',
  'reduce',
  'establece',
  'explica',
  'evita',
  'maximiza',
  'haz',
  // Segunda persona del singular. Como forma verbal son inequívocas, pero
  // varias tienen sustantivo homógrafo —«las escuchas telefónicas», «las
  // ayudas sociales», «las miras puestas en 2027», «haces de luz»— o apellido
  // —Vives—, y la dura escribe sin mirar. Medidas por la revisión del
  // 2026-08-13: al menos 46 tokens de tuteo inequívoco que no estaban en
  // ninguna de las dos listas, con una sonda de sólo 19 formas.
  'piensas',
  'cambias',
  'usas',
  'escuchas',
  'eliges',
  'mantienes',
  'dices',
  'experimentas',
  'logras',
  'aprendes',
  'crees',
  'ayudas',
  'atacas',
  'miras',
  'haces',
  'vives',
  // El pronombre. Sin él, el reporte nombraba `eres` y no el `tú` de al lado,
  // y así se publicó un `TÚ sos` que no existe en ninguna variedad del
  // castellano. Quedan 8 en el corpus, 7 de ellos la cita deliberada de
  // Nietzsche («Tú debes», el lema del Gran Dragón), que no se toca.
  'tú',
];

export interface Hallazgo {
  forma: string;
  indice: number;
  lista: 'dura' | 'blanda';
}

/**
 * El límite incluye dígitos, guión y guión bajo, no sólo letras: `puedes-caja`,
 * `tienes_2` y `eres3` son un id, una clase, un slug o un ancla, no prosa, y
 * con el límite viejo se reescribían. Del lado del reporte, el guión también
 * saca falsos positivos reales: «el sistema se auto-optimiza» no es una orden.
 *
 * Y la alternancia se arma por longitud descendente porque el regex es
 * first-match-wins: si algún día entra `mejoras` pelado, el orden de inserción
 * no puede decidir si gana la entrada de una palabra o la de dos.
 */
const patron = (formas: Iterable<string>): RegExp => {
  const ordenadas = [...formas].sort((a, b) => b.length - a.length);
  return new RegExp(`(?<![\\p{L}\\p{N}_-])(${ordenadas.join('|')})(?![\\p{L}\\p{N}_-])`, 'giu');
};

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
    // Mayúscula sostenida: `PUEDES` es énfasis del autor y tiene que salir
    // `PODÉS`, no `Podés`. Antes se le comía el énfasis.
    if (/\p{Lu}/u.test(encontrado) && !/\p{Ll}/u.test(encontrado)) {
      return reemplazo.toUpperCase();
    }
    // ¿Empieza con mayúscula? Con regex en vez de comparar `charAt(0)`
    // contra su propio `toUpperCase()`: eslint (`prefer-string-starts-ends-with`)
    // rechaza esa forma, y esto además es más directo.
    const esMayuscula = /^\p{Lu}/u.test(encontrado);
    // `.charAt(0)` en vez de `[0]`: devuelve `string` siempre (cadena vacía
    // si no hay carácter), no `string | undefined` como la indexación —
    // `reemplazo` nunca es vacío acá, pero así se lo demuestra al
    // compilador sin un `!`.
    return esMayuscula ? reemplazo.charAt(0).toUpperCase() + reemplazo.slice(1) : reemplazo;
  });
  return { texto: salida, cambios };
}
