import type { Escenario } from './tipos';

/**
 * El artefacto de vectores del ejemplo — qué es, por qué está commiteado y qué
 * lo invalida.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §4.1, §4.3.
 *
 * La página viva embebe **fuera de banda**: un job corre `bge-m3` por Ollama,
 * guarda los vectores en `analisis_vectores` y la constelación los lee. El
 * ejemplo de los tres escenarios no puede hacer eso —vive entero en el
 * navegador, no tiene base y no tiene red—, así que sus vectores se calculan
 * **antes**, con el `EmbebedorFalso` de `@v2/civic-core`, y se commitean acá.
 *
 * Tres cosas que este archivo declara y una que no puede esconder:
 *
 *  1. **Con qué modelo se hizo.** `modelo: 'falso'` es literal: una bolsa de
 *     palabras proyectada por hash, que no sabe que «guita» y «plata» son lo
 *     mismo. No es un modelo de lenguaje y la pantalla lo dice con esas
 *     palabras. El día que haya Ollama, se regenera con `bge-m3` y **los
 *     números de la tabla cambian**: los cosenos de un modelo de verdad viven
 *     más arriba, así que el umbral del ejemplo se recalibra midiendo otra vez.
 *  2. **Con qué `k`.** El grafo es k-NN y `k` no es cosmético: cambia qué
 *     aristas existen antes de que el umbral corte ninguna.
 *  3. **Sobre qué corpus.** `digesto` es el hash del texto de las 189 frases.
 *     Si alguien toca una coma en un escenario y no regenera, el digesto deja
 *     de coincidir, el test falla y **la pantalla lo dice** en vez de dibujar
 *     una constelación de un corpus que ya no existe.
 *
 * **Por qué se guardan los vectores y no las aristas.** Las aristas son el
 * resultado de una decisión (`k`) y de un cálculo; los vectores son la entrada.
 * Con los vectores, el navegador corre `aristasMedidas`, `nucleosAlUmbral` y
 * `fraseDelNucleo` —las funciones **de verdad**, las mismas que corre el
 * servidor— y el ejemplo enseña el motor en vez de enseñar una foto del motor.
 * Además pesan menos: la salida del `EmbebedorFalso` es ralísima —una decena de
 * dimensiones no nulas sobre 1.024— y guardar sólo esas es un orden de magnitud
 * menos que la lista de aristas.
 */

/**
 * Un vector ralo, codificado: `«índice:valor»` separado por espacios.
 *
 * Una cadena y no un arreglo de pares, por una razón chata y real: el archivo
 * es **generado**, y un arreglo de 1.500 pares se reformatea distinto cada vez
 * que alguien cambia de versión de Prettier, con lo cual el artefacto cambia sin
 * que cambie un solo número. Una cadena no se puede reformatear, así que
 * regenerar sin tocar el corpus da byte por byte el mismo archivo — y eso es lo
 * que permite verificar que está al día mirando el diff.
 *
 * Los valores se escriben con `String(v)`, que en JavaScript es la
 * representación más corta que vuelve al **mismo** double: el vector que se lee
 * es idéntico al que salió del embebedor, no una versión redondeada.
 */
export type VectorCodificado = string;

export interface ArtefactoDeVectores {
  /** El nombre del embebedor que lo produjo. Hoy `falso`; se dice en pantalla. */
  readonly modelo: string;
  /** El largo del vector denso. `EmbebedorFalso` usa 1.024, igual que `bge-m3`. */
  readonly dimensiones: number;
  /** Las vecinas por señal del grafo medido. Cambiarlo cambia el grafo. */
  readonly k: number;
  /** Hash del corpus. Si no coincide, el artefacto quedó viejo y se dice. */
  readonly digesto: string;
  /** `escenario → id de voz → vector ralo codificado`. */
  readonly escenarios: Readonly<Record<string, Readonly<Record<string, VectorCodificado>>>>;
}

