import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LugarDeLaFicha } from '../LugarDeLaFicha';

vi.mock('../../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: ({ superficie }: { superficie?: string }) => (
    <p data-testid="buscador" data-superficie={superficie ?? 'noche'}>
      Buscador de lugares
    </p>
  ),
}));

describe('El lugar de la ficha, dentro de un formulario de papel', () => {
  it('usa el buscador de papel y no un bloque de tinta', () => {
    const { container } = render(
      <LugarDeLaFicha territorioId={null} nombre="" elegir={vi.fn()} todoElPais={vi.fn()} />,
    );
    expect(screen.getByTestId('buscador')).toHaveAttribute('data-superficie', 'papel');
    const marco = container.firstElementChild;
    expect(marco).toHaveClass('border', 'border-tinta');
    expect(marco).not.toHaveClass('bg-tinta');
    expect(marco).not.toHaveClass('text-oscuro-texto');
  });

  it('dice el lugar elegido y permite volver a todo el país', () => {
    const todoElPais = vi.fn();
    render(
      <LugarDeLaFicha
        territorioId={50}
        nombre="Mendoza"
        elegir={vi.fn()}
        todoElPais={todoElPais}
      />,
    );
    expect(screen.getByText('Lugar: Mendoza.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Usar todo el país' }));
    expect(todoElPais).toHaveBeenCalledOnce();
  });
});
