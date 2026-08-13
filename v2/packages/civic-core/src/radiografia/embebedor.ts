/**
 * El puerto del embebedor — una sola función.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.1
 *
 * El modelo queda como detalle intercambiable y no como decisión
 * irreversible: cambiar de modelo es cambiar la implementación y rehacer el
 * backfill, no reescribir el motor. La implementación real NO vive en este
 * paquete —civic-core es lógica pura, sin disco ni red— sino en el job.
 */
export interface Embebedor {
  /** Entra en la procedencia del análisis: se guarda con cada corrida. */
  readonly modelo: string;
  readonly dimensiones: number;
  embeber(textos: readonly string[]): Promise<readonly (readonly number[])[]>;
}

/** Hash determinista de 32 bits (FNV-1a). Sin dependencias, sin reloj. */
const fnv1a = (texto: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
};

/**
 * Las palabras que no dicen de qué se habla.
 *
 * Sin esta lista el falso no separaba nada: doce frases sobre tres temas
 * distintos —que no llega la plata, un pozo en la calle, la escuela— daban
 * CERO núcleos al umbral por defecto, porque los «la / de / no / que» que las
 * tres comparten dominaban el coseno. Un modelo de verdad no la necesita:
 * aprende solo que esas palabras no informan. Una bolsa de palabras no aprende.
 */
const VACIAS = new Set([
  'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo', 'al', 'del',
  'de', 'que', 'y', 'a', 'en', 'es', 'se', 'no', 'me', 'mi', 'te', 'su', 'sus',
  'por', 'con', 'para', 'como', 'mas', 'pero', 'si', 'ya', 'muy', 'este',
  'esta', 'esto', 'eso', 'ese', 'esa', 'hay', 'ni', 'o', 'le', 'nos', 'yo',
  'vos', 'ser', 'son', 'fue', 'era', 'he', 'ha', 'han', 'sin', 'sobre', 'todo',
  'cuando', 'donde', 'porque', 'tiene', 'tengo', 'hace', 'ver', 'ir', 'da',
]);

const normalizar = (texto: string): string[] =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9ñ]+/)
    .filter((p) => p.length > 0 && !VACIAS.has(p));

/**
 * Embebedor determinista para tests: una bolsa de palabras proyectada por
 * hash a `dimensiones` y normalizada a la unidad.
 *
 * **No es un modelo.** No entiende que «guita» y «plata» son lo mismo. Sirve
 * para probar el motor —que dos textos con palabras compartidas queden más
 * cerca que dos que no comparten ninguna— y para nada más. El motor real usa
 * la implementación del job.
 */
export class EmbebedorFalso implements Embebedor {
  readonly modelo = 'falso';

  // Sin anotar el tipo: `no-inferrable-types` lo prohíbe cuando el default ya
  // lo dice, y `number` es exactamente lo que infiere de `= 64`.
  // 1024 y no 64: con pocas dimensiones las colisiones de hash acercan frases
  // que no tienen nada que ver, y eso ensucia justamente lo que este falso
  // existe para probar. Es el mismo largo que devuelve `bge-m3`.
  constructor(readonly dimensiones = 1024) {}

  embeber(textos: readonly string[]): Promise<readonly (readonly number[])[]> {
    return Promise.resolve(textos.map((t) => this.uno(t)));
  }

  private uno(texto: string): readonly number[] {
    const v = new Array<number>(this.dimensiones).fill(0);
    for (const palabra of normalizar(texto)) {
      const h = fnv1a(palabra);
      const i = h % this.dimensiones;
      // El signo sale de otro bit del mismo hash: sin eso, dos palabras que
      // caen en la misma dimensión siempre se suman y nunca se cancelan.
      v[i] = (v[i] ?? 0) + (((h >>> 16) & 1) === 1 ? 1 : -1);
    }
    const norma = Math.sqrt(v.reduce((a, n) => a + n * n, 0));
    // Un texto sin palabras da el vector cero, y el cero no se puede
    // normalizar: se devuelve un eje fijo para que la norma siga siendo 1.
    if (norma === 0) {
      const cero = new Array<number>(this.dimensiones).fill(0);
      cero[0] = 1;
      return cero;
    }
    return v.map((n) => n / norma);
  }
}
