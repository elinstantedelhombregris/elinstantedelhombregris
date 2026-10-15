import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ExplorarDisponibilidad } from './ExplorarDisponibilidad';

describe('Explorar una alternativa', () => {
  it('mantiene resultados sintéticos fuera de las fichas y los invalida al editar', () => {
    render(<ExplorarDisponibilidad titulo="Encuentros de escucha" ejemplo />);
    const details = screen
      .getByText('Explorar disponibilidad para esta alternativa')
      .closest('details');
    details?.setAttribute('open', '');
    fireEvent.click(screen.getByRole('button', { name: 'Comparar capacidad y sensibilidad' }));
    expect(screen.getByText('4–4 actividades; 24–24 plazas posibles.')).toBeInTheDocument();
    expect(screen.getByText('6–6 actividades; 36–36 plazas posibles.')).toBeInTheDocument();
    expect(screen.getByText(/parámetros precargados son inventados/)).toBeInTheDocument();
    fireEvent.change(
      screen.getByLabelText('Horas del equipo disponibles en el período, alternativa, min'),
      { target: { value: '10' } },
    );
    expect(screen.queryByText('6–6 actividades; 36–36 plazas posibles.')).not.toBeInTheDocument();
  });
  it('abre sin valores ficticios cuando se usa en una alternativa real', () => {
    render(<ExplorarDisponibilidad titulo="Alternativa de una ficha" />);
    expect(
      screen.getByLabelText('Horas del equipo disponibles en el período, alternativa, min'),
    ).toHaveValue(null);
    expect(screen.queryByText(/parámetros precargados son inventados/)).not.toBeInTheDocument();
  });
});
