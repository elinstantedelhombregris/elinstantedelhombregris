import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { EnsayoDetail } from '../EnsayoDetail';

import type { EnsayoEntry } from '~/lib/ensayos-registry';

import { CICLOS, ORDEN_DE_LECTURA, fechaLarga, ubicarEnsayo } from '~/pages/Biblioteca/biblioteca-data';

/**
 * EnsayoDetail.test.tsx — página papel 3.2, el lector de ensayo. Cero slugs
 * hardcodeados: las fixtures se eligen por posición derivada de
 * ORDEN_DE_LECTURA/CICLOS (patrón exacto de PlanDetail.test.tsx, con
 * memoryLocation).
 */

/** Monta `EnsayoDetail` con la ubicación de wouter fijada al path dado. */
function renderAt(path: string) {
  const { hook } = memoryLocation({ path, static: true });
  return render(
    <Router hook={hook}>
      <EnsayoDetail />
    </Router>,
  );
}

/** Texto exacto del kicker del lector — misma concatenación que produce el componente. */
function textoDelKicker(u: NonNullable<ReturnType<typeof ubicarEnsayo>>, ensayo: EnsayoEntry): string {
  const forma = ensayo.form === 'acta' ? 'acta' : 'ensayo';
  const minutos = ensayo.readingMinutes > 0 ? ` · ${String(ensayo.readingMinutes)} min` : '';
  return `Ciclo ${u.ciclo.romano} — ${u.ciclo.rotulo} · ${forma} ${String(u.posicion)} de ${String(u.total)}${minutos}`;
}

/** El primer heading nivel 2 real del cuerpo — todos los cuerpos abren en `## I. …`. */
function primerH2(body: string): string {
  const m = /^##\s+(.+)$/m.exec(body);
  if (!m?.[1]) throw new Error('el cuerpo no abre con un heading nivel 2 — fixture inválida');
  return m[1].trim();
}

function linkPorHref(scope: HTMLElement, href: string): HTMLElement {
  const el = scope.querySelector(`a[href="${href}"]`);
  if (!el) throw new Error(`no se encontró un link a ${href} dentro del scope`);
  return el as HTMLElement;
}

/** Un ensayo que no es ni el primero ni el último de su ciclo (vecinos same-cycle). */
function ensayoDelMedio(): EnsayoEntry {
  const ciclo = CICLOS.find((c) => c.ensayos.length >= 3);
  if (!ciclo) throw new Error('se necesita un ciclo con al menos 3 ensayos para la fixture del medio');
  const medio = ciclo.ensayos[Math.floor(ciclo.ensayos.length / 2)];
  if (!medio) throw new Error('ensayo del medio no encontrado');
  return medio;
}

const primero = ORDEN_DE_LECTURA[0];
const ultimo = ORDEN_DE_LECTURA.at(-1);
const medio = ensayoDelMedio();
const acta = ORDEN_DE_LECTURA.find((e) => e.form === 'acta');

