import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { VocesTicker } from '../VocesTicker';

import { useVocesRecientes, type VozReciente } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/analytics', () => ({
  useVocesRecientes: vi.fn(),
}));

const mockedUseVocesRecientes = vi.mocked(useVocesRecientes);

function renderTicker() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <VocesTicker />
    </QueryClientProvider>,
  );
}

describe('VocesTicker', () => {
  it('renders the fetched voices, mapping a known categoría to its tipo color and an unknown one to valor (tinta)', () => {
    mockedUseVocesRecientes.mockReturnValue({
      data: [
        { id: 1, texto: 'Basta de rutas sin luz.', categoria: 'basta' },
        { id: 2, texto: 'Una voz sin categoría reconocida.', categoria: 'inventado' },
      ],
      isLoading: false,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();

    const bastaVoice = screen.getAllByText('«Basta de rutas sin luz.»')[0];
    expect(bastaVoice?.className).toMatch(/text-sello/);

    const unknownVoice = screen.getAllByText('«Una voz sin categoría reconocida.»')[0];
    expect(unknownVoice?.className).toMatch(/text-tinta-75/);
    expect(unknownVoice?.className).not.toMatch(/text-sello/);
  });

  it('loops the duplicated aria-hidden copy so the marquee has content even with few voces', () => {
    mockedUseVocesRecientes.mockReturnValue({
      data: [{ id: 1, texto: 'Única voz disponible.', categoria: 'valor' }],
      isLoading: false,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();

    expect(screen.getAllByText('«Única voz disponible.»')).toHaveLength(2);
  });

  it('shows the §10.9 empty-state microcopy instead of the marquee when there are zero voces', () => {
    mockedUseVocesRecientes.mockReturnValue({
      data: [] as VozReciente[],
      isLoading: false,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();

    expect(screen.getByText('Todavía no hay voces acá. Qué oportunidad.')).toBeInTheDocument();
  });

  it('shows neither the old demo voices nor the empty state while loading', () => {
    mockedUseVocesRecientes.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();

    expect(
      screen.queryByText(/Basta de rutas sin luz donde ya murió gente/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Todavía no hay voces acá. Qué oportunidad.')).not.toBeInTheDocument();
  });
});
