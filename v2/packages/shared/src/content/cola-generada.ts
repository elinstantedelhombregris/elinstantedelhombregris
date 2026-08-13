/**
 * La cola generada en v1 — su detector.
 *
 * 320 de las 329 lecciones terminan con las mismas cinco secciones, en dos
 * generaciones distintas (medido 2026-08-12). El corte exige TRES anclas
 * simultáneas, porque hay 168 encabezados del autor con nombres parecidos y
 * algunas de esas secciones son lo mejor del corpus:
 *
 *   1. el encabezado es uno de los cinco, exacto y solo en su línea;
 *   2. el párrafo que le sigue arranca con una huella conocida;
 *   3. de ahí al final del archivo, todo encabezado pertenece a la lista.
 *
 * Sólo `cola-limpia` autoriza a borrar. Todo lo demás va a revisión humana.
 */

export const ENCABEZADOS_COLA = [
  'Aplicación práctica',
  'Cómo se ve en el territorio',
  'Errores comunes',
  'Ejercicio guiado',
  'Idea fuerza',
] as const;

/** Arranques verbatim de las dos generaciones. Basta que el párrafo contenga uno. */
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
  const primero = todos.findIndex((h) => esDeCola(h.texto));
  if (primero === -1) return { motivo: 'sin-cola', indice: null, encabezados: [] };

  const arranque = todos[primero]!;
  const siguiente = todos[primero + 1];
  const parrafo = cuerpoSinFrontmatter.slice(
    arranque.indice,
    siguiente?.indice ?? cuerpoSinFrontmatter.length,
  );
  if (!HUELLAS.some((h) => parrafo.includes(h))) {
    return { motivo: 'sin-huella', indice: null, encabezados: [arranque.texto] };
  }

  const desdeElCorte = todos.slice(primero);
  const ajeno = desdeElCorte.find((h) => !esDeCola(h.texto));
  if (ajeno) {
    return { motivo: 'cola-abierta', indice: null, encabezados: desdeElCorte.map((h) => h.texto) };
  }

  return {
    motivo: 'cola-limpia',
    indice: arranque.indice,
    encabezados: desdeElCorte.map((h) => h.texto),
  };
}
