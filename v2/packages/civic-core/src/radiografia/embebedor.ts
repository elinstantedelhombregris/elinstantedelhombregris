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

const normalizar = (texto: string): string[] =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9ñ]+/)
    .filter((p) => p.length > 0);

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
  constructor(readonly dimensiones = 64) {}

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
