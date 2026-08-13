/**
 * La cola generada en v1 — su detector.
 *
 * 320 de las 329 lecciones terminan con las mismas secciones, en TRES
 * generaciones distintas (medido 2026-08-12). El corte exige TRES anclas
 * simultáneas, porque hay 168 encabezados del autor con nombres parecidos y
 * algunas de esas secciones son lo mejor del corpus:
 *
 *   1. el encabezado es uno de la lista, exacto y solo en su línea;
 *   2. la cola candidata contiene una huella conocida, en cualquiera de sus
 *      secciones;
 *   3. de ahí al final del archivo, todo encabezado pertenece a la lista.
 *
 * Y se prueban todos los candidatos, no sólo el primero: un encabezado de cola
 * temprano perteneciente a otro bloque no puede tapar la cola real.
 *
 * Sólo `cola-limpia` autoriza a borrar. Todo lo demás va a revisión humana.
 */

export const ENCABEZADOS_COLA = [
  // generaciones A y B
  'Aplicación práctica',
  'Cómo se ve en el territorio',
  'Errores comunes',
  'Ejercicio guiado',
  'Idea fuerza',
  // generación C — 7 lecciones de `teoria-juegos-argentina-hombre-gris`, y estos
  // tres encabezados no aparecen en NINGUNA otra lección del corpus (verificado
  // 2026-08-12). `Cierre` es genérico, así que su seguridad la dan las otras dos
  // anclas, no su nombre.
  'Aplicación argentina',
  'Ejercicio de aplicación',
  'Cierre',
] as const;

/**
 * Arranques verbatim de las tres generaciones. Basta que la cola candidata
 * contenga uno — en cualquiera de sus secciones, no sólo en la primera: hay
 * lecciones donde a la primera sección se le corrió una palabra («dos o tres
 * frases propias» en vez de «dos frases propias») y la huella textual aparece
 * dos secciones más abajo.
 */
export const HUELLAS = [
  // generación A (205 lecciones)
  'Para que esta idea no quede en el plano conceptual',
  'En términos operativos, este contenido sirve',
  'muchas discusiones se traban porque se habla desde consignas',
  'Confundir el nombre del problema con su causa de fondo',
  'Resume la idea central de la lección en dos frases propias',
  'Cuando un aprendizaje se traduce en decisiones mejores',
  // generación B (108 lecciones)
  'Cobra valor cuando lo conviertes en una decisión observable',
  'El objetivo no es repetir una definición',
  'Busca un caso cercano donde este principio te permita ver algo',
  'vale por su capacidad para mejorar decisiones reales',
  'deja de ser información suelta y se convierte en capacidad acumulable',
  // generación C (7 lecciones, 3.096 palabras, «Cierre» idéntico en las 7)
  'La utilidad real del contenido aparece cuando lo llevas a decisiones concretas en Argentina',
  'Quedarse con el concepto técnico y no traducirlo a decisiones observables',
  'La prueba de esta lección no está en repetir su vocabulario',
] as const;

export type MotivoCorte = 'sin-cola' | 'cola-limpia' | 'sin-huella' | 'cola-abierta';

export interface Corte {
  motivo: MotivoCorte;
  /** Posición del carácter donde arranca la cola. Sólo con `cola-limpia`. */
  indice: number | null;
  /** Encabezados de cola encontrados, en orden. */
  encabezados: string[];
}

interface Encabezado {
  indice: number;
  nivel: number;
  texto: string;
}

function encabezados(cuerpo: string): Encabezado[] {
  const encontrados: Encabezado[] = [];
  const re = /^(#{1,6}) *(.+?) *$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cuerpo)) !== null) {
    const hashes = m[1];
    const texto = m[2];
    if (hashes && texto) {
      encontrados.push({ indice: m.index, nivel: hashes.length, texto });
    }
  }
  return encontrados;
}

const esDeCola = (texto: string): boolean =>
  (ENCABEZADOS_COLA as readonly string[]).includes(texto);

export function detectarCola(cuerpoSinFrontmatter: string): Corte {
  const todos = encabezados(cuerpoSinFrontmatter);
  const candidatos = todos.flatMap((h, i) => (esDeCola(h.texto) ? [i] : []));
  if (candidatos.length === 0) return { motivo: 'sin-cola', indice: null, encabezados: [] };

  // Se prueban TODOS los candidatos, de arriba hacia abajo. Quedarse con el
  // primero y no reintentar hacía que un encabezado de cola temprano —de otro
  // bloque, con su propia cola abierta— tapara la cola real que venía después.
  let motivoFinal: MotivoCorte = 'sin-huella';
  let encabezadosFinal: string[] = [];

  for (const i of candidatos) {
    const arranque = todos[i];
    if (arranque === undefined) continue;
    const desdeElCorte = todos.slice(i);
    const textos = desdeElCorte.map((h) => h.texto);

    // Ancla 3 primero: si de acá al final hay un encabezado ajeno, este
    // candidato no es el arranque de la cola. Se prueba el siguiente.
    if (desdeElCorte.some((h) => !esDeCola(h.texto))) {
      motivoFinal = 'cola-abierta';
      encabezadosFinal = textos;
      continue;
    }

    // Ancla 2: la huella, en cualquier parte de la cola candidata.
    const cola = cuerpoSinFrontmatter.slice(arranque.indice);
    if (!HUELLAS.some((h) => cola.includes(h))) {
      motivoFinal = 'sin-huella';
      encabezadosFinal = textos;
      continue;
    }

    return { motivo: 'cola-limpia', indice: arranque.indice, encabezados: textos };
  }

  // Ningún candidato pasó. Se reporta el motivo del último evaluado: es el más
  // cercano al final del archivo y por lo tanto el más informativo para quien
  // lo revise a mano.
  return { motivo: motivoFinal, indice: null, encabezados: encabezadosFinal };
}
