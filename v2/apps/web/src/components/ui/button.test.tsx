import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './button';

describe('<Button />', () => {
  it('renders its children', () => {
    render(<Button>Iniciá sesión</Button>);
    expect(screen.getByRole('button', { name: 'Iniciá sesión' })).toBeInTheDocument();
  });

  it('applies the secondary variant class', () => {
    render(<Button variant="secondary">Crear cuenta</Button>);
    const btn = screen.getByRole('button', { name: 'Crear cuenta' });
    expect(btn.className).toMatch(/border-white\/10/);
  });

  it('renders as a <a> via asChild + Slot', () => {
    render(
      <Button asChild>
        <a href="/manifiesto">Leer el manifiesto</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Leer el manifiesto' });
    expect(link).toHaveAttribute('href', '/manifiesto');
  });
});
