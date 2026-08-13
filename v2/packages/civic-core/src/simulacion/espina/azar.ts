/**
 * El azar de la Simulación — spec §2.7 y §3.7.
 *
 * El motor no tenía azar: cero `Math.random`, cero `Date.now()`, dos corridas
 * con la misma entrada daban un resultado byte a byte idéntico. Eso significa
 * que la reproducibilidad estaba regalada y lo que faltaba era **varianza**, y
 * que la casa está limpia para crearla bien: no hay azar escondido que
 * desalojar.
 *
 * Tres decisiones, y cada una tapa un agujero conocido:
 *
 * 1. **La semilla entra por parámetro y vive en el `Escenario`**, no entre las
 *    palancas: es identidad de la corrida, no una perilla más.
 * 2. **El azar es por COORDENADA, no por secuencia.** `azarDe(semilla, ronda,
 *    indice, proposito)` es un mezclador sin estado. La consecuencia que un
 *    PRNG lineal no da: agregar una persona —o un sorteo nuevo en cualquier
 *    lado— **no corre el azar de las demás**, así que dos corridas con distinto
 *    N siguen siendo comparables. Sin eso, un Monte Carlo mide su propio
 *    reordenamiento y nadie se entera.
 * 3. **`Math.random` queda prohibido en `civic-core`**, y hay una guarda que
 *    grepea el fuente.
 *
 * Sin dependencias y sin estado global. El mezclador es el finalizador de
 * splitmix32: cuatro operaciones enteras, avalancha buena, y `Math.imul` para
 * que la multiplicación de 32 bits no se vaya al doble flotante.
 */

/** Un entero de 32 bits sin signo, revuelto. Determinista y sin estado. */
function mezclar32(x: number): number {
  let h = x >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x21f0aaad);
  h ^= h >>> 15;
  h = Math.imul(h, 0x735a2d97);
  h ^= h >>> 15;
  return h >>> 0;
}

/**
 * FNV-1a de 32 bits. Es el mismo hash que ya usa `radiografia/embebedor.ts`
 * para su doble determinista: una sola forma de hashear texto en el paquete.
 */
export const SEMILLA_FNV = 0x811c9dc5;

/**
 * FNV-1a rodante: se le pasa el acumulado y sigue. Así una huella sobre cien
 * mil voces no arma un string de cien mil pedazos para hashearlo después.
 */
export function acumularHuella(acumulado: number, texto: string): number {
  let h = acumulado >>> 0;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export const huellaDeTexto = (texto: string): number => acumularHuella(SEMILLA_FNV, texto);

/** La huella como texto, que es como viaja en una `Corrida` y en una URL. */
export const huellaHex = (n: number): string => (n >>> 0).toString(16).padStart(8, '0');

/**
 * El mezclador sin estado: una coordenada entra, un número en [0, 1) sale.
 *
 * Las coordenadas se truncan a entero de 32 bits. Un flotante como coordenada
 * sería un error silencioso —dos valores distintos que caen en el mismo entero
 * darían el mismo sorteo—, así que quien tenga un flotante lo cuantiza a
 * propósito antes de entrar acá, y se ve en el call site.
 */
export function azarDe(semilla: number, ...coords: readonly number[]): number {
  let h = mezclar32(semilla ^ 0x9e3779b9);
  for (const c of coords) {
    h = mezclar32((h ^ mezclar32(Math.trunc(c) | 0)) >>> 0);
  }
  // 2^32: la división cae en [0, 1) y nunca alcanza el 1.
  return h / 4_294_967_296;
}

/**
 * Una corriente con estado, para los lugares donde el orden de consumo es
 * natural (barajar un array, tomar N muestras seguidas).
 *
 * `rama(etiqueta)` es lo que la vuelve segura: cada consumidor pide la suya y
 * consume a su ritmo sin correr los sorteos de los demás. Con una sola
 * corriente lineal, agregar un sorteo en cualquier lado corre todos los de
 * abajo y el barrido de ayer deja de ser comparable con el de hoy, en silencio.
 */
export interface Azar {
  readonly semilla: number;
  /** El próximo número en [0, 1). */
  siguiente(): number;
  /** Un entero en [0, n). Con `n <= 0` devuelve 0: no hay dónde sortear. */
  entero(n: number): number;
  /** Una sub-corriente etiquetada, independiente de lo ya consumido. */
  rama(etiqueta: string): Azar;
}

class CorrienteDeAzar implements Azar {
  #paso = 0;

  constructor(readonly semilla: number) {}

  siguiente(): number {
    this.#paso += 1;
    return azarDe(this.semilla, this.#paso);
  }

  entero(n: number): number {
    if (n <= 0) return 0;
    return Math.min(Math.floor(this.siguiente() * n), Math.floor(n) - 1);
  }

  rama(etiqueta: string): Azar {
    return crearAzar(mezclar32(this.semilla ^ huellaDeTexto(etiqueta)));
  }
}

export const crearAzar = (semilla: number): Azar => new CorrienteDeAzar(mezclar32(semilla));

/**
 * Fisher-Yates con la corriente dada. Devuelve una copia: barajar en el lugar
 * un array que vino por parámetro es la clase de efecto que hace que un test
 * pase la primera vez y falle la segunda.
 */
export function barajar<T>(items: readonly T[], azar: Azar): T[] {
  const salida = [...items];
  for (let i = salida.length - 1; i > 0; i--) {
    const j = azar.entero(i + 1);
    const a = salida[i];
    const b = salida[j];
    // `noUncheckedIndexedAccess`: los dos índices son válidos por construcción,
    // y el compilador no lo sabe. Se chequea en vez de afirmar con `!`.
    if (a !== undefined && b !== undefined) {
      salida[i] = b;
      salida[j] = a;
    }
  }
  return salida;
}
