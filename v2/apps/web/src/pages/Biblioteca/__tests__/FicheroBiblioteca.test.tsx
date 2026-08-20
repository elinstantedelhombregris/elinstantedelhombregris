import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FicheroBiblioteca } from '../sections/FicheroBiblioteca';

import { ESTANTES } from '~/pages/Biblioteca/biblioteca-data';

interface EntradaFalsa {
  target: { id: string };
  isIntersecting: boolean;
}
type Callback = (entradas: EntradaFalsa[]) => void;

describe('FicheroBiblioteca — la franja fija', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    for (const estante of ESTANTES) {
      document.getElementById(estante.ancla)?.remove();
    }
  });

  it('rinde un nav con un link por estante, sin activo cuando no hay observer', () => {
    render(<FicheroBiblioteca />);
    const nav = screen.getByRole('navigation', { name: 'Secciones de la biblioteca' });
    for (const estante of ESTANTES) {
      const link = screen.getByRole('link', { name: `${estante.num} ${estante.nombre}` });
      expect(nav).toContainElement(link);
      expect(link).toHaveAttribute('href', `#${estante.ancla}`);
      expect(link).not.toHaveAttribute('aria-current');
    }
  });

  it('con observer, la sección visible más temprana en el orden queda activa', () => {
    let callback: Callback | null = null;
    const observados: string[] = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: Callback) {
          callback = cb;
        }
        observe(el: Element): void {
          observados.push(el.id);
        }
        disconnect(): void {
          // nada que soltar en el fake.
        }
      },
    );
    for (const estante of ESTANTES) {
      const seccion = document.createElement('section');
      seccion.id = estante.ancla;
      document.body.appendChild(seccion);
    }

    render(<FicheroBiblioteca />);
    expect(observados).toEqual(ESTANTES.map((e) => e.ancla));
    expect(callback).not.toBeNull();
    const avisar = callback as Callback | null;
    if (!avisar) return;

    act(() => {
      avisar([
        { target: { id: 'ensayos' }, isIntersecting: true },
        { target: { id: 'entrenamientos' }, isIntersecting: true },
      ]);
    });
    expect(screen.getByRole('link', { name: /Los ensayos/ })).toHaveAttribute(
      'aria-current',
      'true',
    );

    act(() => {
      avisar([{ target: { id: 'ensayos' }, isIntersecting: false }]);
    });
    expect(screen.getByRole('link', { name: /Los entrenamientos/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('link', { name: /Los ensayos/ })).not.toHaveAttribute('aria-current');
  });
});
