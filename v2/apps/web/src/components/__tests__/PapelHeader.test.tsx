import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DEMO_VOCES_COUNT, PAPEL_NAV } from '../papel/papel-nav';
import { PapelHeader } from '../papel/PapelHeader';

describe('PapelHeader', () => {
  it('renders the wordmark linking home and the FOMO counter', () => {
    render(<PapelHeader />);

    expect(screen.getByRole('link', { name: '¡BASTA! — inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByText(`${DEMO_VOCES_COUNT} voces · falta la tuya`)).toBeInTheDocument();
  });

  it('renders the recorrido nav with the real v2 routes', () => {
    render(<PapelHeader />);

    for (const item of PAPEL_NAV) {
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute('href', item.href);
    }
    expect(screen.getByRole('link', { name: 'Sembrar tu voz' })).toHaveAttribute(
      'href',
      '/la-semilla-de-basta',
    );
  });

  it('toggles the full-screen mobile menu', () => {
    render(<PapelHeader />);

    expect(
      screen.queryByRole('navigation', { name: 'Recorrido completo' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getByRole('navigation', { name: 'Recorrido completo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inicio/ })).toHaveAttribute('href', '/');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(
      screen.queryByRole('navigation', { name: 'Recorrido completo' }),
    ).not.toBeInTheDocument();
  });
});
