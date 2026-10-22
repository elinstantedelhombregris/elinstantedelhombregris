import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { BLOG_POSTS } from '../blog-registry';
import { datosEstructurados, ORIGEN_DEL_SITIO, useMetaDeCronica } from '../meta-de-cronica';

import type { BlogPost } from '../blog-registry';

function Lector({ post }: { post: BlogPost }) {
  useMetaDeCronica(post);
  return null;
}

const post = BLOG_POSTS[0];

afterEach(() => {
  document.head.innerHTML = '';
  document.title = '';
});

describe('useMetaDeCronica', () => {
  it('pone título, descripción, canónica y datos estructurados de la crónica', () => {
    if (!post) throw new Error('la bitácora está vacía');
    render(<Lector post={post} />);

    expect(document.title).toBe(`${post.title} · ¡BASTA!`);
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).toBe(
      post.summary,
    );
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      `${ORIGEN_DEL_SITIO}/bitacora/${post.slug}`,
    );
    const ld = document.head.querySelector('script[type="application/ld+json"]')?.textContent ?? '';
    expect(JSON.parse(ld)).toMatchObject({ '@type': 'BlogPosting', headline: post.title });
  });

  it('al salir de la crónica devuelve el head como estaba', () => {
    if (!post) throw new Error('la bitácora está vacía');
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'La descripción del sitio.';
    document.head.appendChild(meta);

    const { unmount } = render(<Lector post={post} />);
    unmount();

    expect(document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).toBe(
      'La descripción del sitio.',
    );
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});

describe('datosEstructurados', () => {
  it('no inventa fechas ni imagen que el post no tiene', () => {
    if (!post) throw new Error('la bitácora está vacía');
    const datos = datosEstructurados({ ...post, publishedAt: '', updatedAt: '', coverImageUrl: '' });
    expect(datos).not.toHaveProperty('datePublished');
    expect(datos).not.toHaveProperty('dateModified');
    expect(datos).not.toHaveProperty('image');
  });
});