/**
 * FNV-1a de 32 bits. El mismo que usa `EmbebedorFalso` adentro, por el mismo
 * motivo: determinista, sin dependencias y sin reloj. Acá no hash de palabras
 * sino del corpus entero, para detectar que alguien lo editó.
 */
const fnv1a = (texto: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
};

/**
 * El separador va fuera del alfabeto de los textos: no se puede falsificar.
 *
 * **Se escribe como secuencia de escape y nunca como el byte crudo.** Un NUL
 * literal adentro de una cadena hace que git clasifique el archivo como
 * binario, y entonces `git diff` deja de mostrar el contenido — que es
 * justamente el argumento por el que este artefacto guarda cadenas y no
 * arreglos: que se pueda verificar que está al día mirando el diff. El
 * generado llegó a tener 1.477 de estos bytes y era ilegible entero. El valor
 * en memoria es el mismo; lo que cambia es que el repositorio lo puede leer, y
 * el generador tiene que escribirlo escapado también.
 */
const SEPARADOR = '\u0000';

/**
 * El hash del corpus: los ids, los tipos y los textos de los tres escenarios.
 *
 * Entra el **tipo** además del texto porque el tipo decide la clase, la clase
 * decide el color y la clase decide qué máquina corre. Un cambio de tipo sin
 * cambio de texto cambia lo que la pantalla afirma, así que tiene que invalidar
 * el artefacto igual que un cambio de palabra.
 */
export function digestoDeCorpus(escenarios: readonly Escenario[]): string {
  const partes: string[] = [];
  for (const escenario of escenarios) {
    partes.push(escenario.id, String(escenario.voces.length));
    for (const voz of escenario.voces) partes.push(voz.id, voz.tipo, voz.texto);
  }
  return fnv1a(partes.join(SEPARADOR)).toString(16).padStart(8, '0');
}

/** Codifica un vector denso a la forma que se commitea. Lo usa el script. */
export function codificar(denso: readonly number[]): VectorCodificado {
  const partes: string[] = [];
  for (const [indice, valor] of denso.entries()) {
    if (valor !== 0) partes.push(`${String(indice)}:${String(valor)}`);
  }
  return partes.join(SEPARADOR);
}

/**
 * El vector denso que quieren `similitudCoseno` y `fraseDelNucleo`.
 *
 * Una dimensión fuera de rango se **ignora** en vez de crecer el arreglo: el
 * largo del vector es parte del artefacto, y un vector más largo que el que
 * declara `dimensiones` haría que el coseno compare peras con manzanas.
 */
export function densificar(codificado: VectorCodificado, dimensiones: number): number[] {
  const denso = new Array<number>(dimensiones).fill(0);
  if (codificado.length === 0) return denso;

  for (const par of codificado.split(SEPARADOR)) {
    const corte = par.indexOf(':');
    if (corte < 0) continue;
    const indice = Number(par.slice(0, corte));
    const valor = Number(par.slice(corte + 1));
    if (Number.isInteger(indice) && indice >= 0 && indice < dimensiones && !Number.isNaN(valor)) {
      denso[indice] = valor;
    }
  }
  return denso;
}

export interface VectoresDelEscenario {
  readonly vectores: ReadonlyMap<string, readonly number[]>;
  /**
   * Ids del corpus que el artefacto no tiene. **No se rellenan con ceros en
   * silencio**: un vector cero se parece a todo lo demás en 0 y la voz caería
   * como «sola», que es una afirmación falsa presentada como medición.
   */
  readonly faltantes: readonly string[];
}

/** Los vectores de un escenario, densos y en el orden del corpus. */
export function vectoresDelEscenario(
  artefacto: ArtefactoDeVectores,
  escenarioId: string,
  ids: readonly string[],
): VectoresDelEscenario {
  const guardados = artefacto.escenarios[escenarioId];
  const vectores = new Map<string, readonly number[]>();
  const faltantes: string[] = [];

  for (const id of ids) {
    const codificado = guardados?.[id];
    if (codificado === undefined) faltantes.push(id);
    else vectores.set(id, densificar(codificado, artefacto.dimensiones));
  }

  return { vectores, faltantes };
}
