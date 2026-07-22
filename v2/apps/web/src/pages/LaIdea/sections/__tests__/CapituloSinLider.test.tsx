import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SIN_LIDER } from '../../la-idea-data';
import { CapituloSinLider } from '../CapituloSinLider';

import { useVocesCount } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);

describe('CapituloSinLider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedUseVocesCount.mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
  });

  it('estampa los tres sellos: sin líder, sin partido, sin excusas', () => {
    render(<CapituloSinLider />);

    expect(SIN_LIDER).toHaveLength(3);
    for (const card of SIN_LIDER) {
      expect(screen.getByText(card.stamp)).toBeInTheDocument();
    }
  });

  it('remata con el conteo real de voces y el CTA al mapa', () => {
    render(<CapituloSinLider />);

    expect(screen.getByText(/12\.496 voces ya están en el mapa/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dejar mi voz →' })).toHaveAttribute(
      'href',
      '/el-mapa',
    );
  });

  it('al hacer click en el CTA «Dejar mi voz» despierta el sitio', () => {
    render(<CapituloSinLider />);

    fireEvent.click(screen.getByRole('link', { name: 'Dejar mi voz →' }));

    expect(window.localStorage.getItem('basta_despierto')).toBe('1');
  });

  it('si el conteo carga o falló, la línea no aparece — jamás un número inventado', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    render(<CapituloSinLider />);

    expect(screen.queryByText(/voces ya están en el mapa/)).not.toBeInTheDocument();
  });
});
