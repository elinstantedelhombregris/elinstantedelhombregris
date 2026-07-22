import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PulsoDetail } from '../PulsoDetail';

import type { ReactNode } from 'react';
import type * as Wouter from 'wouter';

import { usePulsoById } from '~/lib/queries/mandato';
import { useProvincias } from '~/lib/queries/open-data';


vi.mock('~/lib/queries/mandato', () => ({
  usePulsoById: vi.fn(),
}));

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
}));

vi.mock('wouter', async (importOriginal) => {
  const actual = await importOriginal<typeof Wouter>();
  return {
    ...actual,
    useRoute: () => [true, { id: '42' }] as const,
    Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  };
});

const mockPulso = vi.mocked(usePulsoById);
const mockProvincias = vi.mocked(useProvincias);

describe('PulsoDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProvincias.mockReturnValue({
      data: [{ id: 6, name: 'Córdoba', isoCode: 'AR-X' }],
      isLoading: false,
    } as ReturnType<typeof useProvincias>);
  });

  it('cargando: microcopy y ningún cuerpo de señal', () => {
    mockPulso.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof usePulsoById>);

    render(<PulsoDetail />);

    expect(screen.getByText('Cargando — menos que un trámite.')).toBeInTheDocument();
  });

  it('404: kicker expediente extraviado + título propio + CTA de vuelta', () => {
    mockPulso.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof usePulsoById>);

    render(<PulsoDetail />);

    expect(screen.getByText('expediente extraviado')).toBeInTheDocument();
    expect(screen.getByText('Esa señal no está.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al mandato →' })).toHaveAttribute('href', '/mandato-vivo');
  });

  it('éxito: cuerpo entre comillas, tema sin clasificar, provincia resuelta y origen humanizado', () => {
    mockPulso.mockReturnValue({
      data: {
        signal: {
          id: 42,
          body: 'Seis meses para un turno',
          provinceId: 6,
          theme: null,
          sentiment: null,
          source: 'mandato_form',
          createdAt: '2026-07-10T00:00:00Z',
          userId: null,
        },
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePulsoById>);

    render(<PulsoDetail />);

    expect(screen.getByText('«Seis meses para un turno»')).toBeInTheDocument();
    expect(screen.getByText('sin clasificar todavía')).toBeInTheDocument();
    expect(screen.getByText('Córdoba')).toBeInTheDocument();
    expect(screen.getByText('formulario del mandato')).toBeInTheDocument();
  });

  it('éxito: tema clasificado se humaniza y sin provincia dice Argentina', () => {
    mockPulso.mockReturnValue({
      data: {
        signal: {
          id: 42,
          body: 'Trenes que lleguen',
          provinceId: null,
          theme: 'salud_publica',
          sentiment: null,
          source: 'community_post',
          createdAt: '2026-07-10T00:00:00Z',
          userId: null,
        },
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePulsoById>);

    render(<PulsoDetail />);

    expect(screen.getByText('salud publica')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('publicación de la comunidad')).toBeInTheDocument();
  });
});
