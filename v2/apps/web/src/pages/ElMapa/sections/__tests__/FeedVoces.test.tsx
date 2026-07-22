import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FeedVoces } from '../FeedVoces';

import { useProvincias, useVocesAbiertas } from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useVocesAbiertas: vi.fn(),
}));

const mockProvincias = vi.mocked(useProvincias);
const mockVoces = vi.mocked(useVocesAbiertas);

describe('FeedVoces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProvincias.mockReturnValue({
      data: [{ id: 6, name: 'Córdoba', isoCode: 'AR-X' }],
      isLoading: false,
    } as ReturnType<typeof useProvincias>);
    mockVoces.mockReturnValue({
      data: [
        { id: 2, body: 'Trenes que lleguen.', category: 'sueño', provinceId: 6, submittedAs: null, createdAt: '2026-07-22T12:00:00Z' },
        { id: 1, body: 'Basta.', category: 'basta', provinceId: null, submittedAs: null, createdAt: '2026-07-21T12:00:00Z' },
      ],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesAbiertas>);
  });

  it('lista tipo + lugar + texto; sin provincia dice Argentina', () => {
    render(<FeedVoces />);

    expect(screen.getByText('sueño')).toBeInTheDocument();
    expect(screen.getByText('Córdoba')).toBeInTheDocument();
    expect(screen.getByText('«Trenes que lleguen.»')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
  });

  it('cierra con el link real a El mandato', () => {
    render(<FeedVoces />);

    expect(screen.getByRole('link', { name: 'El mandato' })).toHaveAttribute('href', '/mandato-vivo');
  });

  it('cargando habla (§10.9): skeleton §5 + microcopy', () => {
    mockVoces.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesAbiertas>);
    const { container } = render(<FeedVoces />);

    expect(container.querySelector('.anim-pulso-papel')).not.toBeNull();
    expect(screen.getByText('Cargando — menos que un trámite.')).toBeInTheDocument();
  });

  it('error habla (§10.9)', () => {
    mockVoces.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useVocesAbiertas>);
    render(<FeedVoces />);

    expect(
      screen.getByText('Esto se rompió. Lo decimos porque publicamos todo.'),
    ).toBeInTheDocument();
  });

  it('vacío habla (§10.9)', () => {
    // `data: []` infiere `never[]`, que no alcanza a ninguna variante de
    // UseQueryResult<VozAbierta[], Error> — puente por `unknown`.
    mockVoces.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useVocesAbiertas>);
    render(<FeedVoces />);

    expect(screen.getByText('El país todavía no dijo nada acá. Empezá vos.')).toBeInTheDocument();
  });
});
