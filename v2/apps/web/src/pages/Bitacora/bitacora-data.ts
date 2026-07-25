import {
  BLOG_POSTS,
  findBlogPost,
  findBlogPostByLegacySlug,
  type BlogPost,
} from '~/lib/blog-registry';

/**
 * La bitácora (spec 3.4). `BLOG_POSTS` ya viene por `publishedAt`
 * descendente: acá solo se agrupa por año —el eje real de una bitácora— y
 * se resuelven vecinos y direcciones viejas. Ningún conteo literal vive en
 * el JSX.
 */
export interface AnioBitacora {
  anio: string;
  cronicas: readonly BlogPost[];
}

function construirAnios(): AnioBitacora[] {
  const grupos = new Map<string, BlogPost[]>();
  for (const post of BLOG_POSTS) {
    const anio = post.publishedAt.slice(0, 4);
    const acumulado = grupos.get(anio) ?? [];
    acumulado.push(post);
    grupos.set(anio, acumulado);
  }
  return [...grupos.entries()]
    .map(([anio, cronicas]) => ({ anio, cronicas }))
    .sort((a, b) => (a.anio < b.anio ? 1 : a.anio > b.anio ? -1 : 0));
}

export const ANIOS: readonly AnioBitacora[] = construirAnios();
export const CRONICA_COUNT = BLOG_POSTS.length;

/** Fecha larga es-AR. Duplicada a propósito (ver Global Constraints). */
export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function mesYAnio(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

/** «desde {mes} de {año}»: la crónica más vieja de la colección. */
export const DESDE = mesYAnio(BLOG_POSTS.at(-1)?.publishedAt ?? '');

export interface UbicacionCronica {
  /** El vecino más reciente (arriba en el índice). */
  anterior: BlogPost | null;
  /** El vecino más antiguo (abajo en el índice). */
  siguiente: BlogPost | null;
}

export function ubicarCronica(slug: string): UbicacionCronica | null {
  const i = BLOG_POSTS.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  return { anterior: BLOG_POSTS[i - 1] ?? null, siguiente: BLOG_POSTS[i + 1] ?? null };
}

export type ResolucionCronica =
  | { estado: 'canonica'; post: BlogPost }
  | { estado: 'legado'; canonico: string }
  | { estado: 'desconocida' };

/**
 * Única puerta de entrada por slug: canónico → se lee; dirección vieja →
 * el lector redirige con `replace`; desconocido → 404 expediente.
 */
export function resolverCronica(slug: string): ResolucionCronica {
  const post = findBlogPost(slug);
  if (post) return { estado: 'canonica', post };
  const legado = findBlogPostByLegacySlug(slug);
  if (legado) return { estado: 'legado', canonico: legado.slug };
  return { estado: 'desconocida' };
}

/** Numeración de fila dentro del año: «01»… */
export function numeroDeFila(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}
