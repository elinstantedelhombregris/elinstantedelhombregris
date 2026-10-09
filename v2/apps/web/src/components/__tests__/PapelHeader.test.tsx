import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PAPEL_NAV } from '../papel/papel-nav';
import { PapelHeader } from '../papel/PapelHeader';

import { useVocesCount } from '~/lib/queries/analytics';

vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: null }) }));

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
  it('mientras carga no inventa un número', () => {
    // Antes caía a DEMO_VOCES_COUNT = '12.496': un número fabricado, en el
    // lugar más visible del sitio, en TODAS las páginas. Un hueco es mejor que
    // una cifra que nadie dijo.
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByRole('link', { name: '¡BASTA! — inicio' })).toHaveAttribute('href', '/');
    expect(screen.queryByText(/12\.496/)).not.toBeInTheDocument();
    expect(screen.queryByText(/voces/)).not.toBeInTheDocument();
  });

  it('si la consulta falla tampoco inventa', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.queryByText(/voces/)).not.toBeInTheDocument();
  });

  it('en cero, el contador invita en vez de contar', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 0 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByText('la primera voz todavía puede ser la tuya')).toBeInTheDocument();
  });

  it('con una sola voz vuelve a contar, sin que nadie apague nada', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 1 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByText('1 aporte en el registro')).toBeInTheDocument();
  });

  it('renders the live total formatted es-AR once loaded', () => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    renderHeader();

    expect(screen.getByText('12.496 aportes en el registro')).toBeInTheDocument();
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
    expect(screen.getByRole('link', { name: 'Imaginar mi Argentina' })).toHaveAttribute(
      'href',
      '/el-mapa?participar=imaginar#instrumento',
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

    const toggle = screen.getByRole('button', { name: 'Abrir menú' });
    // §9b: targets móviles ≥44px — min-h-11/min-w-11 son 2.75rem (44px) en la escala Tailwind.
    expect(toggle).toHaveClass('min-h-11', 'min-w-11');

    fireEvent.click(toggle);
    expect(screen.getByRole('navigation', { name: 'Recorrido completo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inicio/ })).toHaveAttribute('href', '/');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(
      screen.queryByRole('navigation', { name: 'Recorrido completo' }),
    ).not.toBeInTheDocument();
  });
});
