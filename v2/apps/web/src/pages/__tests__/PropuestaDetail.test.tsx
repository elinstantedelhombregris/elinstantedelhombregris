import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PropuestaDetail } from '../PropuestaDetail';

import type { ReactNode } from 'react';
import type * as Wouter from 'wouter';

import { ApiError } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { usePropuestaById, useVotePropuesta, type Propuesta } from '~/lib/queries/mandato';


vi.mock('~/lib/queries/mandato', () => ({
  usePropuestaById: vi.fn(),
  useVotePropuesta: vi.fn(),
}));

vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('wouter', async (importOriginal) => {
  const actual = await importOriginal<typeof Wouter>();
  return {
    ...actual,
    useRoute: () => [true, { id: '7' }] as const,
    Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  };
});

const mockPropuesta = vi.mocked(usePropuestaById);
const mockVote = vi.mocked(useVotePropuesta);
const mockAuth = vi.mocked(useAuth);

/**
 * Matchea el `textContent` completo de un elemento de la etiqueta dada.
 * Necesario cuando el JSX interpola varios `{valor}` como nodos de texto
 * hermanos: RTL no los concatena para un match por string exacto.
 */
function soloEn(tag: string, texto: string) {
  return (_content: string, element: Element | null) =>
    element?.tagName.toLowerCase() === tag && element.textContent === texto;
}

function propuestaBase(overrides: Partial<Propuesta> = {}): Propuesta {
  return {
    id: 7,
    title: 'Red de turnos comunitarios',
    summary: 'Lista de espera paralela y auditable.',
    bodyMarkdown: null,
    status: 'voting',
    voteScore: 1,
    voteCount: 4,
    provinceId: null,
    authorId: null,
    createdAt: '2026-07-10T00:00:00Z',
    updatedAt: '2026-07-10T00:00:00Z',
    ...overrides,
  };
}

