import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CampoPapel } from './CampoPapel';

describe('CampoPapel', () => {
  it('es un campo de papel: borde de tinta, fondo crudo, nada del tema oscuro', () => {
    render(<CampoPapel id="a" etiqueta="Nombre" />);
    const campo = screen.getByLabelText('Nombre');
    expect(campo).toHaveClass('border-tinta', 'bg-papel-crudo', 'text-tinta');
    expect(campo.className).not.toMatch(/white\/|red-400/);
  });

  it('la pista se ve desde el principio y queda ligada al campo', () => {
    render(<CampoPapel id="a" etiqueta="Contraseña" ayuda="Mínimo 12 caracteres." />);
    const campo = screen.getByLabelText('Contraseña');
    expect(screen.getByText('Mínimo 12 caracteres.')).toBeInTheDocument();
    expect(campo).toHaveAccessibleDescription('Mínimo 12 caracteres.');
    expect(campo).not.toHaveAttribute('aria-invalid');
  });

  it('el error va en sello, se anuncia y marca el campo inválido, sin perder la pista', () => {
    render(<CampoPapel id="a" etiqueta="Contraseña" ayuda="Pista." error="Falta algo." />);
    const campo = screen.getByLabelText('Contraseña');
    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('Falta algo.');
    expect(alerta).toHaveClass('text-sello');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveClass('border-sello');
    expect(campo).toHaveAccessibleDescription('Pista. Falta algo.');
  });
});
