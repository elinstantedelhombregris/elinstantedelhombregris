import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Home } from '../Home';
import { PLAN_COUNT, PLANES_TEASER } from '../Home/landing-data';

describe('Home (landing Papel y Tinta)', () => {
  it('renders the hero with the ¡BASTA! ink rite and the demo notice', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { level: 1, name: '¡BASTA!' })).toBeInTheDocument();
    expect(
      screen.getByText('El sitio está en gris — se enciende con tu primera acción'),
    ).toBeInTheDocument();
    expect(screen.getByText('El instante es ahora')).toBeInTheDocument();
  });

  it('points the hero CTAs at the map and the idea', () => {
    render(<Home />);

    expect(screen.getByRole('link', { name: 'Dejar mi voz en el mapa' })).toHaveAttribute(
      'href',
      '/el-mapa',
    );
    expect(screen.getByRole('link', { name: 'Entender la idea' })).toHaveAttribute(
      'href',
      '/la-vision',
    );
  });

  it('marks demo data with the mandatory asterisk note', () => {
    render(<Home />);

    expect(
      screen.getByText(
        '* Datos de demostración — la plataforma real arranca en cero, y eso también está bien.',
      ),
    ).toBeInTheDocument();
  });

  it('teases three real plans from the registry', () => {
    render(<Home />);

    expect(PLANES_TEASER).toHaveLength(3);
    for (const plan of PLANES_TEASER) {
      const card = screen.getByText(plan.code).closest('a');
      expect(card).toHaveAttribute('href', `/planes/${plan.slug}`);
    }
    expect(
      screen.getByRole('heading', {
        name: `Un tipo común ya escribió ${PLAN_COUNT} planes de país.`,
      }),
    ).toBeInTheDocument();
  });

  it('closes with the CTA band toward the map and the seed', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: 'Tu voz pesa. Soltala en el mapa.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir al mapa' })).toHaveAttribute('href', '/el-mapa');
    expect(screen.getByRole('link', { name: 'Sembrar mi compromiso' })).toHaveAttribute(
      'href',
      '/la-semilla-de-basta',
    );
  });
});
