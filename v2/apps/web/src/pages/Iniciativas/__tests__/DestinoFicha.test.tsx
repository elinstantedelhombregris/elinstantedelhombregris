import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { DestinoFicha } from '../DestinoFicha';
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { fichaId: 'ficha', titulo: 'Llegar a la escuela' } }),
}));
vi.mock('../Formulario', () => ({ FormularioGestion: () => null }));
it('presenta destino a todos y reserva el formulario para administrar', () => {
  const { rerender } = render(<DestinoFicha id={1} tareaId={2} revision={1} administrar={false} />);
  expect(screen.getByRole('link', { name: 'Llegar a la escuela' })).toHaveAttribute(
    'href',
    '/fichas/ficha#resultados-campo',
  );
  expect(screen.queryByText('Elegir ficha de devolución')).not.toBeInTheDocument();
  rerender(<DestinoFicha id={1} tareaId={2} revision={1} administrar />);
  expect(screen.getByText('Elegir ficha de devolución')).toBeInTheDocument();
});
