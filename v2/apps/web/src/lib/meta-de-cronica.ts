import { useEffect } from 'react';

import type { BlogPost } from '~/lib/blog-registry';

import { useTituloDePagina } from '~/lib/titulo-de-pagina';

export const ORIGEN_DEL_SITIO = 'https://elinstantedelhombregris.com';

/** La firma de toda crónica (BitacoraDetail la escribe al pie). */
const AUTOR = 'Un hombre gris';

/** Los datos estructurados de una crónica, en el vocabulario de schema.org. */
export function datosEstructurados(post: BlogPost): Record<string, unknown> {
  const url = `${ORIGEN_DEL_SITIO}/bitacora/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    inLanguage: 'es-AR',
    url,
    mainEntityOfPage: url,
    ...(post.publishedAt !== '' ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt !== '' ? { dateModified: post.updatedAt } : {}),
    ...(post.coverImageUrl !== '' ? { image: `${ORIGEN_DEL_SITIO}${post.coverImageUrl}` } : {}),
    keywords: post.tags.join(', '),
    author: { '@type': 'Person', name: AUTOR },
    publisher: { '@type': 'Organization', name: '¡BASTA!', url: ORIGEN_DEL_SITIO },
    isPartOf: { '@type': 'Blog', name: 'La bitácora', url: `${ORIGEN_DEL_SITIO}/bitacora` },
    ...(post.readingMinutes > 0 ? { timeRequired: `PT${String(post.readingMinutes)}M` } : {}),
  };
}

/** Pone (o crea) un elemento del `<head>` y devuelve cómo dejarlo como estaba. */
function ponerEnElHead<T extends HTMLElement>(
  selector: string,
  crear: () => T,
  aplicar: (elemento: T) => void,
): () => void {
  const existente = document.head.querySelector<T>(selector);
  if (existente) {
    const antes = existente.cloneNode(true);
    aplicar(existente);
    return () => {
      existente.replaceWith(antes);
    };
  }
  const nuevo = crear();
  aplicar(nuevo);
  document.head.appendChild(nuevo);
  return () => {
    nuevo.remove();
  };
}

/**
 * Lo que un buscador lee de una crónica: título de pestaña, descripción,
 * dirección canónica y datos estructurados (`BlogPosting`). El sitio es una
 * SPA, así que esto lo ve quien ejecuta JavaScript —Google sí—; las vistas
 * previas de redes sociales no (D-149).
 */
export function useMetaDeCronica(post: BlogPost | undefined): void {
  useTituloDePagina(post?.title ?? '');

  useEffect(() => {
    if (!post) return;
    const deshacer = [
      ponerEnElHead(
        'meta[name="description"]',
        () => {
          const meta = document.createElement('meta');
          meta.name = 'description';
          return meta;
        },
        (meta) => {
          meta.content = post.summary;
        },
      ),
      ponerEnElHead(
        'link[rel="canonical"]',
        () => {
          const link = document.createElement('link');
          link.rel = 'canonical';
          return link;
        },
        (link) => {
          link.href = `${ORIGEN_DEL_SITIO}/bitacora/${post.slug}`;
        },
      ),
      ponerEnElHead(
        'script[type="application/ld+json"][data-cronica]',
        () => {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.dataset.cronica = '';
          return script;
        },
        (script) => {
          script.textContent = JSON.stringify(datosEstructurados(post));
        },
      ),
    ];
    return () => {
      for (const paso of deshacer) paso();
    };
  }, [post]);
}
