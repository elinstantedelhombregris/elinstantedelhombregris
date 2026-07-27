import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SeccionInstrumento } from '../../sections/SeccionInstrumento';

import { api } from '~/lib/api';

vi.mock('~/lib/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

describe('SeccionInstrumento — montaje perezoso (spec 3 §2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = '';
  });

  it('sin el ancla, el instrumento no se monta ni pide un byte', () => {
    render(<SeccionInstrumento />);

    // Los 30 segundos de arriba no pagan el análisis de abajo.
    expect(api.get).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Abrir el instrumento' })).toBeInTheDocument();
  });

  it('la invitación explica qué hace antes de que nadie la toque', () => {
    render(<SeccionInstrumento />);
    expect(screen.getByRole('heading', { name: 'Cercá tu zona.' })).toBeInTheDocument();
    expect(screen.getByText(/no habló nadie todavía/)).toBeInTheDocument();
  });

  it('la sección lleva el ancla profunda a la que redirige /explorar-datos', () => {
    const { container } = render(<SeccionInstrumento />);
    expect(container.querySelector('#instrumento')).not.toBeNull();
  });
});
