import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MODOS } from '../catalogo-modos';
import { BarraModos } from '../Chrome';

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
