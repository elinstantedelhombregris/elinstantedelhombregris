import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { INTERESES, QUE_GANO_CIERRE, QUE_GANO_ENTRADA } from '../../quien-data';
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

  it('prueba la interdependencia desde el oficio antes que desde la política', () => {
    // La entrada tiene que llegar antes que los tres bloques: sin la cuenca,
    // los intereses vuelven a leerse como una lista de deseos.
    render(<QueGanoYo />);

    for (const parrafo of QUE_GANO_ENTRADA) {
      expect(screen.getByText(parrafo)).toBeInTheDocument();
    }
    expect(QUE_GANO_ENTRADA[0]).toContain('nadie limpia su agua solo');
  });

  it('cierra en la aritmética, no en la generosidad', () => {
    // Es lo que separa a esta franja del egoísmo declarado: el interés propio
    // no compite con el ajeno — lo necesita.
    render(<QueGanoYo />);

    expect(screen.getByText(QUE_GANO_CIERRE)).toBeInTheDocument();
    expect(QUE_GANO_CIERRE).toContain('donde yo gane y vos pierdas');
  });
});
