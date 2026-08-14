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
        { id: 1, texto: 'Basta de rutas sin luz.', categoria: 'basta' },
        { id: 2, texto: 'Una voz sin categoría reconocida.', categoria: 'inventado' },
      ],
      isLoading: false,
    } as ReturnType<typeof useVocesRecientes>);
    renderTicker();

    const bastaVoice = screen.getAllByText('«Basta de rutas sin luz.»')[0];
    // `basta` es un `hecho`, y los hechos son ámbar. `sello` dejó de ser el
    // color de un tipo: ahora es el color del estado ruidoso.
    expect(bastaVoice?.className).toMatch(/text-ambar/);

    const unknownVoice = screen.getAllByText('«Una voz sin categoría reconocida.»')[0];
    expect(unknownVoice?.className).toMatch(/text-tinta-75/);
    // Sin sumidero: lo que no está en el canon sale gris y no plegado contra
    // un tipo real, que es lo que hacía el `?? 'valor'`.
    expect(unknownVoice?.className).toMatch(/text-tinta-75/);
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
