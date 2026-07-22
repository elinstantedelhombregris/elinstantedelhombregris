import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LaIdea } from '../LaIdea';

import { useVocesCount } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);

describe('LaIdea (página papel 2.1)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedUseVocesCount.mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
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

  it('recorre los tres capítulos en orden', () => {
    render(<LaIdea />);

    const capitulos = screen.getAllByRole('heading', { level: 2 });
    expect(capitulos).toHaveLength(3);
    expect(capitulos[0]).toHaveTextContent('El instante del hombre gris');
    expect(capitulos[1]).toHaveTextContent('El método: tres roles que no se mezclan');
    expect(capitulos[2]).toHaveTextContent('Nadie viene a salvarte.');
  });
});
