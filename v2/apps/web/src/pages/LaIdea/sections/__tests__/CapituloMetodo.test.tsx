import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CICLO, PLAN_COUNT, ROLES } from '../../la-idea-data';
import { CapituloMetodo } from '../CapituloMetodo';

describe('CapituloMetodo', () => {
  it('renderiza los tres roles con su verbo', () => {
    render(<CapituloMetodo />);

    expect(ROLES).toHaveLength(3);
    for (const rol of ROLES) {
      expect(screen.getByRole('heading', { name: `${rol.a} ${rol.b}` })).toBeInTheDocument();
    }
  });

  it('muestra el ciclo completo como cadena de chips que vuelve a girar', () => {
    render(<CapituloMetodo />);

    for (const paso of CICLO) {
      expect(screen.getByText(paso.label)).toBeInTheDocument();
    }
    expect(screen.getByText('↺')).toBeInTheDocument();
  });

  it('cierra con la prueba: sello, conteo real de planes y CTA a /planes', () => {
    render(<CapituloMetodo />);

    expect(screen.getByText('No es doctrina')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`redactó ${PLAN_COUNT} planes`))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver la prueba: los planes →' })).toHaveAttribute(
      'href',
      '/planes',
    );
  });
});
