import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PLAN_COUNT } from '../../landing-data';
import { CifrasStrip } from '../CifrasStrip';

import { useCifras, useVocesCount } from '~/lib/queries/analytics';
import { useSemillasCount } from '~/lib/queries/semillas';

vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
  useCifras: vi.fn(),
}));

vi.mock('~/lib/queries/semillas', () => ({
  useSemillasCount: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);
const mockedUseCifras = vi.mocked(useCifras);
const mockedUseSemillasCount = vi.mocked(useSemillasCount);

function renderStrip() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CifrasStrip />
    </QueryClientProvider>,
  );
}

describe('CifrasStrip', () => {
  it('renders the real voces/semillas/propuestas/señales counts plus the real plan count, es-AR formatted', () => {
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
    mockedUseSemillasCount.mockReturnValue({
      data: { total: 1234 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSemillasCount>);
    renderStrip();

    expect(screen.getByText('12.496')).toBeInTheDocument();
    expect(screen.getByText('1.234')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText(String(PLAN_COUNT))).toBeInTheDocument();
    expect(screen.getByText(/voces en el mapa/)).toBeInTheDocument();
    expect(screen.getByText(/semillas plantadas/)).toBeInTheDocument();
    expect(screen.getByText(/propuestas del mandato/)).toBeInTheDocument();
    expect(screen.getByText(/señales del pulso/)).toBeInTheDocument();
    expect(screen.getByText(/planes en la prueba/)).toBeInTheDocument();

    const semillasLink = screen.getByText(/semillas plantadas/).closest('a');
    expect(semillasLink).toHaveAttribute('href', '/sembrar');
  });

  it('never renders the retired círculos demo tile', () => {
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
    mockedUseSemillasCount.mockReturnValue({
      data: { total: 0 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSemillasCount>);
    renderStrip();

    expect(screen.queryByText(/círculos activos/)).not.toBeInTheDocument();
    // Exactly 5 tiles: voces, semillas, propuestas, señales, planes.
    expect(screen.getAllByRole('link')).toHaveLength(5);
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
    mockedUseSemillasCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useSemillasCount>);
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
    mockedUseSemillasCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useSemillasCount>);
    renderStrip();

    // The 4 live tiles (voces, semillas, propuestas, señales) fall back to
    // the accessible loading skeleton; the plan count still renders (it's
    // synchronous, from the MDX registry, never in flight).
    expect(screen.getAllByRole('status', { name: 'Cargando cifra' })).toHaveLength(4);
    expect(screen.queryByText('12.496')).not.toBeInTheDocument();
    expect(screen.queryByText('3.107')).not.toBeInTheDocument();
    expect(screen.queryByText('214')).not.toBeInTheDocument();
  });
});
