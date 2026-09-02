import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IndiceLector, type SeccionDelIndice } from '../IndiceLector';

const SECCIONES: SeccionDelIndice[] = [
  { id: 'preambulo', texto: 'Preámbulo' },
  { id: 'diagnostico', texto: 'Diagnóstico' },
  { id: 'modelo-financiero', texto: 'Modelo financiero' },
];

/** Observer de juguete: guarda el callback para que el test lo dispare a mano. */
class FakeIntersectionObserver implements IntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  entra(id: string): void {
    const target = document.getElementById(id);
    if (!target) throw new Error(`no existe #${id}`);
    this.callback([{ isIntersecting: true, target } as unknown as IntersectionObserverEntry], this);
  }
}

function plantarSecciones(): void {
  for (const s of SECCIONES) {
    const h2 = document.createElement('h2');
    h2.id = s.id;
    h2.textContent = s.texto;
    document.body.appendChild(h2);
  }
}

describe('IndiceLector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    FakeIntersectionObserver.instances = [];
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('columna: un nav con nombre, un link por sección con su ancla, y la brújula sin posición', () => {
    render(<IndiceLector secciones={SECCIONES} etiqueta="Índice del expediente" presentacion="columna" />);

    const nav = screen.getByRole('navigation', { name: 'Índice del expediente' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '#preambulo',
      '#diagnostico',
      '#modelo-financiero',
    ]);
    expect(within(nav).getByText('3 secciones')).toBeInTheDocument();
    expect(links.some((l) => l.getAttribute('aria-current') === 'true')).toBe(false);
  });

  it('plegado: la lista vive en un <details> cerrado con el conteo en el resumen', () => {
    const { container } = render(
      <IndiceLector secciones={SECCIONES} etiqueta="Índice del expediente" presentacion="plegado" />,
    );

    const details = container.querySelector('details');
    expect(details).not.toBeNull();
    expect(details?.open).toBe(false);
    expect(screen.getByText(/Índice · 3 secciones/)).toBeInTheDocument();
    expect(within(details as HTMLElement).getAllByRole('link')).toHaveLength(3);
  });

  it('scroll-spy: la sección visible se marca aria-current y la brújula dice «Sección n de N»', () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    plantarSecciones();
    render(<IndiceLector secciones={SECCIONES} etiqueta="Índice del expediente" presentacion="columna" />);

    const [observer] = FakeIntersectionObserver.instances;
    if (!observer) throw new Error('no se creó el observer');
    expect(observer.observe).toHaveBeenCalledTimes(3);

    act(() => {
      observer.entra('diagnostico');
    });

    expect(screen.getByRole('link', { name: /Diagnóstico/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('Sección 2 de 3')).toBeInTheDocument();
  });

  it('al tocar un link salta a la sección, deja el ancla en la URL y no navega con wouter', () => {
    plantarSecciones();
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    render(<IndiceLector secciones={SECCIONES} etiqueta="Índice del expediente" presentacion="columna" />);

    fireEvent.click(screen.getByRole('link', { name: /Modelo financiero/ }));

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('#modelo-financiero');
    // Responde al toque: la sección tocada queda activa sin esperar al observer.
    expect(screen.getByRole('link', { name: /Modelo financiero/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('Sección 3 de 3')).toBeInTheDocument();
  });
});
