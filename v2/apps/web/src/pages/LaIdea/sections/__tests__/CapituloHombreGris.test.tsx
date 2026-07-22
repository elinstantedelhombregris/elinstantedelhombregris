import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { CapituloHombreGris } from '../CapituloHombreGris';

describe('CapituloHombreGris', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('arranca en gris: aviso mono + botón «Este es mi instante»', () => {
    render(<CapituloHombreGris />);

    expect(
      screen.getByText('Esta página está en gris. Como el país. Como vos, hasta hoy.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Este es mi instante' })).toBeInTheDocument();
  });

  it('lleva la identidad plata: argentum, nunca acero', () => {
    render(<CapituloHombreGris />);

    expect(screen.getByText(/argentum/)).toBeInTheDocument();
    expect(screen.getByText(/Plata, no acero\./)).toBeInTheDocument();
  });

  it('al apretar el botón despierta el sitio y estampa el ¡BASTA!', () => {
    render(<CapituloHombreGris />);

    fireEvent.click(screen.getByRole('button', { name: 'Este es mi instante' }));

    expect(window.localStorage.getItem('basta_despierto')).toBe('1');
    expect(screen.getByText('¡BASTA!')).toBeInTheDocument();
    expect(
      screen.getByText('Eso fue todo. Así de simple empieza. Lo que sigue es método.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Este es mi instante' })).not.toBeInTheDocument();
  });

  it('si ya está despierto muestra el estado encendido sin botón', () => {
    window.localStorage.setItem('basta_despierto', '1');
    render(<CapituloHombreGris />);

    expect(screen.queryByRole('button', { name: 'Este es mi instante' })).not.toBeInTheDocument();
    expect(screen.getByText('¡BASTA!')).toBeInTheDocument();
  });
});