describe('PropuestaDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cargando: microcopy y ninguna ficha', () => {
    mockPropuesta.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof usePropuestaById>);
    mockVote.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useVotePropuesta>);
    mockAuth.mockReturnValue({ isAuthenticated: false } as ReturnType<typeof useAuth>);

    render(<PropuestaDetail />);

    expect(screen.getByText('Cargando — menos que un trámite.')).toBeInTheDocument();
  });

  it('404 (ApiError 404): kicker expediente extraviado + título propio, sin sello inventado', () => {
    mockPropuesta.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(404, 'NOT_FOUND', 'Propuesta no encontrada'),
    } as unknown as ReturnType<typeof usePropuestaById>);
    mockVote.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useVotePropuesta>);
    mockAuth.mockReturnValue({ isAuthenticated: false } as ReturnType<typeof useAuth>);

    render(<PropuestaDetail />);

    expect(screen.getByText('expediente extraviado')).toBeInTheDocument();
    expect(screen.getByText('Esa propuesta no está.')).toBeInTheDocument();
    // Catálogo de sellos cerrado (§10.5): el 404 no lleva ninguno.
    expect(screen.queryByText('Extraviado')).not.toBeInTheDocument();
    expect(document.querySelector('.anim-stampin')).toBeNull();
  });

  it('roto (error ≠ 404): frase de honestidad + reintento que llama a refetch — no es el estado extraviado', () => {
    const refetch = vi.fn();
    mockPropuesta.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(500, 'INTERNAL', 'Se rompió'),
      refetch,
    } as unknown as ReturnType<typeof usePropuestaById>);
    mockVote.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useVotePropuesta>);
    mockAuth.mockReturnValue({ isAuthenticated: false } as ReturnType<typeof useAuth>);

    render(<PropuestaDetail />);

    expect(screen.getByText('Esto se rompió. Lo decimos porque publicamos todo.')).toBeInTheDocument();
    expect(screen.queryByText('expediente extraviado')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Probar de nuevo ↺' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('éxito sin sesión: estado en votación, votos + apoyo, botones deshabilitados y link a /ingresar', () => {
    mockPropuesta.mockReturnValue({
      data: { proposal: propuestaBase() },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePropuestaById>);
    mockVote.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useVotePropuesta>);
    mockAuth.mockReturnValue({ isAuthenticated: false } as ReturnType<typeof useAuth>);

    render(<PropuestaDetail />);

    // El texto viene interpolado en varios nodos hermanos (`{id} · {estado}`),
    // así que se matchea por el `textContent` completo del párrafo en vez de
    // un string exacto (RTL no junta texto de nodos separados).
    expect(screen.getByText(soloEn('p', 'Propuesta N° 7 · en votación'))).toBeInTheDocument();
    expect(screen.getByText(soloEn('p', '4 votos · apoyo +1'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'A favor +1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'En contra −1' })).toBeDisabled();
    expect(screen.getByText(/Para votar hace falta/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'entrar' })).toHaveAttribute('href', '/ingresar');
  });

  it('con sesión: los botones quedan habilitados y disparan mutate(1) / mutate(-1)', () => {
    mockPropuesta.mockReturnValue({
      data: { proposal: propuestaBase() },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePropuestaById>);
    const mutate = vi.fn();
    mockVote.mockReturnValue({ mutate, isPending: false } as unknown as ReturnType<typeof useVotePropuesta>);
    mockAuth.mockReturnValue({ isAuthenticated: true } as ReturnType<typeof useAuth>);

    render(<PropuestaDetail />);

    const aFavor = screen.getByRole('button', { name: 'A favor +1' });
    const enContra = screen.getByRole('button', { name: 'En contra −1' });
    expect(aFavor).toBeEnabled();
    expect(enContra).toBeEnabled();

    fireEvent.click(aFavor);
    expect(mutate).toHaveBeenCalledWith(1);
    fireEvent.click(enContra);
    expect(mutate).toHaveBeenCalledWith(-1);
    expect(screen.queryByText(/Para votar hace falta/)).not.toBeInTheDocument();
  });

  it('voto en vuelo: el botón votado muestra cargando (— ▌, aria-busy) y el otro queda deshabilitado', () => {
    mockPropuesta.mockReturnValue({
      data: { proposal: propuestaBase() },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePropuestaById>);
    mockVote.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      variables: 1,
      isError: false,
    } as unknown as ReturnType<typeof useVotePropuesta>);
    mockAuth.mockReturnValue({ isAuthenticated: true } as ReturnType<typeof useAuth>);

    render(<PropuestaDetail />);

    const enVuelo = screen.getByRole('button', { busy: true });
    expect(enVuelo).toHaveTextContent('A favor +1'); // el label queda invisible pero presente (ancho fijo)
    expect(enVuelo).toHaveTextContent('Cargando');
    expect(screen.getByRole('button', { name: 'En contra −1' })).toBeDisabled();
  });

  it('voto fallido: línea de error honesta con role=alert', () => {
    mockPropuesta.mockReturnValue({
      data: { proposal: propuestaBase() },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePropuestaById>);
    mockVote.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
    } as unknown as ReturnType<typeof useVotePropuesta>);
    mockAuth.mockReturnValue({ isAuthenticated: true } as ReturnType<typeof useAuth>);

    render(<PropuestaDetail />);

    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos registrar tu voto. Probá de nuevo.');
  });

  it('con bodyMarkdown: lo parte en párrafos separados por línea en blanco', () => {
    mockPropuesta.mockReturnValue({
      data: { proposal: propuestaBase({ bodyMarkdown: 'Primer párrafo.\n\nSegundo párrafo.' }) },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePropuestaById>);
    mockVote.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useVotePropuesta>);
    mockAuth.mockReturnValue({ isAuthenticated: false } as ReturnType<typeof useAuth>);

    render(<PropuestaDetail />);

    expect(screen.getByText('Primer párrafo.')).toBeInTheDocument();
    expect(screen.getByText('Segundo párrafo.')).toBeInTheDocument();
  });
});
