import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { INTERESES, QUE_GANO_CIERRE } from '../../quien-data';
import { QueGanoYo } from '../QueGanoYo';

describe('QueGanoYo', () => {
  it('declara los tres intereses en vez de esconderlos', () => {
    render(<QueGanoYo />);

    expect(INTERESES).toHaveLength(3);
    for (const interes of INTERESES) {
      expect(screen.getByText(interes.titulo)).toBeInTheDocument();
      expect(screen.getByText(interes.cuerpo)).toBeInTheDocument();
    }
  });

  it('cierra atando el interés propio a la prohibición 04', () => {
    // El cierre es lo que hace creíble a «no puedo cobrar»: los tres
    // intereses se sirven si el país funciona, no si la plataforma factura.
    render(<QueGanoYo />);

    expect(screen.getByText(QUE_GANO_CIERRE)).toBeInTheDocument();
    expect(QUE_GANO_CIERRE).toContain('el país que quede');
  });
});
