import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CITA_LA_IDEA, PROHIBICIONES } from '../../quien-data';
import { LaSemillaNoEsMia } from '../LaSemillaNoEsMia';

describe('LaSemillaNoEsMia', () => {
  it('cita textualmente el compromiso que ya estaba en /la-idea', () => {
    render(<LaSemillaNoEsMia />);

    expect(screen.getByText(CITA_LA_IDEA.texto)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /La idea — Capítulo III/ })).toHaveAttribute(
      'href',
      '/la-idea',
    );
  });

  it('las cinco prohibiciones están todas: es un contrato, no una declaración', () => {
    render(<LaSemillaNoEsMia />);

    expect(PROHIBICIONES).toHaveLength(5);
    for (const item of PROHIBICIONES) {
      expect(screen.getByText(item.sello)).toBeInTheDocument();
      expect(screen.getByText(item.cuerpo)).toBeInTheDocument();
    }
  });
});
