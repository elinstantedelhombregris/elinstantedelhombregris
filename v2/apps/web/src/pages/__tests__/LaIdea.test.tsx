import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { LaIdea } from '../LaIdea';

describe('LaIdea (página papel 2.1)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('abre con el rito de la tinta en el H1 y el kicker de la página', () => {
    render(<LaIdea />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Un país no se hereda. Se diseña.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('La idea · tres capítulos · seis minutos')).toBeInTheDocument();
  });

  it('presenta el Capítulo I con su caja del despertar', () => {
    render(<LaIdea />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'El instante del hombre gris' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Este es mi instante' })).toBeInTheDocument();
  });
});
