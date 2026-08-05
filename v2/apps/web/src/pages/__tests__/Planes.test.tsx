import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Planes } from '../Planes';

import { PLAN_COUNT } from '~/pages/Planes/la-prueba-data';

describe('Planes (página papel 2.4 — El ejemplo, composer)', () => {
  it('abre con el rito de la tinta en el H1 y el kicker de la portada', () => {
    render(<Planes />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Esto lo escribió uno solo.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`El ejemplo · ${PLAN_COUNT} planes · un solo autor`),
    ).toBeInTheDocument();
  });

  it('presenta el callout «No es doctrina» con el link a las voces del mapa', () => {
    render(<Planes />);

    expect(screen.getByText(/Nada de esto se firma ni se obedece/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'voces del mapa' })).toHaveAttribute(
      'href',
      '/el-mapa',
    );
  });

  it('presenta las tres cards de método y el CTA final al mapa', () => {
    render(<Planes />);

    expect(screen.getByRole('heading', { name: '¿Falta un plan?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Método Ackoff' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hechos para ser superados' })).toBeInTheDocument();

    const cta = screen.getByRole('link', { name: 'Soltá tu urgencia en el mapa →' });
    expect(cta).toHaveAttribute('href', '/el-mapa');
  });

  it('mata el chrome v1-port: sin header serif viejo, sin glass ni gradient-text', () => {
    const { container } = render(<Planes />);

    expect(screen.queryByText(/Cada PLAN es un sistema diseñado/)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
  });
});