describe('EnsayoDetail (página papel 3.2 — lector de ensayo)', () => {
  it('cabecera del ensayo del medio: kicker derivado, H1 con aria-label, subtítulo y firma', () => {
    if (!primero) throw new Error('ORDEN_DE_LECTURA vacío');
    const u = ubicarEnsayo(medio.slug);
    expect(u).not.toBeNull();
    if (!u) return;

    renderAt(`/ensayos/${medio.slug}`);

    expect(screen.getByText(textoDelKicker(u, medio))).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: medio.title })).toBeInTheDocument();
    if (medio.subtitle) {
      expect(screen.getByText(medio.subtitle)).toBeInTheDocument();
    }
    expect(screen.getByRole('heading', { level: 2, name: primerH2(medio.body) })).toBeInTheDocument();
    expect(screen.getByText('— El hombre gris')).toBeInTheDocument();
  });

  it('backlink a /biblioteca', () => {
    renderAt(`/ensayos/${medio.slug}`);

    const backlink = screen.getByRole('link', { name: '← La biblioteca' });
    expect(backlink).toHaveAttribute('href', '/biblioteca');
  });

  it('el acta: el kicker dice "acta", no "ensayo"', () => {
    expect(acta).toBeDefined();
    if (!acta) return;
    const u = ubicarEnsayo(acta.slug);
    expect(u).not.toBeNull();
    if (!u) return;

    renderAt(`/ensayos/${acta.slug}`);

    expect(screen.getByText(textoDelKicker(u, acta))).toBeInTheDocument();
    expect(screen.getByText(textoDelKicker(u, acta))).toHaveTextContent(/· acta \d+ de \d+/);
  });

  it('cadena — el primero de ORDEN_DE_LECTURA no tiene eslabón anterior, solo siguiente', () => {
    if (!primero) throw new Error('ORDEN_DE_LECTURA vacío');
    const u = ubicarEnsayo(primero.slug);
    expect(u).not.toBeNull();
    if (!u) return;
    expect(u.anterior).toBeNull();
    expect(u.siguiente).not.toBeNull();

    const { container } = renderAt(`/ensayos/${primero.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav || !u.siguiente) return;

    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    expect(linkPorHref(nav, `/ensayos/${u.siguiente.ensayo.slug}`)).toBeInTheDocument();
  });

  it('cadena — el último de ORDEN_DE_LECTURA (el acta) no tiene eslabón siguiente, solo anterior', () => {
    if (!ultimo) throw new Error('ORDEN_DE_LECTURA vacío');
    const u = ubicarEnsayo(ultimo.slug);
    expect(u).not.toBeNull();
    if (!u) return;
    expect(u.siguiente).toBeNull();
    expect(u.anterior).not.toBeNull();

    const { container } = renderAt(`/ensayos/${ultimo.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav || !u.anterior) return;

    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    expect(linkPorHref(nav, `/ensayos/${u.anterior.ensayo.slug}`)).toBeInTheDocument();
  });

  it('cadena — el último de un ciclo intermedio avisa el cruce al ciclo siguiente', () => {
    const cicloIntermedio = CICLOS[0];
    expect(cicloIntermedio).toBeDefined();
    if (!cicloIntermedio) return;
    const ultimoDelCiclo = cicloIntermedio.ensayos.at(-1);
    expect(ultimoDelCiclo).toBeDefined();
    if (!ultimoDelCiclo) return;

    const u = ubicarEnsayo(ultimoDelCiclo.slug);
    expect(u).not.toBeNull();
    expect(u?.siguiente?.cruzaCiclo).toBe(true);
    if (!u?.siguiente) return;

    const { container } = renderAt(`/ensayos/${ultimoDelCiclo.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav) return;

    const link = linkPorHref(nav, `/ensayos/${u.siguiente.ensayo.slug}`);
    expect(link.textContent).toContain(`Ciclo ${u.siguiente.ciclo.romano} — ${u.siguiente.ciclo.rotulo}`);
  });

  it('cadena — un vecino del mismo ciclo no muestra el aviso de cruce', () => {
    const u = ubicarEnsayo(medio.slug);
    expect(u).not.toBeNull();
    if (!u?.anterior || !u.siguiente) return;
    expect(u.anterior.cruzaCiclo).toBe(false);
    expect(u.siguiente.cruzaCiclo).toBe(false);

    const { container } = renderAt(`/ensayos/${medio.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav) return;

    const linkAnterior = linkPorHref(nav, `/ensayos/${u.anterior.ensayo.slug}`);
    expect(linkAnterior.textContent).not.toContain('Ciclo ');
    const linkSiguiente = linkPorHref(nav, `/ensayos/${u.siguiente.ensayo.slug}`);
    expect(linkSiguiente.textContent).not.toContain('Ciclo ');
  });

  it('edición impresa: article con edicion-impresa, folio con clases print, backlink/cadena/cierre con print:hidden, H1 con guarda de impresión', () => {
    const { container } = renderAt(`/ensayos/${medio.slug}`);

    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article).toHaveClass('edicion-impresa');

    const fecha = fechaLarga(new Date().toISOString());
    const folio = screen.getByText(new RegExp(`¡BASTA! · edición del lector · ${fecha}`));
    expect(folio).toHaveClass('hidden');
    expect(folio).toHaveClass('print:block');

    const backlink = screen.getByRole('link', { name: '← La biblioteca' });
    expect(backlink).toHaveClass('print:hidden');

    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav).toHaveClass('print:hidden');

    const cierre = screen.getByText('¿Te resonó? No lo dejes en lectura.').closest('div');
    expect(cierre).toHaveClass('print:hidden');

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('print:[&_span]:animate-none');
  });

  it('404: slug inexistente muestra el expediente extraviado con CTA a /biblioteca', () => {
    renderAt('/ensayos/esto-no-existe-seguro');

    expect(screen.getByText('expediente extraviado')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ese ensayo no está.' })).toBeInTheDocument();
    expect(screen.getByText('Extraviado')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Volver a la biblioteca →' });
    expect(cta).toHaveAttribute('href', '/biblioteca');
  });

  it('mata el chrome v1-port: sin glass, gradient-text, iris-violet, font-serif ni MdxContent', () => {
    const { container } = renderAt(`/ensayos/${medio.slug}`);

    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
    expect(container.innerHTML).not.toMatch(/MdxContent/);
  });
});
