import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { htmlConVistaPrevia, imagenDeVistaPrevia, leerCabecera } from '../vista-previa';

const AQUI = dirname(fileURLToPath(import.meta.url));
const INDEX = readFileSync(join(AQUI, '..', '..', '..', 'index.html'), 'utf8');

const MDX = `---
slug: el-pueblo-no-delibera-ni-gobierna
title: '«El pueblo no delibera ni gobierna»'
summary: 'Dos horas: eso te pide el sistema. Con "comillas" & <signos>.'
coverImageUrl: /media/bitacora/editorial/delibera-articulo-22.svg
coverImageAlt: 'El artículo 22, tachado a mano'
tags:
  - democracia
draft: false
---

Cuerpo.
`;

const meta = (html: string, clave: string): string | null => {
  const m = new RegExp(`<meta (?:property|name)="${clave}" content="([^"]*)" />`).exec(html);
  return m?.[1] ?? null;
};

describe('la vista previa de una crónica (D-149)', () => {
  const c = leerCabecera(MDX);

  it('lee el frontmatter como el registro de la bitácora', () => {
    expect(c).toEqual({
      slug: 'el-pueblo-no-delibera-ni-gobierna',
      titulo: '«El pueblo no delibera ni gobierna»',
      resumen: 'Dos horas: eso te pide el sistema. Con "comillas" & <signos>.',
      portada: '/media/bitacora/editorial/delibera-articulo-22.svg',
      portadaAlt: 'El artículo 22, tachado a mano',
      borrador: false,
    });
  });

  it('una portada SVG usa su PNG si existe, y si no, ninguna', () => {
    const portada = '/media/bitacora/editorial/delibera-articulo-22.svg';
    expect(imagenDeVistaPrevia(portada, () => true)).toBe(
      '/media/bitacora/editorial/delibera-articulo-22.png',
    );
    expect(imagenDeVistaPrevia(portada, () => false)).toBeNull();
    expect(imagenDeVistaPrevia('/media/x.webp', () => false)).toBe('/media/x.webp');
    expect(imagenDeVistaPrevia(null, () => true)).toBeNull();
  });

  it('pone el título, el resumen, la dirección y la portada de la crónica', () => {
    if (!c) throw new Error('sin cabecera');
    const h = htmlConVistaPrevia(INDEX, c, '/media/bitacora/editorial/delibera-articulo-22.png');
    expect(h).toContain('<title>«El pueblo no delibera ni gobierna» · ¡BASTA!</title>');
    expect(meta(h, 'og:title')).toBe('«El pueblo no delibera ni gobierna»');
    expect(meta(h, 'og:description')).toBe(
      'Dos horas: eso te pide el sistema. Con &quot;comillas&quot; &amp; &lt;signos&gt;.',
    );
    expect(meta(h, 'description')).toBe(meta(h, 'og:description'));
    expect(meta(h, 'og:type')).toBe('article');
    expect(meta(h, 'og:url')).toBe(
      'https://elinstantedelhombregris.com/bitacora/el-pueblo-no-delibera-ni-gobierna',
    );
    expect(meta(h, 'og:image')).toBe(
      'https://elinstantedelhombregris.com/media/bitacora/editorial/delibera-articulo-22.png',
    );
    expect(meta(h, 'og:image:alt')).toBe('El artículo 22, tachado a mano');
    expect(meta(h, 'og:image:width')).toBeNull();
    expect(meta(h, 'twitter:card')).toBe('summary_large_image');
    expect(h).toContain(
      '<link rel="canonical" href="https://elinstantedelhombregris.com/bitacora/el-pueblo-no-delibera-ni-gobierna" />',
    );
    // cada etiqueta una sola vez
    expect(h.match(/property="og:title"/g)).toHaveLength(1);
    expect(h.match(/name="description"/g)).toHaveLength(1);
  });

  it('sin imagen propia deja la del sitio con sus medidas', () => {
    if (!c) throw new Error('sin cabecera');
    const h = htmlConVistaPrevia(INDEX, c, null);
    expect(meta(h, 'og:image')).toBe(
      'https://elinstantedelhombregris.com/media/prensa/basta-marca-fondo-claro.png',
    );
    expect(meta(h, 'og:image:width')).toBe('2000');
    expect(meta(h, 'og:title')).toBe('«El pueblo no delibera ni gobierna»');
  });

  it('no toca nada fuera del head', () => {
    if (!c) throw new Error('sin cabecera');
    const h = htmlConVistaPrevia(INDEX, c, null);
    expect(h.slice(h.indexOf('<body'))).toBe(INDEX.slice(INDEX.indexOf('<body')));
  });
});
