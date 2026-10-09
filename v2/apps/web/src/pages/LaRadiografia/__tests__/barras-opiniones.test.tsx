import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BarrasOpiniones } from '../sections/BarrasOpiniones';

const base = { miRespuesta: null, miExpuesta: false, puedoRetirar: false };
describe('el gráfico de respuestas explícitas', () => {
  it('cambia medida y unidad usando el denominador de respuestas de cada afirmación', () => {
    render(
      <BarrasOpiniones
        afirmaciones={[
          {
            ...base,
            id: 'a',
            texto: 'Una condición deseada',
            respuestas: 10,
            acuerdo: 6,
            desacuerdo: 3,
            paso: 1,
          },
        ]}
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Acuerdos: 60.0 % de 10 respuestas' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Desacuerdos' }));
    expect(
      screen.getByRole('img', { name: 'Desacuerdos: 30.0 % de 10 respuestas' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver cantidades' }));
    expect(
      screen.getByRole('img', { name: 'Desacuerdos: 3 de 10 respuestas' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no personas verificadas/)).toBeInTheDocument();
  });
  it('un desglose suprimido sigue reservado en todas las medidas y órdenes', () => {
    render(
      <BarrasOpiniones
        afirmaciones={[
          {
            ...base,
            id: 'a',
            texto: 'Afirmación con pocas respuestas',
            respuestas: 3,
            acuerdo: null,
            desacuerdo: null,
            paso: null,
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pases' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar por esta medida' }));
    expect(screen.queryByRole('img')).toBeNull();
    expect(
      screen.getByText('3 respuestas; el desglose público espera al menos cinco.'),
    ).toBeInTheDocument();
  });
});
