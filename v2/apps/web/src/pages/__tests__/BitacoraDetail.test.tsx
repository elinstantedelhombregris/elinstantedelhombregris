import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Router, useLocation } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { BitacoraDetail } from '../BitacoraDetail';

import type { BlogPost } from '~/lib/blog-registry';

import { BLOG_POSTS } from '~/lib/blog-registry';
import { fechaLarga, ubicarCronica } from '~/pages/Bitacora/bitacora-data';

/**
 * BitacoraDetail.test.tsx — página papel 3.4, el lector de crónica. Cero
 * slugs hardcodeados: las fixtures se eligen por posición derivada de
 * BLOG_POSTS (patrón exacto de EnsayoDetail.test.tsx / PlanDetail.test.tsx,
 * con memoryLocation).
 */

/** Monta `BitacoraDetail` con la ubicación de wouter fijada al path dado. */
function renderAt(path: string) {
  const { hook } = memoryLocation({ path, static: true });
  return render(
    <Router hook={hook}>
      <BitacoraDetail />
    </Router>,
  );
}

function escapeRegExp(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Texto exacto del kicker del lector — misma concatenación que produce el componente. */
function textoDelKicker(post: BlogPost): string {
  const categoria = post.category !== '' ? ` · ${post.category}` : '';
  const fecha = fechaLarga(post.publishedAt);
  const fechaTramo = fecha !== '' ? ` · ${fecha}` : '';
  const minutos = post.readingMinutes > 0 ? ` · ${String(post.readingMinutes)} min` : '';
  return `Bitácora${categoria}${fechaTramo}${minutos}`;
}

/** Un fragmento real de prosa del cuerpo, sin sintaxis markdown, para probar el verbatim. */
function fragmentoDelCuerpo(body: string): string {
  const primerParrafo = body.trim().split('\n\n')[0] ?? '';
  const limpio = primerParrafo
    .replace(/^>+\s*/gm, '')
    .replace(/[*_#`]/g, '')
    .trim();
  if (limpio.length < 10) throw new Error('no se encontró un fragmento de prosa — fixture inválida');
  return limpio.slice(0, 40);
}

function linkPorHref(scope: HTMLElement, href: string): HTMLElement {
  const el = scope.querySelector(`a[href="${href}"]`);
  if (!el) throw new Error(`no se encontró un link a ${href} dentro del scope`);
  return el as HTMLElement;
}

/** Una crónica que no es ni la más nueva ni la más vieja (tiene los dos vecinos). */
function cronicaDelMedio(): BlogPost {
  const i = Math.floor(BLOG_POSTS.length / 2);
  const medio = BLOG_POSTS[i];
  if (!medio) throw new Error('BLOG_POSTS no tiene suficientes elementos para la fixture del medio');
  return medio;
}

const masNueva = BLOG_POSTS[0];
const masVieja = BLOG_POSTS.at(-1);
const medio = cronicaDelMedio();

describe('BitacoraDetail (página papel 3.4 — el lector de crónica)', () => {
  it('cabecera y cuerpo: kicker derivado, H1 con aria-label, bajada, cuerpo verbatim, firma y backlink', () => {
    renderAt(`/bitacora/${medio.slug}`);

    expect(screen.getByText(textoDelKicker(medio))).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: medio.title })).toBeInTheDocument();
    if (medio.summary !== '') {
      expect(screen.getByText(medio.summary)).toBeInTheDocument();
    }
    const fragmento = fragmentoDelCuerpo(medio.body);
    expect(screen.getByText(new RegExp(escapeRegExp(fragmento)))).toBeInTheDocument();
    expect(screen.getByText('— El hombre gris')).toBeInTheDocument();

    const backlink = screen.getByRole('link', { name: '← La bitácora' });
    expect(backlink).toHaveAttribute('href', '/bitacora');
  });

  it('cadena — la más nueva no tiene eslabón anterior, solo el siguiente (más antigua)', () => {
    expect(masNueva).toBeDefined();
    if (!masNueva) return;
    const u = ubicarCronica(masNueva.slug);
    expect(u).not.toBeNull();
    if (!u) return;
    expect(u.anterior).toBeNull();
    expect(u.siguiente).not.toBeNull();

    const { container } = renderAt(`/bitacora/${masNueva.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav || !u.siguiente) return;

    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    const link = linkPorHref(nav, `/bitacora/${u.siguiente.slug}`);
    expect(link).toHaveTextContent(`${u.siguiente.title} →`);
    expect(link).toHaveTextContent('más antigua');
  });

  it('cadena — la más vieja no tiene eslabón siguiente, solo el anterior (más reciente)', () => {
    expect(masVieja).toBeDefined();
    if (!masVieja) return;
    const u = ubicarCronica(masVieja.slug);
    expect(u).not.toBeNull();
    if (!u) return;
    expect(u.siguiente).toBeNull();
    expect(u.anterior).not.toBeNull();

    const { container } = renderAt(`/bitacora/${masVieja.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav || !u.anterior) return;

    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    const link = linkPorHref(nav, `/bitacora/${u.anterior.slug}`);
    expect(link).toHaveTextContent(`← ${u.anterior.title}`);
    expect(link).toHaveTextContent('más reciente');
  });

  it('cadena — una crónica del medio tiene los dos eslabones, con el título del vecino y el aviso correcto', () => {
    const u = ubicarCronica(medio.slug);
    expect(u).not.toBeNull();
    if (!u?.anterior || !u.siguiente) return;

    const { container } = renderAt(`/bitacora/${medio.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav) return;

    const linkAnterior = linkPorHref(nav, `/bitacora/${u.anterior.slug}`);
    expect(linkAnterior).toHaveTextContent(`← ${u.anterior.title}`);
    expect(linkAnterior).toHaveTextContent('más reciente');

    const linkSiguiente = linkPorHref(nav, `/bitacora/${u.siguiente.slug}`);
    expect(linkSiguiente).toHaveTextContent(`${u.siguiente.title} →`);
    expect(linkSiguiente).toHaveTextContent('más antigua');
  });

  it('edición impresa: article con edicion-impresa, folio con clases print, backlink/cadena/cierre con print:hidden, H1 con guarda de impresión', () => {
    const { container } = renderAt(`/bitacora/${medio.slug}`);

    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article).toHaveClass('edicion-impresa');

    const fecha = fechaLarga(new Date().toISOString());
    const folio = screen.getByText(new RegExp(`¡BASTA! · edición del lector · ${fecha}`));
    expect(folio).toHaveClass('hidden');
    expect(folio).toHaveClass('print:block');

    const backlink = screen.getByRole('link', { name: '← La bitácora' });
    expect(backlink).toHaveClass('print:hidden');

    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav).toHaveClass('print:hidden');

    const cierre = screen.getByText('Esto ya pasó. Lo que sigue lo escribís vos.').closest('div');
    expect(cierre).toHaveClass('print:hidden');

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('print:[&_span]:animate-none');
  });

  it('dirección vieja: redirige a la URL canónica y la ubicación de wouter cambia con replace', () => {
    const conLegado = BLOG_POSTS.find((p) => p.legacySlugs.length > 0);
    expect(conLegado).toBeDefined();
    if (!conLegado) return;
    const legacySlug = conLegado.legacySlugs[0];
    expect(legacySlug).toBeDefined();
    if (legacySlug === undefined) return;

    function Sonda() {
      const [location] = useLocation();
      return <span data-testid="ubicacion">{location}</span>;
    }

    const { hook } = memoryLocation({ path: `/bitacora/${legacySlug}` });
    render(
      <Router hook={hook}>
        <Sonda />
        <BitacoraDetail />
      </Router>,
    );

    expect(screen.getByTestId('ubicacion')).toHaveTextContent(`/bitacora/${conLegado.slug}`);
  });

  it('404: slug inexistente muestra el expediente extraviado con CTA a /bitacora', () => {
    renderAt('/bitacora/esto-no-existe-seguro');

    expect(screen.getByText('expediente extraviado')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Esa crónica no está.' })).toBeInTheDocument();
    expect(screen.getByText('Extraviado')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Volver a la bitácora →' });
    expect(cta).toHaveAttribute('href', '/bitacora');
  });

  it('mata lo que murió: sin MdxContent, sin ♥, sin "Comentarios", sin chips de tag ni chrome v1-port', () => {
    const { container } = renderAt(`/bitacora/${medio.slug}`);

    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
    expect(container.innerHTML).not.toMatch(/MdxContent/);
    expect(screen.queryByText('♥')).not.toBeInTheDocument();
    expect(screen.queryByText(/comentarios/i)).not.toBeInTheDocument();
    for (const tag of medio.tags) {
      expect(screen.queryByText(`#${tag}`)).not.toBeInTheDocument();
    }
  });
});
