import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FotoPapel } from './FotoPapel';

describe('FotoPapel', () => {
  it('con src renderiza la imagen con su alt', () => {
    render(
      <FotoPapel
        src="/media/quien/retrato.jpg"
        archivo="public/media/quien/retrato.jpg"
        alt="Retrato de Juan"
        proporcion="retrato"
      />,
    );

    const img = screen.getByRole('img', { name: 'Retrato de Juan' });
    expect(img).toHaveAttribute('src', '/media/quien/retrato.jpg');
  });

  it('sin src imprime qué archivo falta en vez de romper', () => {
    render(
      <FotoPapel
        src={null}
        archivo="public/media/quien/retrato.jpg"
        alt="Retrato de Juan"
        proporcion="retrato"
      />,
    );

    expect(screen.getByText('public/media/quien/retrato.jpg')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Falta la foto/ })).toBeInTheDocument();
  });

  it('reserva la misma proporción con foto y sin foto — la razón de ser de la primitiva', () => {
    const { rerender } = render(
      <FotoPapel src={null} archivo="x.jpg" alt="x" proporcion="apaisada" />,
    );
    expect(screen.getByRole('img', { name: /Falta la foto/ })).toHaveClass('aspect-[16/9]');

    rerender(<FotoPapel src="/x.jpg" archivo="x.jpg" alt="x" proporcion="apaisada" />);
    expect(screen.getByRole('img', { name: 'x' })).toHaveClass('aspect-[16/9]');
  });

  it('posada «impresa» funde el blanco en el papel y suelta el marco', () => {
    // Los recortes sobre fondo blanco (el retrato, la firma) tienen que
    // quedar impresos en la hoja, no pegados encima con un borde alrededor.
    render(
      <FotoPapel
        src="/media/quien/retrato.png"
        archivo="public/media/quien/retrato.png"
        alt="Juan Ignacio Bravin"
        proporcion="cuadrada"
        posado="impresa"
      />,
    );

    const img = screen.getByRole('img', { name: 'Juan Ignacio Bravin' });
    expect(img).toHaveClass('mix-blend-multiply');
    expect(img).not.toHaveClass('border');
  });

  it('el epígrafe es opcional', () => {
    const { rerender } = render(
      <FotoPapel src={null} archivo="x.jpg" alt="x" proporcion="retrato" />,
    );
    expect(screen.queryByText('Mendoza')).not.toBeInTheDocument();

    rerender(
      <FotoPapel src={null} archivo="x.jpg" alt="x" proporcion="retrato" epigrafe="Mendoza" />,
    );
    expect(screen.getByText('Mendoza')).toBeInTheDocument();
  });
});
