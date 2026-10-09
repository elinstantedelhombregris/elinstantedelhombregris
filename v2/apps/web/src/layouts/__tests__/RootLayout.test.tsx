import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { RootLayout } from '../RootLayout';

// Los chromes se prueban aparte: acá solo importa lo que RootLayout pone alrededor de la página.
vi.mock('~/components/Header', () => ({ Header: () => <a href="/v1">Header v1</a> }));
vi.mock('~/components/Footer', () => ({ Footer: () => <a href="/v1-pie">Footer v1</a> }));
vi.mock('~/components/papel/PapelHeader', () => ({
  PapelHeader: () => <a href="/papel">Header papel</a>,
}));
vi.mock('~/components/papel/PapelFooter', () => ({
  PapelFooter: () => <a href="/papel-pie">Footer papel</a>,
}));
vi.mock('~/components/papel/DespertarVeil', () => ({ DespertarVeil: () => null }));

function montar(ruta: string) {
  const { hook } = memoryLocation({ path: ruta });
  return render(
    <Router hook={hook}>
      <RootLayout>
        <main>
          <h1>La página</h1>
          <a href="/otra">Un enlace de la página</a>
        </main>
      </RootLayout>
    </Router>,
  );
}

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe.each([
  ['papel', '/mi-espacio'],
  ['v1', '/cuaderno'],
])('RootLayout en el chrome %s', (_nombre, ruta) => {
  it('«Saltar al contenido» es el primer elemento enfocable', () => {
    montar(ruta);
    const enlaces = screen.getAllByRole('link');
    expect(enlaces[0]).toHaveTextContent('Saltar al contenido');
    expect(enlaces[0]).toHaveAttribute('href', '#contenido');
  });

  it('el contenedor de la página existe, es el destino del enlace y recibe el foco', () => {
    montar(ruta);
    const contenido = document.getElementById('contenido');
    expect(contenido).not.toBeNull();
    expect(contenido).toContainElement(screen.getByRole('heading', { name: 'La página' }));
    expect(contenido).toHaveAttribute('tabindex', '-1');
    fireEvent.click(screen.getByRole('link', { name: 'Saltar al contenido' }));
    expect(contenido).toHaveFocus();
    // No ensucia la dirección con un ancla.
    expect(window.location.hash).toBe('');
  });

  it('el header y el pie no quedan dentro del contenedor al que se salta', () => {
    montar(ruta);
    const contenido = document.getElementById('contenido');
    for (const nombre of [/^Header/, /^Footer/]) {
      expect(contenido).not.toContainElement(screen.getByRole('link', { name: nombre }));
    }
  });
});

describe('RootLayout — el enlace es invisible hasta que se enfoca', () => {
  it('sr-only por defecto, visible con el foco', () => {
    montar('/mi-espacio');
    const enlace = screen.getByRole('link', { name: 'Saltar al contenido' });
    expect(enlace).toHaveClass('sr-only', 'focus:not-sr-only');
  });
});
