import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DEMO_VOCES_COUNT, PAPEL_NAV } from '../papel/papel-nav';
import { PapelHeader } from '../papel/PapelHeader';

import { useVocesCount } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);

function renderHeader() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <PapelHeader />
    </QueryClientProvider>,
  );
}

describe('PapelHeader', () => {
  it('renders the wordmark linking home and falls back to the demo count while loading', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByRole('link', { name: '¡BASTA! — inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByText(`${DEMO_VOCES_COUNT} voces · falta la tuya`)).toBeInTheDocument();
  });

  it('falls back to the demo count on error', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByText(`${DEMO_VOCES_COUNT} voces · falta la tuya`)).toBeInTheDocument();
  });

  it('renders the live total formatted es-AR once loaded', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByText('12.496 voces · falta la tuya')).toBeInTheDocument();
  });

  it('renders the recorrido nav with the real v2 routes', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    for (const item of PAPEL_NAV) {
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute('href', item.href);
    }
    expect(screen.getByRole('link', { name: 'Sembrar tu voz' })).toHaveAttribute(
      'href',
      '/la-semilla-de-basta',
    );
  });

  it('toggles the full-screen mobile menu', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

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
