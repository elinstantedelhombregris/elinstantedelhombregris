/**
 * La vista previa de cada crónica al compartir su enlace (D-149).
 *
 * El sitio es una aplicación de una sola página y Vercel entrega el mismo `index.html` para
 * cualquier dirección. WhatsApp, X, Facebook y LinkedIn no ejecutan JavaScript: leen el
 * `<head>` tal como llega. Por eso, al terminar el build, se escribe una copia de `index.html`
 * por crónica en `dist/bitacora/<slug>/index.html`, con su título, su resumen y su portada.
 * Vercel sirve un archivo que existe antes de aplicar la reescritura a `index.html`, y la copia
 * arranca la misma aplicación, así que quien la abre en el navegador no nota nada.
 *
 * Módulo puro: sin disco y sin red. El disco lo pone `vite.config.ts`.
 */

export const SITIO = 'https://elinstantedelhombregris.com';

export interface CabeceraDeCronica {
  slug: string;
  titulo: string;
  resumen: string;
  portada: string | null;
  portadaAlt: string | null;
  borrador: boolean;
}

function sinComillas(v: string): string {
  if (
    v.length >= 2 &&
    ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"')))
  )
    return v.slice(1, -1);
  return v;
}

/** Lee del frontmatter lo que necesita la vista previa. Lee igual que `blog-registry.ts`. */
export function leerCabecera(mdx: string): CabeceraDeCronica | null {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(mdx);
  if (!m) return null;
  const campos: Record<string, string> = {};
  for (const linea of (m[1] ?? '').split('\n')) {
    const c = /^([a-zA-Z0-9_]+)\s*:\s*(.+?)\s*$/.exec(linea);
    if (c?.[1] && c[2] !== undefined) campos[c[1]] = sinComillas(c[2]);
  }
  const slug = campos.slug;
  const titulo = campos.title;
  if (!slug || !titulo) return null;
  return {
    slug,
    titulo,
    resumen: campos.summary ?? '',
    portada: campos.coverImageUrl ?? null,
    portadaAlt: campos.coverImageAlt ?? null,
    borrador: campos.draft === 'true',
  };
}

/**
 * La imagen de la vista previa. X y WhatsApp no muestran SVG: para una portada SVG se usa el
 * PNG del mismo nombre si existe, y si no, ninguna (queda la del sitio).
 */
export function imagenDeVistaPrevia(
  portada: string | null,
  existe: (ruta: string) => boolean,
): string | null {
  if (!portada?.startsWith('/')) return null;
  if (!portada.endsWith('.svg')) return portada;
  const png = portada.replace(/\.svg$/, '.png');
  return existe(png) ? png : null;
}

const escapar = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function reemplazarMeta(
  html: string,
  atributo: 'property' | 'name',
  clave: string,
  valor: string,
): string {
  const etiqueta = `<meta ${atributo}="${clave}" content="${escapar(valor)}" />`;
  const re = new RegExp(`<meta\\s+${atributo}="${clave}"\\s+content="[^"]*"\\s*/>`);
  if (re.test(html)) return html.replace(re, etiqueta);
  return html.replace('</head>', `    ${etiqueta}\n  </head>`);
}

function quitarMeta(html: string, atributo: 'property' | 'name', clave: string): string {
  return html.replace(
    new RegExp(`\\s*<meta\\s+${atributo}="${clave}"\\s+content="[^"]*"\\s*/>`),
    '',
  );
}

/** El `index.html` del sitio con el `<head>` de una crónica. */
export function htmlConVistaPrevia(
  html: string,
  c: CabeceraDeCronica,
  imagen: string | null,
): string {
  // Vite deja las etiquetas en varias líneas tal como vienen de `index.html`: se juntan antes.
  let h = html.replace(
    /<meta\s*\n\s*([^>]*?)\s*\n\s*\/>/g,
    (_t, cuerpo: string) => `<meta ${cuerpo.replace(/\s*\n\s*/g, ' ')} />`,
  );
  const titulo = `${c.titulo} · ¡BASTA!`;
  const url = `${SITIO}/bitacora/${c.slug}`;
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${escapar(titulo)}</title>`);
  h = reemplazarMeta(h, 'name', 'description', c.resumen);
  h = reemplazarMeta(h, 'property', 'og:type', 'article');
  h = reemplazarMeta(h, 'property', 'og:title', c.titulo);
  h = reemplazarMeta(h, 'property', 'og:description', c.resumen);
  h = reemplazarMeta(h, 'property', 'og:url', url);
  if (imagen) {
    h = reemplazarMeta(h, 'property', 'og:image', `${SITIO}${imagen}`);
    // El ancho y el alto declarados son los de la imagen del sitio: con otra imagen, mienten.
    h = quitarMeta(h, 'property', 'og:image:width');
    h = quitarMeta(h, 'property', 'og:image:height');
    h = c.portadaAlt
      ? reemplazarMeta(h, 'property', 'og:image:alt', c.portadaAlt)
      : quitarMeta(h, 'property', 'og:image:alt');
  }
  if (!h.includes('rel="canonical"'))
    h = h.replace('</head>', `    <link rel="canonical" href="${url}" />\n  </head>`);
  return h;
}
