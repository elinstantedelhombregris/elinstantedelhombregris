import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MODOS } from '../catalogo-modos';
import { BarraModos, ContadorEnVista } from '../Chrome';

import type { SenalConTipo } from '../useVistaMapa';

describe('BarraModos', () => {
  it('scrollea horizontal por sí sola: en 390px la fila no estira el documento (D-078)', () => {
    const [primero] = MODOS;
    if (primero === undefined) throw new Error('el catálogo de modos está vacío');
    render(<BarraModos activo={primero.id} onCambiar={vi.fn()} />);

    const barra = screen.getByRole('navigation', { name: 'Modos del instrumento' });
    expect(barra).toHaveClass('overflow-x-auto');

    const botones = screen.getAllByRole('button');
    expect(botones).toHaveLength(MODOS.length);
    for (const boton of botones) {
      expect(boton).toHaveClass('shrink-0');
      expect(boton).toHaveClass('whitespace-nowrap');
    }
    expect(botones[0]).toHaveAttribute('aria-current', 'page');
  });
});

describe('BarraModos — cada pestaña dice qué pregunta contesta', () => {
  it('muestra la pregunta de cada modo debajo de su nombre', () => {
    render(<BarraModos activo="mapa" onCambiar={vi.fn()} />);
    for (const modo of MODOS) {
      const boton = screen.getByRole('button', { name: new RegExp(modo.etiqueta) });
      expect(boton).toHaveTextContent(modo.descripcion);
      expect(modo.descripcion).toMatch(/^¿.+\?$/);
    }
  });

  it('avisa que la fila se desliza cuando hay pestañas más allá del borde', () => {
    const ancho = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(541);
    const visible = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(390);
    try {
      const { container } = render(<BarraModos activo="mapa" onCambiar={vi.fn()} />);
      expect(container.querySelector('[data-indicador-de-desplazamiento]')).not.toBeNull();
    } finally {
      ancho.mockRestore();
      visible.mockRestore();
    }
  });

  it('no pone el aviso cuando entran todas', () => {
    const { container } = render(<BarraModos activo="mapa" onCambiar={vi.fn()} />);
    expect(container.querySelector('[data-indicador-de-desplazamiento]')).toBeNull();
  });
});

const unaSenal = (id: string, claseSenal: SenalConTipo['claseSenal']): SenalConTipo => ({
  id,
  capa: 'voz',
  tipo: 'necesidad',
  texto: 'Falta agua.',
  lat: -34.6,
  lng: -58.4,
  precision: 'neighborhood',
  role: 'capture',
  provinceId: 6,
  cityId: null,
  createdAt: '2026-10-08T00:00:00Z',
  claseSenal,
});

describe('ContadorEnVista', () => {
  it('sin puntos en la vista ocupa una línea: dice cuántos aportes no tienen ubicación y dónde están', () => {
    const { container } = render(<ContadorEnVista senales={[]} sinPunto={4} />);
    expect(container.textContent).toBe('Sin ubicación en el mapa: 4. Están en la lista.');
    expect(container.querySelector('.font-anton')).toBeNull();
  });

  it('con uno solo concuerda, y sin ninguno no deja un número', () => {
    const uno = render(<ContadorEnVista senales={[]} sinPunto={1} />);
    expect(uno.container.textContent).toBe('Sin ubicación en el mapa: 1. Está en la lista.');
    uno.unmount();
    const ninguno = render(<ContadorEnVista senales={[]} sinPunto={0} />);
    expect(ninguno.container.textContent).toBe('No hay aportes en esta vista.');
  });

  it('con puntos cuenta aportes y nombra las clases con el rótulo de siempre', () => {
    const { container } = render(
      <ContadorEnVista senales={[unaSenal('a', 'hecho'), unaSenal('b', 'deseo')]} />,
    );
    expect(container.textContent).toContain('Aportes en esta vista');
    expect(container.textContent).toContain('Lo que hay');
    expect(container.textContent).toContain('Lo que querés');
    expect(container.textContent).not.toMatch(/Registros|\bhecho\b|\bdeseo\b/);
  });
});
