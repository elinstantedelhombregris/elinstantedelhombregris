import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EjemploIniciativa } from '../Ejemplo';

describe('Ejemplo guiado de escucha', () => {
  it('recorre aceptación, evidencia y relevo sin presentarlos como registros reales', () => {
    render(<EjemploIniciativa />);
    expect(screen.getByText(/No se publican aportes/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    for (let i = 0; i < 3; i++)
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
    expect(screen.getByText(/Ejecución declarada; evidencia pendiente/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '5. Revisar y decidir el próximo paso' }));
    expect(screen.getByText(/Si se retira la evidencia/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
    expect(screen.getByRole('button', { name: 'Siguiente paso' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Organizar una escucha propia' })).toHaveAttribute(
      'href',
      '/iniciativas/nueva?escucha=si',
    );
  });
});
