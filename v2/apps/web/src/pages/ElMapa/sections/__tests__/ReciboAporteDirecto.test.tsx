import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReciboAporteDirecto } from '../soltar/ReciboAporteDirecto';

const id = '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b';

describe('Recibo del aporte puntual', () => {
  it('dice dónde quedó y lleva a su página', () => {
    render(
      <ReciboAporteDirecto idPublico={id} provincia="Córdoba" engrosado={null} campana={null} />,
    );
    expect(screen.getByText('Recibido')).toBeInTheDocument();
    expect(
      screen.getByText('Quedó en Córdoba. Desde su página lo seguís o lo retirás.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mi aporte y cómo sigue →' })).toHaveAttribute(
      'href',
      `/senal/${id}`,
    );
  });

  it('sin provincia lo dice sin inventar un lugar', () => {
    render(<ReciboAporteDirecto idPublico={id} provincia="" engrosado={null} campana={null} />);
    expect(
      screen.getByText(
        'No indicaste una provincia, así que cuenta pero no aparece en un lugar del mapa.',
      ),
    ).toBeInTheDocument();
  });

  it('explica la precisión que el servidor engrosó, si lo hizo', () => {
    render(
      <ReciboAporteDirecto
        idPublico={id}
        provincia="Córdoba"
        engrosado="La precisión publicada protege el lugar."
        campana={null}
      />,
    );
    expect(screen.getByText('La precisión publicada protege el lugar.')).toBeInTheDocument();
  });

  it('cuenta la campaña en la que entró con los datos de la campaña', () => {
    render(
      <ReciboAporteDirecto
        idPublico={id}
        provincia="Córdoba"
        engrosado={null}
        campana={{
          id: 'e2d1c0b9-5a41-4f3e-9b7c-1a2b3c4d5e6f',
          slug: 'mi-argentina-ideal',
          revision: 1,
          contrato: {
            titulo: 'Mi Argentina ideal',
            responsable: 'Equipo ¡BASTA!',
            fechaDevolucion: '2099-12-20',
          },
        }}
      />,
    );
    expect(
      screen.getByText(
        /Tu aporte entró en la campaña nacional «Mi Argentina ideal»\. Equipo ¡BASTA!, que la coordina, va a publicar una devolución el 20 de diciembre de 2099/,
      ),
    ).toBeInTheDocument();
  });
});
