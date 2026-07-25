import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SECCIONES_BIBLIOTECA } from './papel-nav';
import { PapelHeader } from './PapelHeader';

import type { ReactNode } from 'react';

/** PapelHeader dispara `useVocesCount` (react-query) — necesita su provider. */
function ConQueryClient({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

/**
 * Narrowing sin `!` ni `as`: el lint prohíbe los dos, y un test que se cae
 * con un mensaje claro es mejor que uno que se cae con «null is not an
 * object» treinta líneas más abajo.
 */
function exigir<T>(valor: T | null | undefined, que: string): T {
  if (valor === null || valor === undefined) throw new Error(`No está en el DOM: ${que}`);
  return valor;
}

function montarHeader() {
  render(
    <ConQueryClient>
      <PapelHeader />
    </ConQueryClient>,
  );
  return screen.getByRole('link', { name: /La biblioteca/ });
}

describe('MenuBiblioteca — los cinco estantes se abren desde el header', () => {
  it('el panel está cerrado hasta que el mouse entra', () => {
    const disparador = montarHeader();

    expect(disparador).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'La bitácora' })).not.toBeInTheDocument();
  });

  it('el hover abre el panel con las cinco secciones y sus destinos reales', () => {
    const disparador = montarHeader();
    // El listener vive en el contenedor del disparador.
    fireEvent.mouseEnter(exigir(disparador.parentElement, 'el contenedor del disparador'));

    expect(disparador).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById('menu-biblioteca');
    expect(panel).not.toBeNull();

    for (const seccion of SECCIONES_BIBLIOTECA) {
      const link = within(exigir(panel, "el panel del menú")).getByRole('link', { name: seccion.label });
      expect(link).toHaveAttribute('href', seccion.href);
    }
    expect(within(exigir(panel, "el panel del menú")).getAllByRole('link')).toHaveLength(
      SECCIONES_BIBLIOTECA.length,
    );
  });

  it('el foco también lo abre: un menú de solo hover deja afuera al teclado', () => {
    const disparador = montarHeader();

    fireEvent.focus(disparador);

    expect(disparador).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'La bitácora' })).toBeInTheDocument();
  });

  it('Escape lo cierra', () => {
    const disparador = montarHeader();
    const contenedor = exigir(disparador.parentElement, 'el contenedor del disparador');
    fireEvent.mouseEnter(contenedor);

    fireEvent.keyDown(contenedor, { key: 'Escape' });

    expect(disparador).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'La bitácora' })).not.toBeInTheDocument();
  });

  it('el disparador sigue siendo un link real al hub — el panel agrega caminos, no los saca', () => {
    const disparador = montarHeader();

    expect(disparador).toHaveAttribute('href', '/biblioteca');
    expect(disparador).toHaveAttribute('aria-controls', 'menu-biblioteca');
  });

  it('el estante que es la página actual queda marcado con aria-current', () => {
    window.history.replaceState(null, '', '/bitacora');
    const disparador = montarHeader();
    fireEvent.mouseEnter(exigir(disparador.parentElement, 'el contenedor del disparador'));

    expect(screen.getByRole('link', { name: 'La bitácora' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'El manifiesto' })).not.toHaveAttribute('aria-current');
    window.history.replaceState(null, '', '/');
  });

  it('estando en /biblioteca, «Los ensayos» salta a la sección en vez de navegar', () => {
    window.history.replaceState(null, '', '/biblioteca');
    const alElemento = vi.fn();
    Element.prototype.scrollIntoView = alElemento;
    const seccion = document.createElement('section');
    seccion.id = 'ensayos';
    document.body.append(seccion);

    const disparador = montarHeader();
    fireEvent.mouseEnter(exigir(disparador.parentElement, 'el contenedor del disparador'));
    fireEvent.click(screen.getByRole('link', { name: 'Los ensayos' }));

    expect(alElemento).toHaveBeenCalledTimes(1);
    // No navegamos: seguimos en la misma dirección, sin ancla en el camino.
    expect(window.location.pathname).toBe('/biblioteca');

    seccion.remove();
    window.history.replaceState(null, '', '/');
  });
});

describe('MenuBiblioteca — el menú móvil ofrece los mismos caminos', () => {
  it('las secciones cuelgan de «La biblioteca» en el menú de pantalla completa', () => {
    render(
      <ConQueryClient>
        <PapelHeader />
      </ConQueryClient>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('navigation', { name: 'Recorrido completo' });

    for (const seccion of SECCIONES_BIBLIOTECA) {
      expect(within(menu).getByRole('link', { name: new RegExp(seccion.label) })).toHaveAttribute(
        'href',
        seccion.href,
      );
    }
  });
});
