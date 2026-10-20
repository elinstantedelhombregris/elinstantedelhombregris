import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  SECCIONES_BIBLIOTECA,
  SECCIONES_CAMPANAS,
  SECCIONES_LA_IDEA,
  SECCIONES_MI_ARGENTINA_IDEAL,
} from './papel-nav';
import { PapelHeader } from './PapelHeader';

import type { ReactNode } from 'react';

vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('~/lib/queries/analytics', () => ({ useVocesCount: () => ({ data: undefined }) }));

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
  return screen.getByRole('link', { name: /Biblioteca/ });
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
      const link = within(exigir(panel, 'el panel del menú')).getByRole('link', {
        name: seccion.label,
      });
      expect(link).toHaveAttribute('href', seccion.href);
    }
    expect(within(exigir(panel, 'el panel del menú')).getAllByRole('link')).toHaveLength(
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

  it('en Imaginar marca Imaginar y no también Ver, que la contiene por prefijo', () => {
    window.history.replaceState(null, '', '/mi-argentina-ideal/imaginar');
    render(
      <ConQueryClient>
        <PapelHeader />
      </ConQueryClient>,
    );
    const disparador = screen.getAllByRole('link', { name: /Mi Argentina ideal/ })[0];
    fireEvent.mouseEnter(exigir(disparador?.parentElement, 'el contenedor del disparador'));
    const actuales = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('aria-current') === 'page')
      .map((l) => l.textContent);
    expect(actuales).toContain('Imaginar');
    expect(actuales).not.toContain('Ver');
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

describe('MenuBiblioteca — Planes y Fichas tienen puerta en el recorrido', () => {
  it.each([
    ['La idea', 'menu-la-idea', SECCIONES_LA_IDEA],
    ['Mi Argentina ideal', 'menu-mi-argentina-ideal', SECCIONES_MI_ARGENTINA_IDEAL],
    ['Campañas', 'menu-campanas', SECCIONES_CAMPANAS],
  ] as const)('«%s» despliega sus hijos, con un panel de id propio', (nombre, idPanel, hijos) => {
    render(
      <ConQueryClient>
        <PapelHeader />
      </ConQueryClient>,
    );
    const disparador = screen.getByRole('link', { name: nombre });
    expect(disparador).toHaveAttribute('aria-controls', idPanel);
    fireEvent.mouseEnter(exigir(disparador.parentElement, 'el contenedor del disparador'));

    const panel = exigir(document.getElementById(idPanel), 'el panel del menú');
    for (const hijo of hijos)
      expect(within(panel).getByRole('link', { name: hijo.label })).toHaveAttribute(
        'href',
        hijo.href,
      );
  });

  it('«Mi Argentina ideal» abre los tres momentos y, más abajo, el mapa y la Radiografía', () => {
    render(
      <ConQueryClient>
        <PapelHeader />
      </ConQueryClient>,
    );
    const disparador = screen.getByRole('link', { name: 'Mi Argentina ideal' });
    fireEvent.mouseEnter(exigir(disparador.parentElement, 'el contenedor del disparador'));
    const panel = exigir(document.getElementById('menu-mi-argentina-ideal'), 'el panel');

    expect(
      within(panel)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Imaginar', 'Mirar', 'Ver', 'El mapa de lo que pasa hoy', 'La Radiografía']);
    // Dejaron de ser puertas sueltas del header: están una sola vez, adentro.
    expect(screen.queryByRole('link', { name: 'Mapa' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Radiografía/i })).toHaveLength(1);
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
