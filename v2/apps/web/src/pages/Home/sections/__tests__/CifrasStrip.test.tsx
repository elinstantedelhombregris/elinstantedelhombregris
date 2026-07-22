import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PLAN_COUNT } from '../../landing-data';
import { CifrasStrip } from '../CifrasStrip';

import { useCifras, useVocesCount } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
  useCifras: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);
const mockedUseCifras = vi.mocked(useCifras);

function renderStrip() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CifrasStrip />
    </QueryClientProvider>,
  );
}

describe('CifrasStrip', () => {
  it('renders the real voces/propuestas/señales counts plus the real plan count, es-AR formatted', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    mockedUseCifras.mockReturnValue({
      data: { voces: 12496, propuestas: 7, senales: 42, posts: 3 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCifras>);
    renderStrip();

    expect(screen.getByText('12.496')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText(String(PLAN_COUNT))).toBeInTheDocument();
    expect(screen.getByText(/voces en el mapa/)).toBeInTheDocument();
    expect(screen.getByText(/propuestas del mandato/)).toBeInTheDocument();
    expect(screen.getByText(/señales del pulso/)).toBeInTheDocument();
    expect(screen.getByText(/planes en la prueba/)).toBeInTheDocument();
  });

  it('never renders the retired semillas/círculos demo tiles', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 0 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    mockedUseCifras.mockReturnValue({
      data: { voces: 0, propuestas: 0, senales: 0, posts: 0 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCifras>);
    renderStrip();

    expect(screen.queryByText(/semillas plantadas/)).not.toBeInTheDocument();
    expect(screen.queryByText(/círculos activos/)).not.toBeInTheDocument();
    // Exactly 4 tiles: voces, propuestas, señales, planes.
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });

  it('never shows the demo-data asterisk note — nothing demo remains in this strip', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    mockedUseCifras.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useCifras>);
    renderStrip();

    expect(screen.queryByText(/datos de demostración/)).not.toBeInTheDocument();
  });

  it('shows a skeleton (never the old hardcoded demo numbers) while loading or on error', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    mockedUseCifras.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useCifras>);
    renderStrip();

    // The 3 live tiles (voces, propuestas, señales) fall back to the
    // accessible loading skeleton; the plan count still renders (it's
    // synchronous, from the MDX registry, never in flight).
    expect(screen.getAllByRole('status', { name: 'Cargando cifra' })).toHaveLength(3);
    expect(screen.queryByText('12.496')).not.toBeInTheDocument();
    expect(screen.queryByText('3.107')).not.toBeInTheDocument();
    expect(screen.queryByText('214')).not.toBeInTheDocument();
  });
});
