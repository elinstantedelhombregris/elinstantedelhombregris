/**
 * Partir un .mdx en frontmatter crudo y cuerpo.
 *
 * Para LEER frontmatter validado está `loadContentDir` (gray-matter + Zod).
 * Esto es para ESCRIBIR: los scripts que reescriben cuerpos necesitan el
 * frontmatter como texto intacto, byte por byte. De ahí el invariante
 * `encabezado + cuerpo === raw`, que el test fija.
 */

export interface MdxPartido {
  /** Frontmatter crudo, delimitadores incluidos. Cadena vacía si no hay. */
  encabezado: string;
  cuerpo: string;
}

export function separarMdx(raw: string): MdxPartido {
  if (!raw.startsWith('---')) return { encabezado: '', cuerpo: raw };
  const fin = raw.indexOf('\n---', 3);
  if (fin === -1) return { encabezado: '', cuerpo: raw };
  const corte = fin + 4;
  return { encabezado: raw.slice(0, corte), cuerpo: raw.slice(corte) };
}
