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
  it('pinta por CLASE, y lo que el canon no reconoce sale neutro', () => {
    mockedUseVocesRecientes.mockReturnValue({
      data: [
        {
          id: '00000000-0000-4000-8000-000000000001',
          texto: 'Basta de rutas sin luz.',
          categoria: 'basta',
        },
        {
          id: '00000000-0000-4000-8000-000000000002',
          texto: 'Una voz sin categoría reconocida.',
          categoria: 'inventado',
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();

    const bastaVoice = screen.getAllByText('«Basta de rutas sin luz.»')[0];
    // `basta` es un `hecho`, y los hechos son ámbar. `sello` dejó de ser el
    // color de un tipo: ahora es el color del estado ruidoso.
    // El token ya es el ámbar de texto (5,23:1 sobre papel-crudo): la cinta no
    // lleva ningún color propio.
    expect(bastaVoice?.className).toMatch(/text-ambar\b/);
    expect(bastaVoice?.className).not.toMatch(/text-\[#/);

    const unknownVoice = screen.getAllByText('«Una voz sin categoría reconocida.»')[0];
    expect(unknownVoice?.className).toMatch(/text-tinta-75/);
    // Sin sumidero: lo que no está en el canon sale gris y no plegado contra
    // un tipo real, que es lo que hacía el `?? 'valor'`.
    expect(unknownVoice?.className).toMatch(/text-tinta-75/);
  });

  it('loops the duplicated aria-hidden copy so the marquee has content even with few voces', () => {
    mockedUseVocesRecientes.mockReturnValue({
      data: [
        {
          id: '00000000-0000-4000-8000-000000000001',
          texto: 'Única voz disponible.',
          categoria: 'valor',
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();

    expect(screen.getAllByText('«Única voz disponible.»')).toHaveLength(2);
  });

  it('sin aportes dice una sola cosa en vez de mostrar la cinta', () => {
    mockedUseVocesRecientes.mockReturnValue({
      data: [] as VozReciente[],
      isLoading: false,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();

    expect(screen.getByText('Todavía nadie publicó un aporte.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
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
    expect(screen.queryByText('Todavía nadie publicó un aporte.')).not.toBeInTheDocument();
  });

  it('no presenta el aviso de texto reservado como una cita de la ciudadanía', () => {
    mockedUseVocesRecientes.mockReturnValue({
      data: [
        {
          id: '00000000-0000-4000-8000-000000000003',
          texto: 'Texto reservado por su autoría.',
          categoria: 'sueno',
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();
    expect(screen.queryByText('«Texto reservado por su autoría.»')).not.toBeInTheDocument();
    // Hubo quien publicó, así que no se dice que nadie lo hizo.
    expect(screen.queryByText('Todavía nadie publicó un aporte.')).not.toBeInTheDocument();
    expect(screen.getByText(/tienen el texto reservado/)).toBeInTheDocument();
  });

  it('la cinta tiene rótulo, se pausa con el mouse o el foco y el teclado puede llegar', () => {
    mockedUseVocesRecientes.mockReturnValue({
      data: [
        { id: '00000000-0000-4000-8000-000000000001', texto: 'Una voz.', categoria: 'sueño' },
      ],
      isLoading: false,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();

    const region = screen.getByRole('region', { name: 'Últimos aportes' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('Últimos aportes', { selector: 'p' })).toBeInTheDocument();
    const cinta = region.querySelector('.anim-marquee');
    expect(cinta?.className).toContain('group-hover:[animation-play-state:paused]');
    expect(cinta?.className).toContain('group-focus-within:[animation-play-state:paused]');
  });

  it('con movimiento reducido es una lista quieta: sin recortar y sin la copia del loop', () => {
    mockedUseVocesRecientes.mockReturnValue({
      data: [
        { id: '00000000-0000-4000-8000-000000000001', texto: 'Una voz.', categoria: 'sueño' },
        { id: '00000000-0000-4000-8000-000000000002', texto: 'Otra voz.', categoria: 'basta' },
      ],
      isLoading: false,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();

    const region = screen.getByRole('region', { name: 'Últimos aportes' });
    const cinta = region.querySelector('.anim-marquee');
    expect(cinta?.className).toContain('motion-reduce:flex-wrap');
    expect(cinta?.className).toContain('motion-reduce:w-auto');
    expect(region.className).toContain('motion-reduce:overflow-visible');
    const copias = region.querySelectorAll('ul');
    expect(copias[0]?.className).not.toContain('motion-reduce:hidden');
    expect(copias[1]?.className).toContain('motion-reduce:hidden');
    for (const li of region.querySelectorAll('li'))
      expect(li.className).toContain('motion-reduce:whitespace-normal');
  });
});
